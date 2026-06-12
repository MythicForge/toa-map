import { useState } from 'react';
import { renderMarkdown } from '../lib/markdown';
import { ALL_LOCATIONS } from '../lib/locations';

const TIER_META = [
  { label: 'Hidden',       desc: 'Players cannot see this hex',                color: '#454455' },
  { label: 'Hex Visible',  desc: 'Players see a blank hex outline only',        color: '#7B9EC9' },
  { label: 'Name Visible', desc: 'Players see the hex and its name',            color: '#C9923A' },
  { label: 'Full Reveal',  desc: 'Players see name, description & shared note', color: '#4a9c6e' },
];

const COLOR_PRESETS = [
  '#7B9EC9', '#4a9c6e', '#C9923A', '#E05C4B',
  '#9C7CC0', '#b84040', '#4cb8a0', '#c4932a',
];

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.16em',
    color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
    marginBottom: 7, paddingBottom: 4,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>{children}</div>
);

const FieldLabel = ({ children }) => (
  <div style={{
    fontSize: 10, color: 'rgba(255,255,255,0.38)',
    fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em', marginBottom: 4,
  }}>{children}</div>
);

const baseInput = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 4,
  color: 'rgba(232,224,216,0.9)', fontSize: 13,
  fontFamily: 'Inter, sans-serif', padding: '7px 10px',
  outline: 'none', boxSizing: 'border-box',
};

const baseTextarea = { ...baseInput, fontSize: 12, resize: 'vertical', minHeight: 70, lineHeight: 1.55 };

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
      {COLOR_PRESETS.map(c => (
        <div key={c} onClick={() => onChange(c)} style={{
          width: 18, height: 18, borderRadius: 3, background: c, cursor: 'pointer', flexShrink: 0,
          border: value === c ? '2px solid rgba(255,255,255,0.85)' : '1px solid rgba(255,255,255,0.18)',
          boxShadow: value === c ? `0 0 6px ${c}88` : 'none',
        }} />
      ))}
      <input type="color" value={value || '#7B9EC9'}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 22, height: 22, padding: 0, border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 3, background: 'transparent', cursor: 'pointer', flexShrink: 0,
        }}
      />
    </div>
  );
}

function TierSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {TIER_META.map((t, i) => (
        <button key={i} onClick={() => onChange(i)} title={t.desc} style={{
          flex: 1, padding: '5px 2px',
          background: value === i ? t.color + '28' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${value === i ? t.color + '88' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 4, cursor: 'pointer', textAlign: 'center',
          color: value === i ? t.color : 'rgba(255,255,255,0.3)',
          fontSize: 9, fontFamily: 'Inter, sans-serif', lineHeight: 1.3,
          transition: 'all 0.15s',
        }}>
          {t.label.split(' ').map((w, j) => <span key={j} style={{ display: 'block' }}>{w}</span>)}
        </button>
      ))}
    </div>
  );
}

function MarkdownEditor({ value, onChange }) {
  const [preview, setPreview] = useState(false);
  const tabStyle = (active) => ({
    padding: '3px 11px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
    border: active ? '1px solid rgba(123,158,201,0.45)' : '1px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(123,158,201,0.15)' : 'transparent',
    color: active ? '#7B9EC9' : 'rgba(255,255,255,0.35)',
  });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3, marginBottom: 5 }}>
        <button style={tabStyle(!preview)} onClick={() => setPreview(false)}>Edit</button>
        <button style={tabStyle(preview)} onClick={() => setPreview(true)}>Preview</button>
      </div>
      {preview
        ? <div className="md-content" style={{
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '8px 12px', minHeight: 100,
            color: 'rgba(232,224,216,0.8)', fontSize: 13, lineHeight: 1.65,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value || '') }} />
        : <textarea value={value || ''} onChange={e => onChange(e.target.value)}
            placeholder="Paste module content here. Supports # Heading, **bold**, - list item…"
            style={{ ...baseTextarea, fontFamily: 'monospace', minHeight: 110, fontSize: 11 }} />
      }
    </div>
  );
}

export default function GMPanel({ hex, hexId: hid, onClose, onUpdate, partyMarkers, onMoveMarker, playerNotes }) {
  const init = {
    name: '', colorTag: '#7B9EC9', revealTier: 0, location: null,
    markdown: '', gmNote: '', sharedNote: '',
    ...(hex || {}),
  };
  const [local, setLocal] = useState(init);

  const set = (field, val) => {
    const next = { ...local, [field]: val };
    setLocal(next);
    onUpdate(next);
  };

  const tier = local.revealTier;
  const assignedLocations = new Set(Object.values({})); // locations used by other hexes shown via parent

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 390,
      background: '#111118', borderLeft: '1px solid rgba(255,255,255,0.07)',
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
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.16em' }}>GM PANEL</span>
        <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 14, color: '#e8e2d8', fontWeight: 600, letterSpacing: '0.04em' }}>
          Hex {hid}
        </span>
        <span style={{
          padding: '2px 9px', borderRadius: 10, fontSize: 9,
          background: TIER_META[tier].color + '22',
          border: `1px solid ${TIER_META[tier].color}44`,
          color: TIER_META[tier].color,
          fontFamily: 'Inter, sans-serif',
        }}>{TIER_META[tier].label}</span>
        <button onClick={onClose} style={{
          width: 26, height: 26, background: 'transparent', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          color: 'rgba(255,255,255,0.4)', fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Identity */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Identity</SectionLabel>
          <div style={{ marginBottom: 11 }}>
            <FieldLabel>Assign Location</FieldLabel>
            <select value={local.location || ''} onChange={e => {
              const loc = e.target.value;
              set('location', loc || null);
              if (loc && !local.name) set('name', loc);
            }} style={{ ...baseInput, cursor: 'pointer' }}>
              <option value="">— Unassigned —</option>
              {ALL_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 11 }}>
            <FieldLabel>Display Name</FieldLabel>
            <input type="text" value={local.name || ''} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Port Nyanzaru" style={baseInput} />
          </div>
          <div>
            <FieldLabel>Region Color</FieldLabel>
            <ColorPicker value={local.colorTag} onChange={v => set('colorTag', v)} />
          </div>
        </div>

        {/* Player Visibility */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Player Visibility</SectionLabel>
          <TierSelector value={local.revealTier} onChange={v => set('revealTier', v)} />
          <div style={{ marginTop: 5, fontSize: 10, color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
            {TIER_META[tier].desc}
          </div>
        </div>

        {/* Location Content */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Location Content</SectionLabel>
          <MarkdownEditor value={local.markdown} onChange={v => set('markdown', v)} />
        </div>

        {/* GM Private Note */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>GM Private Note</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#d45a4a', marginBottom: 5, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ fontSize: 11 }}>⚠</span>
            <span>Never synced to players</span>
          </div>
          <textarea value={local.gmNote || ''} onChange={e => set('gmNote', e.target.value)}
            placeholder="Your private notes, encounter hooks, secrets, DM reminders…"
            style={{ ...baseTextarea, borderColor: 'rgba(212,90,74,0.2)' }} />
        </div>

        {/* Shared Note */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Shared Note</SectionLabel>
          <div style={{ fontSize: 10, color: 'rgba(74,156,110,0.75)', fontFamily: 'Inter, sans-serif', marginBottom: 5 }}>
            Shown to players when tier is Full Reveal
          </div>
          <textarea value={local.sharedNote || ''} onChange={e => set('sharedNote', e.target.value)}
            placeholder="What players will see when this location is fully revealed…"
            style={{ ...baseTextarea, borderColor: 'rgba(74,156,110,0.18)' }} />
        </div>

        {/* Party Markers */}
        {partyMarkers && partyMarkers.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Party Markers</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {partyMarkers.map(m => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  background: m.hexId === hid ? 'rgba(255,215,0,0.07)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${m.hexId === hid ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 4,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'rgba(232,224,216,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    {m.name}
                    {m.hexId === hid && <span style={{ fontSize: 9, color: 'rgba(255,215,0,0.6)', marginLeft: 6 }}>HERE</span>}
                  </span>
                  <button onClick={() => onMoveMarker(m.id)} style={{
                    padding: '3px 9px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                    background: 'rgba(196,147,42,0.1)', border: '1px solid rgba(196,147,42,0.3)',
                    color: '#c4932a', fontFamily: 'Inter, sans-serif',
                  }}>
                    Move here
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Notes (read-only) */}
        {playerNotes && Object.keys(playerNotes).length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Player Notes</SectionLabel>
            {Object.entries(playerNotes).map(([player, note]) => note ? (
              <div key={player} style={{
                marginBottom: 7, padding: '8px 10px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4,
              }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', marginBottom: 3 }}>
                  {player}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(232,224,216,0.55)', fontFamily: 'IM Fell English, Georgia, serif', fontStyle: 'italic', lineHeight: 1.45 }}>
                  {note}
                </div>
              </div>
            ) : null)}
          </div>
        )}

      </div>
    </div>
  );
}
