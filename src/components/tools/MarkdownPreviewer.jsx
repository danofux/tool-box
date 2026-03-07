import { useState, useMemo } from 'react';
import { Copy, Check, Code2, Eye } from 'lucide-react';

/* Minimal Markdown→HTML — no dependency */
function mdToHtml(md) {
  let html = md
    // code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="md-pre"><code class="md-code">${esc(code.trim())}</code></pre>`)
    // inline code
    .replace(/`([^`]+)`/g, (_, c) => `<code class="md-inline">${esc(c)}</code>`)
    // headings
    .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
    // hr
    .replace(/^---$/gm, '<hr/>')
    // blockquote
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // images before links
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;"/>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // unordered lists
    .replace(/^[-*+]\s+(.+)$/gm, '<li data-ul>$1</li>')
    // ordered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li data-ol>$1</li>');

  // wrap consecutive ul items
  html = html.replace(/(<li data-ul>[^<]*<\/li>\n?)+/g, m =>
    `<ul>${m.replace(/ data-ul/g, '')}</ul>`);
  // wrap consecutive ol items
  html = html.replace(/(<li data-ol>[^<]*<\/li>\n?)+/g, m =>
    `<ol>${m.replace(/ data-ol/g, '')}</ol>`);

  // paragraphs — blank-line-separated blocks not already wrapped
  html = html.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const SAMPLE = `# Markdown Previewer

Write **bold**, *italic*, or ***both***.

## Code

Inline \`code\` and blocks:

\`\`\`js
const greet = name => \`Hello, \${name}!\`;
\`\`\`

## Lists

- Item one
- Item two
- Item three

1. First
2. Second
3. Third

## Blockquote

> "The best tool is the one you actually use."

---

[Visit GitHub](https://github.com/vyzzze)
`;

export default function MarkdownPreviewer() {
  const [text, setText] = useState(SAMPLE);
  const [view, setView] = useState('split'); // 'split' | 'edit' | 'preview'
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => mdToHtml(text), [text]);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const TAB_STYLES = active => ({
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.35rem 0.8rem', borderRadius: '0.5rem', border: 'none',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
  });

  return (
    <div className="glass-card p-6 tool-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="tool-title">Markdown Previewer</h2>
          <p className="tool-desc">Live render — no dependencies</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ display: 'flex', background: 'rgba(99,102,241,0.07)', borderRadius: '0.65rem', padding: '0.2rem', border: '1px solid rgba(99,102,241,0.12)' }}>
            <button style={TAB_STYLES(view === 'edit')}    onClick={() => setView('edit')}>    <Code2 size={12} /> Edit</button>
            <button style={TAB_STYLES(view === 'split')}   onClick={() => setView('split')}>   Split</button>
            <button style={TAB_STYLES(view === 'preview')} onClick={() => setView('preview')}> <Eye size={12} /> Preview</button>
          </div>
          <button onClick={copy} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {copied ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: view === 'split' ? '1fr 1fr' : '1fr', gap: '0.75rem', minHeight: 380 }}>
        {(view === 'edit' || view === 'split') && (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', height: 380, resize: 'vertical',
              background: 'rgba(10,10,30,0.5)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '0.875rem', padding: '1rem',
              color: '#c9d8f0', fontFamily: 'monospace', fontSize: '0.82rem',
              lineHeight: 1.7, outline: 'none', tabSize: 2,
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
          />
        )}

        {(view === 'preview' || view === 'split') && (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="md-preview-pane"
            style={{
              height: 380, overflowY: 'auto',
              background: 'var(--preview-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: '0.875rem', padding: '1.25rem 1.5rem',
              color: 'var(--text-primary)', lineHeight: 1.75,
              fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem',
            }}
          />
        )}
      </div>

      <style>{`
        .md-pre { background: rgba(10,10,30,0.6); border-radius: 8px; padding: 0.875rem 1rem; overflow-x: auto; margin: 0.75rem 0; }
        .md-code { font-family: monospace; font-size: 0.8rem; color: #a5f3d0; }
        .md-inline { background: rgba(99,102,241,0.15); color: #818cf8; border-radius: 4px; padding: 0.1rem 0.35rem; font-family: monospace; font-size: 0.85em; }
        .md-preview-pane h1 { font-size: 1.6rem; font-weight: 700; margin: 0.5rem 0 0.75rem; color: var(--text-primary); }
        .md-preview-pane h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: var(--text-primary); }
        .md-preview-pane h3 { font-size: 1.05rem; font-weight: 600; margin: 0.75rem 0 0.4rem; color: var(--text-primary); }
        .md-preview-pane p  { margin: 0.5rem 0; color: var(--text-primary); }
        .md-preview-pane ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; color: var(--text-primary); }
        .md-preview-pane ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; color: var(--text-primary); }
        .md-preview-pane li { margin: 0.2rem 0; color: var(--text-primary); }
        .md-preview-pane blockquote { border-left: 3px solid #6366f1; padding: 0.4rem 0.75rem; margin: 0.75rem 0; opacity: 0.8; font-style: italic; }
        .md-preview-pane hr { border: none; border-top: 1px solid var(--glass-border); margin: 1rem 0; }
        .md-preview-pane a { color: #6366f1; text-decoration: underline; }
        .md-preview-pane strong { font-weight: 700; color: var(--text-primary); }
        .md-preview-pane em { font-style: italic; }
        .md-preview-pane del { text-decoration: line-through; opacity: 0.6; }
      `}</style>
    </div>
  );
}
