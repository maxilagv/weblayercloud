import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-dark)',
        borderTop: '1px solid var(--color-dark-border)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          maxWidth: '1200px',
          marginInline: 'auto',
          paddingInline: 'clamp(20px, 6vw, 80px)',
          paddingBlock: 'clamp(48px, 7vw, 80px)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto',
          gap: 'clamp(32px, 5vw, 80px)',
          alignItems: 'start',
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '16px', textDecoration: 'none' }}>
            <LogoMark size={24} variant="full" theme="dark" />
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
              lineHeight: 1.6,
              maxWidth: '200px',
            }}
          >
            Ingeniería de sistemas
            <br />
            para empresas en expansión.
          </p>
        </div>

        {/* Spacer on desktop */}
        <div />

        {/* Plataforma */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '20px',
            }}
          >
            Plataforma
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Arquitectura',         path: '/solucion' },
              { label: 'Operación y canales',  path: '/solucion' },
              { label: 'Diagnóstico',          path: '/contacto' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Empresa */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '20px',
            }}
          >
            Empresa
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Visión',    path: '/' },
              { label: 'Contacto', path: '/contacto' },
              { label: 'Términos', path: '#' },
              { label: 'Privacidad', path: '#' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.45)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1200px',
          marginInline: 'auto',
          paddingInline: 'clamp(20px, 6vw, 80px)',
          paddingBlock: '20px',
          borderTop: '1px solid var(--color-dark-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}
        >
          © {new Date().getFullYear()} LayerCloud. Todos los derechos reservados.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}
        >
          Built in Argentina. Designed to scale.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto;
          }
          .footer-grid > div:nth-child(2) {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
