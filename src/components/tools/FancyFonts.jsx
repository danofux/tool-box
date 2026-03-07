import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/* ── Unicode math letter transforms ── */
const OFFSETS = {
  Bold:          { up: 0x1D400, lo: 0x1D41A },
  Italic:        { up: 0x1D434, lo: 0x1D44E },
  Script:        { up: 0x1D4D0, lo: 0x1D4EA }, // bold script
  Gothic:        { up: 0x1D56C, lo: 0x1D586 }, // bold fraktur
  'Double Struck':{ up: 0x1D538, lo: 0x1D552 },
};

/* Letters that fall outside the contiguous block */
const ITALIC_EXCEPTIONS = { h: 'ℎ' };
const DS_EXCEPTIONS = { C:'ℂ', H:'ℍ', N:'ℕ', P:'ℙ', Q:'ℚ', R:'ℝ', Z:'ℤ' };

function transformChar(ch, style) {
  const isUp = ch >= 'A' && ch <= 'Z';
  const isLo = ch >= 'a' && ch <= 'z';
  if (!isUp && !isLo) return ch;

  if (style === 'Italic' && ITALIC_EXCEPTIONS[ch]) return ITALIC_EXCEPTIONS[ch];
  if (style === 'Double Struck' && isUp && DS_EXCEPTIONS[ch]) return DS_EXCEPTIONS[ch];

  const { up, lo } = OFFSETS[style];
  const base = isUp ? 65 : 97;
  return String.fromCodePoint((isUp ? up : lo) + (ch.charCodeAt(0) - base));
}

function transformText(text, style) {
  return [...text].map(ch => transformChar(ch, style)).join('');
}

/* Circled / bubble letters (not in OFFSETS — they're separate unicode blocks) */
function toBubble(text) {
  return [...text].map(ch => {
    if (ch >= 'A' && ch <= 'Z') return String.fromCodePoint(0x24B6 + (ch.charCodeAt(0) - 65));
    if (ch >= 'a' && ch <= 'z') return String.fromCodePoint(0x24D0 + (ch.charCodeAt(0) - 97));
    if (ch >= '0' && ch <= '9') return String.fromCodePoint(ch === '0' ? 0x24EA : 0x245F + (ch.charCodeAt(0) - 48));
    return ch;
  }).join('');
}

const STYLES = [
  { name: 'Bold',          fn: t => transformText(t, 'Bold'),           sample: '𝐀𝐁𝐂', desc: 'Strong and sturdy' },
  { name: 'Italic',        fn: t => transformText(t, 'Italic'),         sample: '𝐴𝐵𝐶', desc: 'Elegant slant' },
  { name: 'Script',        fn: t => transformText(t, 'Script'),         sample: '𝓐𝓑𝓒', desc: 'Calligraphic cursive' },
  { name: 'Gothic',        fn: t => transformText(t, 'Gothic'),         sample: '𝕬𝕭𝕮', desc: 'Medieval blackletter' },
  { name: 'Double Struck', fn: t => transformText(t, 'Double Struck'),  sample: '𝔸𝔹ℂ', desc: 'Mathematical outline' },
  { name: 'Bubble',        fn: t => toBubble(t),                        sample: 'ⓐⓑⓒ', desc: 'Circled letters' },
];

function FontCard({ style, text }) {
  const [copied, setCopied] = useState(false);
  const output = style.fn(text) || style.fn('Preview');

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500 dark:text-indigo-400">{style.name}</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{style.desc}</p>
        </div>
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'glass-btn'
          }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-white/40 dark:bg-white/5 rounded-xl px-3 py-3 min-h-[44px] break-all">
        <p className="text-base leading-relaxed text-gray-800 dark:text-gray-100" style={{ fontSize: '1.1rem' }}>
          {output || <span className="text-gray-300 dark:text-gray-600 text-sm">start typing above…</span>}
        </p>
      </div>
    </div>
  );
}

export default function FancyFonts() {
  const [input, setInput] = useState('Hello World');

  return (
    <div className="glass-card p-6 animate-tool-enter">
      <div className="tool-header">
        <h2 className="tool-title">Fancy Fonts</h2>
        <p className="tool-desc">Convert text into Unicode character styles — paste anywhere</p>
      </div>

      {/* Input */}
      <div className="relative mb-5">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type something…"
          maxLength={80}
          className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl
                     px-4 py-3.5 text-base font-medium placeholder-gray-300 dark:placeholder-gray-600
                     focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400/60
                     text-gray-800 dark:text-gray-100 transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-300 dark:text-gray-600">
          {input.length}/80
        </span>
      </div>

      {/* Font style grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLES.map(style => (
          <FontCard key={style.name} style={style} text={input} />
        ))}
      </div>
    </div>
  );
}
