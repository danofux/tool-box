import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Play, Square } from 'lucide-react';

const BAR_COUNT = 48;

/* ── Demo mode: sine wave simulation ── */
function getDemoBars(time) {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = Math.sin(time * 0.002 + i * 0.4) * 0.3 + 0.35;
    const secondary = Math.sin(time * 0.003 + i * 0.25) * 0.2;
    const noise = Math.random() * 0.08;
    // Frequency envelope — stronger in mid range
    const envelope = Math.exp(-0.5 * Math.pow((i / BAR_COUNT - 0.35) / 0.28, 2));
    return Math.max(0.04, Math.min(1, (base + secondary + noise) * envelope));
  });
}

export default function AudioVisualizer() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [mode, setMode] = useState('demo');   // 'demo' | 'mic'
  const [running, setRunning] = useState(true);
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const draw = useCallback((time = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    let bars;
    if (mode === 'mic' && analyserRef.current) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      // Sample BAR_COUNT evenly-spaced bins from the lower 2/3 of the spectrum
      const slice = Math.floor(data.length * 0.66 / BAR_COUNT);
      bars = Array.from({ length: BAR_COUNT }, (_, i) =>
        Math.min(1, data[i * slice] / 255)
      );
    } else {
      bars = getDemoBars(time);
    }

    const barW = Math.floor((W - (BAR_COUNT - 1) * 2) / BAR_COUNT);
    const maxBarH = H * 0.85;

    // Parse hex → rgb for gradient
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    bars.forEach((val, i) => {
      const bH = Math.max(4, val * maxBarH);
      const x = i * (barW + 2);
      const y = (H - bH) / 2;

      // Gradient per bar: bright center → dim top/bottom
      const grad = ctx.createLinearGradient(0, y, 0, y + bH);
      grad.addColorStop(0,   `rgba(${r},${g},${b},0.3)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.85)`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},0.85)`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0.3)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, bH, 2);
      ctx.fill();

      // Glow
      ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;
      ctx.shadowBlur = val > 0.7 ? 10 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    rafRef.current = requestAnimationFrame(t => draw(t));
  }, [mode, color]);

  /* Start / stop render loop */
  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, draw]);

  /* Handle mic permission */
  const startMic = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      streamRef.current = stream;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setMode('mic');
      setRunning(true);
    } catch {
      setError('Microphone permission denied. Using demo mode.');
      setMode('demo');
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    setMode('demo');
  };

  /* Cleanup on unmount */
  useEffect(() => () => { stopMic(); cancelAnimationFrame(rafRef.current); }, []);

  /* Resize canvas to match displayed size */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="glass-card p-6 animate-tool-enter">
      <div className="tool-header flex items-start justify-between">
        <div>
          <h2 className="tool-title">Audio Visualizer</h2>
          <p className="tool-desc">
            {mode === 'mic' ? '🔴 Live microphone input' : '⚡ Demo simulation mode'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* Color picker */}
          <label className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform shadow-md" style={{ background: color }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="opacity-0 w-0 h-0" />
          </label>
          {/* Play/pause */}
          <button
            onClick={() => setRunning(r => !r)}
            className="glass-btn flex items-center gap-1.5 text-sm"
          >
            {running ? <Square size={13} /> : <Play size={13} />}
            {running ? 'Pause' : 'Play'}
          </button>
          {/* Mic toggle */}
          <button
            onClick={mode === 'mic' ? stopMic : startMic}
            className={`flex items-center gap-1.5 text-sm rounded-xl px-3 py-2 transition-all font-medium ${
              mode === 'mic'
                ? 'bg-red-500 text-white shadow-md shadow-red-400/30 hover:bg-red-600'
                : 'glass-btn'
            }`}
          >
            {mode === 'mic' ? <MicOff size={13} /> : <Mic size={13} />}
            {mode === 'mic' ? 'Stop Mic' : 'Use Mic'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-xl mb-4">
          {error}
        </p>
      )}

      {/* Canvas */}
      <div className="w-full h-52 bg-black/5 dark:bg-black/40 rounded-2xl overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => setRunning(true)} className="glass-btn-primary flex items-center gap-2">
              <Play size={15} /> Resume
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-600">
          {mode === 'mic' ? `${analyserRef.current?.frequencyBinCount ?? '--'} FFT bins` : 'Simulated spectrum'}
        </span>
        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">{BAR_COUNT} bars</span>
      </div>
    </div>
  );
}
