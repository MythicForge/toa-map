import { useState, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { ALL_LOCATIONS } from '../lib/locations';
import HexMap from '../components/HexMap';
import GMPanel from '../components/GMPanel';
import TopBar from '../components/TopBar';
import TrackerManager from '../components/TrackerManager';
import PartyManager from '../components/PartyManager';
import BulkEditBar from '../components/BulkEditBar';

export default function GMView() {
  const { state, dispatch } = useAppState();
  const [selectedHexId, setSelectedHexId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTrackers, setShowTrackers] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [movingMarkerId, setMovingMarkerId] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedHexIds, setSelectedHexIds] = useState(new Set());

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
