import { useState } from 'react';

export default function PlayerNamePrompt({ onSubmit }) {
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#06060e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#111118', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 10, padding: '36px 40px', width: 360,
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
            <polygon points="12,2 21.4,7.5 21.4,16.5 12,22 2.6,16.5 2.6,7.5"
              fill="none" stroke="rgba(123,158,201,0.6)" strokeWidth="1.5" />
            <polygon points="12,6 17.2,9 17.2,15 12,18 6.8,15 6.8,9"
              fill="rgba(123,158,201,0.12)" stroke="rgba(123,158,201,0.35)" strokeWidth="1" />
            <circle cx="12" cy="12" r="2.2" fill="rgba(123,158,201,0.6)" />
          </svg>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#e8e2d8', letterSpacing: '0.08em', fontWeight: 600 }}>
            CHULT EXPLORER
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', marginTop: 4 }}>
            TOMB OF ANNIHILATION
          </div>
        </div>

        <div style={{ fontFamily: 'IM Fell English, Georgia, serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', textAlign: 'center', marginBottom: 22, lineHeight: 1.55 }}>
          Enter your character name to begin.
        </div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Character name…"
          autoFocus
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5,
            color: '#e8e2d8', fontSize: 14, fontFamily: 'Inter, sans-serif',
            padding: '10px 14px', outline: 'none', boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />

        <button
          onClick={submit}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '10px', cursor: name.trim() ? 'pointer' : 'default',
            background: name.trim() ? 'rgba(74,156,110,0.25)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${name.trim() ? 'rgba(74,156,110,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 5,
            color: name.trim() ? '#4a9c6e' : 'rgba(255,255,255,0.25)',
            fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.1em',
            transition: 'all 0.15s',
          }}
        >
          ENTER THE JUNGLE
        </button>
      </div>
    </div>
  );
}
