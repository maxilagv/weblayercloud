import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Database, Infinity, LayoutDashboard, Store, Users, X, Zap } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Hero from '../components/Hero';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

gsap.registerPlugin(ScrollTrigger);

/* ── UPDATE: reemplazá con tus números reales ── */
const impactStats = [
  { num: '12+',  lbl: 'sistemas entregados' },
  { num: '6',    lbl: 'industrias donde operamos' },
  { num: '100%', lbl: 'en producción' },
];

const services = [
  'Sistemas operativos a medida',
  'Integración de canales de venta',
  'Automatización de procesos internos',
  'Inteligencia comercial',
  'Plataformas de gestión (ERP)',
];

const processSteps = [
  { num: '01', title: 'Diagnóstico',  desc: 'Entendemos tu operación, identificamos dónde se pierde tiempo, dinero y control.' },
  { num: '02', title: 'Arquitectura', desc: 'Diseñamos la solución técnica exacta para tu negocio. Sin plantillas genéricas.' },
  { num: '03', title: 'Construcción', desc: 'Desarrollamos en iteraciones cortas con entregas visibles desde la primera semana.' },
  { num: '04', title: 'Operación',    desc: 'El sistema crece con vos. Acompañamos la evolución del negocio a largo plazo.' },
];

const industries = [
  { id: 'gomeria',   tag: '01', title: 'Gomería',               desc: 'Control de stock de neumáticos y llantas, órdenes de trabajo, historial por vehículo, caja diaria y WhatsApp automático al cliente.' },
  { id: 'logistica', tag: '02', title: 'Logística',             desc: 'Gestión de rutas, zonas, entregas y flota. Trazabilidad en tiempo real desde el pedido hasta la entrega al cliente final.' },
  { id: 'retail',    tag: '03', title: 'Retail',                desc: 'Catálogo unificado, stock en tiempo real, canales de venta sincronizados (local, web, marketplace) y métricas comerciales.' },
  { id: 'servicios', tag: '04', title: 'Servicios\nProfesionales', desc: 'CRM, agenda, presupuestos, facturación y seguimiento de cada cliente en un solo sistema sin planillas ni chats dispersos.' },
];

const beforeAfterRows = [
  { before: 'Pedidos que llegan por WhatsApp y se pierden', after: 'Sistema que captura cada pedido automáticamente' },
  { before: 'Stock en una planilla que nadie actualiza a tiempo', after: 'Stock en tiempo real, visible desde el celular' },
  { before: 'El historial del cliente lo sabe un solo empleado', after: 'Toda la operación documentada y accesible para el equipo' },
  { before: '5 apps distintas que no se hablan entre sí', after: 'Una sola plataforma donde todo está conectado' },
  { before: 'Decisiones tomadas "a ojo" sin datos reales', after: 'Ventas, costos y márgenes en tiempo real para decidir' },
];

const testimonials = [
  {
    name: 'Marcos Silveira',
    role: 'Dueño',
    company: 'Neumáticos Sur',
    industry: 'Gomería · Buenos Aires',
    quote: 'Antes tardábamos 40 minutos en atender cada turno. Entre buscar el historial, chequear el stock y armar la orden. Ahora tardamos 8 minutos y el cliente se va con el comprobante en WhatsApp.',
    metric: '-80% tiempo de atención',
  },
  {
    name: 'Carolina Díaz',
    role: 'Responsable de operaciones',
    company: 'MoveLog',
    industry: 'Logística · Córdoba',
    quote: 'Teníamos un Excel para la flota, otro para los pedidos y el WhatsApp para coordinar choferes. Todo desincronizado. Ahora el sistema lo conecta solo y los errores bajaron a cero.',
    metric: '0 pedidos extraviados en 6 meses',
  },
  {
    name: 'Rodrigo Menéndez',
    role: 'Socio',
    company: 'Ferretería Progreso',
    industry: 'Retail · Rosario',
    quote: 'Cuando empezamos a vender por web nos dimos cuenta que nuestro sistema de stock no aguantaba. LayerCloud lo resolvió en 3 semanas y ya no perdemos ventas por error de inventario.',
    metric: '+40% facturación primer trimestre',
  },
];

const integrations = [
  'WhatsApp API', 'MercadoPago', 'AFIP / Facturación', 'Tiendanube',
  'Shopify', 'Mercado Libre', 'Google Analytics', 'Firebase',
];

const demoFeatures = [
  { Icon: Store,           title: 'Tienda online completa',    desc: 'Catálogo, carrito, checkout y panel admin en un solo sistema listo para vender.' },
  { Icon: LayoutDashboard, title: '20+ módulos operativos',    desc: 'Productos, pedidos, clientes, finanzas, empleados, ofertas y mucho más.' },
  { Icon: Users,           title: 'Roles y equipos',           desc: 'Permisos por módulo. Tu equipo accede solo a lo que necesita.' },
  { Icon: Database,        title: 'Tus datos desde el día uno', desc: 'Cargás tu catálogo real. Sin información de ejemplo ni restricciones.' },
  { Icon: Zap,             title: 'Integraciones incluidas',   desc: 'MercadoPago, AFIP, WhatsApp API y más desde el mismo sistema.' },
  { Icon: Infinity,        title: 'Sin límites de crecimiento', desc: 'El sistema escala con tu operación. Sin cambiar de plan ni perder datos.' },
];

const howItWorks = [
  { num: '01', title: 'Registrás tu negocio',         desc: 'Nombre, rubro y datos básicos. En 2 minutos tenés tu demo activa.',            tag: '2 min'    },
  { num: '02', title: 'Personalizás tu tienda',        desc: 'Colores, tipografía, textos, logo y catálogo. Todo desde el panel de admin.',   tag: '30 min'   },
  { num: '03', title: 'Lo compartís con tus clientes', desc: 'Un link directo y un código QR. Tus clientes entran, navegan y compran.',       tag: '1 min'    },
  { num: '04', title: 'Convertís cuando lo decidís',   desc: 'Si querés el sistema completo lo activamos sin perder ningún dato.',            tag: 'Tu ritmo' },
];

function openChatbot() {
  window.dispatchEvent(new CustomEvent('layercloud:open-chat'));
}

/* ── Calculadora de fricción ── */
function Calculator({ isSmallViewport }: { isSmallViewport: boolean }) {
  const [horas, setHoras]     = useState(10);
  const [pedidos, setPedidos] = useState(5);
  const [empleados, setEmp]   = useState(3);

  const horasMes    = Math.round(horas * 4.3);
  /* Costo conservador: $15 USD/h por empleado + $50 USD por pedido perdido */
  const costoUSD    = Math.round(horasMes * empleados * 15 + pedidos * 50);
  const diasEquiv   = Math.round(horasMes * empleados / 8);

  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--color-text)',
    fontWeight: 500,
    display: 'block',
    marginBottom: '4px',
  };
  const valueStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--color-accent)',
    letterSpacing: '0.06em',
  };

  return (
    <div className="calc-widget">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
          gap: '32px',
          marginBottom: '8px',
        }}
      >
        {/* Slider 1 */}
        <div>
          <label style={labelStyle}>Horas semanales en tareas manuales</label>
          <span style={valueStyle}>{horas} horas / semana</span>
          <input
            type="range" min={2} max={60} step={1}
            value={horas}
            onChange={(e) => setHoras(Number(e.target.value))}
            className="calc-slider"
            aria-label="Horas semanales"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>2h</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>60h</span>
          </div>
        </div>

        {/* Slider 2 */}
        <div>
          <label style={labelStyle}>Pedidos o ventas perdidas por mes</label>
          <span style={valueStyle}>{pedidos} pedidos / mes</span>
          <input
            type="range" min={0} max={50} step={1}
            value={pedidos}
            onChange={(e) => setPedidos(Number(e.target.value))}
            className="calc-slider"
            aria-label="Pedidos perdidos por mes"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>0</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>50</span>
          </div>
        </div>

        {/* Slider 3 */}
        <div>
          <label style={labelStyle}>Personas en el equipo operativo</label>
          <span style={valueStyle}>{empleados} personas</span>
          <input
            type="range" min={1} max={20} step={1}
            value={empleados}
            onChange={(e) => setEmp(Number(e.target.value))}
            className="calc-slider"
            aria-label="Personas en el equipo"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>1</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)' }}>20</span>
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div className="calc-result">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
            gap: isSmallViewport ? '24px' : '0',
            marginBottom: '28px',
          }}
        >
          {[
            { lbl: 'Horas perdidas / mes',  val: `${horasMes * empleados}h`, note: 'en tareas manuales' },
            { lbl: 'Equivalente en días',    val: `${diasEquiv} días`,        note: 'de trabajo no productivo' },
            { lbl: 'Costo estimado',         val: `~USD ${costoUSD.toLocaleString()}`, note: 'por mes de fricción operativa' },
          ].map((item) => (
            <div
              key={item.lbl}
              style={{
                paddingInline: isSmallViewport ? '0' : '28px',
                borderLeft: isSmallViewport ? 'none' : '1px solid rgba(255,255,255,0.07)',
                ...(isSmallViewport ? {} : { ':first-child': { borderLeft: 'none' } }),
              }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
                {item.lbl}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', lineHeight: 1, marginBottom: '4px' }}>
                {item.val}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                {item.note}
              </p>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: '420px', lineHeight: 1.6 }}>
            Este costo desaparece con un sistema que automatiza, registra y conecta. Sin aumentar personal.
          </p>
          <button
            onClick={openChatbot}
            data-track-event="cta_click"
            data-track-label="Calculadora CTA"
            data-track-location="home_calculator"
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
              background: '#FF3B00', color: '#FFFFFF', border: 'none', cursor: 'pointer',
              padding: '14px 28px', transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#E03000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#FF3B00'; }}
          >
            Veamos cómo recuperarlos →
          </button>
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-muted)', marginTop: '12px', letterSpacing: '0.08em' }}>
        * Estimación conservadora basada en USD 15/h de costo operativo y USD 50 por pedido no capturado.
      </p>
    </div>
  );
}

export default function Home() {
  const impactRef  = useRef<HTMLDivElement>(null);
  const whatRef    = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const indRef     = useRef<HTMLDivElement>(null);
  const baRef      = useRef<HTMLDivElement>(null);
  const testiRef   = useRef<HTMLDivElement>(null);
  const demoRef    = useRef<HTMLDivElement>(null);
  const howRef     = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const kill: ScrollTrigger[] = [];

    const stagger = (container: HTMLElement | null, selector: string, start = 'top 82%') => {
      if (!container) return;
      const els = container.querySelectorAll(selector);
      const t = gsap.fromTo(
        els,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.72, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: container, start } },
      );
      if (t.scrollTrigger) kill.push(t.scrollTrigger);
    };

    stagger(impactRef.current,  '.impact-stat');
    stagger(whatRef.current,    '.what-reveal');
    stagger(processRef.current, '.proc-step');
    stagger(indRef.current,     '.industry-card');
    stagger(baRef.current,      '.ba-item');
    stagger(testiRef.current,   '.testi-card');
    stagger(demoRef.current,    '.demo-feat-card');
    stagger(howRef.current,     '.how-step');

    if (ctaRef.current) {
      const t = gsap.fromTo(ctaRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' } });
      if (t.scrollTrigger) kill.push(t.scrollTrigger);
    }

    return () => kill.forEach((st) => st.kill());
  }, [prefersReducedMotion, isSmallViewport]);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };

  const sec: CSSProperties = {
    borderBottom: '1px solid var(--color-border)',
    paddingBlock: 'clamp(72px, 9vw, 120px)',
  };

  return (
    <PageTransition>
      <div style={{ background: 'var(--color-bg)' }}>

        {/* ── HERO ── */}
        <Hero />

        {/* ── MARQUEE ── */}
        <div aria-hidden="true" style={{ borderBottom: '1px solid var(--color-border)', overflow: 'hidden', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <div className="marquee-track">
              {[
                'ERP operativo', 'Automatización comercial', 'Stock · Pedidos · Clientes',
                'Arquitectura de escala', 'Inteligencia de datos', 'Canales sincronizados',
                'Software a medida', 'Buenos Aires · Argentina',
                'ERP operativo', 'Automatización comercial', 'Stock · Pedidos · Clientes',
                'Arquitectura de escala', 'Inteligencia de datos', 'Canales sincronizados',
                'Software a medida', 'Buenos Aires · Argentina',
              ].map((item, i) => (
                <span key={i} className="marquee-item">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── IMPACTO ── */}
        <section data-track-section="home_impact" style={{ background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)' }}>
          <div style={wrap}>
            <div ref={impactRef} className="impact-grid">
              {impactStats.map((stat) => (
                <div key={stat.lbl} className="impact-stat">
                  <span className="impact-num">{stat.num}</span>
                  <span className="impact-lbl">{stat.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ANTES / DESPUÉS ── */}
        <section data-track-section="home_before_after" style={sec}>
          <div style={wrap}>
            <div style={{ marginBottom: '40px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>El antes y el después</p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 3.2vw, 44px)',
                  fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1,
                  color: 'var(--color-text)',
                }}
              >
                ¿Te suena familiar
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}> alguno de estos?</em>
              </h2>
            </div>

            <div ref={baRef} className="ba-grid" style={{ border: '1px solid var(--color-border)' }}>
              {/* Encabezados */}
              <div className="ba-col ba-col-before">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '20px' }}>
                  Sin sistema — hoy
                </p>
                {beforeAfterRows.map((row) => (
                  <div key={row.before} className="ba-item ba-item-before">
                    <X size={15} strokeWidth={2.5} style={{ color: 'var(--color-muted)', flexShrink: 0, marginTop: '1px' }} />
                    {row.before}
                  </div>
                ))}
              </div>
              <div className="ba-col ba-col-after">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '20px' }}>
                  Con LayerCloud
                </p>
                {beforeAfterRows.map((row) => (
                  <div key={row.after} className="ba-item ba-item-after">
                    <Check size={15} strokeWidth={2.5} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '1px' }} />
                    {row.after}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── QUÉ HACEMOS ── */}
        <section ref={whatRef} data-track-section="home_what" style={{ borderBottom: '1px solid var(--color-border)', paddingBlock: 'clamp(80px, 10vw, 140px)' }}>
          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr', gap: 'clamp(48px, 6vw, 96px)', alignItems: 'start' }}>
            <div>
              <p className="eyebrow what-reveal" style={{ marginBottom: '28px' }}>Lo que hacemos</p>
              <h2 className="what-reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 3.8vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.02, color: 'var(--color-text)', marginBottom: '28px' }}>
                No somos una<br />
                agencia de{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)', display: 'block' }}>
                  páginas web.
                </em>
              </h2>
              <p className="what-reveal" style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', lineHeight: 1.75, color: 'var(--color-muted)', fontWeight: 300, maxWidth: '440px' }}>
                Construimos la infraestructura operativa que permite a una empresa vender más, atender mejor y crecer sin que todo dependa de una planilla, un chat suelto o de una sola persona que tiene todo en la cabeza.
              </p>
            </div>
            <div>
              <p className="eyebrow what-reveal" style={{ marginBottom: '4px' }}>Servicios</p>
              <div>
                {services.map((svc, i) => (
                  <div key={svc} className="service-item what-reveal">
                    <span className="service-num">0{i + 1}</span>
                    <span className="service-name">{svc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROCESO ── */}
        <section data-track-section="home_process" style={{ background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)', paddingBlock: 'clamp(64px, 9vw, 120px)' }}>
          <div style={wrap}>
            <p className="eyebrow-accent" style={{ marginBottom: '48px' }}>Cómo trabajamos</p>
          </div>
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '4px' }}>
            <style>{`.proc-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div ref={processRef} className="proc-scroll" style={{ display: 'flex', gap: 0, minWidth: isSmallViewport ? 'auto' : 'max-content', paddingInline: 'clamp(20px, 6vw, 80px)', maxWidth: isSmallViewport ? 'none' : undefined, flexDirection: isSmallViewport ? 'column' : 'row' }}>
              {processSteps.map((step, idx) => (
                <div key={step.num} className="proc-step" style={{ width: isSmallViewport ? '100%' : '320px', flexShrink: 0, padding: isSmallViewport ? '28px 0' : '0 48px 0 0', borderRight: isSmallViewport ? 'none' : idx < processSteps.length - 1 ? '1px solid var(--color-dark-border)' : 'none', borderBottom: isSmallViewport ? (idx < processSteps.length - 1 ? '1px solid var(--color-dark-border)' : 'none') : 'none', marginLeft: isSmallViewport ? 0 : idx > 0 ? '48px' : 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: isSmallViewport ? '56px' : '80px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'rgba(255,255,255,0.07)', marginBottom: isSmallViewport ? '8px' : '16px', userSelect: 'none' }}>
                    {step.num}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2vw, 28px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '14px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.68, color: 'rgba(255,255,255,0.38)', fontWeight: 300, maxWidth: '260px' }}>
                    {step.desc}
                  </p>
                  {!isSmallViewport && idx < processSteps.length - 1 && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'rgba(255,255,255,0.15)', marginTop: '28px', letterSpacing: '-0.05em' }}>→</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INDUSTRIAS ── */}
        <section data-track-section="home_industries" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div style={wrap}>
            <div style={{ paddingBlock: 'clamp(60px, 8vw, 96px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: '12px' }}>Casos e industrias</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 44px)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  Donde ya operamos
                </h2>
              </div>
              <Link to="/solucion" className="btn-ghost" data-track-event="cta_click" data-track-label="Ver arquitectura completa" data-track-location="industries" style={{ fontSize: '14px', marginBottom: '2px' }}>
                Ver arquitectura →
              </Link>
            </div>
          </div>
          <div ref={indRef} className="industry-grid">
            {industries.map((ind) => (
              <div key={ind.id} className="industry-card">
                <span className="industry-card-num">{ind.tag}</span>
                <h3 className="industry-card-title" style={{ whiteSpace: 'pre-line' }}>{ind.title}</h3>
                <p className="industry-card-desc">{ind.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DEMO EN VIVO ── */}
        <section data-track-section="home_demo" style={{ background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)', paddingBlock: 'clamp(72px, 9vw, 120px)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '52px' }}>
              <p className="eyebrow-accent" style={{ marginBottom: '16px' }}>Demo en vivo</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.8vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#FAFAFA', maxWidth: 560 }}>
                  Probalo antes
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>de decidir.</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '380px', lineHeight: 1.7, fontWeight: 300 }}>
                  Una demo completa con tu marca, tu catálogo y tu tienda. Todo personalizable en minutos.
                </p>
              </div>
            </div>

            <div ref={demoRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2px', marginBottom: '48px' }}>
              {demoFeatures.map(({ Icon, title, desc }) => (
                <div key={title} className="demo-feat-card" style={{ padding: '28px 28px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,0,0.1)', border: '1px solid rgba(255,59,0,0.15)' }}>
                    <Icon size={20} color="#FF3B00" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Gratis · 7 días · Sin tarjeta
              </p>
              <Link
                to="/registro"
                className="btn-primary-accent"
                data-track-event="cta_click"
                data-track-label="Activar demo desde sección demo"
                data-track-location="home_demo"
              >
                Activar mi demo gratis&nbsp;→
              </Link>
            </div>
          </div>
        </section>

        {/* ── LO QUE LA DEMO NO MUESTRA ── */}
        <section data-track-section="home_hidden" style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBlock: 'clamp(72px, 9vw, 120px)', position: 'relative', overflow: 'hidden' }}>
          {/* Ruido de fondo sutil */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,59,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={wrap}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ width: 6, height: 6, background: '#FF3B00', borderRadius: '50%' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                La demo muestra el 10% del sistema
              </p>
            </div>

            {/* Headline */}
            <div style={{ maxWidth: '680px', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 58px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#FAFAFA', marginBottom: '20px' }}>
                Lo que estás viendo<br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>es el punto de partida.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 1.5vw, 17px)', lineHeight: 1.75, color: 'rgba(255,255,255,0.42)', fontWeight: 300, maxWidth: '520px' }}>
                La demo básica muestra la estructura. El sistema real incluye todo lo que hace que un negocio funcione sin fricción, a escala y con inteligencia operativa.
              </p>
            </div>

            {/* Grid de features ocultas */}
            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '56px' }}>
              {[
                {
                  tag: 'IA',
                  title: 'Agente de IA 24/7',
                  desc: 'Atiende consultas, genera presupuestos, clasifica pedidos y aprende de tu operación. Sin intervención humana.',
                  accent: '#FF3B00',
                },
                {
                  tag: 'Marketplace',
                  title: 'MercadoLibre sincronizado',
                  desc: 'Publicaciones, stock y precios actualizados en tiempo real. Vendés en ML sin salir del sistema.',
                  accent: '#FFE600',
                },
                {
                  tag: 'Facturación',
                  title: 'ARCA / AFIP integrado',
                  desc: 'Facturas A, B y C generadas automáticamente al confirmar un pedido. Sin apps externas.',
                  accent: '#00D4AA',
                },
                {
                  tag: 'Pagos',
                  title: 'MercadoPago nativo',
                  desc: 'Checkout con QR, links de pago, cuotas y conciliación automática en el panel de finanzas.',
                  accent: '#00BCFF',
                },
                {
                  tag: 'Comisiones',
                  title: 'Motor de comisiones',
                  desc: 'Calculá comisiones por vendedor, producto o canal. Liquidación automática con cierre de período.',
                  accent: '#A78BFA',
                },
                {
                  tag: 'Logística',
                  title: 'Multidepósito y flota',
                  desc: 'Stock distribuido en múltiples sucursales, rutas de reparto y trazabilidad hasta la entrega final.',
                  accent: '#34D399',
                },
                {
                  tag: 'WhatsApp',
                  title: 'WhatsApp API empresarial',
                  desc: 'Notificaciones automáticas de estado, recordatorios de turno y campañas segmentadas desde el CRM.',
                  accent: '#25D366',
                },
                {
                  tag: 'Roles',
                  title: 'Control de accesos granular',
                  desc: 'Cada empleado ve solo lo que necesita. Gerente, vendedor, depositario, fletero y más roles configurables.',
                  accent: '#F59E0B',
                },
                {
                  tag: 'Reportes',
                  title: 'Inteligencia comercial',
                  desc: 'Márgenes por producto, ranking de clientes, proyecciones de stock y cierres mensuales automáticos.',
                  accent: '#FF3B00',
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  style={{
                    background: '#0D0D0D',
                    padding: isSmallViewport ? '28px 20px' : '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0D0D0D'; }}
                >
                  <span style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: feat.accent, border: `1px solid ${feat.accent}30`, padding: '3px 8px', alignSelf: 'flex-start', background: `${feat.accent}0A` }}>
                    {feat.tag}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.32)', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(255,255,255,0.35)', fontWeight: 300, maxWidth: '440px', lineHeight: 1.65 }}>
                El sistema completo se construye sobre tu operación real.<br />La demo es solo la puerta de entrada.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  to="/servicios"
                  data-track-event="cta_click"
                  data-track-label="Ver servicios desde hidden features"
                  data-track-location="home_hidden"
                  style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#FF3B00', border: '1px solid rgba(255,59,0,0.35)', padding: '13px 24px', textDecoration: 'none', transition: 'border-color 0.15s, background 0.15s', letterSpacing: '-0.01em' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF3B00'; e.currentTarget.style.background = 'rgba(255,59,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,59,0,0.35)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Ver servicios completos →
                </Link>
                <Link
                  to="/registro"
                  className="btn-primary-accent"
                  data-track-event="cta_click"
                  data-track-label="Activar demo desde hidden features"
                  data-track-location="home_hidden"
                >
                  Activar demo gratis →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALCULADORA DE FRICCIÓN ── */}
        <section data-track-section="home_calculator" style={sec}>
          <div style={wrap}>
            <div style={{ marginBottom: '40px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>Calculadora de fricción</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--color-text)' }}>
                  ¿Cuánto perdés por mes
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>sin un sistema?</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', fontWeight: 300, maxWidth: '340px', lineHeight: 1.6 }}>
                  Mové los controles y mirá el impacto real en tu operación.
                </p>
              </div>
            </div>
            <Calculator isSmallViewport={isSmallViewport} />
          </div>
        </section>

        {/* ── TESTIMONIOS ── */}
        <section data-track-section="home_testimonials" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', paddingBlock: 'clamp(72px, 9vw, 120px)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: '12px' }}>Lo que dicen los que ya operan</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)' }}>
                  Resultados concretos,
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>negocios reales.</em>
                </h2>
              </div>
            </div>

            <div ref={testiRef} className="testi-grid">
              {testimonials.map((t) => (
                <div key={t.name} className="testi-card">
                  {/* Métrica destacada */}
                  <span className="testi-metric">{t.metric}</span>

                  {/* Quote */}
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.72, color: 'var(--color-text)', fontStyle: 'italic', fontWeight: 300, flexGrow: 1 }}>
                    "{t.quote}"
                  </p>

                  {/* Autor */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: '2px' }}>
                      {t.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 300 }}>
                      {t.role} — {t.company}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,59,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                      {t.industry}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTEGRACIONES ── */}
        <section data-track-section="home_integrations" style={{ background: 'var(--color-dark)', borderBottom: '1px solid var(--color-dark-border)', paddingBlock: 'clamp(36px, 5vw, 56px)' }}>
          <div style={wrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>
                Integramos con
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {integrations.map((item) => (
                  <span key={item} className="int-tag" style={{ color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section data-track-section="home_how" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', paddingBlock: 'clamp(72px, 9vw, 120px)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '52px' }}>
              <p className="eyebrow" style={{ marginBottom: '12px' }}>¿Cómo funciona?</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--color-text)' }}>
                De cero a tienda activa
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}> en una tarde.</em>
              </h2>
            </div>
            <div ref={howRef} style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--color-border)' }}>
              {howItWorks.map((step, idx) => (
                <div
                  key={step.num}
                  className="how-step"
                  style={{
                    padding: 'clamp(24px, 3vw, 36px)',
                    borderRight: !isSmallViewport && idx < howItWorks.length - 1 ? '1px solid var(--color-border)' : 'none',
                    borderBottom: isSmallViewport && idx < howItWorks.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--color-border)', lineHeight: 1, userSelect: 'none' }}>
                      {step.num}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', border: '1px solid rgba(255,59,0,0.3)', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                      {step.tag}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section data-track-section="home_cta" style={{ background: 'var(--color-accent)', paddingBlock: 'clamp(80px, 12vw, 160px)' }}>
          <div ref={ctaRef} style={{ ...wrap, textAlign: 'center', maxWidth: '760px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 88px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#FFFFFF', marginBottom: '32px' }}>
              ¿Cuánto te cuesta
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>no tener</em>{' '}
              un sistema?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', fontWeight: 300, marginBottom: '44px', maxWidth: '480px', marginInline: 'auto' }}>
              Contanos tu negocio en 5 minutos y te devolvemos un diagnóstico gratuito de qué se puede automatizar y cuánto impacto genera.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isSmallViewport ? 'column' : 'row', maxWidth: isSmallViewport ? '360px' : 'none', marginInline: 'auto' }}>
              <button
                onClick={openChatbot}
                data-track-event="cta_click"
                data-track-label="Abrir chatbot desde CTA"
                data-track-location="home_cta"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', background: '#FFFFFF', color: 'var(--color-accent)', border: 'none', padding: '16px 32px', cursor: 'pointer', transition: 'background 0.15s, transform 0.15s', width: isSmallViewport ? '100%' : 'auto' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F0E8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Hacé el diagnóstico gratis&nbsp;→
              </button>
              <Link
                to="/contacto"
                data-track-event="cta_click"
                data-track-label="Ir a contacto desde CTA"
                data-track-location="home_cta"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 400, background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '15px 32px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s', width: isSmallViewport ? '100%' : 'auto' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                Prefiero escribir primero
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
