import { useState, useCallback } from 'react';
import { RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const SETS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function entropy(pwd) {
  const pool =
    (/[A-Z]/.test(pwd) ? 26 : 0) +
    (/[a-z]/.test(pwd) ? 26 : 0) +
    (/[0-9]/.test(pwd) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pwd) ? 30 : 0);
  return pool ? +(pwd.length * Math.log2(pool)).toFixed(1) : 0;
}

function strength(bits) {
  if (bits < 40) return { label: 'Weak',   color: '#f43f5e', Icon: ShieldAlert };
  if (bits < 72) return { label: 'Fair',   color: '#f59e0b', Icon: Shield };
  return           { label: 'Strong', color: '#22c55e', Icon: ShieldCheck };
}

function generate(length, opts) {
  let pool = '';
  if (opts.upper)   pool += SETS.upper;
  if (opts.lower)   pool += SETS.lower;
  if (opts.numbers) pool += SETS.numbers;
  if (opts.symbols) pool += SETS.symbols;
  if (!pool) return '';

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => pool[n % pool.length]).join('');
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '0.5rem 0' }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
      <div
        onClick={onChange}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: checked ? '#6366f1' : 'rgba(99,102,241,0.15)',
          transition: 'background 0.2s', position: 'relative', flexShrink: 0,
          boxShadow: checked ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </label>
  );
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState(() =>
    Array.from({ length: 5 }, () => generate(20, { upper: true, lower: true, numbers: true, symbols: false }))
  );
  const [copied, setCopied] = useState(null);

  const regenerate = useCallback(() => {
    setPasswords(Array.from({ length: count }, () => generate(length, opts)));
  }, [length, opts, count]);

  const toggle = key => {
    const next = { ...opts, [key]: !opts[key] };
    if (!Object.values(next).some(Boolean)) return;
    setOpts(next);
    setPasswords(Array.from({ length: count }, () => generate(length, next)));
  };

  const copy = (pwd, i) => {
    navigator.clipboard.writeText(pwd);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="tool-title">Password Generator</h2>
        <p className="tool-desc">Cryptographically random — uses <code style={{ fontSize: '0.75rem' }}>crypto.getRandomValues</code></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Length */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>Length</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>{length}</span>
            </div>
            <input
              type="range" min={6} max={64} value={length}
              onChange={e => setLength(+e.target.value)}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>

          {/* Count */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>Batch size</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>{count}</span>
            </div>
            <input
              type="range" min={1} max={10} value={count}
              onChange={e => { setCount(+e.target.value); setPasswords(Array.from({ length: +e.target.value }, () => generate(length, opts))); }}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>

          <Toggle label="Uppercase (A–Z)"   checked={opts.upper}   onChange={() => toggle('upper')} />
          <Toggle label="Lowercase (a–z)"   checked={opts.lower}   onChange={() => toggle('lower')} />
          <Toggle label="Numbers (0–9)"     checked={opts.numbers} onChange={() => toggle('numbers')} />
          <Toggle label="Symbols (!@#…)"    checked={opts.symbols} onChange={() => toggle('symbols')} />
        </div>

        {/* Password list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {passwords.map((pwd, i) => {
            const bits = entropy(pwd);
            const { label, color, Icon } = strength(bits);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(99,102,241,0.1)',
                borderRadius: '0.75rem', padding: '0.5rem 0.75rem',
                transition: 'border-color 0.15s',
              }}>
                <Icon size={13} style={{ color, flexShrink: 0 }} />
                <span style={{
                  flex: 1, fontFamily: 'monospace', fontSize: '0.8rem',
                  color: 'var(--text-primary)', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '0.04em',
                }}>
                  {pwd}
                </span>
                <span style={{ fontSize: '0.6rem', color, fontWeight: 600, flexShrink: 0 }}>{bits}b</span>
                <button onClick={() => copy(pwd, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: '2px' }}>
                  {copied === i ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={regenerate} className="glass-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={13} /> Regenerate
        </button>
        <button onClick={copyAll} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {copied === 'all' ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
          Copy All
        </button>
      </div>
    </div>
  );
}
