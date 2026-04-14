import { Boxes, Cable, Cpu, Eye, ShieldCheck, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties, RefObject } from 'react';

const pillars = [
  {
    Icon: Cpu,
    title: 'Core de dominio',
    desc: 'Catálogo, precios, clientes, órdenes y permisos resueltos como dominios estables, no como componentes aislados.',
  },
  {
    Icon: Workflow,
    title: 'Orquestación',
    desc: 'Eventos, colas y sincronización entre servicios para que ventas, pagos, logística y reporting compartan estado real.',
  },
  {
    Icon: Eye,
    title: 'Observabilidad',
    desc: 'Logs, trazas, alertas y auditoría desde el diseño. La operación no depende de adivinar qué falló.',
  },
  {
    Icon: Cable,
    title: 'Integraciones',
    desc: 'Conectores para marketplaces, pagos, ERPs externos, CRMs y APIs propias sin acoplar toda la plataforma.',
  },
  {
    Icon: ShieldCheck,
    title: 'Seguridad',
    desc: 'Accesos granulares, entornos aislados y flujos listos para una operación B2B con múltiples equipos.',
  },
  {
    Icon: Boxes,
    title: 'Escala modular',
    desc: 'Más de 10 microservicios coordinados para crecer por módulos sin reescribir la base cada vez.',
  },
] as const;

const topicLinks = [
  {
    href: '/saas-java',
    label: 'SaaS en Java',
    desc: 'Por qué Java sigue siendo una base fuerte para productos con alto volumen, reglas complejas e integraciones críticas.',
  },
  {
    href: '/arquitectura-microservicios',
    label: 'Microservicios',
    desc: 'Cómo separar dominios, eventos, trazabilidad y despliegues sin crear un sistema inmantenible.',
  },
  {
    href: '/integraciones-empresariales',
    label: 'Integraciones',
    desc: 'APIs, webhooks, colas y conectores para operar con terceros sin duplicar lógica de negocio.',
  },
  {
    href: '/migracion-sistemas-legacy',
    label: 'Migración legacy',
    desc: 'Migrar sin romper ventas ni operaciones, con etapas, doble corrida y control sobre el dato.',
  },
] as const;

interface PlatformArchitectureSectionProps {
  isSmallViewport: boolean;
  sectionRef: RefObject<HTMLDivElement | null>;
  wrapStyle: CSSProperties;
}

export default function PlatformArchitectureSection({
  isSmallViewport,
  sectionRef,
  wrapStyle,
}: PlatformArchitectureSectionProps) {
  return (
    <section
      data-track-section="home_architecture"
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
            gridTemplateColumns: isSmallViewport ? '1fr' : 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
            gap: 'clamp(28px, 5vw, 56px)',
            marginBottom: '40px',
            alignItems: 'start',
          }}
        >
          <div>
            <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>
              Arquitectura aplicada
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(30px, 4vw, 58px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                color: '#FAFAFA',
                marginBottom: '18px',
                maxWidth: '620px',
              }}
            >
              MotorCloud no es una demo.
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.34)' }}>
                Es una plataforma operativa real.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.48)',
                fontWeight: 300,
                maxWidth: '560px',
              }}
            >
              El foco de esta capa pública cambia de "probar una demo" a mostrar cómo está
              construida la plataforma: dominios bien separados, integraciones serias, trazabilidad
              y una base Java lista para operar a escala.
            </p>
          </div>

          <div
            style={{
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#FF3B00',
                marginBottom: '12px',
              }}
            >
              Temas que ahora empujan SEO
            </p>
            <div style={{ display: 'grid', gap: '10px' }}>
              {topicLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    textDecoration: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '10px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#FAFAFA',
                      letterSpacing: '-0.02em',
                      marginBottom: '4px',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: 300,
                    }}
                  >
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={sectionRef}
          style={{
            display: 'grid',
            gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          {pillars.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="architecture-card"
              style={{
                background: '#0B0B0B',
                padding: isSmallViewport ? '24px 20px' : '28px 24px',
                minHeight: '220px',
              }}
            >
              <Icon size={18} color="#FF3B00" strokeWidth={2.2} style={{ marginBottom: '18px' }} />
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#FAFAFA',
                  marginBottom: '10px',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.42)',
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
