import { useMemo, useState, type CSSProperties, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Database, Infinity, LayoutDashboard, Store, Users, Zap } from 'lucide-react';
import { BUSINESS_TYPES } from '../../lib/businessTypes';
import { getPublicDemoByBusinessType, getPublicDemoHref, getPublicDemoLabel } from '../../lib/publicDemos';

const demoFeatures = [
  {
    Icon: Store,
    title: 'Tienda online completa',
    desc: 'Catálogo, carrito, checkout y panel admin en un solo sistema listo para vender.',
  },
  {
    Icon: LayoutDashboard,
    title: '20+ módulos operativos',
    desc: 'Productos, pedidos, clientes, finanzas, empleados, ofertas y mucho más.',
  },
  {
    Icon: Users,
    title: 'Roles y equipos',
    desc: 'Permisos por módulo. Tu equipo accede solo a lo que necesita.',
  },
  {
    Icon: Database,
    title: 'Tus datos desde el día uno',
    desc: 'Cargás tu catálogo real. Sin información de ejemplo ni restricciones.',
  },
  {
    Icon: Zap,
    title: 'Integraciones incluidas',
    desc: 'MercadoPago, AFIP, WhatsApp API y más desde el mismo sistema.',
  },
  {
    Icon: Infinity,
    title: 'Sin límites de crecimiento',
    desc: 'El sistema escala con tu operación. Sin cambiar de plan ni perder datos.',
  },
] as const;

interface DemoExperienceSectionProps {
  isSmallViewport: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  wrapStyle: CSSProperties;
}

export default function DemoExperienceSection({
  isSmallViewport,
  sectionRef,
  wrapStyle,
}: DemoExperienceSectionProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('indumentaria');
  const selectedDemo = useMemo(
    () => getPublicDemoByBusinessType(selectedIndustry),
    [selectedIndustry],
  );

  return (
    <section
      data-track-section="home_demo"
      style={{
        background: 'var(--color-dark)',
        borderBottom: '1px solid var(--color-dark-border)',
        paddingBlock: 'clamp(72px, 9vw, 120px)',
      }}
    >
      <div style={wrapStyle}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSmallViewport ? '1fr' : 'minmax(0, 1.05fr) minmax(320px, 420px)',
            gap: 'clamp(28px, 4vw, 48px)',
            alignItems: 'stretch',
            marginBottom: '48px',
          }}
        >
          <div>
            <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>
              Demo interactiva
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(30px, 4vw, 58px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                color: '#FAFAFA',
                maxWidth: 620,
                marginBottom: 18,
              }}
            >
              Probá cómo queda tu tienda
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.38)' }}>
                antes de contratar nada.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                color: 'rgba(255,255,255,0.48)',
                maxWidth: 520,
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: 28,
              }}
            >
              Elegí una industria, recorré una tienda pública curada y mirá en tiempo real
              cómo se siente el producto antes de abrir tu propia cuenta.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
              }}
            >
              {BUSINESS_TYPES.filter((item) =>
                ['indumentaria', 'gastronomia', 'muebleria'].includes(item.key),
              ).map((item) => {
                const selected = item.key === selectedIndustry;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedIndustry(item.key)}
                    style={{
                      padding: '14px 14px 15px',
                      textAlign: 'left',
                      border: `1px solid ${selected ? '#FF3B00' : 'rgba(255,255,255,0.08)'}`,
                      background: selected ? 'rgba(255,59,0,0.1)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '-0.02em',
                        marginBottom: 4,
                      }}
                    >
                      {item.shortLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: selected ? '#FF3B00' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      Demo pública
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: '28px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#FF3B00',
                  marginBottom: 8,
                }}
              >
                Demo seleccionada
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 2.5vw, 34px)',
                  fontWeight: 800,
                  color: '#FAFAFA',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  marginBottom: 10,
                }}
              >
                {selectedDemo.businessName}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.46)',
                  fontWeight: 300,
                }}
              >
                {selectedDemo.headline}
              </p>
            </div>

            <div
              style={{
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.42)',
                  marginBottom: 10,
                }}
              >
                {selectedDemo.summary}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)',
                }}
              >
                {selectedDemo.proof}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                to={getPublicDemoHref(selectedIndustry)}
                className="btn-primary-accent"
                data-track-event="cta_click"
                data-track-label={`Ver demo de ${getPublicDemoLabel(selectedIndustry)}`}
                data-track-location="home_demo"
              >
                Ver demo de {getPublicDemoLabel(selectedIndustry)} →
              </Link>
              <Link
                to="/registro"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: '#FAFAFA',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '13px 22px',
                }}
                data-track-event="cta_click"
                data-track-label="Crear mi propia demo gratis"
                data-track-location="home_demo"
              >
                Crear mi propia demo gratis
              </Link>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              Tiempo estimado: 3 minutos · Sin instalar nada
            </p>
          </div>
        </div>

        <div
          ref={sectionRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2px',
          }}
        >
          {demoFeatures.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="demo-feat-card"
              style={{
                padding: '28px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,59,0,0.1)',
                  border: '1px solid rgba(255,59,0,0.15)',
                }}
              >
                <Icon size={20} color="#FF3B00" strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
