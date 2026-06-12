import { useState } from 'react';

const TIER_META = [
  { label: 'Hidden',       color: '#454455' },
  { label: 'Hex Visible',  color: '#7B9EC9' },
  { label: 'Name Visible', color: '#C9923A' },
  { label: 'Full Reveal',  color: '#4a9c6e' },
];

const COLOR_PRESETS = [
  '#7B9EC9', '#4a9c6e', '#C9923A', '#E05C4B',
  '#9C7CC0', '#b84040', '#4cb8a0', '#c4932a',
];

export default function BulkEditBar({ count, onApply, onClear }) {
  const [tier, setTier] = useState(null);   // null = don't change
  const [color, setColor] = useState(null); // null = don't change

  const apply = () => {
    onApply({ tier, color });
    onClear();
  };

  return (
    <div style={{
      position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#141420', border: '1px solid rgba(123,158,201,0.3)',
      borderRadius: 8, padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', gap: 14,
      zIndex: 150, userSelect: 'none', flexWrap: 'wrap',
    }}>
      {/* Count badge */}
      <div style={{
        padding: '3px 10px', borderRadius: 12,
        background: 'rgba(123,158,201,0.15)', border: '1px solid rgba(123,158,201,0.3)',
        fontSize: 11, color: '#7B9EC9', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        {count} hex{count !== 1 ? 'es' : ''} selected
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

      {/* Tier picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}>
          REVEAL TIER
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {TIER_META.map((t, i) => (
            <button key={i} onClick={() => setTier(tier === i ? null : i)} style={{
              padding: '4px 8px',
              background: tier === i ? t.color + '28' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tier === i ? t.color + '88' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 4, cursor: 'pointer',
              color: tier === i ? t.color : 'rgba(255,255,255,0.3)',
              fontSize: 9, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              transition: 'all 0.12s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

      {/* Color picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', fontFamily: 'Cinzel, serif', letterSpacing: '0.12em' }}>
          REGION COLOR
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Clear color option */}
          <div
            onClick={() => setColor(color === '' ? null : '')}
            title="No color"
            style={{
              width: 18, height: 18, borderRadius: 3, cursor: 'pointer', flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: color === '' ? '2px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
            }}
          >×</div>
          {COLOR_PRESETS.map(c => (
            <div key={c} onClick={() => setColor(color === c ? null : c)} style={{
              width: 18, height: 18, borderRadius: 3, background: c, cursor: 'pointer', flexShrink: 0,
              border: color === c ? '2px solid rgba(255,255,255,0.85)' : '1px solid rgba(255,255,255,0.18)',
              boxShadow: color === c ? `0 0 6px ${c}88` : 'none',
            }} />
          ))}
          <input type="color"
            value={typeof color === 'string' && color.startsWith('#') ? color : '#7B9EC9'}
            onChange={e => setColor(e.target.value)}
            style={{ width: 22, height: 22, padding: 0, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
          />
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={apply}
          disabled={tier === null && color === null}
          style={{
            padding: '6px 16px', cursor: (tier !== null || color !== null) ? 'pointer' : 'default',
            background: (tier !== null || color !== null) ? 'rgba(74,156,110,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${(tier !== null || color !== null) ? 'rgba(74,156,110,0.45)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 5, color: (tier !== null || color !== null) ? '#4a9c6e' : 'rgba(255,255,255,0.25)',
            fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
            transition: 'all 0.12s',
          }}
        >
          Apply
        </button>
        <button
          onClick={onClear}
          style={{
            padding: '6px 14px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 5, color: 'rgba(255,255,255,0.35)',
            fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: '0.08em',
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
