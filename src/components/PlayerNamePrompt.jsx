import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PlayerNamePrompt({ onSubmit }) {
  const [name, setName] = useState('');
  const [knownNames, setKnownNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('player_notes')
      .select('player_name')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map(r => r.player_name))].sort();
          setKnownNames(unique);
        }
        setLoading(false);
      });
  }, []);

  const submit = (n = name) => {
    const trimmed = n.trim();
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
        borderRadius: 10, padding: '36px 40px', width: 380,
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

        {/* Known players */}
        {!loading && knownNames.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.28)', marginBottom: 10, textAlign: 'center',
            }}>
              RETURNING EXPLORER?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {knownNames.map(n => (
                <button key={n} onClick={() => submit(n)} style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: 'rgba(123,158,201,0.1)',
                  border: '1px solid rgba(123,158,201,0.3)',
                  color: '#7B9EC9', fontFamily: 'Inter, sans-serif',
                  fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {n}
                </button>
              ))}
            </div>
            <div style={{
              margin: '18px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                background: '#111118', padding: '0 10px',
                fontSize: 9, color: 'rgba(255,255,255,0.22)',
                fontFamily: 'Cinzel, serif', letterSpacing: '0.12em',
              }}>OR NEW EXPLORER</span>
            </div>
          </div>
        )}

        <div style={{
          fontFamily: 'IM Fell English, Georgia, serif', fontSize: 13,
          color: 'rgba(255,255,255,0.45)', fontStyle: 'italic',
          textAlign: 'center', marginBottom: 14, lineHeight: 1.55,
        }}>
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
          onClick={() => submit()}
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
