import { Link } from 'react-router';
import LogoMark from './LogoMark';

const platformLinks = [
  { label: 'Plataforma', path: '/solucion' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Diagnóstico', path: '/contacto' },
];

const architectureLinks = [
  { label: 'SaaS en Java', path: '/saas-java' },
  { label: 'Microservicios', path: '/arquitectura-microservicios' },
  { label: 'Integraciones', path: '/integraciones-empresariales' },
  { label: 'Migración legacy', path: '/migracion-sistemas-legacy' },
];

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
              maxWidth: '240px',
            }}
          >
            SaaS moderno en Java
            <br />
            para operaciones que ya necesitan sistema.
          </p>
        </div>

        <div />

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
            {platformLinks.map((item) => (
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

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
            Arquitectura
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {architectureLinks.map((item) => (
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

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
          © {new Date().getFullYear()} MotorCloud. Todos los derechos reservados.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}
        >
          Built in Argentina. Designed for scale.
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
