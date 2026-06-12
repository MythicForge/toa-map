import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { colRowFromId } from '../lib/hexMath';

const panelStyle = {
  position: 'absolute', top: 60, right: 14, width: 280,
  background: '#141420', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
  zIndex: 300,
};

const fieldStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 3, color: 'rgba(232,224,216,0.85)', fontSize: 12,
  fontFamily: 'Inter, sans-serif', padding: '4px 8px', outline: 'none',
};

const btnSmall = {
  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 3, cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13,
};

export default function PartyManager({ onClose, onMoveMarker, movingMarkerId }) {
  const { state, dispatch } = useAppState();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#FFD700');

  const addMarker = () => {
    if (!newName.trim()) return;
    dispatch({
      type: 'ADD_PARTY_MARKER',
      marker: { id: `m_${Date.now()}`, name: newName.trim(), color: newColor, hexId: null },
    });
    setNewName('');
  };

  return (
    <div style={panelStyle}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}>
          PARTY MARKERS
        </span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 15 }}>×</button>
      </div>

      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.partyMarkers.map(m => {
          const isMoving = movingMarkerId === m.id;
          return (
            <div key={m.id} style={{
              padding: '8px 10px',
              background: isMoving ? 'rgba(196,147,42,0.1)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${isMoving ? 'rgba(196,147,42,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <input
                  type="color" value={m.color}
                  onChange={e => dispatch({ type: 'UPDATE_PARTY_MARKER', markerId: m.id, updates: { color: e.target.value } })}
                  style={{ width: 22, height: 22, padding: 0, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
                />
                <input
                  value={m.name}
                  onChange={e => dispatch({ type: 'UPDATE_PARTY_MARKER', markerId: m.id, updates: { name: e.target.value } })}
                  style={{ ...fieldStyle, flex: 1 }}
                />
                <button
                  onClick={() => dispatch({ type: 'REMOVE_PARTY_MARKER', markerId: m.id })}
                  style={{ ...btnSmall, color: 'rgba(212,90,74,0.6)' }}
                  title="Remove marker"
                >×</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'Inter, sans-serif' }}>
                  {m.hexId ? `Hex ${m.hexId}` : 'Not placed'}
                </span>
                <button
                  onClick={() => onMoveMarker(isMoving ? null : m.id)}
                  style={{
                    padding: '3px 9px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                    background: isMoving ? 'rgba(196,147,42,0.2)' : 'rgba(196,147,42,0.08)',
                    border: `1px solid ${isMoving ? 'rgba(196,147,42,0.55)' : 'rgba(196,147,42,0.25)'}`,
                    color: '#c4932a', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {isMoving ? 'Cancel' : 'Move on map'}
                </button>
              </div>
            </div>
          );
        })}

        {/* Add marker */}
        <div style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 5, padding: '10px 11px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', marginBottom: 8 }}>
            ADD MARKER
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <input
              type="color" value={newColor}
              onChange={e => setNewColor(e.target.value)}
              style={{ width: 28, height: 28, padding: 0, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
            />
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMarker()}
              placeholder="Marker name…"
              style={{ ...fieldStyle, flex: 1 }}
            />
          </div>
          <button onClick={addMarker} disabled={!newName.trim()} style={{
            width: '100%', padding: '6px', cursor: newName.trim() ? 'pointer' : 'default',
            background: 'rgba(74,156,110,0.1)', border: '1px solid rgba(74,156,110,0.25)',
            borderRadius: 4, color: '#4a9c6e', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
          }}>
            + ADD
          </button>
        </div>
      </div>
    </div>
  );
}
