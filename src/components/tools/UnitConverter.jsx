import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

const CATEGORIES = {
  Length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  Weight: {
    units: ['mg', 'g', 'kg', 'oz', 'lb', 't'],
    toBase: { mg: 0.000001, g: 0.001, kg: 1, oz: 0.028349, lb: 0.453592, t: 1000 },
  },
  Temperature: {
    units: ['°C', '°F', 'K'],
    toBase: null,
  },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'knot'],
    toBase: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  },
  Area: {
    units: ['mm²', 'cm²', 'm²', 'km²', 'in²', 'ft²', 'acre'],
    toBase: { 'mm²': 0.000001, 'cm²': 0.0001, 'm²': 1, 'km²': 1e6, 'in²': 0.000645, 'ft²': 0.092903, acre: 4046.856 },
  },
  Data: {
    units: ['bit', 'B', 'KB', 'MB', 'GB', 'TB'],
    toBase: { bit: 0.125, B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
  },
};

function convertTemp(value, from, to) {
  let celsius;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;
  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

function convert(value, from, to, category) {
  if (!value && value !== 0) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  if (from === to) return num;
  if (category === 'Temperature') return +convertTemp(num, from, to).toFixed(6);
  const base = CATEGORIES[category].toBase;
  return +(num * base[from] / base[to]).toFixed(8);
}

function fmt(val) {
  if (val === '' || val === null || val === undefined) return '';
  const n = parseFloat(val);
  if (isNaN(n)) return '';
  if (Math.abs(n) >= 1e-4 && Math.abs(n) < 1e10) return parseFloat(n.toPrecision(8)).toString();
  return n.toExponential(4);
}

/* Custom dropdown — no native select */
function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(99,102,241,0.1)', border: `1px solid ${open ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.2)'}`,
          borderRadius: '0.75rem', padding: '0.5rem 0.75rem',
          color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif",
          fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
          transition: 'border-color 0.15s', outline: 'none',
          gap: '0.5rem',
        }}
      >
        <span>{value}</span>
        <ChevronDown size={14} style={{ color: '#6366f1', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.75rem',
          overflow: 'hidden', zIndex: 100,
          boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
        }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width: '100%', padding: '0.55rem 0.85rem', border: 'none',
                background: opt === value ? 'rgba(99,102,241,0.18)' : 'transparent',
                color: opt === value ? '#6366f1' : 'var(--text-primary)',
                fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem',
                fontWeight: opt === value ? 700 : 500,
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
              onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [input, setInput] = useState('1');

  const units = CATEGORIES[category].units;
  const result = convert(input, from, to, category);

  const swap = () => {
    setFrom(to);
    setTo(from);
    setInput(fmt(result) || '1');
  };

  const changeCategory = c => {
    setCategory(c);
    const u = CATEGORIES[c].units;
    setFrom(u[0]);
    setTo(u[1]);
    setInput('1');
  };

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="tool-title">Unit Converter</h2>
        <p className="tool-desc">Length, weight, temperature, speed, area & data</p>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {Object.keys(CATEGORIES).map(c => (
          <button
            key={c}
            onClick={() => changeCategory(c)}
            style={{
              padding: '0.3rem 0.85rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 600,
              transition: 'all 0.18s',
              background: category === c ? '#6366f1' : 'rgba(99,102,241,0.1)',
              color: category === c ? '#fff' : 'var(--text-muted)',
              boxShadow: category === c ? '0 3px 12px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
        {/* From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Dropdown value={from} options={units} onChange={setFrom} />
          <input
            type="number"
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '0.75rem', padding: '0.75rem',
              color: 'var(--text-primary)', fontFamily: 'monospace',
              fontSize: '1.4rem', fontWeight: 600, outline: 'none', width: '100%',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
          />
        </div>

        {/* Swap */}
        <button
          onClick={swap}
          style={{
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', color: '#6366f1', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}
        >
          <ArrowLeftRight size={16} />
        </button>

        {/* To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Dropdown value={to} options={units} onChange={setTo} />
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '0.75rem', padding: '0.75rem',
            fontSize: '1.4rem', fontWeight: 600, color: '#6366f1', fontFamily: 'monospace',
            minHeight: '56px', display: 'flex', alignItems: 'center',
          }}>
            {fmt(result) || '—'}
          </div>
        </div>
      </div>

      {input && result !== '' && (
        <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {input} {from} = <strong style={{ color: 'var(--text-primary)' }}>{fmt(result)} {to}</strong>
        </p>
      )}
    </div>
  );
}

