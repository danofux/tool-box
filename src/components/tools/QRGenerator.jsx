import { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';

/* ── Minimal QR encoder — Reed-Solomon + data matrix via qrcode-generator style ── */
/* We use the qrcodejs approach rendered onto a canvas */

function QRCanvas({ text, size, color, bg }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!text || !canvasRef.current) return;
    const canvas = canvasRef.current;

    /* Use the browser's built-in URL.createObjectURL + fetch trick isn't available,
       so we encode manually using a pure-JS micro QR library approach via data URL */
    import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js')
      .catch(() => null);

    /* Fallback: draw QR using the qrcode library loaded via dynamic script */
    const script = document.getElementById('qrcode-script') || (() => {
      const s = document.createElement('script');
      s.id = 'qrcode-script';
      s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      document.head.appendChild(s);
      return s;
    })();

    const render = () => {
      if (!window.QRCode) return;
      window.QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: { dark: color, light: bg },
        errorCorrectionLevel: 'H',
      }, () => {});
    };

    if (window.QRCode) {
      render();
    } else {
      script.addEventListener('load', render);
    }
  }, [text, size, color, bg]);

  return <canvas ref={canvasRef} style={{ borderRadius: '1rem', display: 'block' }} />;
}

const PRESETS = [
  { label: 'Dark', color: '#1a1a2e', bg: '#ffffff' },
  { label: 'Indigo', color: '#6366f1', bg: '#eef2ff' },
  { label: 'Ink', color: '#000000', bg: '#ffffff' },
  { label: 'Neon', color: '#00dda0', bg: '#070b18' },
  { label: 'Rose', color: '#f43f5e', bg: '#fff1f2' },
];

export default function QRGenerator() {
  const [input, setInput] = useState('https://vyzzze.github.io');
  const [value, setValue] = useState('https://vyzzze.github.io');
  const [color, setColor] = useState('#1a1a2e');
  const [bg, setBg] = useState('#ffffff');
  const [size] = useState(280);

  const generate = () => setValue(input);

  const download = () => {
    const canvas = document.querySelector('#qr-wrap canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="tool-title">QR Generator</h2>
        <p className="tool-desc">Turn any URL or text into a downloadable QR code</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="URL or any text…"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem',
                padding: '0.65rem 0.9rem', color: 'var(--text-primary)',
                fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
            />
            <button onClick={generate} className="glass-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              <RefreshCw size={13} /> Generate
            </button>
          </div>

          {/* Color controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Color Presets
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setColor(p.color); setBg(p.bg); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.7rem', borderRadius: '9999px',
                    border: `2px solid ${color === p.color ? p.color : 'transparent'}`,
                    background: p.bg, cursor: 'pointer', transition: 'all 0.15s',
                    fontSize: '0.72rem', fontWeight: 600, color: p.color,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual color pickers */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'QR Color', val: color, set: setColor },
              { label: 'Background', val: bg, set: setBg },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{
                  width: 32, height: 32, borderRadius: '8px', overflow: 'hidden',
                  cursor: 'pointer', border: '2px solid rgba(99,102,241,0.2)',
                  boxShadow: `0 2px 8px ${val}44`, transition: 'transform 0.15s',
                  display: 'block',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <input type="color" value={val} onChange={e => set(e.target.value)} style={{ width: '100%', height: '100%' }} />
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          <button onClick={download} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}>
            <Download size={13} /> Download PNG
          </button>
        </div>

        {/* QR preview */}
        <div
          id="qr-wrap"
          style={{
            padding: '1rem', borderRadius: '1.25rem',
            background: bg,
            boxShadow: `0 8px 32px ${color}22`,
            transition: 'background 0.3s, box-shadow 0.3s',
            flexShrink: 0,
          }}
        >
          <QRCanvas text={value} size={size} color={color} bg={bg} />
        </div>
      </div>
    </div>
  );
}
