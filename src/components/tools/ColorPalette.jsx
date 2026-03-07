import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Lock, Unlock, Check, Copy } from 'lucide-react';
import { generatePalette, getColorFormats, isLight } from '../../utils/colorUtils';

function ColorCard({ hex, locked, onToggleLock }) {
  const [copied, setCopied] = useState(null);
  const [hovered, setHovered] = useState(false);
  const formats = getColorFormats(hex);
  const dark = !isLight(hex);

  const copy = (label, value) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Swatch */}
      <div
        className="h-36 rounded-2xl flex flex-col justify-between p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1"
        style={{ background: hex, boxShadow: `0 6px 24px ${hex}55` }}
      >
        <div className="flex items-start justify-between">
          <span className={`text-[11px] font-mono font-bold tracking-wider ${dark ? 'text-white/90' : 'text-black/60'}`}>
            {hex.toUpperCase()}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleLock(); }}
            className={`p-1 rounded-lg transition-all ${dark ? 'text-white/70 hover:bg-white/20' : 'text-black/50 hover:bg-black/10'}`}
          >
            {locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
        </div>
        <span className={`text-[9px] font-semibold tracking-widest uppercase ${dark ? 'text-white/40' : 'text-black/30'}`}>
          hover to copy
        </span>
      </div>

      {/* Floating popover — appears above the card */}
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 mb-2 z-50 glass-card"
          style={{
            transform: 'translateX(-50%)',
            width: '220px',
            padding: '0.6rem',
            animation: 'toolEnter 0.18s ease both',
          }}
        >
          {Object.entries(formats).map(([label, value]) => (
            <button
              key={label}
              onClick={() => copy(label, value)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.35rem 0.5rem', borderRadius: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#6366f1', width: '40px', textAlign: 'left' }}>
                {label}
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-primary)', flex: 1, textAlign: 'left', marginLeft: '6px', whiteSpace: 'nowrap' }}>
                {value}
              </span>
              {copied === label
                ? <Check size={11} color="#22c55e" />
                : <Copy size={11} color="#9ca3af" />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ColorPalette() {
  const [colors, setColors] = useState(() => generatePalette());
  const [locked, setLocked] = useState([false, false, false, false, false]);

  const regenerate = useCallback(() => {
    const lockedColors = colors.map((c, i) => locked[i] ? c : null);
    setColors(generatePalette(lockedColors));
  }, [colors, locked]);

  const toggleLock = i => setLocked(prev => prev.map((v, idx) => idx === i ? !v : v));

  const handleKey = useCallback(e => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      regenerate();
    }
  }, [regenerate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="glass-card p-6 tool-enter">
      <div className="tool-header flex items-start justify-between">
        <div>
          <h2 className="tool-title">Color Palette</h2>
          <p className="tool-desc">5 cohesive colors · hover to copy formats · lock to preserve</p>
        </div>
        <button onClick={regenerate} className="glass-btn flex items-center gap-2 text-sm mt-1">
          <RefreshCw size={14} />
          Generate
          <span className="text-[10px] opacity-50 font-mono">[space]</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3" style={{ overflow: 'visible' }}>
        {colors.map((hex, i) => (
          <ColorCard
            key={i}
            hex={hex}
            locked={locked[i]}
            onToggleLock={() => toggleLock(i)}
          />
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-4">
        Hover a swatch to reveal copy options · click the lock to preserve a color
      </p>
    </div>
  );
}
