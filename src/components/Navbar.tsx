import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import LogoMark from './LogoMark';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

const navLinks = [
  { name: 'Arquitectura', path: '/solucion' },
  { name: 'Servicios',    path: '/servicios' },
  { name: 'Contacto',     path: '/contacto' },
];

/* ── Estilos del hamburger inyectados una sola vez ── */
const injectHamStyles = (() => {
  let done = false;
  return () => {
    if (done || typeof document === 'undefined') return;
    done = true;
    const s = document.createElement('style');
    s.textContent = `
      .ham-btn {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        gap: 5px;
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        flex-shrink: 0;
      }
      .ham-line {
        display: block;
        height: 1.5px;
        background: currentColor;
        border-radius: 1px;
        transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                    opacity   0.25s ease,
                    width     0.35s cubic-bezier(0.22,1,0.36,1);
        transform-origin: center;
      }
      .ham-line-1 { width: 22px; }
      .ham-line-2 { width: 16px; }
      .ham-line-3 { width: 22px; }

      /* open state */
      .ham-open .ham-line-1 {
        width: 22px;
        transform: translateY(6.5px) rotate(45deg);
      }
      .ham-open .ham-line-2 {
        opacity: 0;
        transform: scaleX(0);
      }
      .ham-open .ham-line-3 {
        width: 22px;
        transform: translateY(-6.5px) rotate(-45deg);
      }

      /* nav link hover */
      .mobile-nav-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-decoration: none;
        padding: 0 clamp(24px, 7vw, 56px);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        transition: padding-left 0.2s ease;
      }
      .mobile-nav-link:last-child { border-bottom: none; }
      .mobile-nav-link:hover { padding-left: calc(clamp(24px, 7vw, 56px) + 10px); }
      .mobile-nav-link:active { opacity: 0.7; }

      @media (prefers-reduced-motion: reduce) {
        .ham-line { transition: none !important; }
      }
    `;
    document.head.appendChild(s);
  };
})();

export default function Navbar() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isSmallViewport } = useAdaptiveExperience();

  useEffect(() => { injectHamStyles(); }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* cerrar al navegar */
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  /* bloquear scroll del body cuando el menu está abierto */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 'var(--bar-h, 0px)',
          width: '100%',
          zIndex: 100,
          transition: 'padding 0.3s ease, background 0.3s ease, border-color 0.3s ease',
          paddingBlock: isScrolled ? '14px' : '22px',
          background: isMobileMenuOpen
            ? 'transparent'
            : isScrolled
              ? 'rgba(250,250,250,0.96)'
              : 'transparent',
          borderBottom: isScrolled && !isMobileMenuOpen
            ? '1px solid #E5E5E5'
            : '1px solid transparent',
          backdropFilter: isScrolled && !isMobileMenuOpen ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: isScrolled && !isMobileMenuOpen ? 'blur(12px)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            marginInline: 'auto',
            paddingInline: 'clamp(20px, 6vw, 80px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo — claro en fondo blanco, oscuro en overlay negro */}
          <Link to="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 101 }}>
            <LogoMark size={26} variant="full" theme={isMobileMenuOpen ? 'dark' : 'light'} />
          </Link>

          {/* Desktop nav — solo cuando no es mobile */}
          {!isSmallViewport && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    data-track-event="cta_click"
                    data-track-label={link.name}
                    data-track-location="navbar"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: active ? 500 : 400,
                      color: active ? 'var(--color-text)' : 'var(--color-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      paddingBottom: '2px',
                      borderBottom: active ? '1px solid var(--color-text)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = active ? 'var(--color-text)' : 'var(--color-muted)'; }}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <Link
                to="/login"
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: '13px',
                  color: 'var(--color-muted)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                Acceder →
              </Link>
              <Link
                to="/registro"
                className="btn-primary-accent"
                data-track-event="cta_click"
                data-track-label="Probar gratis navbar"
                data-track-location="navbar"
                style={{ fontSize: '13px', padding: '9px 20px' }}
              >
                Probá gratis
              </Link>
            </nav>
          )}

          {/* Hamburger — solo mobile */}
          {isSmallViewport && (
            <button
              className={`ham-btn ${isMobileMenuOpen ? 'ham-open' : ''}`}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
              style={{
                color: isMobileMenuOpen ? '#FFFFFF' : 'var(--color-text)',
                position: 'relative',
                zIndex: 101,
              }}
            >
              <span className="ham-line ham-line-1" />
              <span className="ham-line ham-line-2" />
              <span className="ham-line ham-line-3" />
            </button>
          )}
        </div>
      </header>

      {/* ── OVERLAY MENU FULL-SCREEN ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: '#0A0A0A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
            }}
          >
            {/* Links — bloque central */}
            <nav
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop: '100px',
                paddingBottom: '32px',
              }}
            >
              {navLinks.map((link, i) => {
                const active = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.38, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.path}
                      className="mobile-nav-link"
                      data-track-event="cta_click"
                      data-track-label={link.name}
                      data-track-location="navbar_mobile"
                      style={{
                        paddingBlock: '22px',
                      }}
                    >
                      {/* Número */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.25)',
                            letterSpacing: '0.14em',
                            minWidth: '24px',
                          }}
                        >
                          0{i + 1}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(36px, 11vw, 56px)',
                            fontWeight: 700,
                            letterSpacing: '-0.03em',
                            color: active ? '#FF3B00' : '#FFFFFF',
                            lineHeight: 1,
                            transition: 'color 0.15s',
                          }}
                        >
                          {link.name}
                        </span>
                      </div>
                      {/* Flecha */}
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '20px',
                          color: active ? '#FF3B00' : 'rgba(255,255,255,0.2)',
                          transition: 'color 0.15s',
                        }}
                      >
                        →
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* CTA + tagline — fondo del overlay */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                padding: 'clamp(20px, 6vw, 40px)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Link
                to="/registro"
                data-track-event="cta_click"
                data-track-label="Probar gratis mobile"
                data-track-location="navbar_mobile"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500,
                  background: '#FF3B00', color: '#FFFFFF', textDecoration: 'none',
                  padding: '16px 24px', marginBottom: '10px',
                  transition: 'background 0.15s', letterSpacing: '-0.01em',
                }}
              >
                Probá gratis →
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-sans)', fontSize: '14px',
                  color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
                  padding: '12px 24px', marginBottom: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                Acceder a mi demo →
              </Link>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                  textAlign: 'center',
                }}
              >
                Buenos Aires&nbsp;·&nbsp;Software de escala
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
