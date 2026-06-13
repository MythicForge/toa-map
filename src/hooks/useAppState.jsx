import { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback } from 'react';
import { INITIAL_STATE } from '../lib/locations';
import { supabase } from '../lib/supabase';
import {
  loadAllState, upsertHex, upsertMarker, deleteMarker,
  upsertTracker, deleteTracker, upsertPlayerNote, upsertPartyNote,
  revealAllHexes, hexFromRow,
} from '../lib/storage';

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_HEX':
      return {
        ...state,
        hexes: {
          ...state.hexes,
          [action.hexId]: { ...(state.hexes[action.hexId] || {}), ...action.updates },
        },
      };

    case 'REMOTE_HEX':
      return {
        ...state,
        hexes: {
          ...state.hexes,
          [action.hexId]: { ...(state.hexes[action.hexId] || {}), ...action.data },
        },
      };

    case 'MOVE_PARTY_MARKER':
      return {
        ...state,
        partyMarkers: state.partyMarkers.map(m =>
          m.id === action.markerId ? { ...m, hexId: action.hexId } : m
        ),
      };

    case 'ADD_PARTY_MARKER':
      return { ...state, partyMarkers: [...state.partyMarkers, action.marker] };

    case 'REMOVE_PARTY_MARKER':
      return { ...state, partyMarkers: state.partyMarkers.filter(m => m.id !== action.markerId) };

    case 'UPDATE_PARTY_MARKER':
      return {
        ...state,
        partyMarkers: state.partyMarkers.map(m =>
          m.id === action.markerId ? { ...m, ...action.updates } : m
        ),
      };

    case 'REMOTE_MARKER': {
      const exists = state.partyMarkers.some(m => m.id === action.marker.id);
      return {
        ...state,
        partyMarkers: exists
          ? state.partyMarkers.map(m => m.id === action.marker.id ? { ...m, ...action.marker } : m)
          : [...state.partyMarkers, action.marker],
      };
    }

    case 'REMOTE_DELETE_MARKER':
      return { ...state, partyMarkers: state.partyMarkers.filter(m => m.id !== action.markerId) };

    case 'UPDATE_TRACKER':
      return {
        ...state,
        trackers: state.trackers.map(t =>
          t.id === action.trackerId ? { ...t, ...action.updates } : t
        ),
      };

    case 'ADD_TRACKER':
      return { ...state, trackers: [...state.trackers, action.tracker] };

    case 'REMOVE_TRACKER':
      return { ...state, trackers: state.trackers.filter(t => t.id !== action.trackerId) };

    case 'REMOTE_TRACKER': {
      const exists = state.trackers.some(t => t.id === action.tracker.id);
      return {
        ...state,
        trackers: exists
          ? state.trackers.map(t => t.id === action.tracker.id ? { ...t, ...action.tracker } : t)
          : [...state.trackers, action.tracker],
      };
    }

    case 'REMOTE_DELETE_TRACKER':
      return { ...state, trackers: state.trackers.filter(t => t.id !== action.trackerId) };

    case 'SET_PLAYER_NOTE':
      return {
        ...state,
        playerNotes: {
          ...state.playerNotes,
          [action.hexId]: {
            ...(state.playerNotes[action.hexId] || {}),
            [action.playerName]: action.note,
          },
        },
      };

    case 'SET_PARTY_NOTE':
      return {
        ...state,
        partyNotes: { ...state.partyNotes, [action.hexId]: action.note },
      };

    case 'REVEAL_ALL': {
      const allHexes = { ...state.hexes };
      for (let col = 1; col <= 72; col++) {
        for (let row = 1; row <= 85; row++) {
          const id = String(col).padStart(2, '0') + String(row).padStart(2, '0');
          allHexes[id] = { colorTag: '#C9923A', ...(allHexes[id] || {}), revealTier: action.tier ?? 3 };
        }
      }
      return { ...state, hexes: allHexes };
    }

    case 'HYDRATE':
      return action.state;

    default:
      return state;
  }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load from Supabase on mount
  useEffect(() => {
    loadAllState()
      .then(loaded => {
        dispatch({
          type: 'HYDRATE',
          state: {
            hexes: { ...INITIAL_STATE.hexes, ...loaded.hexes },
            partyMarkers: loaded.partyMarkers.length ? loaded.partyMarkers : INITIAL_STATE.partyMarkers,
            trackers: loaded.trackers.length ? loaded.trackers : INITIAL_STATE.trackers,
            playerNotes: loaded.playerNotes,
            partyNotes: loaded.partyNotes,
          },
        });
      })
      .catch(err => console.error('Supabase load failed:', err))
      .finally(() => setReady(true));
  }, []);

  // Realtime subscriptions — use raw dispatch to avoid re-writing to DB
  useEffect(() => {
    const channel = supabase.channel('map-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hexes' },
        ({ eventType, new: row }) => {
          if (eventType === 'DELETE' || !row?.hex_id) return;
          dispatch({ type: 'REMOTE_HEX', hexId: row.hex_id, data: hexFromRow(row) });
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_markers' },
        ({ eventType, new: row, old }) => {
          if (eventType === 'DELETE') {
            dispatch({ type: 'REMOTE_DELETE_MARKER', markerId: old.id });
          } else if (row?.id) {
            dispatch({ type: 'REMOTE_MARKER', marker: { id: row.id, name: row.name, color: row.color, hexId: row.hex_id } });
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trackers' },
        ({ eventType, new: row, old }) => {
          if (eventType === 'DELETE') {
            dispatch({ type: 'REMOTE_DELETE_TRACKER', trackerId: old.id });
          } else if (row?.id) {
            dispatch({ type: 'REMOTE_TRACKER', tracker: {
              id: row.id, name: row.name, type: row.type,
              current: row.current_value, max: row.max_value,
              visibleToPlayers: row.visible_to_players,
            }});
          }
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_notes' },
        ({ new: row }) => {
          if (!row?.hex_id) return;
          dispatch({ type: 'SET_PLAYER_NOTE', hexId: row.hex_id, playerName: row.player_name, note: row.note });
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_notes' },
        ({ new: row }) => {
          if (!row?.hex_id) return;
          dispatch({ type: 'SET_PARTY_NOTE', hexId: row.hex_id, note: row.note });
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Wraps dispatch: updates local state immediately, then writes to Supabase
  const enhancedDispatch = useCallback((action) => {
    dispatch(action);
    const s = stateRef.current;

    switch (action.type) {
      case 'UPDATE_HEX': {
        const merged = { ...(s.hexes[action.hexId] || {}), ...action.updates };
        upsertHex(action.hexId, merged);
        break;
      }
      case 'MOVE_PARTY_MARKER': {
        const marker = s.partyMarkers.find(m => m.id === action.markerId);
        if (marker) upsertMarker({ ...marker, hexId: action.hexId }, s.partyMarkers.indexOf(marker));
        break;
      }
      case 'ADD_PARTY_MARKER':
        upsertMarker(action.marker, s.partyMarkers.length);
        break;
      case 'REMOVE_PARTY_MARKER':
        deleteMarker(action.markerId);
        break;
      case 'UPDATE_PARTY_MARKER': {
        const marker = s.partyMarkers.find(m => m.id === action.markerId);
        if (marker) upsertMarker({ ...marker, ...action.updates }, s.partyMarkers.indexOf(marker));
        break;
      }
      case 'ADD_TRACKER':
        upsertTracker(action.tracker, s.trackers.length);
        break;
      case 'UPDATE_TRACKER': {
        const tracker = s.trackers.find(t => t.id === action.trackerId);
        if (tracker) upsertTracker({ ...tracker, ...action.updates }, s.trackers.indexOf(tracker));
        break;
      }
      case 'REMOVE_TRACKER':
        deleteTracker(action.trackerId);
        break;
      case 'SET_PLAYER_NOTE':
        upsertPlayerNote(action.hexId, action.playerName, action.note);
        break;
      case 'SET_PARTY_NOTE':
        upsertPartyNote(action.hexId, action.note);
        break;
      case 'REVEAL_ALL':
        revealAllHexes(action.tier ?? 3);
        break;
      default:
        break;
    }
  }, []);

  if (!ready) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#06060e', color: 'rgba(255,255,255,0.35)',
        fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.18em',
      }}>
        LOADING MAP…
      </div>
    );
  }

  return (
    <AppStateContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
