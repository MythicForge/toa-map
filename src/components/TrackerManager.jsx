import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';

const panelStyle = {
  position: 'absolute', top: 60, right: 14, width: 300,
  background: '#141420', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
  zIndex: 300, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
};

const btnSmall = (active) => ({
  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: active ? 'rgba(123,158,201,0.2)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? 'rgba(123,158,201,0.4)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 3, cursor: 'pointer',
  color: active ? '#7B9EC9' : 'rgba(255,255,255,0.4)', fontSize: 13,
});

export default function TrackerManager({ onClose }) {
  const { state, dispatch } = useAppState();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('progress');
  const [newMax, setNewMax] = useState(10);

  const addTracker = () => {
    if (!newName.trim()) return;
    dispatch({
      type: 'ADD_TRACKER',
      tracker: {
        id: `t_${Date.now()}`,
        name: newName.trim(),
        type: newType,
        current: 0,
        max: newMax,
        visibleToPlayers: false,
      },
    });
    setNewName('');
    setNewMax(10);
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 3, color: 'rgba(232,224,216,0.85)', fontSize: 12,
    fontFamily: 'Inter, sans-serif', padding: '4px 8px', outline: 'none',
  };

  return (
    <div style={panelStyle}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}>
          TRACKERS
        </span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 15 }}>×</button>
      </div>

      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.trackers.map(t => (
          <div key={t.id} style={{
            padding: '10px 11px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5,
          }}>
            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <input
                value={t.name}
                onChange={e => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { name: e.target.value } })}
                style={{ ...fieldStyle, flex: 1 }}
              />
              {/* visible toggle */}
              <button
                title={t.visibleToPlayers ? 'Hide from players' : 'Show to players'}
                onClick={() => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { visibleToPlayers: !t.visibleToPlayers } })}
                style={btnSmall(t.visibleToPlayers)}
              >
                {t.visibleToPlayers ? '👁' : '🙈'}
              </button>
              {/* delete */}
              <button
                onClick={() => dispatch({ type: 'REMOVE_TRACKER', trackerId: t.id })}
                style={{ ...btnSmall(false), color: 'rgba(212,90,74,0.6)' }}
                title="Delete tracker"
              >
                ×
              </button>
            </div>

            {/* Type + max */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <select
                value={t.type}
                onChange={e => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { type: e.target.value } })}
                style={{ ...fieldStyle, cursor: 'pointer' }}
              >
                <option value="progress">Bar</option>
                <option value="pip">Pips</option>
              </select>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>max</span>
              <input
                type="number" min="1" max="99"
                value={t.max}
                onChange={e => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { max: Math.max(1, parseInt(e.target.value) || 1) } })}
                style={{ ...fieldStyle, width: 50, textAlign: 'center' }}
              />
            </div>

            {/* Current value */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', width: 44 }}>value</span>
              <button
                onClick={() => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { current: Math.max(0, t.current - 1) } })}
                style={{ ...btnSmall(false), fontSize: 15 }}
              >−</button>
              <span style={{ fontSize: 13, color: '#e8e2d8', fontFamily: 'Inter, sans-serif', minWidth: 40, textAlign: 'center' }}>
                {t.current} / {t.max}
              </span>
              <button
                onClick={() => dispatch({ type: 'UPDATE_TRACKER', trackerId: t.id, updates: { current: Math.min(t.max, t.current + 1) } })}
                style={{ ...btnSmall(false), fontSize: 15 }}
              >+</button>
            </div>
          </div>
        ))}

        {/* Add tracker */}
        <div style={{
          padding: '10px 11px',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 5,
        }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em', marginBottom: 8 }}>
            ADD TRACKER
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTracker()}
              placeholder="Name…"
              style={{ ...fieldStyle, flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <select value={newType} onChange={e => setNewType(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
              <option value="progress">Bar</option>
              <option value="pip">Pips</option>
            </select>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>max</span>
            <input
              type="number" min="1" max="99"
              value={newMax}
              onChange={e => setNewMax(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ ...fieldStyle, width: 50, textAlign: 'center' }}
            />
          </div>
          <button onClick={addTracker} disabled={!newName.trim()} style={{
            width: '100%', padding: '6px', cursor: newName.trim() ? 'pointer' : 'default',
            background: 'rgba(123,158,201,0.1)', border: '1px solid rgba(123,158,201,0.25)',
            borderRadius: 4, color: '#7B9EC9', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
          }}>
            + ADD
          </button>
        </div>
      </div>
    </div>
  );
}
