import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopBar({ mode, trackers, unassignedCount, unassignedLocations, playerName, onShowTrackers, onShowParty, multiSelectMode, onToggleMultiSelect, onRevealAll, onExport, onImport }) {
  const navigate = useNavigate();
  const [showUnassigned, setShowUnassigned] = useState(false);

  return (
    <div style={{
      height: 52, background: '#0b0b14',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 14px', flexShrink: 0,
      position: 'relative', zIndex: 200,
      userSelect: 'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 18 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 21.4,7.5 21.4,16.5 12,22 2.6,16.5 2.6,7.5"
            fill="none" stroke="rgba(123,158,201,0.6)" strokeWidth="1.5" />
          <polygon points="12,6 17.2,9 17.2,15 12,18 6.8,15 6.8,9"
            fill="rgba(123,158,201,0.12)" stroke="rgba(123,158,201,0.35)" strokeWidth="1" />
          <circle cx="12" cy="12" r="2.2" fill="rgba(123,158,201,0.6)" />
        </svg>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#e8e2d8', letterSpacing: '0.08em', fontWeight: 600, lineHeight: 1 }}>
            CHULT EXPLORER
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', lineHeight: 1, marginTop: 2 }}>
            TOMB OF ANNIHILATION
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.07)', marginRight: 16 }} />

      {/* View toggle */}
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
        padding: 2, gap: 2,
      }}>
        {[['gm', 'GM View', '/gm'], ['player', 'Player View', '/player']].map(([v, label, path]) => (
          <button key={v} onClick={() => navigate(path)} style={{
            padding: '4px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.07em',
            transition: 'all 0.15s',
            background: mode === v ? (v === 'gm' ? 'rgba(123,158,201,0.2)' : 'rgba(74,156,110,0.2)') : 'transparent',
            color: mode === v ? (v === 'gm' ? '#7B9EC9' : '#4a9c6e') : 'rgba(255,255,255,0.32)',
          }}>{label}</button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Trackers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginRight: 14 }}>
        {trackers.filter(t => mode === 'gm' || t.visibleToPlayers).map(t => (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
              {t.name}
            </div>
            {t.type === 'progress'
              ? <>
                  <div style={{ width: 58, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, transition: 'width 0.3s',
                      width: `${(t.current / t.max) * 100}%`,
                      background: t.id === 'rations' ? '#4a9c6e' : t.id === 'curse' ? '#d45a4a' : '#7B9EC9',
                    }} />
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', fontFamily: 'Inter, sans-serif' }}>
                    {t.current}/{t.max}
                  </div>
                </>
              : <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: t.max }, (_, i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: i < t.current ? '#7B9EC9' : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
            }
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.07)', marginRight: 12 }} />

      {mode === 'gm' && (
        <>
          {/* Trackers button */}
          <button onClick={onShowTrackers} style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter, sans-serif',
          }}>
            Trackers
          </button>

          {/* Party button */}
          <button onClick={onShowParty} style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter, sans-serif',
          }}>
            Party
          </button>

          {/* Export */}
          <button onClick={onExport} style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter, sans-serif',
          }}>
            Export
          </button>

          {/* Import */}
          <label style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter, sans-serif',
            userSelect: 'none',
          }}>
            Import
            <input type="file" accept=".json" onChange={onImport}
              style={{ display: 'none' }} />
          </label>

          {/* Reveal all */}
          <button onClick={onRevealAll} style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 6,
            background: 'rgba(74,156,110,0.07)', border: '1px solid rgba(74,156,110,0.2)',
            color: 'rgba(74,156,110,0.7)', fontSize: 11, fontFamily: 'Inter, sans-serif',
          }}>
            Reveal All
          </button>

          {/* Multi-select toggle */}
          <button onClick={onToggleMultiSelect} style={{
            padding: '5px 11px', cursor: 'pointer', borderRadius: 5, marginRight: 8,
            background: multiSelectMode ? 'rgba(123,158,201,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${multiSelectMode ? 'rgba(123,158,201,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: multiSelectMode ? '#7B9EC9' : 'rgba(255,255,255,0.45)',
            fontSize: 11, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
          }}>
            Select
          </button>

          {/* Unassigned locations */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowUnassigned(s => !s)} style={{
              padding: '5px 11px', cursor: 'pointer', borderRadius: 5,
              background: unassignedCount > 0 ? 'rgba(196,147,42,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${unassignedCount > 0 ? 'rgba(196,147,42,0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: unassignedCount > 0 ? '#c4932a' : 'rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontFamily: 'Inter, sans-serif',
            }}>
              <span style={{ fontWeight: 600 }}>{unassignedCount}</span>
              <span style={{ opacity: 0.75 }}>unplaced</span>
            </button>
            {showUnassigned && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 220,
                background: '#141420', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '10px 0',
                boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
                zIndex: 500, maxHeight: 280, overflowY: 'auto',
              }}>
                <div style={{ padding: '0 12px 6px', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}>
                  UNPLACED LOCATIONS
                </div>
                {(unassignedLocations || []).map(l => (
                  <div key={l} style={{
                    padding: '5px 12px', fontSize: 12,
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'Inter, sans-serif',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>{l}</div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'player' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '4px 11px',
          background: 'rgba(74,156,110,0.07)',
          border: '1px solid rgba(74,156,110,0.2)', borderRadius: 5,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(74,156,110,0.2)',
            border: '1px solid rgba(74,156,110,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#4a9c6e', fontFamily: 'Cinzel, serif', fontWeight: 700,
          }}>{playerName?.charAt(0)}</div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', fontFamily: 'Inter, sans-serif' }}>
            {playerName}
          </span>
        </div>
      )}
    </div>
  );
}
