import { useEffect, useRef, type CSSProperties } from 'react';
import { Link, type MetaFunction } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, Zap, Users, TrendingUp, BarChart3,
  ShieldCheck, Cable, Database, Layers3, GitBranch, LineChart,
  Cpu, Globe2, CheckCircle,
} from 'lucide-react';
import AnimatedShaderHero from '../components/ui/animated-shader-hero';
import { Carousel, TestimonialCard } from '../components/ui/retro-testimonial';
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
    title: 'LayerCloud — Software a Medida para Empresas que Crecen',
    description:
      'Construimos software personalizado que automatiza procesos, organiza tu equipo y hace crecer tu negocio. Casos de éxito en retail, distribución, alimentación y e-commerce.',
    path: '/',
    keywords: [
      'software a medida',
      'desarrollo de software personalizado Argentina',
      'automatización de procesos empresariales',
      'sistemas de gestión para empresas',
      'software para dueños de empresas',
      'LayerCloud',
      'ERP personalizado',
      'automatización empresarial',
      'software para pymes Argentina',
    ],
  });

// ── DATA ─────────────────────────────────────────────────────────

const impactStats = [
  { num: '5+',   lbl: 'empresas activas' },
  { num: '100%', lbl: 'software personalizado' },
  { num: '3×',   lbl: 'crecimiento en ventas' },
  { num: '24/7', lbl: 'soporte continuo' },
] as const;

const painPoints = [
  {
    icon: '📊',
    title: 'Planillas que no escalan',
    desc: 'El Excel que funcionaba con 10 clientes explota con 100. Los datos no se sincronizan y el equipo trabaja siempre sobre información desactualizada.',
  },
  {
    icon: '⏱',
    title: 'Procesos manuales que frenan',
    desc: 'Tareas repetitivas que consumen horas de tu equipo cada semana. Tiempo que podría ir al negocio, no a cargar datos en pantallas.',
  },
  {
    icon: '🔌',
    title: 'Sistemas que no se hablan',
    desc: 'Tu stock en un sistema, tus ventas en otro, tu contabilidad en otro. Nada conectado y siempre hay que hacer todo dos veces.',
  },
  {
    icon: '👀',
    title: 'Sin visibilidad real',
    desc: 'Tomar decisiones sin datos en tiempo real es apostar. No sabés cuánto vendiste hoy, cuánto stock tenés ni qué cliente está en riesgo.',
  },
] as const;

const automationBenefits = [
  {
    Icon: Zap,
    title: 'Velocidad ×10',
    desc: 'Las tareas que le tomaban horas a tu equipo, el sistema las hace en segundos. Facturas, reportes, notificaciones, actualizaciones de stock — todo automático.',
    stat: '10×',
    statLabel: 'más rápido',
  },
  {
    Icon: ShieldCheck,
    title: 'Cero errores humanos',
    desc: 'Cuando el sistema hace el trabajo, los errores de tipeo, los olvidos y las inconsistencias desaparecen. El dato que entra es el dato que sale.',
    stat: '99%',
    statLabel: 'precisión',
  },
  {
    Icon: TrendingUp,
    title: 'Escala sin fricciones',
    desc: 'Con 100 clientes o con 10.000, tu sistema trabaja igual. No necesitás contratar más administrativos para procesar más órdenes.',
    stat: '∞',
    statLabel: 'escalabilidad',
  },
  {
    Icon: BarChart3,
    title: 'Decisiones con datos',
    desc: 'Dashboards en tiempo real, alertas automáticas, reportes cuando los necesitás. Sabés exactamente qué está pasando en tu negocio, siempre.',
    stat: '24/7',
    statLabel: 'visibilidad',
  },
] as const;

const testimonials = [
  {
    name: 'EnSintonia',
    designation: 'Entretenimiento & Media',
    description:
      'Automatizamos toda la gestión de agenda y reservas. Lo que antes nos tomaba horas de planillas, ahora el sistema lo hace solo. La experiencia de nuestros clientes cambió completamente.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'Electrohogar',
    designation: 'Retail de Electrodomésticos',
    description:
      'Unificamos ventas, inventario y facturación en un solo sistema. Pasamos de no saber el stock real a tener visibilidad completa en tiempo real. El equipo trabaja con datos, no con suposiciones.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'AlimentosCanapa',
    designation: 'Industria Alimentaria',
    description:
      'Conectamos producción, logística y distribución en tiempo real. La trazabilidad completa nos permitió reducir tiempos de entrega y responder a la demanda de manera proactiva.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
  },
  {
    name: 'NexaStore',
    designation: 'E-commerce & Retail Online',
    description:
      'Una tienda lista para escalar desde el día uno. Stock, pagos y fulfillment integrados sin necesidad de cambiar de plataforma cuando empezamos a crecer. Exactamente lo que necesitábamos.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
  },
] as const;

const teamDisciplines = [
  {
    Icon: Cpu,
    title: 'Ingeniería de Software',
    desc: 'Arquitectura limpia, código que escala y sistemas que duran. No parches, no deuda técnica acumulada.',
    tag: 'Core',
  },
  {
    Icon: Globe2,
    title: 'Informática & Redes',
    desc: 'Infraestructura segura, redes optimizadas y servidores que no se caen cuando más los necesitás.',
    tag: 'Infraestructura',
  },
  {
    Icon: Zap,
    title: 'Robótica & Automatización',
    desc: 'Automatizaciones avanzadas que van más allá del software: conectamos el mundo físico con el digital.',
    tag: 'Innovación',
  },
  {
    Icon: Users,
    title: 'Ingeniería Social',
    desc: 'Entendemos los procesos humanos antes de automatizarlos. Tecnología que la gente realmente usa y adopta.',
    tag: 'Estrategia',
  },
] as const;

const platformServices = [
  {
    Icon: Layers3,
    title: 'Software a medida',
    desc: 'Tu sistema, diseñado desde cero para tu negocio. No templates, no soluciones genéricas, no límites de terceros.',
  },
  {
    Icon: GitBranch,
    title: 'Automatizaciones',
    desc: 'Procesos que corren solos: notificaciones, reportes, facturación, sincronización de datos entre sistemas.',
  },
  {
    Icon: Database,
    title: 'Gestión de datos',
    desc: 'Base de datos unificada que conecta todos tus sistemas y te da visibilidad en tiempo real sobre tu operación.',
  },
  {
    Icon: Cable,
    title: 'Integraciones',
    desc: 'Conectamos tu sistema con Mercado Libre, WhatsApp, AFIP, facturación electrónica, marketplaces y más.',
  },
  {
    Icon: ShieldCheck,
    title: 'Seguridad & Roles',
    desc: 'Control total sobre quién ve qué. Permisos por área, logs de actividad y backup automático incluidos.',
  },
  {
    Icon: LineChart,
    title: 'Analytics & Reportes',
    desc: 'Dashboards en tiempo real con los indicadores clave para tu negocio. Todo en un lugar, siempre disponible.',
  },
] as const;

function openChatbot() {
  window.dispatchEvent(new CustomEvent('layercloud:open-chat'));
}

// ── COMPONENT ────────────────────────────────────────────────────

export default function Home() {
  const statsRef    = useRef<HTMLDivElement>(null);
  const problemRef  = useRef<HTMLElement>(null);
  const autoRef     = useRef<HTMLElement>(null);
  const casesRef    = useRef<HTMLElement>(null);
  const teamRef     = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const triggers: ScrollTrigger[] = [];

    // Stagger cards up + scale
    const stagger = (
      container: HTMLElement | null,
      selector: string,
      from: gsap.TweenVars = { y: 36, opacity: 0, scale: 0.96 },
      start = 'top 82%',
    ) => {
      if (!container) return;
      const items = container.querySelectorAll(selector);
      if (!items.length) return;
      const tween = gsap.fromTo(items, from, {
        y: 0, opacity: 1, scale: 1,
        duration: 0.72, stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'scale,transform',
        scrollTrigger: { trigger: container, start },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    };

    // Clip-path wipe reveal for section headings
    const revealHeading = (container: HTMLElement | null) => {
      if (!container) return;
      const heading = container.querySelector<HTMLElement>('.section-reveal-heading');
      if (!heading) return;
      const tween = gsap.fromTo(
        heading,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)', opacity: 1,
          duration: 1.1, ease: 'power4.out',
          clearProps: 'clipPath,opacity',
          scrollTrigger: { trigger: container, start: 'top 82%' },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    };

    // Eyebrow slide-in
    const revealEyebrow = (container: HTMLElement | null) => {
      if (!container) return;
      const el = container.querySelector<HTMLElement>('.section-eyebrow-anim');
      if (!el) return;
      const tween = gsap.fromTo(
        el,
        { x: -20, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: container, start: 'top 85%' },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    };

    // Animated counters in stats bar
    if (statsRef.current) {
      const numEls = statsRef.current.querySelectorAll<HTMLElement>('.stat-num-animate');
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
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        });
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });
      stagger(statsRef.current, '.stat-card', { y: 24, opacity: 0 });
    }

    stagger(problemRef.current, '.problem-card');
    stagger(autoRef.current, '.auto-card', { y: 40, opacity: 0, scale: 0.94 });
    // casesRef: carousel handles its own animations via motion/react
    stagger(teamRef.current, '.team-card', { y: 32, opacity: 0 });
    stagger(servicesRef.current, '.service-card');

    revealHeading(problemRef.current);
    revealHeading(autoRef.current);
    revealHeading(casesRef.current);
    revealHeading(teamRef.current);
    revealHeading(servicesRef.current);

    revealEyebrow(problemRef.current);
    revealEyebrow(autoRef.current);
    revealEyebrow(casesRef.current);
    revealEyebrow(teamRef.current);
    revealEyebrow(servicesRef.current);

    // Sub-paragraphs in each section
    [problemRef, autoRef, casesRef, teamRef, servicesRef].forEach((ref) => {
      if (!ref.current) return;
      const sub = ref.current.querySelector<HTMLElement>('.section-sub-anim');
      if (!sub) return;
      const tween = gsap.fromTo(
        sub,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8, delay: 0.35, ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 82%' },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    if (ctaRef.current) {
      const tween = gsap.fromTo(
        ctaRef.current,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    return () => triggers.forEach((t) => t.kill());
  }, [prefersReducedMotion]);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };
  const section: CSSProperties = {
    paddingBlock: 'clamp(80px, 10vw, 130px)',
    borderBottom: '1px solid var(--color-border)',
  };

  const homeJsonLd = [
    websiteJsonLd(),
    organizationJsonLd(),
    softwareApplicationJsonLd({
      name: 'LayerCloud',
      description:
        'Software a medida que automatiza procesos, ordena la operación y hace crecer tu empresa. Casos de éxito en retail, distribución, alimentación y e-commerce.',
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

        {/* ── HERO ── */}
        <AnimatedShaderHero
          trustBadge={{
            text: "Software que hace crecer empresas reales en Argentina.",
            icons: ["⚡"],
          }}
          headline={{
            line1: "Tu empresa,",
            line2: "automatizada.",
          }}
          subtitle="Construimos software que organiza tu operación, elimina el trabajo manual y te da visibilidad en tiempo real sobre tu negocio. Sin planillas, sin procesos lentos, sin límites."
          buttons={{
            primary: {
              text: "Hablemos de tu proyecto",
              onClick: openChatbot,
            },
            secondary: {
              text: "Ver soluciones",
              onClick: () => { window.location.href = '/servicios'; },
            },
          }}
        />

        {/* ── STATS BAR ── */}
        <section
          data-track-section="home_stats"
          style={{ background: 'var(--color-dark)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(255,59,0,0.05) 0%, transparent 50%, rgba(255,59,0,0.03) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div
              ref={statsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {impactStats.map((item) => {
                const isNumeric = /^\d/.test(item.num);
                const numericVal = parseInt(item.num.replace(/\D.*/, ''), 10);
                const suffix = isNumeric ? item.num.replace(/^\d+/, '') : '';
                return (
                  <div
                    key={item.lbl}
                    className="stat-card"
                    style={{
                      background: '#0A0A0A',
                      padding: isSmallViewport ? '28px 20px' : '40px 32px',
                      transition: 'background 0.25s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#111'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#0A0A0A'; }}
                  >
                    <p
                      className={isNumeric ? 'stat-num-animate' : undefined}
                      data-target={isNumeric ? numericVal : undefined}
                      data-suffix={isNumeric ? suffix : undefined}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 3.5vw, 54px)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: '#FF3B00',
                        marginBottom: '10px',
                        lineHeight: 1,
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

        {/* ── PROBLEM ── */}
        <section
          ref={problemRef}
          data-track-section="home_problem"
          style={{ ...section, position: 'relative', overflow: 'hidden' }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '52px', maxWidth: '600px' }}>
              <p className="eyebrow section-eyebrow-anim" style={{ marginBottom: '16px' }}>
                El problema
              </p>
              <h2
                className="section-reveal-heading"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4.2vw, 58px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: 'var(--color-text)',
                  marginBottom: '18px',
                  willChange: 'clip-path, opacity',
                }}
              >
                ¿Tu negocio todavía corre<br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-accent)' }}>
                  en planillas y procesos manuales?
                </em>
              </h2>
              <p
                className="section-sub-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.78,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                }}
              >
                Cada hora que tu equipo pasa cargando datos es una hora que no está vendiendo,
                atendiendo clientes ni haciendo crecer el negocio. Hay una mejor manera.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(2, 1fr)',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {painPoints.map((point) => (
                <div
                  key={point.title}
                  className="problem-card"
                  style={{
                    background: 'var(--color-surface)',
                    padding: isSmallViewport ? '26px 22px' : '34px 30px',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--color-bg)';
                    el.style.boxShadow = 'inset 0 -3px 0 var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--color-surface)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '30px', marginBottom: '18px', lineHeight: 1 }}>
                    {point.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'var(--color-text)',
                      marginBottom: '12px',
                    }}
                  >
                    {point.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      lineHeight: 1.78,
                      color: 'var(--color-muted)',
                      fontWeight: 300,
                    }}
                  >
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUTOMATIONS ── */}
        <section
          ref={autoRef}
          data-track-section="home_automations"
          style={{
            ...section,
            background: 'var(--color-dark)',
            borderBottom: '1px solid var(--color-dark-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Noise texture */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
              backgroundSize: '180px',
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          />
          {/* Glow orb */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '700px', height: '700px',
              background: 'radial-gradient(circle, rgba(255,59,0,0.08) 0%, transparent 65%)',
              top: '-200px', right: '-150px',
              pointerEvents: 'none',
              animation: 'orb-drift 14s ease-in-out infinite',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '56px', maxWidth: '700px' }}>
              <p className="eyebrow-accent section-eyebrow-anim" style={{ marginBottom: '16px' }}>
                Automatizaciones
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
                  marginBottom: '18px',
                  willChange: 'clip-path, opacity',
                }}
              >
                La automatización no es<br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#FF3B00' }}>
                  el futuro. Es el presente.
                </em>
              </h2>
              <p
                className="section-sub-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.78,
                  color: 'rgba(255,255,255,0.48)',
                  fontWeight: 300,
                }}
              >
                Tus competidores ya están automatizando. Cada proceso manual que todavía corrés a
                mano es una ventaja que le estás regalando a quien sí lo automatizó.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(2, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {automationBenefits.map(({ Icon, title, desc, stat, statLabel }) => (
                <div
                  key={title}
                  className="auto-card"
                  style={{
                    background: '#0A0A0A',
                    padding: isSmallViewport ? '28px 22px' : '38px 34px',
                    transition: 'background 0.25s, box-shadow 0.25s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
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
                      marginBottom: '22px',
                    }}
                  >
                    <Icon size={20} color="#FF3B00" strokeWidth={2} />
                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(28px, 3vw, 46px)',
                          fontWeight: 900,
                          letterSpacing: '-0.04em',
                          color: '#FF3B00',
                          lineHeight: 1,
                        }}
                      >
                        {stat}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.3)',
                          marginTop: '4px',
                        }}
                      >
                        {statLabel}
                      </p>
                    </div>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
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
                      lineHeight: 1.78,
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

        {/* ── SUCCESS CASES ── */}
        <section
          ref={casesRef}
          data-track-section="home_cases"
          style={{ ...section, position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '56px', maxWidth: '680px' }}>
              <p className="eyebrow section-eyebrow-anim" style={{ marginBottom: '16px' }}>
                Casos de éxito
              </p>
              <h2
                className="section-reveal-heading"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(30px, 4.2vw, 58px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: 'var(--color-text)',
                  marginBottom: '18px',
                  willChange: 'clip-path, opacity',
                }}
              >
                Empresas reales.
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>
                  Resultados reales.
                </em>
              </h2>
              <p
                className="section-sub-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.78,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                }}
              >
                Trabajamos con empresas de distintas industrias que tenían un problema en común:
                sus sistemas no alcanzaban para lo que querían lograr.
              </p>
            </div>
            <Carousel
              items={testimonials.map((t, index) => (
                <TestimonialCard
                  key={t.name}
                  testimonial={t}
                  index={index}
                  backgroundImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                />
              ))}
            />
          </div>
        </section>

        {/* ── WHY US / TEAM ── */}
        <section
          ref={teamRef}
          data-track-section="home_team"
          style={{
            ...section,
            background: 'var(--color-dark)',
            borderBottom: '1px solid var(--color-dark-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '900px', height: '900px',
              background: 'radial-gradient(circle, rgba(255,59,0,0.05) 0%, transparent 65%)',
              bottom: '-350px', left: '-250px',
              pointerEvents: 'none',
              animation: 'orb-drift 18s ease-in-out infinite reverse',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '56px', maxWidth: '780px' }}>
              <p className="eyebrow-accent section-eyebrow-anim" style={{ marginBottom: '16px' }}>
                Por qué elegirnos
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
                No somos una agencia.
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.42)' }}>
                  Somos ingenieros que entienden tu negocio.
                </em>
              </h2>
              <p
                className="section-sub-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  lineHeight: 1.78,
                  color: 'rgba(255,255,255,0.48)',
                  fontWeight: 300,
                  maxWidth: '640px',
                }}
              >
                A diferencia de la mayoría, nuestro equipo combina ingeniería de software,
                informática, robótica e ingeniería social. Eso nos permite ver el problema completo,
                no solo la parte técnica.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(4, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {teamDisciplines.map(({ Icon, title, desc, tag }) => (
                <div
                  key={title}
                  className="team-card"
                  style={{
                    background: '#0A0A0A',
                    padding: isSmallViewport ? '28px 22px' : '34px 28px',
                    transition: 'background 0.25s, border-top-color 0.25s',
                    borderTop: '2px solid transparent',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '#111';
                    el.style.borderTopColor = '#FF3B00';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = '#0A0A0A';
                    el.style.borderTopColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '22px',
                    }}
                  >
                    <Icon size={20} color="#FF3B00" strokeWidth={2} />
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
                      fontSize: '19px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#FAFAFA',
                      marginBottom: '12px',
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      lineHeight: 1.78,
                      color: 'rgba(255,255,255,0.4)',
                      fontWeight: 300,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
            {/* Differentiator callout */}
            <div
              style={{
                marginTop: '2px',
                padding: isSmallViewport ? '24px 22px' : '34px 38px',
                background: 'rgba(255,59,0,0.06)',
                border: '1px solid rgba(255,59,0,0.16)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexDirection: isSmallViewport ? 'column' : 'row',
              }}
            >
              <CheckCircle size={22} color="#FF3B00" strokeWidth={2} style={{ flexShrink: 0 }} />
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.68,
                  color: 'rgba(255,255,255,0.68)',
                  fontWeight: 300,
                }}
              >
                <strong style={{ color: '#FAFAFA', fontWeight: 600 }}>Lo que nos distingue:</strong>{' '}
                Mientras otros entregan el software y desaparecen, nosotros somos el equipo técnico
                de tu empresa. Evolucionamos el sistema junto con tu negocio, sin costos ocultos ni
                dependencias forzadas.
              </p>
            </div>
          </div>
        </section>

        {/* ── PLATFORM SERVICES ── */}
        <section
          ref={servicesRef}
          data-track-section="home_services"
          style={{ ...section, background: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
          />
          <div style={{ ...wrap, position: 'relative' }}>
            <div style={{ marginBottom: '52px', maxWidth: '680px' }}>
              <p className="eyebrow section-eyebrow-anim" style={{ marginBottom: '16px' }}>
                Qué construimos
              </p>
              <h2
                className="section-reveal-heading"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.8vw, 54px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.06,
                  color: 'var(--color-text)',
                  marginBottom: '16px',
                  willChange: 'clip-path, opacity',
                }}
              >
                Cada solución,
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>
                  diseñada para tu operación.
                </em>
              </h2>
              <p
                className="section-sub-anim"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                  maxWidth: '560px',
                }}
              >
                No vendemos licencias ni templates. Construimos desde cero el sistema que tu
                empresa necesita para operar, escalar y ganar en su mercado.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {platformServices.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="service-card"
                  style={{
                    background: 'var(--color-bg)',
                    padding: isSmallViewport ? '26px 22px' : '32px 28px',
                    minHeight: '200px',
                    transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)';
                    const svg = el.querySelector('svg') as SVGElement | null;
                    if (svg) svg.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                    const svg = el.querySelector('svg') as SVGElement | null;
                    if (svg) svg.style.transform = 'scale(1)';
                  }}
                >
                  <Icon
                    size={18}
                    color="#FF3B00"
                    strokeWidth={2.2}
                    style={{ marginBottom: '18px', transition: 'transform 0.3s ease' }}
                  />
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
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

        {/* ── CTA ── */}
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
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.07\'/%3E%3C/svg%3E")',
              backgroundSize: '200px',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
          <div ref={ctaRef} style={{ ...wrap, textAlign: 'center', maxWidth: '780px' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '22px',
              }}
            >
              ● Ingenieros disponibles ahora
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 88px)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.94,
                color: '#FFFFFF',
                marginBottom: '28px',
              }}
            >
              Tu negocio merece
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.55)' }}>
                un sistema que trabaje por vos.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                lineHeight: 1.72,
                color: 'rgba(255,255,255,0.68)',
                fontWeight: 300,
                maxWidth: '520px',
                marginInline: 'auto',
                marginBottom: '42px',
              }}
            >
              Contanos tu desafío y en 48 horas te devolvemos una propuesta concreta, con
              tecnología y costos claros. Sin compromiso.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                flexDirection: isSmallViewport ? 'column' : 'row',
                maxWidth: isSmallViewport ? '360px' : 'none',
                marginInline: 'auto',
              }}
            >
              <button
                onClick={openChatbot}
                data-track-event="cta_click"
                data-track-label="Hablar con nosotros desde home"
                data-track-location="home_cta"
                className="cta-btn-main"
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
                  padding: '16px 36px',
                  cursor: 'pointer',
                  width: isSmallViewport ? '100%' : 'auto',
                  transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(-3px)';
                  el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.24)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}
              >
                Hablar con nosotros <ArrowRight size={16} strokeWidth={2.2} />
              </button>
              <Link
                to="/contacto"
                data-track-event="cta_click"
                data-track-label="Ver contacto desde home"
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
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '15px 36px',
                  textDecoration: 'none',
                  width: isSmallViewport ? '100%' : 'auto',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = 'rgba(255,255,255,0.72)';
                  el.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = 'rgba(255,255,255,0.3)';
                  el.style.color = 'rgba(255,255,255,0.8)';
                }}
              >
                Agendar una reunión
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
