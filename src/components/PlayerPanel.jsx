import { useState } from 'react';
import { renderMarkdown } from '../lib/markdown';

export default function PlayerPanel({ hex, hexId: hid, onClose, playerName, playerNote, partyNote, onSavePlayerNote, onSavePartyNote }) {
  const tier = hex?.revealTier ?? 0;
  const [myNote, setMyNote] = useState(playerNote || '');
  const [party, setParty] = useState(partyNote || '');

  const headerName = tier >= 2 && hex?.name ? hex.name
    : tier === 1 ? `Hex ${hid}` : 'Unknown Location';

  const noteStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
    color: 'rgba(232,224,216,0.75)', fontSize: 12,
    fontFamily: 'Inter, sans-serif', padding: '8px 10px',
    resize: 'vertical', minHeight: 76, outline: 'none',
    boxSizing: 'border-box', lineHeight: 1.55,
  };

  const SectionLabel = ({ children }) => (
    <div style={{
      fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.16em',
      color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
      marginBottom: 7, paddingBottom: 4,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>{children}</div>
  );

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 370,
      background: '#111118',
      borderLeft: '1px solid rgba(123,158,201,0.1)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '-12px 0 40px rgba(0,0,0,0.65)',
      animation: 'slideInRight 0.2s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '11px 14px', background: '#0c0c14',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        {tier >= 2 && hex?.colorTag && (
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: hex.colorTag, flexShrink: 0 }} />
        )}
        <span style={{
          flex: 1, fontFamily: 'Cinzel, serif', letterSpacing: '0.04em',
          fontSize: tier >= 2 ? 15 : 12,
          color: tier >= 2 ? '#e8e2d8' : 'rgba(255,255,255,0.3)',
        }}>{headerName}</span>
        <button onClick={onClose} style={{
          width: 26, height: 26, background: 'transparent', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          color: 'rgba(255,255,255,0.4)', fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {tier === 3 && hex?.markdown && (
          <div>
            <SectionLabel>About This Place</SectionLabel>
            <div className="md-content" style={{ color: 'rgba(232,224,216,0.82)', fontSize: 13, lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(hex.markdown) }} />
          </div>
        )}

        {tier === 3 && hex?.sharedNote && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(74,156,110,0.07)',
            border: '1px solid rgba(74,156,110,0.2)', borderRadius: 6,
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(74,156,110,0.65)', fontFamily: 'Cinzel, serif', marginBottom: 5 }}>
              GUIDE NOTE
            </div>
            <div style={{ color: 'rgba(232,224,216,0.7)', fontSize: 12, fontFamily: 'IM Fell English, Georgia, serif', fontStyle: 'italic', lineHeight: 1.5 }}>
              {hex.sharedNote}
            </div>
          </div>
        )}

        {tier < 2 && (
          <div style={{ padding: '24px 12px', textAlign: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(123,158,201,0.08)',
              border: '1px solid rgba(123,158,201,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: 20, color: 'rgba(123,158,201,0.45)',
            }}>
              {tier === 1 ? '◉' : '○'}
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'rgba(255,255,255,0.22)', marginBottom: 8 }}>
              {tier === 1 ? 'Unexplored Territory' : 'Beyond the Fog'}
            </div>
            <div style={{ fontFamily: 'IM Fell English, Georgia, serif', fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.15)', lineHeight: 1.55, maxWidth: 240, margin: '0 auto' }}>
              {tier === 1
                ? 'You know this hex exists, but its secrets remain undiscovered.'
                : 'The jungle jealously guards its secrets from the unprepared.'}
            </div>
          </div>
        )}

        <div>
          <SectionLabel>My Notes ({playerName})</SectionLabel>
          <textarea
            value={myNote}
            onChange={e => setMyNote(e.target.value)}
            onBlur={() => onSavePlayerNote(myNote)}
            placeholder="Your personal notes about this location — only you see these…"
            style={noteStyle}
          />
        </div>

        <div>
          <SectionLabel>Party Notes (shared)</SectionLabel>
          <textarea
            value={party}
            onChange={e => setParty(e.target.value)}
            onBlur={() => onSavePartyNote(party)}
            placeholder="Notes the whole party can read and edit…"
            style={{ ...noteStyle, borderColor: 'rgba(123,158,201,0.12)' }}
          />
        </div>

      </div>
    </div>
  );
}
