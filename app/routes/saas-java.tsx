import { useEffect, useRef, type CSSProperties } from 'react';
import { Link, type MetaFunction } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Layers3, GitBranch, Database, ShieldCheck, Zap, Globe2,
  Cable, Cpu, Clock, CheckCircle, ArrowRight, Lock, BarChart3,
} from 'lucide-react';
import GLSLHero from '../components/GLSLHero';
import PageTransition from '../components/PageTransition';
import StructuredData from '../components/seo/StructuredData';
import { breadcrumbJsonLd, buildMeta, softwareApplicationJsonLd } from '../lib/seo';

gsap.registerPlugin(ScrollTrigger);

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'MotorCloud Enterprise — La plataforma SaaS B2B en Java | Próximamente',
    description:
      'MotorCloud Enterprise es la plataforma SaaS empresarial construida en Java que va a redefinir la operación de medianas y grandes empresas en Argentina. Arquitectura de microservicios, multi-tenant, integración nativa con ecosistemas empresariales. Próximamente.',
    path: '/saas-java',
    keywords: [
      'saas empresarial argentina',
      'plataforma b2b java',
      'software erp cloud argentina',
      'motorcloud enterprise',
      'sistema gestion empresarial saas',
      'layercloud saas',
    ],
  });

const capabilities = [
  {
    Icon: Layers3,
    title: 'Arquitectura multi-tenant real',
    desc: 'Cada empresa opera en su propio entorno aislado con configuración, datos y workflows completamente independientes. Sin contaminación entre clientes, sin compromisos en seguridad.',
    tag: 'Infraestructura',
  },
  {
    Icon: GitBranch,
    title: 'Microservicios coordinados',
    desc: 'Catálogo, pricing, órdenes, facturación, usuarios y reportes como dominios separados que se coordinan sin crear dependencias rígidas. Cada módulo evoluciona sin romper los demás.',
    tag: 'Arquitectura',
  },
  {
    Icon: Database,
    title: 'Datos en tiempo real',
    desc: 'Dashboards operativos que muestran lo que está pasando ahora mismo en tu empresa. No reportes de ayer. No datos en caché. La operación real, visible en el instante.',
    tag: 'Analytics',
  },
  {
    Icon: Cable,
    title: 'Integraciones empresariales nativas',
    desc: 'AFIP, MercadoPago, MercadoLibre, WhatsApp Business, correo, transportistas y cualquier API de tu ecosistema. La plataforma habla el idioma de tu operación, no al revés.',
    tag: 'Integraciones',
  },
  {
    Icon: ShieldCheck,
    title: 'Seguridad y roles granulares',
    desc: 'Permisos por área, por acción y por dato. Cada empleado ve exactamente lo que necesita ver. Logs de auditoría completos, encriptación en reposo y en tránsito.',
    tag: 'Seguridad',
  },
  {
    Icon: Cpu,
    title: 'IA operativa integrada',
    desc: 'Predicción de demanda, detección de anomalías, sugerencias de reorden automático y alertas inteligentes. No IA de marketing — IA que hace cosas reales en tu operación.',
    tag: 'Inteligencia',
  },
] as const;

const javaAdvantages = [
  {
    title: 'Reglas de negocio que no colapsan',
    desc: 'En una plataforma B2B real, la lógica de pricing, permisos, estados y consistencia entre servicios es lo que más importa. Java tiene el ecosistema maduro para mantener esas capas sin que exploten con el tiempo.',
  },
  {
    title: 'Un equipo que trabaja por módulos, no por hacks',
    desc: 'Cuando el producto escala, la disciplina técnica deja de ser opcional. Java favorece contratos claros entre módulos, testing real y refactors que no rompen todo. Eso se traduce en menos bugs en producción.',
  },
  {
    title: 'Observabilidad desde el día uno',
    desc: 'Tracing distribuido, métricas de performance y logs estructurados integrados desde el principio, no como afterthought. Saber exactamente qué pasó y cuándo es tan importante como que funcione.',
  },
  {
    title: 'Integraciones enterprise sin compromisos',
    desc: 'Conectar sistemas empresariales complejos — ERPs, facturadores, marketplaces, bancos — requiere herramientas que manejen estados, reintentos y consistencia eventual de verdad. El ecosistema Java tiene eso resuelto.',
  },
] as const;

const timeline = [
  {
    phase: '01',
    label: 'Arquitectura base',
    desc: 'Núcleo multi-tenant, autenticación, microservicios de catálogo y órdenes.',
    status: 'active',
  },
  {
    phase: '02',
    label: 'Módulos operativos',
    desc: 'Inventario avanzado, facturación AFIP, integraciones de pago y logística.',
    status: 'building',
  },
  {
    phase: '03',
    label: 'Analytics e IA',
    desc: 'Dashboards en tiempo real, predicciones y alertas operativas inteligentes.',
    status: 'upcoming',
  },
  {
    phase: '04',
    label: 'Beta cerrada',
    desc: 'Primeras empresas piloto con acceso completo y soporte dedicado de ingeniería.',
    status: 'upcoming',
  },
] as const;

const guarantees = [
  'Migración de datos incluida desde tu sistema actual',
  'Onboarding personalizado con tu equipo operativo',
  'SLA de disponibilidad 99.9% desde el primer día',
  'Soporte de ingeniería directo — sin call centers, sin tickets que se pierden',
  'Código propio — no dependés de licencias ni de actualizaciones forzadas de terceros',
  'Actualizaciones continuas sin downtime ni ventanas de mantenimiento molestas',
] as const;

function openChatbot() {
  window.dispatchEvent(new CustomEvent('layercloud:open-chat'));
}

export default function SaasJavaRoute() {
  const heroRef     = useRef<HTMLDivElement>(null);
  const capRef      = useRef<HTMLElement>(null);
  const javaRef     = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    const stagger = (container: HTMLElement | null, selector: string) => {
      if (!container) return;
      const items = container.querySelectorAll(selector);
      if (!items.length) return;
      const t = gsap.fromTo(
        items,
        { y: 36, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.72, stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'scale,transform',
          scrollTrigger: { trigger: container, start: 'top 82%' },
        },
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    };

    const revealHeading = (container: HTMLElement | null) => {
      if (!container) return;
      const heading = container.querySelector<HTMLElement>('.section-reveal-heading');
      if (!heading) return;
      const t = gsap.fromTo(
        heading,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)', opacity: 1,
          duration: 1.1, ease: 'power4.out',
          clearProps: 'clipPath,opacity',
          scrollTrigger: { trigger: container, start: 'top 82%' },
        },
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    };

    stagger(capRef.current, '.cap-card');
    stagger(javaRef.current, '.java-card');
    stagger(timelineRef.current, '.tl-card');
    revealHeading(capRef.current);
    revealHeading(javaRef.current);
    revealHeading(timelineRef.current);

    if (ctaRef.current) {
      const t = gsap.fromTo(
        ctaRef.current,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        },
      );
      if (t.scrollTrigger) triggers.push(t.scrollTrigger);
    }

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-anim'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.2 },
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, []);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };

  return (
    <PageTransition>
      <StructuredData data={softwareApplicationJsonLd({
        name: 'MotorCloud Enterprise',
        description: 'Plataforma SaaS empresarial en Java con arquitectura de microservicios, multi-tenant e integraciones nativas para el mercado argentino.',
        path: '/saas-java',
      })} />
      <StructuredData data={breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'MotorCloud Enterprise', path: '/saas-java' },
      ])} />

      <div style={{ background: 'var(--color-dark)' }}>
        <GLSLHero
          eyebrow="SaaS en Java"
          accent="MotorCloud Enterprise"
          title="para operar en serio"
          description="La plataforma B2B que estamos construyendo sobre Java, microservicios, multi-tenant real e integraciones locales para empresas que necesitan escala sin improvisar."
          trackSection="saas_hero"
        />

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          style={{
            display: 'none',
            minHeight: '100svh',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Background grid */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(10,10,10,0.05) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
              maskImage: 'linear-gradient(135deg, transparent 0%, black 30%, black 72%, transparent 100%)',
            }}
          />
          {/* Glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(125deg, transparent 0%, rgba(255,59,0,0.08) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ ...wrap, position: 'relative', paddingBlock: 'clamp(100px, 14vw, 180px)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'clamp(36px, 6vw, 84px)',
                alignItems: 'center',
              }}
            >
              <div style={{ maxWidth: '780px' }}>
              {/* Badge */}
              <div
                className="hero-anim"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,59,0,0.08)',
                  border: '1px solid rgba(255,59,0,0.18)',
                  padding: '8px 18px',
                  borderRadius: '100px',
                  marginBottom: '36px',
                }}
              >
                <span
                  style={{
                    width: '8px', height: '8px',
                    background: '#FF3B00',
                    borderRadius: '50%',
                    animation: 'blink 1.5s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#FF3B00',
                  }}
                >
                  En construccion - Proximamente
                </span>
              </div>

              <h1
                className="hero-anim"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(38px, 6vw, 88px)',
                  fontWeight: 900,
                  letterSpacing: 0,
                  lineHeight: 0.98,
                  color: 'var(--color-text)',
                  marginBottom: '28px',
                }}
              >
                MotorCloud Enterprise
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#FF3B00' }}>
                  SaaS en Java
                </em>
                <br />
                para operar en serio.
              </h1>

              <p
                className="hero-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  lineHeight: 1.75,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                  maxWidth: '680px',
                  marginBottom: '48px',
                }}
              >
                Una plataforma B2B en construccion para empresas que necesitan multi-tenant real,
                microservicios, integraciones locales y una capa operativa que no dependa de parches
                ni de ERPs genericos.
              </p>

              <div
                className="hero-anim"
                style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
              >
                <button
                  onClick={openChatbot}
                  className="btn-primary-accent"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  Sumate a la lista de espera
                  <ArrowRight size={16} />
                </button>
                <Link to="/servicios" className="btn-ghost">
                  Ver soluciones actuales
                </Link>
              </div>

              <p
                className="hero-anim"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-muted)',
                  marginTop: '28px',
                  textTransform: 'uppercase',
                }}
              >
                Beta cerrada - acceso por invitacion unicamente
              </p>
              </div>

              <div
                className="hero-anim"
                aria-label="Mapa visual de la plataforma MotorCloud Enterprise"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '420px',
                  border: '1px solid rgba(30, 42, 56, 0.96)',
                  background: 'linear-gradient(180deg, rgba(16,21,28,0.98) 0%, rgba(8,10,13,1) 100%)',
                  padding: 'clamp(22px, 4vw, 34px)',
                  boxShadow: '0 24px 70px rgba(10,10,10,0.24)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: '10px' }}>
                        Enterprise OS
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, lineHeight: 1.02, color: '#FAFAFA' }}>
                        Modulos aislados.
                        <br />
                        Operacion conectada.
                      </p>
                    </div>
                    <div style={{ border: '1px solid rgba(255,59,0,0.24)', background: 'rgba(255,59,0,0.08)', padding: '12px 14px', minWidth: '96px' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.42)', marginBottom: '6px' }}>
                        MODE
                      </p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#FF3B00' }}>
                        BETA
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '12px', marginBottom: '22px' }}>
                    {[
                      { code: '01', label: 'Tenant core', desc: 'Datos, roles y configuracion aislada por empresa.' },
                      { code: '02', label: 'Domain services', desc: 'Catalogo, ordenes, pagos, stock y CRM por contrato.' },
                      { code: '03', label: 'Operational AI', desc: 'Alertas, predicciones y seguimiento sobre eventos reales.' },
                    ].map((item) => (
                      <div
                        key={item.code}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '42px 1fr',
                          gap: '14px',
                          alignItems: 'start',
                          border: '1px solid rgba(30,42,56,0.86)',
                          background: 'rgba(255,255,255,0.025)',
                          padding: '14px 16px',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: '#FF3B00' }}>
                          {item.code}
                        </span>
                        <span>
                          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#FAFAFA', marginBottom: '4px' }}>
                            {item.label}
                          </span>
                          <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.44)', fontWeight: 300 }}>
                            {item.desc}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                    {[
                      { label: 'Java', value: 'Core' },
                      { label: 'SLA', value: '99.9' },
                      { label: 'Tenants', value: 'N' },
                    ].map((item) => (
                      <div key={item.label} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginBottom: '6px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#FAFAFA' }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT'S COMING ── */}
        <section
          ref={capRef}
          data-track-section="saas_capabilities"
          style={{
            paddingBlock: 'clamp(80px, 10vw, 130px)',
            borderBottom: '1px solid var(--color-dark-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '700px', height: '700px',
              background: 'radial-gradient(circle, rgba(255,59,0,0.06) 0%, transparent 65%)',
              bottom: '-200px', left: '-150px',
              pointerEvents: 'none',
              animation: 'orb-drift 18s ease-in-out infinite reverse',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '60px', maxWidth: '720px' }}>
              <p
                className="eyebrow-accent"
                style={{ marginBottom: '16px' }}
              >
                Capacidades de la plataforma
              </p>
              <h2
                className="section-reveal-heading"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4.2vw, 58px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: '#FAFAFA',
                  marginBottom: '20px',
                  willChange: 'clip-path, opacity',
                }}
              >
                Todo lo que tu empresa necesita
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#FF3B00' }}>
                  en una sola plataforma.
                </em>
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.78,
                  color: 'rgba(255,255,255,0.48)',
                  fontWeight: 300,
                  maxWidth: '580px',
                }}
              >
                No estamos construyendo otro ERP genérico con módulos que se usan al 10%. Estamos
                construyendo una plataforma operativa que entiende cómo funciona realmente una empresa
                mediana en Argentina y la resuelve de raíz.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {capabilities.map(({ Icon, title, desc, tag }) => (
                <div
                  key={title}
                  className="cap-card"
                  style={{
                    background: '#0A0A0A',
                    padding: 'clamp(28px, 3vw, 44px)',
                    transition: 'background 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '#0E0E0E';
                    el.style.boxShadow = 'inset 0 0 0 1px rgba(255,59,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '#0A0A0A';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px',
                    }}
                  >
                    <Icon size={22} color="#FF3B00" strokeWidth={1.5} />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#FF3B00',
                        background: 'rgba(255,59,0,0.1)',
                        border: '1px solid rgba(255,59,0,0.22)',
                        padding: '4px 9px',
                      }}
                    >
                      {tag}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '21px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#FAFAFA',
                      marginBottom: '12px',
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

        {/* ── WHY JAVA ── */}
        <section
          ref={javaRef}
          data-track-section="saas_java"
          style={{
            paddingBlock: 'clamp(80px, 10vw, 130px)',
            borderBottom: '1px solid var(--color-dark-border)',
            background: '#060606',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ ...wrap, position: 'relative' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: 'clamp(48px, 6vw, 100px)',
                alignItems: 'start',
              }}
            >
              {/* Left: heading */}
              <div>
                <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>
                  Decisión técnica
                </p>
                <h2
                  className="section-reveal-heading"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(30px, 4vw, 54px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.04,
                    color: '#FAFAFA',
                    marginBottom: '24px',
                    willChange: 'clip-path, opacity',
                  }}
                >
                  Por qué Java es la base correcta
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>
                    para un SaaS que opera en serio.
                  </em>
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.45)',
                    fontWeight: 300,
                    maxWidth: '460px',
                  }}
                >
                  La decisión no fue usar Java por tradición ni por currículum. Fue porque cuando
                  la plataforma necesita mezclar pricing complejo, permisos granulares, integraciones
                  múltiples y consistencia entre servicios, las opciones que parecen más rápidas
                  terminan siendo las que más deuda generan.
                </p>
                <div
                  style={{
                    marginTop: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    background: 'rgba(255,59,0,0.08)',
                    border: '1px solid rgba(255,59,0,0.2)',
                  }}
                >
                  <Lock size={18} color="#FF3B00" strokeWidth={1.5} />
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: 1.7,
                      color: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    El objetivo es que la plataforma soporte operación real con menos deuda, menos
                    ambigüedad y más control. No menos.
                  </p>
                </div>
              </div>

              {/* Right: advantages */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  background: 'rgba(255,255,255,0.07)',
                }}
              >
                {javaAdvantages.map((item, index) => (
                  <div
                    key={item.title}
                    className="java-card"
                    style={{
                      background: '#0A0A0A',
                      padding: 'clamp(22px, 2.5vw, 32px)',
                      borderLeft: '2px solid transparent',
                      transition: 'border-left-color 0.25s, background 0.25s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderLeftColor = '#FF3B00';
                      el.style.background = '#0E0E0E';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderLeftColor = 'transparent';
                      el.style.background = '#0A0A0A';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.1em',
                          color: '#FF3B00',
                          marginTop: '3px',
                          flexShrink: 0,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: '#FAFAFA',
                            marginBottom: '8px',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            lineHeight: 1.75,
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 300,
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section
          ref={timelineRef}
          data-track-section="saas_timeline"
          style={{
            paddingBlock: 'clamp(80px, 10vw, 130px)',
            borderBottom: '1px solid var(--color-dark-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '600px', height: '600px',
              background: 'radial-gradient(circle, rgba(255,59,0,0.07) 0%, transparent 65%)',
              top: '0', right: '0',
              pointerEvents: 'none',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '60px' }}>
              <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>
                Hoja de ruta
              </p>
              <h2
                className="section-reveal-heading"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4.2vw, 56px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: '#FAFAFA',
                  willChange: 'clip-path, opacity',
                }}
              >
                Estamos construyendo ahora mismo.
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>
                  No es una promesa. Es un proceso.
                </em>
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {timeline.map((item) => (
                <div
                  key={item.phase}
                  className="tl-card"
                  style={{
                    background: '#0A0A0A',
                    padding: 'clamp(24px, 2.8vw, 40px)',
                    borderTop: `2px solid ${
                      item.status === 'active'
                        ? '#FF3B00'
                        : item.status === 'building'
                        ? 'rgba(255,59,0,0.4)'
                        : 'rgba(255,255,255,0.1)'
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '18px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(36px, 4vw, 60px)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color:
                          item.status === 'active'
                            ? '#FF3B00'
                            : item.status === 'building'
                            ? 'rgba(255,59,0,0.4)'
                            : 'rgba(255,255,255,0.08)',
                        lineHeight: 1,
                      }}
                    >
                      {item.phase}
                    </span>
                    {item.status === 'active' && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: '#FF3B00',
                          background: 'rgba(255,59,0,0.1)',
                          border: '1px solid rgba(255,59,0,0.25)',
                          padding: '4px 10px',
                        }}
                      >
                        <span style={{
                          width: '6px', height: '6px',
                          background: '#FF3B00',
                          borderRadius: '50%',
                          animation: 'blink 1.5s ease-in-out infinite',
                        }} />
                        Activo
                      </span>
                    )}
                    {item.status === 'building' && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '4px 10px',
                        }}
                      >
                        Siguiente
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: item.status === 'upcoming' ? 'rgba(255,255,255,0.3)' : '#FAFAFA',
                      marginBottom: '10px',
                    }}
                  >
                    {item.label}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: 1.75,
                      color: item.status === 'upcoming'
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.42)',
                      fontWeight: 300,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GUARANTEES ── */}
        <section
          style={{
            paddingBlock: 'clamp(80px, 10vw, 120px)',
            borderBottom: '1px solid var(--color-dark-border)',
            background: '#060606',
          }}
        >
          <div style={wrap}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: 'clamp(40px, 6vw, 80px)',
                alignItems: 'center',
              }}
            >
              <div>
                <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>
                  Compromisos
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 3.5vw, 50px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.06,
                    color: '#FAFAFA',
                    marginBottom: '20px',
                  }}
                >
                  Cuando entre en beta, esto es lo que podés esperar.
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 300,
                  }}
                >
                  Las empresas piloto que accedan a la beta cerrada no van a ser conejillos de indias.
                  Van a tener el mismo nivel de soporte, estabilidad y atención que cualquier cliente
                  de producción. Eso no es un slogan — es cómo construimos todo lo que salió antes.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {guarantees.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                    }}
                  >
                    <CheckCircle size={16} color="#FF3B00" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.55)',
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          data-track-section="saas_cta"
          style={{
            paddingBlock: 'clamp(90px, 12vw, 150px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,59,0,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div ref={ctaRef} style={{ ...wrap, position: 'relative', textAlign: 'center' }}>
            <p className="eyebrow-accent" style={{ marginBottom: '20px' }}>
              Acceso anticipado
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 5vw, 72px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 0.98,
                color: '#FAFAFA',
                marginBottom: '24px',
              }}
            >
              Querés ser parte de la beta.
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#FF3B00' }}>
                Escribinos antes de que cerremos la lista.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.48)',
                fontWeight: 300,
                maxWidth: '540px',
                marginInline: 'auto',
                marginBottom: '44px',
              }}
            >
              Las empresas piloto tienen acceso completo, soporte directo de ingeniería y la
              posibilidad de moldear el producto desde adentro. No tenemos fecha de lanzamiento público.
              Cuando estemos listos, van a ser los primeros en saber.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={openChatbot}
                className="btn-primary-accent"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Escribinos por WhatsApp
                <ArrowRight size={16} />
              </button>
              <Link to="/servicios" className="btn-ghost-dark">
                Ver soluciones disponibles hoy
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
