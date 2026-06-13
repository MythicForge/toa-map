import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { ALL_LOCATIONS } from '../lib/locations';
import { supabase } from '../lib/supabase';
import HexMap from '../components/HexMap';
import GMPanel from '../components/GMPanel';
import TopBar from '../components/TopBar';
import TrackerManager from '../components/TrackerManager';
import PartyManager from '../components/PartyManager';
import BulkEditBar from '../components/BulkEditBar';

function ColorLegend({ hexes, spotlightColor, onSpotlight }) {
  const [collapsed, setCollapsed] = useState(false);

  const groups = useMemo(() => {
    const map = {};
    Object.values(hexes).forEach(h => {
      if (!h.colorTag) return;
      if (!map[h.colorTag]) map[h.colorTag] = { count: 0, names: [] };
      map[h.colorTag].count++;
      if (h.name) map[h.colorTag].names.push(h.name);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [hexes]);

  if (groups.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 16, right: 16,
      background: 'rgba(8,8,18,0.92)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6, zIndex: 40, minWidth: 140,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <span style={{ fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)' }}>
          COLOR REGIONS
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {groups.map(([color, { count, names }]) => {
            const active = spotlightColor === color;
            return (
              <button
                key={color}
                title={names.slice(0, 8).join(', ') || color}
                onClick={() => onSpotlight(active ? null : color)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '4px 7px', borderRadius: 4, cursor: 'pointer',
                  background: active ? color + '22' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? color + 'aa' : 'rgba(255,255,255,0.07)'}`,
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0,
                  boxShadow: active ? `0 0 6px ${color}` : 'none',
                }} />
                <span style={{
                  fontSize: 11, fontFamily: 'Inter, sans-serif',
                  color: active ? color : 'rgba(232,224,216,0.55)', flex: 1,
                }}>
                  {count} hex{count !== 1 ? 'es' : ''}
                </span>
              </button>
            );
          })}
          {spotlightColor && (
            <button
              onClick={() => onSpotlight(null)}
              style={{
                marginTop: 2, padding: '3px 7px', borderRadius: 4, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Inter, sans-serif',
              }}
            >
              Clear spotlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GMLoginGate({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else onAuth();
  };

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4,
    color: 'rgba(232,224,216,0.9)', fontSize: 14,
    fontFamily: 'Inter, sans-serif', padding: '9px 12px',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: '#06060e',
    }}>
      <form onSubmit={login} style={{
        width: 320, padding: '32px 28px',
        background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: '#e8e2d8', letterSpacing: '0.1em', marginBottom: 4 }}>
          GM Access
        </div>
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required style={inp} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required style={inp} />
        {error && <div style={{ fontSize: 12, color: '#d45a4a', fontFamily: 'Inter, sans-serif' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          padding: '10px', background: 'rgba(123,158,201,0.15)',
          border: '1px solid rgba(123,158,201,0.4)', borderRadius: 4,
          color: '#7B9EC9', fontFamily: 'Cinzel, serif', fontSize: 12,
          letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
}

export default function GMView() {
  const { state, dispatch } = useAppState();
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!authChecked) return null;
  if (!authed) return <GMLoginGate onAuth={() => setAuthed(true)} />;
  const [selectedHexId, setSelectedHexId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTrackers, setShowTrackers] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [movingMarkerId, setMovingMarkerId] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedHexIds, setSelectedHexIds] = useState(new Set());
  const [spotlightColor, setSpotlightColor] = useState(null);

  const toggleMultiSelect = () => {
    setMultiSelectMode(m => {
      if (m) setSelectedHexIds(new Set()); // clear on exit
      return !m;
    });
    setPanelOpen(false);
  };

  const openHex = useCallback((id, shiftKey = false) => {
    if (movingMarkerId) {
      dispatch({ type: 'MOVE_PARTY_MARKER', markerId: movingMarkerId, hexId: id });
      setMovingMarkerId(null);
      return;
    }
    if (multiSelectMode) {
      if (shiftKey) {
        // Select all hexes with the same colorTag
        const targetColor = state.hexes[id]?.colorTag;
        if (targetColor) {
          setSelectedHexIds(prev => {
            const next = new Set(prev);
            Object.entries(state.hexes).forEach(([hid, hex]) => {
              if (hex.colorTag === targetColor) next.add(hid);
            });
            return next;
          });
        }
        return;
      }
      setSelectedHexIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      return;
    }
    setSelectedHexId(id);
    setPanelOpen(true);
    setShowTrackers(false);
    setShowParty(false);
  }, [movingMarkerId, multiSelectMode, state.hexes, dispatch]);

  const closePanel = () => { setPanelOpen(false); setSelectedHexId(null); };

  const updateHex = (updates) => {
    if (selectedHexId) {
      dispatch({ type: 'UPDATE_HEX', hexId: selectedHexId, updates });
    }
  };

  const paintHex = useCallback((id) => {
    setSelectedHexIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const applyBulk = ({ tier, color }) => {
    selectedHexIds.forEach(hexId => {
      const updates = {};
      if (tier !== null) updates.revealTier = tier;
      if (color !== null) updates.colorTag = color;
      if (Object.keys(updates).length) dispatch({ type: 'UPDATE_HEX', hexId, updates });
    });
  };

  const assignedLocationSet = new Set(
    Object.values(state.hexes).filter(h => h.location).map(h => h.location)
  );
  const unassignedLocations = ALL_LOCATIONS.filter(l => !assignedLocationSet.has(l));

  const handleExport = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toa-map-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        dispatch({ type: 'HYDRATE', state: imported });
      } catch {
        alert('Invalid save file — could not parse JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset so same file can be re-imported
  };

  const handleMoveMarker = (markerId) => {
    dispatch({ type: 'MOVE_PARTY_MARKER', markerId, hexId: selectedHexId });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#06060e' }}>
      <TopBar
        mode="gm"
        trackers={state.trackers}
        unassignedCount={unassignedLocations.length}
        unassignedLocations={unassignedLocations}
        onShowTrackers={() => { setShowTrackers(s => !s); setShowParty(false); setPanelOpen(false); }}
        onShowParty={() => { setShowParty(s => !s); setShowTrackers(false); setPanelOpen(false); }}
        multiSelectMode={multiSelectMode}
        onToggleMultiSelect={toggleMultiSelect}
        onExport={handleExport}
        onImport={handleImport}
        onRevealAll={() => {
          if (window.confirm('Set all 6,120 hexes to Full Reveal? You can work backwards with Select mode.')) {
            dispatch({ type: 'REVEAL_ALL' });
          }
        }}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        <HexMap
          hexData={state.hexes}
          mode="gm"
          onHexClick={openHex}
          onHexPaint={paintHex}
          selectedHexId={panelOpen ? selectedHexId : null}
          partyMarkers={state.partyMarkers}
          movingMarkerId={movingMarkerId}
          multiSelectIds={multiSelectMode ? selectedHexIds : null}
          spotlightColor={spotlightColor}
        />

        <ColorLegend
          hexes={state.hexes}
          spotlightColor={spotlightColor}
          onSpotlight={setSpotlightColor}
        />

        {panelOpen && selectedHexId && !multiSelectMode && (
          <GMPanel
            key={selectedHexId}
            hex={state.hexes[selectedHexId] || {}}
            hexId={selectedHexId}
            onClose={closePanel}
            onUpdate={updateHex}
            partyMarkers={state.partyMarkers}
            onMoveMarker={handleMoveMarker}
            playerNotes={state.playerNotes[selectedHexId] || {}}
          />
        )}

        {showTrackers && (
          <TrackerManager onClose={() => setShowTrackers(false)} />
        )}

        {showParty && (
          <PartyManager
            onClose={() => setShowParty(false)}
            onMoveMarker={(id) => {
              setMovingMarkerId(id);
              if (id) setShowParty(false);
            }}
            movingMarkerId={movingMarkerId}
          />
        )}

        {multiSelectMode && selectedHexIds.size > 0 && (
          <BulkEditBar
            count={selectedHexIds.size}
            onApply={applyBulk}
            onClear={() => setSelectedHexIds(new Set())}
          />
        )}
      </div>
    </div>
  );
}
