import { ArrowRight, BarChart3, CalendarRange, CheckCircle2, ShieldCheck, Eye, Zap, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const navItems = ['Product', 'Teams', 'Reports', 'Company'];

const statItems = [
  { label: 'Task Views', value: '4', accent: '#f97316' },
  { label: 'Core Pages', value: '17+', accent: '#3b82f6' },
  { label: 'User Roles', value: '2', accent: '#a855f7' },
];

const trustItems = [
  { name: 'Studios', icon: '🎬' },
  { name: 'Marketing Teams', icon: '📢' },
  { name: 'Design Ops', icon: '🎨' },
  { name: 'Production Leads', icon: '🚀' },
  { name: 'Client Services', icon: '🤝' },
];

const capabilityItems = [
  {
    icon: CheckCircle2,
    title: 'Task workflows',
    description: 'Create, assign, edit, archive, and track work with multi-view execution across grid, list, kanban, and calendar.',
    accentColor: '#f97316',
  },
  {
    icon: CalendarRange,
    title: 'Progress reviews',
    description: 'Log updates, hours, attachments, and approvals so admins and collaborators stay aligned on delivery.',
    accentColor: '#3b82f6',
  },
  {
    icon: BarChart3,
    title: 'Analytics & reports',
    description: 'Use dashboard metrics, charts, and PDF exports to report progress clearly to leads and stakeholders.',
    accentColor: '#a855f7',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Separate admin and collaborator experiences while keeping comments, activity, and notifications connected.',
    accentColor: '#10b981',
  },
];

const flowNodes = [
  { x: 10, y: 20, size: 6, pulse: true },
  { x: 25, y: 35, size: 4, pulse: false },
  { x: 40, y: 15, size: 5, pulse: true },
  { x: 55, y: 45, size: 4, pulse: false },
  { x: 70, y: 25, size: 6, pulse: true },
  { x: 85, y: 40, size: 5, pulse: false },
  { x: 20, y: 55, size: 4, pulse: true },
  { x: 45, y: 65, size: 5, pulse: false },
  { x: 65, y: 58, size: 4, pulse: true },
  { x: 80, y: 70, size: 6, pulse: false },
  { x: 35, y: 80, size: 5, pulse: true },
  { x: 55, y: 85, size: 4, pulse: false },
];

const flowConnections = [
  { x1: 10, y1: 20, x2: 25, y2: 35 },
  { x1: 25, y1: 35, x2: 40, y2: 15 },
  { x1: 40, y1: 15, x2: 55, y2: 45 },
  { x1: 55, y1: 45, x2: 70, y2: 25 },
  { x1: 70, y1: 25, x2: 85, y2: 40 },
  { x1: 20, y1: 55, x2: 45, y2: 65 },
  { x1: 45, y1: 65, x2: 65, y2: 58 },
  { x1: 65, y1: 58, x2: 80, y2: 70 },
  { x1: 25, y1: 35, x2: 20, y2: 55 },
  { x1: 55, y1: 45, x2: 45, y2: 65 },
  { x1: 85, y1: 40, x2: 80, y2: 70 },
  { x1: 35, y1: 80, x2: 55, y2: 85 },
  { x1: 80, y1: 70, x2: 55, y2: 85 },
];

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for scroll-triggered fade-in            */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useTypewriter(text: string, speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    function type() {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        timeoutId = setTimeout(type, speed);
      } else {
        timeoutId = setTimeout(() => { i = 0; type(); }, pause);
      }
    }
    type();
    const cursorInterval = setInterval(() => setShowCursor(c => !c), 530);
    return () => { clearTimeout(timeoutId); clearInterval(cursorInterval); };
  }, [text, speed, pause]);
  return { displayed, showCursor };
}

const reveal = (v: boolean, delay = 0): React.CSSProperties => ({
  opacity: v ? 1 : 0,
  transform: v ? 'translateY(0)' : 'translateY(28px)',
  transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}s`,
});

/* ------------------------------------------------------------------ */
/*  CSS-in-JS helpers — bypasses Tailwind JIT issues with responsive   */
/* ------------------------------------------------------------------ */
const css = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontFamily: "'Inter', 'Manrope', system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: 1320,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: 20,
    paddingRight: 20,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  CLI Typewriter sub-component                                       */
/* ------------------------------------------------------------------ */
function CliTyper() {
  const CMD = 'npx create-collabtrack-app';
  const { displayed, showCursor } = useTypewriter(CMD, 75, 2000);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0a0a', border: '1px solid #333', borderRadius: 6, padding: '14px 16px' }}>
      <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 14, whiteSpace: 'nowrap' }}>
        <span style={{ color: '#ff4500', marginRight: 8, fontWeight: 'bold' }}>&gt;</span>
        {displayed}
        <span style={{ opacity: showCursor ? 1 : 0, color: '#ff4500', fontWeight: 100, marginLeft: 1 }}>|</span>
      </span>
      <button onClick={handleCopy} title="Copy" style={{ background: 'none', border: 'none', color: copied ? '#ff4500' : '#666', cursor: 'pointer', padding: 0, marginLeft: 12, transition: 'color 0.2s', flexShrink: 0 }}>
        {copied
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        }
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Landing() {
  const navigate = useNavigate();
  const heroReveal = useReveal();
  const teamsReveal = useReveal();
  const capsReveal = useReveal();
  const ctaReveal = useReveal();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handler = () => setWinW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isLg = winW >= 1024;
  const isMd = winW >= 768;
  const isSm = winW >= 640;

  return (
    <div style={css.page}>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#000000',
        }}
      >
        <div
          style={{
            ...css.container,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px',
          }}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#fff', textAlign: 'left', padding: 0 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20"></path></svg>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CollabTrack</span>
          </button>

          {/* Desktop nav links */}
          {isLg && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    color: '#888',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
                >
                  {item} <span style={{ color: '#444' }}>&gt;</span>
                </button>
              ))}
            </nav>
          )}

          {/* Desktop auth buttons */}
          {isLg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                style={{ background: '#fff', border: 'none', cursor: 'pointer', padding: '6px 16px', borderRadius: 2, fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#000', transition: 'background 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ddd'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                LOG IN
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                style={{
                  background: '#111',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  borderRadius: 2,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#fff',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#555'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderColor = '#333'; }}
              >
                START WORKSPACE
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {!isLg && (
            <button
              type="button"
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenu && !isLg && (
          <div style={{ borderTop: '1px solid #222', background: '#000', padding: '16px 20px 24px' }}>
            {navItems.map((item) => (
              <button key={item} type="button" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', fontSize: 12, fontFamily: 'monospace', textTransform: 'uppercase', color: '#888' }}>{item}</button>
            ))}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="button" onClick={() => navigate('/auth/login')} style={{ borderRadius: 2, border: 'none', background: '#fff', cursor: 'pointer', padding: '10px 20px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#000' }}>LOG IN</button>
              <button type="button" onClick={() => navigate('/auth/register')} style={{ borderRadius: 2, background: '#111', border: '1px solid #333', cursor: 'pointer', padding: '10px 20px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>START WORKSPACE</button>
            </div>
          </div>
        )}
      </header>

      <div style={css.container}>
        {/* ── HERO SECTION ──────────────────────────────────── */}
        <section
          ref={heroReveal.ref}
          style={{
            display: isLg ? 'grid' : 'block',
            gridTemplateColumns: isLg ? '1fr 1fr' : undefined,
            alignItems: 'center',
            gap: isLg ? 64 : 48,
            minHeight: isLg ? '100vh' : 'auto',
            padding: isLg ? '96px 0' : isMd ? '64px 0' : '40px 0',
          }}
        >
          {/* Left — Copy */}
          <div style={{ ...reveal(heroReveal.visible), marginLeft: isLg ? -80 : 0, marginTop: isLg ? -120 : 0 }}>
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4500' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#fff', fontFamily: 'monospace' }}>Vision</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                fontWeight: 100,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                margin: 0,
                color: '#fff',
                fontFamily: '"Merriweather", serif',
                fontStretch: 'extra-condensed',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                WebkitTextStroke: '2px #000',
                opacity: 0.9,
                fontOpticalSizing: 'auto',
                fontVariationSettings: '"wdth" 25'
              }}
            >
              Track work.
              <br />
              Review progress.
              <br />
              Ship with clarity.
            </h1>

            {/* Subtext */}
            <div style={{ marginTop: 32, maxWidth: 540 }}>
              <p style={{ fontSize: isMd ? 15 : 14, lineHeight: 1.6, color: '#888', margin: '0 0 16px', fontFamily: 'monospace' }}>
                CollabTrack is a task and progress tracker built for teams working across the pipeline. 
              </p>
              <p style={{ fontSize: isMd ? 15 : 14, lineHeight: 1.6, color: '#888', margin: 0, fontFamily: 'monospace' }}>
                From brief to CI/CD - delegate workflows directly, managing approvals, notifications, and analytics without leaving the workspace.
              </p>
            </div>

            {/* CTA Terminal Card */}
            <div
              style={{
                marginTop: 48,
                border: '1px solid #222',
                borderRadius: 8,
                background: '#0a0a0a',
                maxWidth: 480,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', borderBottom: '1px solid #222', padding: '12px 16px', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '4px 8px', letterSpacing: '0.02em' }}>CLOUD / HOSTED</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#444', border: '1px solid #1a1a1a', borderRadius: 4, padding: '4px 8px', letterSpacing: '0.02em' }}>SELF-HOSTED</span>
              </div>
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', flexDirection: isSm ? 'row' : 'column', gap: 12, marginBottom: 28 }}>
                  <button
                    onClick={() => navigate('/auth/login')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#000', border: 'none', padding: '10px 0', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    OPEN DEMO (PREVIEW)
                  </button>
                  <button
                    onClick={() => navigate('/auth/register')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#000', border: 'none', padding: '10px 0', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    CREATE ACCOUNT
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                  <span style={{ height: 1, flex: 1, background: '#222' }}></span>
                  <span style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', letterSpacing: '0.05em' }}>OR INSTALL VIA CLI</span>
                  <span style={{ height: 1, flex: 1, background: '#222' }}></span>
                </div>

                <CliTyper />
              </div>
            </div>

            {/* Stat cards styled minimally */}
            <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: isSm ? 32 : 20 }}>
              {statItems.map((item, i) => (
                <div key={item.label} style={{ ...reveal(heroReveal.visible, 0.15 + i * 0.1) }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#555', margin: 0, fontFamily: 'monospace' }}>{item.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 500, color: '#fff', margin: '4px 0 0', fontFamily: 'monospace' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Operational view visualization matched to factory.ai design */}
          {isLg && (
              <div
              style={{
                ...reveal(heroReveal.visible, 0.3),
                position: 'relative',
                minHeight: 680,
                width: '100%',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 80, paddingTop: 80, paddingLeft: 0 }}>
                {/* Horizontal tracks with animated/static nodes */}
                <div style={{ borderBottom: '1px dashed #222', width: '80%', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -14, left: '10%', width: 70, height: 28, background: '#111', border: '1px solid #333', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ width: 6, height: 6, background: '#555', borderRadius: '50%' }}></div>
                    <div style={{ width: 14, height: 4, background: '#555', borderRadius: 2 }}></div>
                  </div>
                  <div style={{ position: 'absolute', top: -14, right: '0%', width: 70, height: 28, background: '#111', border: '1px solid #333', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ width: 14, height: 4, background: '#555', borderRadius: 2 }}></div>
                    <div style={{ width: 6, height: 6, background: '#555', borderRadius: '50%' }}></div>
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #222', width: '100%', position: 'relative', left: '10%' }}>
                  <div style={{ position: 'absolute', top: -14, left: '5%', width: 80, height: 28, background: '#111', border: '1px solid #333', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ width: 6, height: 6, background: '#555', borderRadius: '50%' }}></div>
                    <div style={{ width: 24, height: 4, background: '#555', borderRadius: 2 }}></div>
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #222', width: '90%', position: 'relative', left: '5%' }}>
                   {/* Middle spinning star */}
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: -20, left: '30%', animation: 'spin 10s linear infinite' }}><path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20"></path></svg>

                   <div style={{ position: 'absolute', top: -14, right: '15%', width: 120, height: 28, background: '#111', border: '1px solid #333', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ width: 14, height: 4, background: '#555', borderRadius: 2 }}></div>
                    <div style={{ width: 8, height: 8, background: '#ff4500', borderRadius: '50%', boxShadow: '0 0 12px #ff4500' }}></div>
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #222', width: '70%', position: 'relative', left: '15%' }}></div>
                
                <div style={{ borderBottom: '1px dashed #222', width: '85%', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: -14, left: '20%', width: 80, height: 28, background: '#111', border: '1px solid #333', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <div style={{ width: 20, height: 4, background: '#555', borderRadius: 2 }}></div>
                    <div style={{ width: 6, height: 6, background: '#555', borderRadius: '50%' }}></div>
                  </div>
                </div>

                {/* Overlaid terminal view */}
                <div style={{ position: 'absolute', top: 120, right: -80, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 8, padding: '24px', minWidth: 280, fontFamily: 'monospace', fontSize: 11, color: '#666', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }}></span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }}></span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }}></span>
                  </div>
                  <div style={{ color: '#ff4500', marginBottom: 8 }}>Operational View :</div>
                  <div style={{ paddingLeft: 12 }}>
                    <div>..init.ts</div>
                    <div>..x_axis,</div>
                    <div>..y_axis,</div>
                    <div>..plot_title = null,</div>
                    <div>..plot_subtitle = null,</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── TEAMS SECTION ────────────────────────────────── */}
        <section
          ref={teamsReveal.ref}
          style={{ borderTop: '1px solid #1a1a1a', padding: isLg ? '112px 0' : isMd ? '80px 0' : '56px 0', minHeight: isLg ? '100vh' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMd ? 56 : 40,
            }}
          >
            <div style={reveal(teamsReveal.visible)}>
              {/* Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#444' }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#888', fontFamily: 'monospace' }}>Built for teams like</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                  fontWeight: 100,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  margin: 0,
                  color: '#fff',
                  fontFamily: '"Merriweather", serif',
                  fontStretch: 'extra-condensed',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  WebkitTextStroke: '1.2px #000',
                  opacity: 0.9,
                  fontOpticalSizing: 'auto',
                  fontVariationSettings: '"wdth" 25'
                }}
              >
                Structured enough for operations,{' '}
                <span style={{ color: '#666' }}>simple enough for daily collaboration.</span>
              </h2>
              <p style={{ marginTop: 24, maxWidth: 900, fontSize: 16, lineHeight: 1.8, color: '#888', fontFamily: 'monospace' }}>
                CollabTrack fits the kinds of teams that move from brief to review to delivery quickly and need reliable operational visibility.
              </p>
            </div>

            <div
              style={{
                ...reveal(teamsReveal.visible, 0.2),
                marginTop: isLg ? 0 : 48,
              }}
            >
              <style>
                {`
                  @keyframes scrollMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .infinite-marquee {
                    display: flex;
                    gap: 16px;
                    padding: 4px 0;
                    width: max-content;
                    animation: scrollMarquee 25s linear infinite;
                  }
                  .infinite-marquee:hover {
                    animation-play-state: paused;
                  }
                `}
              </style>
              <div style={{ overflow: 'hidden', padding: '10px 0' }}>
                <div className="infinite-marquee">
                  {[...trustItems, ...trustItems].map((item, i) => (
                    <div
                      key={item.name + i}
                      style={{
                        minWidth: 220,
                        borderRadius: 8,
                        border: '1px solid #1a1a1a',
                        background: '#040404',
                        padding: 24,
                        transition: 'border-color 0.3s, background 0.3s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#0a0a0a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#040404'; }}
                    >
                      <span style={{ fontSize: 24, filter: 'grayscale(100%) brightness(150%)' }}>{item.icon}</span>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#555', margin: '16px 0 0', fontFamily: 'monospace' }}>Team type</p>
                      <p style={{ fontSize: 16, fontWeight: 500, color: '#ddd', margin: '6px 0 0' }}>{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CAPABILITIES ───────────────────────────────────── */}
        <section
          ref={capsReveal.ref}
          style={{ borderTop: '1px solid #1a1a1a', padding: isLg ? '112px 0' : isMd ? '80px 0' : '56px 0', minHeight: isLg ? '100vh' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div style={{ ...reveal(capsReveal.visible), maxWidth: 720 }}>
            {/* Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#444' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#888', fontFamily: 'monospace' }}>Capabilities</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                fontWeight: 100,
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                margin: 0,
                color: '#fff',
                fontFamily: '"Merriweather", serif',
                fontStretch: 'extra-condensed',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                WebkitTextStroke: '1.2px #000',
                opacity: 0.9,
                fontOpticalSizing: 'auto',
                fontVariationSettings: '"wdth" 25'
              }}
            >
              A professional task and progress tracker{' '}
              <span style={{ color: '#666' }}>for modern creative delivery.</span>
            </h2>
            <p style={{ marginTop: 20, maxWidth: 600, fontSize: 16, lineHeight: 1.8, color: '#888', fontFamily: 'monospace' }}>
              Every major workflow in the repository is represented here: task execution, progress review,
              reporting, user management, notifications, and role-based access.
            </p>
          </div>

          <div
            style={{
              marginTop: 56,
              display: 'grid',
              gridTemplateColumns: isLg ? 'repeat(4, 1fr)' : isMd ? 'repeat(2, 1fr)' : '1fr',
              gap: 20,
            }}
          >
            {capabilityItems.map((item, i) => (
              <div
                key={item.title}
                style={{
                  ...reveal(capsReveal.visible, 0.1 + i * 0.1),
                  borderRadius: 8,
                  border: '1px solid #1a1a1a',
                  background: '#040404',
                  padding: 28,
                  transition: 'border-color 0.3s, background 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#0a0a0a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#040404'; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    border: '1px solid #222',
                    background: '#111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <item.icon size={18} style={{ color: '#fff' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff', margin: '24px 0 0' }}>{item.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: '#666', margin: '12px 0 0', fontFamily: 'monospace' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA SECTION ────────────────────────────────────── */}
        <section
          ref={ctaReveal.ref}
          style={{ borderTop: '1px solid #1a1a1a', padding: isLg ? '112px 0' : isMd ? '80px 0' : '56px 0', minHeight: isLg ? '100vh' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div
            style={{
              ...reveal(ctaReveal.visible),
              position: 'relative',
              borderRadius: 8,
              border: '1px solid #1a1a1a',
              background: '#040404',
            }}
          >
            <div
              style={{
                display: isLg ? 'grid' : 'block',
                gridTemplateColumns: isLg ? '1fr auto' : undefined,
                alignItems: 'end',
                gap: 40,
                padding: isLg ? 56 : 32,
              }}
            >
              <div style={{ maxWidth: 640 }}>
                {/* Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#444' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#888', fontFamily: 'monospace' }}>Start using it</span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                    fontWeight: 100,
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    margin: 0,
                    color: '#fff',
                    fontFamily: '"Merriweather", serif',
                    fontStretch: 'extra-condensed',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitTextStroke: '1.2px #000',
                    opacity: 0.9,
                    fontOpticalSizing: 'auto',
                    fontVariationSettings: '"wdth" 25'
                  }}
                >
                  Explore the full workflow{' '}
                  <span style={{ color: '#666' }}>from task creation to reporting.</span>
                </h2>
                <p style={{ marginTop: 20, maxWidth: 520, fontSize: 16, lineHeight: 1.8, color: '#888', fontFamily: 'monospace' }}>
                  Open the demo to inspect the actual product architecture: dashboard, tasks, task detail, analytics, templates, activity, users, and reports.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: isLg ? 0 : 32 }}>
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 4,
                    background: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '12px 24px',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#000',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ddd'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  OPEN DEMO
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth/register')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 4,
                    background: '#111',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    padding: '12px 24px',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: '#fff',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#555'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderColor = '#333'; }}
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 0 }}>
          <div style={{ padding: '80px 0 0' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isLg ? '2fr 1fr 1fr 1fr 1fr' : isMd ? '1fr 1fr 1fr' : '1fr',
              gap: isLg ? 48 : isMd ? 40 : 32,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20"></path></svg>
                  <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff' }}>CollabTrack</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555', fontFamily: 'monospace', maxWidth: 320, margin: 0 }}>
                  Task and progress tracking built for teams that move from brief to review to delivery quickly.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid #1a1a1a', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#0a0a0a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#040404'; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid #1a1a1a', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#0a0a0a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#040404'; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                  <a href="#" style={{ width: 36, height: 36, borderRadius: 4, border: '1px solid #1a1a1a', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, background 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#0a0a0a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#040404'; }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontFamily: 'monospace', marginBottom: 20 }}>Product</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Features', 'Pricing', 'Changelog', 'Documentation', 'API Reference'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: 14, color: '#555', fontFamily: 'monospace', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}>{item}</a>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontFamily: 'monospace', marginBottom: 20 }}>Company</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['About', 'Blog', 'Careers', 'Press', 'Contact'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: 14, color: '#555', fontFamily: 'monospace', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}>{item}</a>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontFamily: 'monospace', marginBottom: 20 }}>Resources</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Community', 'Help Center', 'Templates', 'Guides', 'Status'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: 14, color: '#555', fontFamily: 'monospace', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}>{item}</a>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontFamily: 'monospace', marginBottom: 20 }}>Legal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Privacy', 'Terms', 'Security', 'Cookie Policy'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: 14, color: '#555', fontFamily: 'monospace', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}>{item}</a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 56, padding: '24px 0', display: 'flex', flexDirection: isSm ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>&copy; {new Date().getFullYear()} CollabTrack. All rights reserved.</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0, fontFamily: 'monospace' }}>Task &amp; progress tracking for creative teams</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Keyframe for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
