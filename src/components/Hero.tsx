import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const injectStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    injected = true;

    const style = document.createElement('style');
    style.textContent = `
      .hero-headline {
        font-family: var(--font-display);
        font-size: clamp(48px, 9vw, 130px);
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

      .hero-headline {
        animation: fade-up 800ms 160ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-sub {
        font-family: var(--font-sans);
        font-size: clamp(15px, 1.5vw, 19px);
        line-height: 1.68;
        color: var(--color-muted);
        font-weight: 300;
        max-width: 540px;
        margin-bottom: clamp(28px, 4vw, 48px);
        animation: fade-up 800ms 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-cta {
        animation: fade-up 800ms 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: clamp(32px, 5vw, 64px);
      }

      /* En mobile: botón CTA full-width */
      @media (max-width: 480px) {
        .hero-cta {
          flex-direction: column;
          align-items: stretch;
        }
        .hero-cta a,
        .hero-cta button {
          text-align: center;
          justify-content: center;
        }
      }

      .hero-industries {
        animation: fade-up 800ms 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .hero-divider {
        animation: fade-in 1200ms 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* Ocultar scroll indicator en pantallas pequeñas */
      @media (max-width: 600px) {
        .hero-divider { display: none !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-eyebrow,
        .hero-headline,
        .hero-sub,
        .hero-cta,
        .hero-industries,
        .hero-divider {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
})();

export default function Hero() {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <section
      data-track-section="hero"
      style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: 'calc(var(--bar-h, 0px) + clamp(88px, 14vw, 160px))',
        paddingBottom: 'clamp(64px, 8vw, 100px)',
        paddingInline: 'clamp(20px, 6vw, 80px)',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle ruled lines in background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 80px',
          backgroundPosition: '0 0',
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.6) 70%, transparent 100%)',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          marginInline: 'auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p className="hero-eyebrow">
          Buenos Aires&nbsp;&nbsp;·&nbsp;&nbsp;Software de escala
        </p>

        <h1 className="hero-headline">
          Construimos
          <br />
          sistemas que
          <br />
          hacen <em>crecer</em>
          <br />
          negocios.
        </h1>

        <p className="hero-sub">
          Arquitectura de software para empresas argentinas
          que quieren operar, vender y escalar sin fricción.
        </p>

        <div className="hero-cta">
          <Link
            to="/contacto"
            className="btn-primary-accent"
            data-track-event="cta_click"
            data-track-label="Contanos tu negocio"
            data-track-location="hero"
          >
            Contanos tu negocio&nbsp;→
          </Link>
          <Link
            to="/solucion"
            data-track-event="cta_click"
            data-track-label="Ver cómo trabajamos"
            data-track-location="hero"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--color-muted)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '2px',
              transition: 'color 0.15s, border-color 0.15s',
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
            Ver cómo trabajamos
          </Link>
        </div>

        {/* Industry pills */}
        <div
          className="hero-industries"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
          }}
        >
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
            Sectores:
          </span>
          {['Retail', 'Logística', 'E-commerce', 'Servicios', 'Manufactura'].map((ind) => (
            <span
              key={ind}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                border: '1px solid var(--color-border)',
                padding: '5px 12px',
                background: 'var(--color-surface)',
              }}
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="hero-divider"
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            opacity: 0.5,
          }}
        >
          scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, var(--color-muted), transparent)',
            opacity: 0.4,
          }}
        />
      </div>
    </section>
  );
}
