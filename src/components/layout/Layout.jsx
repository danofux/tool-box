import { Sun, Moon } from 'lucide-react';

export default function Layout({ children, dark, onToggleDark }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', position: 'relative', overflowX: 'hidden' }}>

      {/* Blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* ── GitHub button — matches your Figma glassmorphism pill ── */}
      <a
        href="https://vyzzze.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed', top: '1.25rem', left: '1.25rem', zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          padding: '0.55rem 1.2rem',
          borderRadius: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: 'inset 0px 0px 30px 0px rgba(0, 0, 0, 0.1)',
          color: 'var(--text-primary)',
          textDecoration: 'none',
          fontSize: '0.8rem',
          fontWeight: 600,
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.01em',
          transition: 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
          e.currentTarget.style.boxShadow = 'inset 0px 0px 30px 0px rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = 'inset 0px 0px 30px 0px rgba(0, 0, 0, 0.1)';
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.jpg`}
          alt="vyze logo"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            objectFit: 'cover',
            filter: dark ? 'invert(0)' : 'invert(1)',
          }}
        />
        More on GitHub
      </a>

      {/* ── Dark mode toggle — same pill style ── */}
      <button
        onClick={onToggleDark}
        style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 50,
          padding: '0.55rem 0.7rem',
          borderRadius: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: 'inset 0px 0px 30px 0px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease, background 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="var(--text-muted)" />}
      </button>

      {/* ── Header ── */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', paddingTop: '5.5rem', paddingBottom: '3.5rem' }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: '3.5rem',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: '0.7rem',
        }}>
          Tool Box
        </h1>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          fontSize: '0.6rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          Tools You'll Need
        </p>
      </div>

      {/* ── Content ── */}
      <main style={{
        position: 'relative', zIndex: 10,
        maxWidth: '820px', margin: '0 auto',
        padding: '0 1.5rem 9rem',
      }}>
        {children}
      </main>
    </div>
  );
}
