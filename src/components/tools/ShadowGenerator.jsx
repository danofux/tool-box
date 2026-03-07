import { useState } from 'react';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';

const DEFAULT_SHADOW = { x: 0, y: 8, blur: 24, spread: 0, color: '#6366f1', opacity: 0.35, inset: false };

function toRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function shadowStr(s) {
  return `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${toRgba(s.color, s.opacity)}`;
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6366f1', fontWeight: 700 }}>{value}px</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: '#6366f1' }} />
    </div>
  );
}

export default function ShadowGenerator() {
  const [mode, setMode] = useState('box'); // 'box' | 'text'
  const [shadows, setShadows] = useState([{ ...DEFAULT_SHADOW }]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [previewText, setPreviewText] = useState('Shadow');
  const [previewBg, setPreviewBg] = useState('#ffffff');

  const active = shadows[activeIdx] || shadows[0];
  const cssValue = shadows.map(shadowStr).join(', ');
  const cssProp = mode === 'box' ? 'box-shadow' : 'text-shadow';
  const cssOutput = `${cssProp}: ${cssValue};`;

  const update = patch => setShadows(prev => prev.map((s, i) => i === activeIdx ? { ...s, ...patch } : s));
  const addLayer = () => {
    setShadows(prev => [...prev, { ...DEFAULT_SHADOW, x: 0, y: 16, blur: 40, spread: -4, color: '#000000', opacity: 0.15 }]);
    setActiveIdx(shadows.length);
  };
  const removeLayer = i => {
    if (shadows.length === 1) return;
    const next = shadows.filter((_, idx) => idx !== i);
    setShadows(next);
    setActiveIdx(Math.min(activeIdx, next.length - 1));
  };

  const copy = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const previewShadow = mode === 'box'
    ? { boxShadow: cssValue }
    : { textShadow: cssValue, color: '#1e1b4b' };

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="tool-title">Shadow Generator</h2>
          <p className="tool-desc">Build <code style={{ fontSize: '0.75rem' }}>box-shadow</code> & <code style={{ fontSize: '0.75rem' }}>text-shadow</code> visually</p>
        </div>
        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(99,102,241,0.07)', borderRadius: '0.65rem', padding: '0.2rem', border: '1px solid rgba(99,102,241,0.12)' }}>
          {['box', 'text'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '0.35rem 0.9rem', borderRadius: '0.5rem', border: 'none',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s',
              background: mode === m ? '#6366f1' : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-muted)',
            }}>{m === 'box' ? 'Box' : 'Text'}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Layer tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {shadows.map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <button onClick={() => setActiveIdx(i)} style={{
                  padding: '0.25rem 0.65rem', borderRadius: '0.5rem', border: `1px solid ${i === activeIdx ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
                  cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                  background: i === activeIdx ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: i === activeIdx ? '#6366f1' : 'var(--text-muted)',
                  fontFamily: "'Outfit', sans-serif",
                }}>Layer {i + 1}</button>
                {shadows.length > 1 && (
                  <button onClick={() => removeLayer(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', padding: '0 2px', display: 'flex' }}>
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addLayer} style={{
              display: 'flex', alignItems: 'center', gap: '0.2rem',
              padding: '0.25rem 0.55rem', borderRadius: '0.5rem',
              border: '1px dashed rgba(99,102,241,0.3)',
              background: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: '0.7rem', fontFamily: "'Outfit', sans-serif",
            }}>
              <Plus size={10} /> Add
            </button>
          </div>

          <Slider label="X Offset" value={active.x} min={-60} max={60} onChange={v => update({ x: v })} />
          <Slider label="Y Offset" value={active.y} min={-60} max={60} onChange={v => update({ y: v })} />
          <Slider label="Blur" value={active.blur} min={0} max={100} onChange={v => update({ blur: v })} />
          {mode === 'box' && <Slider label="Spread" value={active.spread} min={-30} max={30} onChange={v => update({ spread: v })} />}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Opacity</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6366f1', fontWeight: 700 }}>{active.opacity}</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={active.opacity} onChange={e => update({ opacity: +e.target.value })}
              style={{ width: '100%', accentColor: '#6366f1' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ width: 32, height: 32, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '2px solid rgba(99,102,241,0.2)', boxShadow: `0 2px 8px ${active.color}55`, display: 'block' }}>
              <input type="color" value={active.color} onChange={e => update({ color: e.target.value })} style={{ width: '100%', height: '100%' }} />
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shadow color</span>
            {mode === 'box' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={active.inset} onChange={e => update({ inset: e.target.checked })} style={{ accentColor: '#6366f1' }} />
                Inset
              </label>
            )}
          </div>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Preview box */}
          <div style={{
            flex: 1, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: previewBg, minHeight: 180, border: '1px solid rgba(99,102,241,0.1)',
            transition: 'background 0.2s', position: 'relative',
          }}>
            {mode === 'box' ? (
              <div style={{
                width: 100, height: 100, borderRadius: '1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                ...previewShadow,
                transition: 'box-shadow 0.2s',
              }} />
            ) : (
              <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Fraunces', serif", userSelect: 'none', ...previewShadow }}>
                {previewText}
              </span>
            )}
          </div>

          {/* Preview controls */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ width: 24, height: 24, borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(99,102,241,0.2)', display: 'block', flexShrink: 0 }}>
              <input type="color" value={previewBg} onChange={e => setPreviewBg(e.target.value)} style={{ width: '100%', height: '100%' }} />
            </label>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BG</span>
            {mode === 'text' && (
              <input
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
                maxLength={12}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '0.5rem', padding: '0.3rem 0.6rem',
                  color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.78rem', outline: 'none',
                }}
              />
            )}
          </div>

          {/* CSS output */}
          <div style={{
            background: 'rgba(10,10,30,0.5)', borderRadius: '0.75rem', padding: '0.75rem 1rem',
            border: '1px solid rgba(99,102,241,0.2)', position: 'relative',
          }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#a5f3d0', lineHeight: 1.6, wordBreak: 'break-all' }}>
              <span style={{ color: '#818cf8' }}>{cssProp}</span>
              <span style={{ color: '#fff' }}>: </span>
              <span style={{ color: '#fde68a' }}>{cssValue}</span>
              <span style={{ color: '#fff' }}>;</span>
            </p>
            <button onClick={copy} style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '0.4rem', padding: '0.3rem 0.5rem', cursor: 'pointer',
              color: copied ? '#22c55e' : '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.65rem', fontWeight: 600,
            }}>
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
