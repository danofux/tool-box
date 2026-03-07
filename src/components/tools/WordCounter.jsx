import { useState, useMemo } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';

function stat(label, value, accent = false) {
  return (
    <div style={{
      background: accent ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.35)',
      border: `1px solid ${accent ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.5)'}`,
      borderRadius: '1rem', padding: '0.85rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '0.2rem',
    }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: accent ? '#6366f1' : 'var(--text-primary)', fontFamily: 'monospace', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

const COMMON = ['the','a','an','and','or','but','in','on','at','to','for','of','with','is','it','be','was','are'];

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const t = text.trim();
    const words = t ? t.split(/\s+/).filter(Boolean) : [];
    const sentences = t ? t.split(/[.!?]+/).filter(s => s.trim()) : [];
    const paragraphs = t ? text.split(/\n{2,}/).filter(p => p.trim()) : [];
    const avgWordLen = words.length
      ? (words.reduce((s, w) => s + w.replace(/[^a-z]/gi, '').length, 0) / words.length).toFixed(1)
      : 0;
    const readTime = Math.max(1, Math.ceil(words.length / 238));

    // Top words
    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length > 2 && !COMMON.includes(clean)) freq[clean] = (freq[clean] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      words: words.length,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, '').length,
      sentences: sentences.length,
      paragraphs: paragraphs.length || (t ? 1 : 0),
      avgWordLen,
      readTime,
      top,
    };
  }, [text]);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="tool-title">Word Counter</h2>
          <p className="tool-desc">Paste or type — instant text analysis</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button onClick={copy} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}>
            {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={() => setText('')} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}>
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start typing or paste your text here…"
        rows={6}
        style={{
          width: '100%', resize: 'vertical',
          background: 'var(--input-bg)', border: '1px solid var(--input-border)',
          borderRadius: '1rem', padding: '0.875rem 1rem',
          color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif",
          fontSize: '0.9rem', lineHeight: 1.7, outline: 'none',
          transition: 'border-color 0.2s',
          marginBottom: '1.25rem',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
      />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
        {stat('Words', stats.words, true)}
        {stat('Characters', stats.chars)}
        {stat('No spaces', stats.charsNoSpace)}
        {stat('Sentences', stats.sentences)}
        {stat('Paragraphs', stats.paragraphs)}
        {stat('Avg word len', stats.avgWordLen)}
        {stat('Read time', `${stats.readTime} min`)}
        {stat('Unique freq', stats.top.length)}
      </div>

      {/* Top words */}
      {stats.top.length > 0 && (
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Top Words
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {stats.top.map(([word, count]) => (
              <span key={word} style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '9999px', padding: '0.2rem 0.7rem',
                fontSize: '0.75rem', fontWeight: 500, color: '#6366f1',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {word}
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
