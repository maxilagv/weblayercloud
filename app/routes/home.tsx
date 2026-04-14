import { useEffect, useRef, type CSSProperties } from 'react';
import { Link, type MetaFunction } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Boxes, Cable, Database, GitBranch, Layers3, LineChart, ShieldCheck } from 'lucide-react';
import Hero from '../components/Hero';
import PlatformArchitectureSection from '../components/home/PlatformArchitectureSection';
import PageTransition from '../components/PageTransition';
import StructuredData from '../components/seo/StructuredData';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';
import {
  breadcrumbJsonLd,
  buildMeta,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '../lib/seo';

gsap.registerPlugin(ScrollTrigger);

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'MotorCloud',
    description:
      'MotorCloud es un SaaS moderno en Java con más de 10 microservicios para ventas, catálogo, pagos, integraciones y operación B2B a escala.',
    path: '/',
    keywords: [
      'motorcloud',
      'saas java',
      'microservicios',
      'arquitectura de software',
      'erp moderno',
      'integraciones empresariales',
      'plataforma b2b',
    ],
  });

const impactStats = [
  { num: '10+', lbl: 'microservicios coordinados' },
  { num: '1', lbl: 'modelo operativo unificado' },
  { num: '24/7', lbl: 'observabilidad y monitoreo' },
  { num: 'B2B', lbl: 'foco en operaciones complejas' },
] as const;

const platformLayers = [
  {
    Icon: Layers3,
    title: 'Dominios claros',
    desc: 'Catálogo, pricing, clientes, pedidos y permisos viven en límites de dominio definidos. Sin mezclar reglas comerciales con UI o integraciones.',
  },
  {
    Icon: GitBranch,
    title: 'Eventos y flujos',
    desc: 'Cada cambio importante puede propagarse entre servicios con eventos, colas y automatizaciones que reducen acople y retrabajo.',
  },
  {
    Icon: Database,
    title: 'Dato confiable',
    desc: 'La plataforma prioriza trazabilidad, auditoría y sincronización controlada para que reporting y operación miren la misma verdad.',
  },
  {
    Icon: Cable,
    title: 'Conectores reales',
    desc: 'APIs, webhooks y adaptadores para pagos, marketplaces, ERPs y CRMs externos sin convertir cada integración en una excepción.',
  },
  {
    Icon: ShieldCheck,
    title: 'Seguridad operativa',
    desc: 'Roles, permisos, logs y aislamiento por entorno pensados para equipos comerciales, operativos y técnicos trabajando en paralelo.',
  },
  {
    Icon: LineChart,
    title: 'Escala medible',
    desc: 'Métricas, alertas y observabilidad para saber qué está pasando en producción antes de que el problema llegue al usuario final.',
  },
] as const;

const microserviceDomains = [
  'Identity & Access',
  'Catalog',
  'Pricing',
  'Orders',
  'Payments',
  'Inventory',
  'Notifications',
  'CRM',
  'Analytics',
  'Integrations',
  'Audit',
  'Workflow',
] as const;

const operatingScenarios = [
  {
    tag: 'Distribución B2B',
    title: 'Catálogo, precios y órdenes sin hojas sueltas',
    desc: 'Cuando el negocio vende por múltiples canales y necesita reglas distintas por cliente, una arquitectura bien separada deja de ser opcional.',
  },
  {
    tag: 'Retail con operación',
    title: 'Stock, pagos y ventas alineados en tiempo real',
    desc: 'El problema no es solo vender más. Es vender sin romper inventario, finanzas o la experiencia del equipo que opera cada día.',
  },
  {
    tag: 'Logística',
    title: 'Rutas, estados y trazabilidad sobre eventos',
    desc: 'La operación logística exige estados consistentes, integraciones y alertas. Eso encaja mejor con servicios especializados que con un monolito improvisado.',
  },
  {
    tag: 'Migración legacy',
    title: 'Pasar de planillas y parches a una plataforma viva',
    desc: 'MotorCloud está pensado para convivir con datos históricos, integrarse por etapas y reducir riesgo durante el cambio.',
  },
] as const;

const authorityLinks = [
  {
    href: '/saas-java',
    label: 'SaaS en Java',
    desc: 'Base técnica para productos con reglas complejas, equipos grandes e integraciones críticas.',
  },
  {
    href: '/arquitectura-microservicios',
    label: 'Arquitectura de microservicios',
    desc: 'Separación de dominios, eventos, observabilidad y despliegues sin caos organizacional.',
  },
  {
    href: '/integraciones-empresariales',
    label: 'Integraciones empresariales',
    desc: 'Pagos, marketplaces, webhooks y APIs conectados desde una capa estable.',
  },
  {
    href: '/migracion-sistemas-legacy',
    label: 'Migración de sistemas legacy',
    desc: 'Cómo pasar de Excel y aplicaciones aisladas a una plataforma operativa sin cortar la operación.',
  },
] as const;

function openChatbot() {
  window.dispatchEvent(new CustomEvent('layercloud:open-chat'));
}

export default function Home() {
  const impactRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const architectureRef = useRef<HTMLDivElement>(null);
  const scenariosRef = useRef<HTMLDivElement>(null);
  const authorityRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const triggers: ScrollTrigger[] = [];

    const stagger = (container: HTMLElement | null, selector: string, start = 'top 82%') => {
      if (!container) return;
      const items = container.querySelectorAll(selector);
      const tween = gsap.fromTo(
        items,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.78,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: container, start },
        },
      );

      if (tween.scrollTrigger) {
        triggers.push(tween.scrollTrigger);
      }
    };

    stagger(impactRef.current, '.impact-card');
    stagger(layersRef.current, '.layer-card');
    stagger(architectureRef.current, '.architecture-card');
    stagger(scenariosRef.current, '.scenario-card');
    stagger(authorityRef.current, '.authority-card');

    // Animated counters for impact stats
    if (impactRef.current) {
      const numEls = impactRef.current.querySelectorAll<HTMLElement>('.impact-num-animate');
      numEls.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const counter = { val: 0 };
        const t = gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: () => { el.textContent = `${Math.round(counter.val)}${suffix}`; },
          scrollTrigger: { trigger: impactRef.current, start: 'top 85%', once: true },
        });
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });
    }

    if (ctaRef.current) {
      const tween = gsap.fromTo(
        ctaRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        },
      );
      if (tween.scrollTrigger) {
        triggers.push(tween.scrollTrigger);
      }
    }

    return () => triggers.forEach((trigger) => trigger.kill());
  }, [prefersReducedMotion]);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };

  const section: CSSProperties = {
    paddingBlock: 'clamp(72px, 9vw, 120px)',
    borderBottom: '1px solid var(--color-border)',
  };

  const homeJsonLd = [
    websiteJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd({
      name: 'MotorCloud',
      description:
        'SaaS moderno en Java con más de 10 microservicios para operaciones, integraciones y crecimiento B2B.',
      path: '/',
    }),
    breadcrumbJsonLd([{ name: 'Inicio', path: '/' }]),
  ];

  return (
    <PageTransition>
      <div style={{ background: 'var(--color-bg)' }}>
        {homeJsonLd.map((entry, index) => (
          <StructuredData key={index} data={entry} />
        ))}

        <Hero />

        <PlatformArchitectureSection
          isSmallViewport={isSmallViewport}
          sectionRef={architectureRef}
          wrapStyle={wrap}
        />

        <section
          data-track-section="home_impact"
          style={{ background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)', position: 'relative', overflow: 'hidden' }}
        >
          {/* Noise texture overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
              backgroundSize: '180px',
              pointerEvents: 'none',
              opacity: 0.6,
            }}
          />
          {/* Gradient sweep */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255,59,0,0.04) 0%, transparent 50%, rgba(255,59,0,0.02) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div
              ref={impactRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {impactStats.map((item) => {
                const isNumeric = /^\d/.test(item.num);
                const numericVal = parseInt(item.num.replace(/\D.*/, ''), 10);
                const suffix = isNumeric ? item.num.replace(/^\d+/, '') : '';

                return (
                  <div
                    key={item.lbl}
                    className="impact-card"
                    style={{
                      background: '#0A0A0A',
                      padding: isSmallViewport ? '24px 18px' : '32px 24px',
                      transition: 'background 0.25s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#111'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#0A0A0A'; }}
                  >
                    <p
                      className={isNumeric ? 'impact-num-animate' : undefined}
                      data-target={isNumeric ? numericVal : undefined}
                      data-suffix={isNumeric ? suffix : undefined}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(28px, 3.2vw, 46px)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: '#FAFAFA',
                        marginBottom: '8px',
                      }}
                    >
                      {item.num}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.38)',
                      }}
                    >
                      {item.lbl}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="home_layers" style={{ ...section, position: 'relative', overflow: 'hidden' }}>
          {/* Dot-grid background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
              pointerEvents: 'none',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '38px', maxWidth: '760px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>
                Plataforma en capas
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4vw, 54px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: 'var(--color-text)',
                  marginBottom: '16px',
                }}
              >
                Un SaaS moderno no se vende por screenshots.
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>
                  Se sostiene por diseño técnico.
                </em>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                  maxWidth: '680px',
                }}
              >
                Esta capa pública ahora explica qué hace fuerte a MotorCloud: dominios
                estables, servicios especializados y un modelo de integración listo para operar
                con terceros sin perder control.
              </p>
            </div>

            <div
              ref={layersRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {platformLayers.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="layer-card"
                  style={{
                    background: 'var(--color-surface)',
                    padding: isSmallViewport ? '24px 20px' : '28px 24px',
                    minHeight: '240px',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)';
                    const svg = el.querySelector('svg') as SVGElement | null;
                    if (svg) svg.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                    const svg = el.querySelector('svg') as SVGElement | null;
                    if (svg) svg.style.transform = 'scale(1)';
                  }}
                >
                  <Icon size={18} color="#FF3B00" strokeWidth={2.2} style={{ marginBottom: '18px', transition: 'transform 0.25s ease' }} />
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'var(--color-text)',
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
                      color: 'var(--color-muted)',
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

        <section data-track-section="home_microservices" style={{ ...section, background: 'var(--color-surface)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '30px', maxWidth: '760px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>
                Mapa operativo
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.6vw, 48px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.06,
                  color: 'var(--color-text)',
                  marginBottom: '14px',
                }}
              >
                Más de 10 microservicios coordinados,
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>
                  una sola plataforma para operar.
                </em>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                  maxWidth: '680px',
                }}
              >
                No todos se muestran de cara al usuario final, pero todos cuentan para la
                estabilidad del producto. El sitio ahora prioriza explicar esa base técnica.
              </p>
            </div>

          </div>

          {/* Marquee strip */}
          <div
            style={{
              overflow: 'hidden',
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              marginTop: 'clamp(32px, 5vw, 56px)',
            }}
          >
            <div
              className="marquee-track"
              style={{ animationDuration: '28s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}
            >
              {[...microserviceDomains, ...microserviceDomains].map((service, i) => (
                <span key={i} className="marquee-item">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="home_scenarios" style={section}>
          <div style={wrap}>
            <div style={{ marginBottom: '34px', maxWidth: '760px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>
                Donde encaja
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.6vw, 48px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.06,
                  color: 'var(--color-text)',
                }}
              >
                Operaciones donde un sistema genérico
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>
                  ya no alcanza.
                </em>
              </h2>
            </div>

            <div
              ref={scenariosRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(2, 1fr)',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {operatingScenarios.map((scenario) => (
                <div
                  key={scenario.title}
                  className="scenario-card"
                  style={{
                    background: 'var(--color-bg)',
                    padding: isSmallViewport ? '24px 20px' : '30px 26px',
                    minHeight: '230px',
                    transition: 'background 0.25s, box-shadow 0.25s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--color-surface)';
                    el.style.boxShadow = 'inset 3px 0 0 var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--color-bg)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: '12px',
                    }}
                  >
                    {scenario.tag}
                  </p>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '26px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'var(--color-text)',
                      lineHeight: 1.08,
                      marginBottom: '12px',
                    }}
                  >
                    {scenario.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      lineHeight: 1.8,
                      color: 'var(--color-muted)',
                      fontWeight: 300,
                    }}
                  >
                    {scenario.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="home_authority" style={{ ...section, background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '34px', maxWidth: '720px' }}>
              <p className="eyebrow-accent" style={{ marginBottom: '12px' }}>
                Hub temático
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.8vw, 52px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: '#FAFAFA',
                  marginBottom: '14px',
                }}
              >
                Contenido pensado para atraer búsquedas
                <br />
                con intención técnica y comercial.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.42)',
                  fontWeight: 300,
                }}
              >
                En lugar de empujar una demo, la web ahora empuja autoridad: arquitectura,
                Java, integraciones y migración como temas centrales del posicionamiento.
              </p>
            </div>

            <div
              ref={authorityRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(4, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {authorityLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="authority-card"
                  style={{
                    background: '#0A0A0A',
                    padding: isSmallViewport ? '24px 20px' : '26px 22px',
                    textDecoration: 'none',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderTop: '2px solid transparent',
                    transition: 'background 0.25s, border-color 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = '#111';
                    el.style.borderTopColor = '#FF3B00';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = '#0A0A0A';
                    el.style.borderTopColor = 'transparent';
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#FAFAFA',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      lineHeight: 1.8,
                      color: 'rgba(255,255,255,0.42)',
                      fontWeight: 300,
                      flexGrow: 1,
                    }}
                  >
                    {item.desc}
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#FF3B00',
                    }}
                  >
                    Explorar <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          data-track-section="home_cta"
          style={{
            background: 'linear-gradient(135deg, #FF3B00 0%, #CC2E00 45%, #FF4D00 75%, #E03000 100%)',
            backgroundSize: '300% 300%',
            animation: 'cta-gradient-shift 10s ease infinite',
            paddingBlock: 'clamp(80px, 12vw, 160px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Grain overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.07\'/%3E%3C/svg%3E")',
              backgroundSize: '200px',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
          <div ref={ctaRef} style={{ ...wrap, textAlign: 'center', maxWidth: '760px' }}>
            <Boxes size={26} color="#FFFFFF" style={{ marginInline: 'auto', marginBottom: '18px' }} />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 88px)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.94,
                color: '#FFFFFF',
                marginBottom: '26px',
              }}
            >
              Si tu operación ya es compleja,
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.58)' }}>
                hablemos como producto, no como demo.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 300,
                maxWidth: '520px',
                marginInline: 'auto',
                marginBottom: '36px',
              }}
            >
              Contanos el volumen, las integraciones y los cuellos de botella actuales. Te
              devolvemos una conversación útil y una arquitectura posible.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isSmallViewport ? 'column' : 'row', maxWidth: isSmallViewport ? '360px' : 'none', marginInline: 'auto' }}>
              <button
                onClick={openChatbot}
                data-track-event="cta_click"
                data-track-label="Abrir diagnostico desde home"
                data-track-location="home_cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  background: '#FFFFFF',
                  color: 'var(--color-accent)',
                  border: 'none',
                  padding: '16px 32px',
                  cursor: 'pointer',
                  width: isSmallViewport ? '100%' : 'auto',
                }}
              >
                Solicitar diagnóstico <ArrowRight size={16} strokeWidth={2.2} />
              </button>
              <Link
                to="/solucion"
                data-track-event="cta_click"
                data-track-label="Ir a plataforma desde home"
                data-track-location="home_cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 400,
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.82)',
                  border: '1px solid rgba(255,255,255,0.32)',
                  padding: '15px 32px',
                  textDecoration: 'none',
                  width: isSmallViewport ? '100%' : 'auto',
                }}
              >
                Ver plataforma
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
