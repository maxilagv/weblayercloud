import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { usePersonalization } from '../hooks/usePersonalization';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';
import HeroVisual from './HeroVisual';

const injectStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    injected = true;

    const style = document.createElement('style');
    style.textContent = `
      /* ── Hero split grid ──────────────────────── */
      .hero-grid {
        display: grid;
        grid-template-columns: 1fr;
        min-height: 100svh;
      }

      @media (min-width: 920px) {
        .hero-grid {
          grid-template-columns: 55fr 45fr;
        }
      }

      .hero-right-panel {
        display: none;
      }

      @media (min-width: 920px) {
        .hero-right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 5vw, 80px);
          position: relative;
          overflow: hidden;
        }
      }

      /* ── Dot-grid background ─────────────────── */
      .hero-dot-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle, rgba(0,0,0,0.11) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
        mask-image: linear-gradient(to bottom,
          transparent 0%,
          rgba(0,0,0,0.7) 20%,
          rgba(0,0,0,0.7) 80%,
          transparent 100%
        );
      }

      .hero-dot-grid-dark {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
        mask-image: linear-gradient(135deg,
          transparent 0%,
          rgba(0,0,0,0.5) 40%,
          rgba(0,0,0,0.5) 60%,
          transparent 100%
        );
      }

      /* ── Orange gradient orb ─────────────────── */
      .hero-orb {
        position: absolute;
        width: 640px;
        height: 640px;
        background: radial-gradient(circle, rgba(255,59,0,0.09) 0%, transparent 68%);
        top: -180px;
        left: -120px;
        pointer-events: none;
        animation: orb-drift 12s ease-in-out infinite;
      }

      @keyframes orb-drift {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33%       { transform: translate(40px, 30px) scale(1.05); }
        66%       { transform: translate(-20px, 50px) scale(0.97); }
      }

      /* ── Headline lines (GSAP reveal) ────────── */
      .hero-headline {
        font-family: var(--font-display);
        font-size: clamp(44px, 7.5vw, 118px);
        font-weight: 900;
        letter-spacing: -0.035em;
        line-height: 0.95;
        color: var(--color-text);
        margin-bottom: clamp(20px, 3vw, 40px);
        word-break: keep-all;
      }

      .hero-headline em {
        font-style: italic;
        font-weight: 700;
        color: var(--color-accent);
      }

      .headline-line-outer {
        display: block;
        overflow: hidden;
      }

      .headline-line-inner {
        display: block;
        will-change: transform, opacity;
      }

      /* ── Supporting elements (CSS animations) ── */
      .hero-eyebrow {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--color-muted);
        display: inline-block;
        margin-bottom: clamp(20px, 3vw, 40px);
        animation: fade-up 600ms 80ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-sub {
        font-family: var(--font-sans);
        font-size: clamp(15px, 1.5vw, 19px);
        line-height: 1.68;
        color: var(--color-muted);
        font-weight: 300;
        max-width: 520px;
        margin-bottom: clamp(28px, 4vw, 48px);
        animation: fade-up 800ms 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-cta {
        animation: fade-up 800ms 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: clamp(32px, 5vw, 64px);
      }

      @media (max-width: 480px) {
        .hero-cta { flex-direction: column; align-items: stretch; }
        .hero-cta a, .hero-cta button { text-align: center; justify-content: center; }
      }

      .hero-industries {
        animation: fade-up 800ms 780ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-divider {
        animation: fade-in 1200ms 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      @media (max-width: 600px) {
        .hero-divider { display: none !important; }
      }

      /* ── Right panel glow accent ─────────────── */
      .hero-right-glow {
        position: absolute;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(255,59,0,0.06) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      /* ── Scroll indicator ────────────────────── */
      .hero-scroll-indicator {
        position: absolute;
        bottom: 32px;
        left: clamp(20px, 6vw, 80px);
        display: flex;
        flex-direction: column;
        gap: 6px;
        animation: fade-in 1200ms 1000ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      @media (min-width: 920px) {
        .hero-scroll-indicator {
          left: 50%;
          transform: translateX(-50%);
        }
      }

      @media (max-width: 600px) {
        .hero-scroll-indicator { display: none !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-eyebrow, .hero-sub, .hero-cta,
        .hero-industries, .hero-divider, .hero-scroll-indicator {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
        .hero-orb { animation: none !important; }
        .headline-line-inner { transform: none !important; opacity: 1 !important; }
      }
    `;
    document.head.appendChild(style);
  };
})();

function renderHeadline(value: string) {
  const highlighted = ['microservicios', 'escala', 'orquesta'];
  const lines = value.split('\n');

  return lines.map((line, lineIndex) => {
    let parts: ReactNode[] = [line];

    highlighted.forEach((word) => {
      parts = parts.flatMap((part, partIndex) => {
        if (typeof part !== 'string' || !part.toLowerCase().includes(word)) return [part];
        const regex = new RegExp(`(${word})`, 'ig');
        return part.split(regex).map((chunk, chunkIndex) =>
          chunk.toLowerCase() === word
            ? <em key={`${lineIndex}-${partIndex}-${chunkIndex}`}>{chunk}</em>
            : chunk,
        );
      });
    });

    return (
      <span key={lineIndex} className="headline-line-outer">
        <span className="headline-line-inner">{parts}</span>
      </span>
    );
  });
}

export default function Hero() {
  const p = usePersonalization();
  const { prefersReducedMotion } = useAdaptiveExperience();
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !headlineRef.current) return;

    const lines = headlineRef.current.querySelectorAll<HTMLElement>('.headline-line-inner');
    gsap.fromTo(
      lines,
      { y: '108%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.95,
        stagger: 0.14,
        ease: 'power4.out',
        delay: 0.12,
      },
    );

    return () => gsap.killTweensOf(lines);
  }, [prefersReducedMotion]);

  return (
    <section
      data-track-section="hero"
      style={{
        position: 'relative',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}
    >
      <div className="hero-grid">
        {/* ── LEFT PANEL ── */}
        <div
          style={{
            background: 'var(--color-bg)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: 'calc(var(--bar-h, 0px) + clamp(88px, 14vw, 160px))',
            paddingBottom: 'clamp(80px, 10vw, 120px)',
            paddingInline: 'clamp(20px, 6vw, 80px)',
          }}
        >
          {/* Dot-grid overlay */}
          <div className="hero-dot-grid" aria-hidden="true" />
          {/* Orange orb */}
          <div className="hero-orb" aria-hidden="true" />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
            <p className="hero-eyebrow">MotorCloud · SaaS Java · Arquitectura distribuida</p>

            <h1 ref={headlineRef} className="hero-headline">
              {renderHeadline(p.heroHeadline)}
            </h1>

            <p className="hero-sub">{p.heroSub}</p>

            {p.urgencySignal && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '20px',
                  animation: 'fade-up 700ms 640ms cubic-bezier(0.22, 1, 0.36, 1) both',
                }}
              >
                ● Arquitectura lista para integraciones y operación compleja
              </p>
            )}

            <div className="hero-cta">
              <Link
                to="/solucion"
                className="btn-primary-accent"
                data-track-event="cta_click"
                data-track-label={p.primaryCta}
                data-track-location="hero"
              >
                {p.primaryCta} →
              </Link>
              <Link
                to="/contacto"
                data-track-event="cta_click"
                data-track-label={p.secondaryCta}
                data-track-location="hero"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '2px',
                  transition: 'color 0.15s, border-color 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)';
                  e.currentTarget.style.borderColor = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-muted)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {p.secondaryCta}
              </Link>
            </div>

            <div className="hero-industries" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  marginRight: '4px',
                }}
              >
                Foco:
              </span>
              {['Distribución', 'Retail', 'Logística', 'B2B', 'Integraciones'].map((item) => (
                <span
                  key={item}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    border: '1px solid var(--color-border)',
                    padding: '5px 12px',
                    background: 'var(--color-surface)',
                    transition: 'border-color 0.2s, color 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.borderColor = 'var(--color-accent)';
                    (e.currentTarget as HTMLSpanElement).style.color = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLSpanElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLSpanElement).style.color = 'var(--color-muted)';
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll-indicator hero-divider" aria-hidden="true">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                opacity: 0.45,
              }}
            >
              scroll
            </span>
            <div
              style={{
                width: '1px',
                height: '40px',
                background: 'linear-gradient(to bottom, var(--color-muted), transparent)',
                opacity: 0.35,
              }}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL (desktop only) ── */}
        <div
          className="hero-right-panel"
          style={{ background: '#0A0A0A' }}
        >
          <div className="hero-dot-grid-dark" aria-hidden="true" />
          <div className="hero-right-glow" aria-hidden="true" />
          <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <HeroVisual prefersReducedMotion={prefersReducedMotion} />
          </div>
        </div>
      </div>
    </section>
  );
}
