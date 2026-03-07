import { useRef, useEffect, useState } from 'react';
import { Palette, Layers, Type, Music, Wand2, Ruler, AlignLeft, QrCode, KeyRound, FileText, BoxSelect } from 'lucide-react';

const TABS = [
  { id: 'palette',  label: 'Palette',  Icon: Palette },
  { id: 'gradient', label: 'Gradient', Icon: Layers },
  { id: 'fonts',    label: 'Fonts',    Icon: Type },
  { id: 'audio',    label: 'Audio',    Icon: Music },
  { id: 'bgremove', label: 'Remover',  Icon: Wand2 },
  { id: 'units',    label: 'Units',    Icon: Ruler },
  { id: 'words',    label: 'Words',    Icon: AlignLeft },
  { id: 'qr',       label: 'QR Code',  Icon: QrCode },
  { id: 'password', label: 'Password', Icon: KeyRound },
  { id: 'markdown', label: 'Markdown', Icon: FileText },
  { id: 'shadow',   label: 'Shadow',   Icon: BoxSelect },
];

export default function Navbar({ active, onChange }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  /* Measure the active tab and move the pill */
  useEffect(() => {
    const el = tabRefs.current[active];
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPill({ left: eRect.left - cRect.left, width: eRect.width });
    setReady(true);
  }, [active]);

  return (
    <nav style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, maxWidth: 'calc(100vw - 2rem)' }}>
      <div
        ref={containerRef}
        className="glass-dock"
        style={{
          borderRadius: '9999px', padding: '0.4rem',
          display: 'flex', alignItems: 'center', gap: '0.15rem',
          position: 'relative', overflowX: 'auto', overflowY: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        {/* Sliding pill */}
        {ready && (
          <div
            style={{
              position: 'absolute',
              top: '0.4rem',
              left: pill.left,
              width: pill.width,
              height: 'calc(100% - 0.8rem)',
              background: '#6366f1',
              borderRadius: '9999px',
              transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              ref={el => { tabRefs.current[id] = el; }}
              onClick={() => onChange(id)}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '9999px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                transition: 'color 0.2s ease',
                minWidth: '64px',
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
