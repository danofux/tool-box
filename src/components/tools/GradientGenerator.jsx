import { useState, useMemo } from 'react';
import { Copy, Check, Shuffle } from 'lucide-react';

const PRESETS = [
  { a: '#6366f1', b: '#ec4899' },
  { a: '#06b6d4', b: '#8b5cf6' },
  { a: '#f59e0b', b: '#ef4444' },
  { a: '#10b981', b: '#3b82f6' },
  { a: '#a78bfa', b: '#f0abfc' },
];

function randomHex() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

export default function GradientGenerator() {
  const [color1, setColor1] = useState('#6366f1');
  const [color2, setColor2] = useState('#ec4899');
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState('linear');
  const [copied, setCopied] = useState(false);

  const cssValue = useMemo(() => {
    if (type === 'linear') return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    if (type === 'radial') return `radial-gradient(circle, ${color1}, ${color2})`;
    return `conic-gradient(from ${angle}deg, ${color1}, ${color2})`;
  }, [color1, color2, angle, type]);

  const css = `background: ${cssValue};`;

  const copyCSS = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shuffle = () => {
    setColor1(randomHex());
    setColor2(randomHex());
    setAngle(Math.floor(Math.random() * 360));
  };

  return (
    <div className="glass-card p-6 animate-tool-enter">
      <div className="tool-header">
        <h2 className="tool-title">Gradient Generator</h2>
        <p className="tool-desc">Build linear, radial & conic gradients with CSS export</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Color pickers */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">Colors</label>
            <div className="flex items-center gap-3">
              {[{ val: color1, set: setColor1 }, { val: color2, set: setColor2 }].map(({ val, set }, i) => (
                <div key={i} className="flex items-center gap-2.5 flex-1 glass-btn rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{val.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient type */}
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 block mb-2">Type</label>
            <div className="flex gap-2">
              {['linear', 'radial', 'conic'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide capitalize transition-all ${
                    type === t
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-400/30'
                      : 'glass-btn'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          {type !== 'radial' && (
            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 block mb-2">
                Angle — <span className="text-indigo-500 dark:text-indigo-400">{angle}°</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              {/* Circular angle indicator */}
              <div className="flex justify-center mt-2">
                <div className="relative w-10 h-10 rounded-full border-2 border-indigo-400/40 bg-indigo-50 dark:bg-indigo-950/40">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-0.5 h-4 bg-indigo-500 rounded-full origin-bottom translate-y-[-4px]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 block mb-2">Presets</label>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setColor1(p.a); setColor2(p.b); }}
                  className="w-8 h-8 rounded-lg hover:scale-110 active:scale-95 transition-transform shadow-md"
                  style={{ background: `linear-gradient(135deg, ${p.a}, ${p.b})` }}
                />
              ))}
              <button
                onClick={shuffle}
                className="w-8 h-8 rounded-lg glass-btn flex items-center justify-center hover:scale-110"
              >
                <Shuffle size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-3">
          <div
            className="flex-1 min-h-[200px] rounded-2xl shadow-xl transition-all duration-500"
            style={{ background: cssValue }}
          />
          <div className="relative">
            <div className="bg-gray-900 dark:bg-black/60 rounded-xl p-3.5 font-mono text-xs text-emerald-400 leading-relaxed">
              <span className="text-gray-500">background:</span>
              <br />
              <span className="ml-2 text-purple-300 break-all">{cssValue}</span>
              <span className="text-gray-500">;</span>
            </div>
            <button
              onClick={copyCSS}
              className={`
                absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5
                ${copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }
              `}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
