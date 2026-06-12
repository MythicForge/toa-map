import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadState, saveState } from '../lib/storage';
import { INITIAL_STATE } from '../lib/locations';

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
  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => {
      const saved = loadState();
      if (!saved) return INITIAL_STATE;
      // Merge so new initial fields appear if save is from older version
      return {
        ...INITIAL_STATE,
        ...saved,
        hexes: { ...INITIAL_STATE.hexes, ...saved.hexes },
      };
    }
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Cross-tab sync: when GM saves in another tab, player tab updates live
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'toa-map-state' && e.newValue) {
        try {
          dispatch({ type: 'HYDRATE', state: JSON.parse(e.newValue) });
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
