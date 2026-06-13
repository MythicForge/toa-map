import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import HexMap from '../components/HexMap';
import PlayerPanel from '../components/PlayerPanel';
import TopBar from '../components/TopBar';
import PlayerNamePrompt from '../components/PlayerNamePrompt';

export default function PlayerView() {
  const { state, dispatch } = useAppState();
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('toa-player-name') || ''
  );
  const [selectedHexId, setSelectedHexId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  if (!playerName) {
    return (
      <PlayerNamePrompt onSubmit={name => {
        localStorage.setItem('toa-player-name', name);
        setPlayerName(name);
      }} />
    );
  }

  const openHex = (id) => {
    const h = state.hexes[id];
    if (!h || h.revealTier < 2) return;
    setSelectedHexId(id);
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setSelectedHexId(null); };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#06060e' }}>
      <TopBar
        mode="player"
        trackers={state.trackers}
        playerName={playerName}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        <HexMap
          hexData={state.hexes}
          mode="player"
          onHexClick={openHex}
          selectedHexId={panelOpen ? selectedHexId : null}
          partyMarkers={state.partyMarkers}
        />

        {panelOpen && selectedHexId && (
          <PlayerPanel
            key={selectedHexId}
            hex={state.hexes[selectedHexId] || {}}
            hexId={selectedHexId}
            onClose={closePanel}
            playerName={playerName}
            playerNote={state.playerNotes[selectedHexId]?.[playerName] || ''}
            partyNote={state.partyNotes[selectedHexId] || ''}
            allPlayerNotes={state.playerNotes[selectedHexId] || {}}
            onSavePlayerNote={note => dispatch({ type: 'SET_PLAYER_NOTE', hexId: selectedHexId, playerName, note })}
            onSavePartyNote={note => dispatch({ type: 'SET_PARTY_NOTE', hexId: selectedHexId, note })}
          />
        )}
      </div>
    </div>
  );
}
