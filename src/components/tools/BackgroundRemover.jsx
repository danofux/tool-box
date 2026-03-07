import { useState, useRef, useCallback } from 'react';
import { Upload, ImageOff, Download, RotateCcw, Loader } from 'lucide-react';

const STATE = { IDLE: 'idle', PREVIEW: 'preview', PROCESSING: 'processing', DONE: 'done' };

export default function BackgroundRemover() {
  const [phase, setPhase] = useState(STATE.IDLE);
  const [imgSrc, setImgSrc] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const loadFile = useCallback(file => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImgSrc(e.target.result);
      setPhase(STATE.PREVIEW);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  }, [loadFile]);

  const onFileInput = e => loadFile(e.target.files[0]);

  const processImage = () => {
    setPhase(STATE.PROCESSING);
    /* Simulate async background-removal processing */
    setTimeout(() => setPhase(STATE.DONE), 2200);
  };

  const reset = () => {
    setPhase(STATE.IDLE);
    setImgSrc(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  /* Mock download — in production wire to a real removal API */
  const download = () => {
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = 'removed-bg.png';
    a.click();
  };

  return (
    <div className="glass-card p-6 animate-tool-enter">
      <div className="tool-header flex items-start justify-between">
        <div>
          <h2 className="tool-title">Background Remover</h2>
          <p className="tool-desc">Drop an image — instant background removal preview</p>
        </div>
        {phase !== STATE.IDLE && (
          <button onClick={reset} className="glass-btn flex items-center gap-1.5 text-sm mt-1">
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {/* ── Drop zone ── */}
      {phase === STATE.IDLE && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-4
            rounded-2xl border-2 border-dashed cursor-pointer
            min-h-[280px] transition-all duration-200
            ${dragging
              ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 scale-[1.01]'
              : 'border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
            }
          `}
        >
          <div className={`p-5 rounded-full transition-all ${dragging ? 'bg-indigo-100 dark:bg-indigo-900/50 scale-110' : 'bg-gray-100 dark:bg-white/5'}`}>
            <Upload size={28} className={dragging ? 'text-indigo-500' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {dragging ? 'Drop it!' : 'Drop an image here'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">or click to browse · PNG, JPG, WebP</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInput}
          />
        </div>
      )}

      {/* ── Preview ── */}
      {phase === STATE.PREVIEW && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full rounded-2xl overflow-hidden bg-white/30 dark:bg-white/5 flex items-center justify-center max-h-72">
            <img src={imgSrc} alt="Upload preview" className="max-h-72 object-contain rounded-2xl" />
          </div>
          <button onClick={processImage} className="glass-btn-primary flex items-center gap-2">
            <ImageOff size={15} /> Remove Background
          </button>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
            In production: connect a removal API (remove.bg, replicate, etc.)
          </p>
        </div>
      )}

      {/* ── Processing ── */}
      {phase === STATE.PROCESSING && (
        <div className="flex flex-col items-center justify-center gap-6 min-h-[220px]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
            <div className="absolute inset-2 w-12 h-12 rounded-full border border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Processing image…</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Segmenting subject from background</p>
          </div>
          <div className="flex gap-1.5">
            {['Detecting edges', 'Masking subject', 'Refining'].map((step, i) => (
              <span key={step} className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400">
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {phase === STATE.DONE && (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full rounded-2xl overflow-hidden checker-bg max-h-72 flex items-center justify-center">
            {/* Simulated result: original image on transparent checker bg */}
            <img src={imgSrc} alt="Result" className="max-h-72 object-contain mix-blend-multiply dark:mix-blend-normal" />
            <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <span>✓</span> Background removed
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={download} className="glass-btn-primary flex items-center gap-2">
              <Download size={14} /> Download PNG
            </button>
            <button onClick={reset} className="glass-btn flex items-center gap-2 text-sm">
              <RotateCcw size={13} /> New Image
            </button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
            Demo mode · connect a real removal API to get actual transparent results
          </p>
        </div>
      )}
    </div>
  );
}
