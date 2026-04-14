import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { type MetaFunction } from 'react-router';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShoppingBag, Globe, CreditCard, Package, Users, BarChart3,
  Tag, Palette, Shield, Search, ChevronDown, ArrowRight, Check,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StructuredData from '../components/seo/StructuredData';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';
import { breadcrumbJsonLd, buildMeta, faqJsonLd, serviceJsonLd } from '../lib/seo';

gsap.registerPlugin(ScrollTrigger);

/* ─── Datos ──────────────────────────────────────────────────────────── */

const included = [
  {
    Icon: ShoppingBag,
    title: 'Tienda online completa',
    desc: 'Catálogo, carrito, checkout, historial de pedidos y cuenta del cliente. Diseñada para convertir desde el primer día.',
  },
  {
    Icon: Palette,
    title: 'Identidad de marca total',
    desc: 'Colores, tipografías, logo, banners y textos 100% personalizables. Tu marca, no una plantilla genérica.',
  },
  {
    Icon: CreditCard,
    title: 'MercadoPago integrado',
    desc: 'Pagos con tarjeta, QR y transferencia. Cuotas automáticas. Conciliación en el panel de finanzas.',
  },
  {
    Icon: Package,
    title: 'Gestión de inventario',
    desc: 'Stock en tiempo real, alertas de quiebre, historial de movimientos y precios con estructura de costo.',
  },
  {
    Icon: Users,
    title: 'CRM de clientes',
    desc: 'Registro automático al comprar, historial de pedidos, notas internas y segmentación por comportamiento.',
  },
  {
    Icon: BarChart3,
    title: 'Panel de métricas',
    desc: 'Ventas por período, ticket promedio, productos más vendidos y rendimiento por canal en un solo dashboard.',
  },
  {
    Icon: Tag,
    title: 'Ofertas y descuentos',
    desc: 'Precios con oferta, descuentos por categoría, banners de promoción y temporadas. Todo desde el admin.',
  },
  {
    Icon: Search,
    title: 'SEO + dominio propio',
    desc: 'Meta tags editables, URLs amigables, sitemap automático y soporte para dominio personalizado desde el día uno.',
  },
  {
    Icon: Globe,
    title: 'Multicanal sincronizado',
    desc: 'El mismo catálogo para tu tienda, WhatsApp y (opcionalmente) MercadoLibre. Sin duplicar carga de trabajo.',
  },
  {
    Icon: Shield,
    title: 'Seguridad y uptime',
    desc: 'Hosting sobre Firebase con CDN global, SSL incluido y disponibilidad del 99.9%. Sin servers que administrar.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Diagnóstico y arquitectura',
    desc: 'Entendemos tu catálogo, tus clientes y tu forma de vender. Definimos la arquitectura exacta de la tienda antes de escribir una sola línea de código.',
    tag: 'Semana 1',
  },
  {
    num: '02',
    title: 'Construcción y personalización',
    desc: 'Desarrollamos la tienda con tu marca, subimos el catálogo real y configuramos pagos e integraciones. Vos ves el avance en vivo desde el primer día.',
    tag: 'Semanas 2–3',
  },
  {
    num: '03',
    title: 'Lanzamiento y acompañamiento',
    desc: 'Salida a producción con dominio propio, capacitación del equipo en el panel admin y soporte continuo para evolucionar el sistema con el negocio.',
    tag: 'Semana 4 en adelante',
  },
];

const faqs = [
  {
    q: '¿Cuánto tarda en estar lista la tienda?',
    a: 'El tiempo base es 3 a 4 semanas desde el kickoff. Tiendas con catálogos más complejos o integraciones adicionales (MercadoLibre, AFIP) pueden requerir una semana más. Siempre definimos plazos concretos antes de arrancar.',
  },
  {
    q: '¿Necesito un servidor o hosting aparte?',
    a: 'No. El sistema corre sobre Firebase, una infraestructura de Google con CDN global, SSL automático y disponibilidad del 99.9%. No tenés que administrar nada técnico.',
  },
  {
    q: '¿Puedo cargar yo mismo los productos?',
    a: 'Sí. El panel de administración está diseñado para que cualquier persona del equipo pueda cargar, editar y gestionar productos sin conocimientos técnicos. Incluimos capacitación en el lanzamiento.',
  },
  {
    q: '¿MercadoPago es la única opción de pago?',
    a: 'Es la integración nativa incluida. Si necesitás Stripe, Payway u otro procesador, lo evaluamos en el diagnóstico y lo incluimos en el scope del proyecto.',
  },
  {
    q: '¿Qué pasa si quiero agregar funcionalidades después?',
    a: 'El sistema está diseñado para crecer. Podemos agregar módulos como facturación AFIP, sincronización con MercadoLibre, agente de IA o gestión de flota sin tener que rehacer nada desde cero.',
  },
  {
    q: '¿Es un producto genérico o se construye a medida?',
    a: 'Se construye sobre nuestra plataforma probada, pero adaptado a tu operación específica. No usamos plantillas de terceros ni WordPress. El código es nuestro y lo evolucionamos con vos.',
  },
];

/* ─── Componente FAQ Accordion ───────────────────────────────────────── */

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'E-commerce operativo con SEO y dominio propio',
    description:
      'Tienda online operativa con catálogo, checkout, CRM, panel admin, SEO estructurado y dominio propio sobre MotorCloud.',
    path: '/servicios/ecommerce',
    keywords: ['ecommerce operativo', 'seo ecommerce', 'motorcloud ecommerce', 'tienda online b2b', 'dominio propio'],
  });

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="faq-item"
      style={{
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: '24px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(15px, 1.4vw, 18px)',
            fontWeight: 600,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={18} color="var(--color-muted)" strokeWidth={2} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                lineHeight: 1.75,
                color: 'var(--color-muted)',
                fontWeight: 300,
                paddingBottom: '24px',
                maxWidth: '680px',
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */

export default function ServicioEcommerce() {
  const includesRef = useRef<HTMLDivElement>(null);
  const stepsRef    = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const kill: ScrollTrigger[] = [];

    const stagger = (container: HTMLElement | null, selector: string) => {
      if (!container) return;
      const els = container.querySelectorAll(selector);
      const t = gsap.fromTo(els,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.78, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: container, start: 'top 80%' } });
      if (t.scrollTrigger) kill.push(t.scrollTrigger);
    };

    stagger(includesRef.current, '.include-card');
    stagger(stepsRef.current,    '.ec-step');

    return () => kill.forEach(st => st.kill());
  }, [prefersReducedMotion]);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };

  return (
    <PageTransition>
      <StructuredData
        data={serviceJsonLd({
          name: 'E-commerce operativo MotorCloud',
          description:
            'Tienda online operativa con checkout, CRM, panel admin y SEO estructurado sobre MotorCloud.',
          path: '/servicios/ecommerce',
          serviceType: 'E-commerce operativo',
        })}
      />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Servicios', path: '/servicios' },
          { name: 'E-commerce', path: '/servicios/ecommerce' },
        ])}
      />
      <StructuredData
        data={faqJsonLd(
          faqs.map((faq) => ({
            question: faq.q,
            answer: faq.a,
          })),
        )}
      />
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section
          style={{
            paddingTop: 'clamp(120px, 14vw, 200px)',
            paddingBottom: 'clamp(72px, 9vw, 120px)',
            background: 'var(--color-dark)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fondo decorativo */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,59,0,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={wrap}>
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}
            >
              <Link to="/servicios" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                Servicios
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>→</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF3B00' }}>
                E-commerce
              </span>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'end' }}>
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'rgba(255,59,0,0.1)', border: '1px solid rgba(255,59,0,0.2)', marginBottom: '28px' }}>
                  <ShoppingBag size={26} color="#FF3B00" strokeWidth={1.5} />
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(38px, 6vw, 88px)',
                    fontWeight: 900,
                    letterSpacing: '-0.045em',
                    lineHeight: 0.92,
                    color: '#FAFAFA',
                    marginBottom: '28px',
                  }}
                >
                  Tu tienda online,
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.28)' }}>
                    hecha para vender.
                  </em>
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Tienda completa', 'Panel admin', 'MercadoPago', 'SEO incluido'].map(tag => (
                    <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.12)', padding: '5px 12px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(15px, 1.5vw, 18px)',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.42)',
                    fontWeight: 300,
                    marginBottom: '32px',
                  }}
                >
                  No es un template de Tiendanube ni un WordPress con plugins. Es un sistema construido sobre tu operación real, con tu marca, tu catálogo y la forma en que tu negocio vende.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                  data-track-event="cta_click"
                  data-track-label="Hero CTA ecommerce"
                  data-track-location="ecommerce_hero"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: '#FFFFFF', background: '#FF3B00', border: 'none', padding: '16px 28px', cursor: 'pointer', transition: 'background 0.15s', letterSpacing: '-0.01em' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E03000'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FF3B00'; }}
                >
                  Quiero mi tienda →
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── QUÉ INCLUYE ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '16px' }}>
                Qué incluye
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--color-text)', maxWidth: '560px' }}>
                Todo lo que necesitás para vender online
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}> desde el día uno.</em>
              </h2>
            </div>

            <div
              ref={includesRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {included.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="include-card"
                  style={{
                    background: 'var(--color-bg)',
                    padding: isSmallViewport ? '28px 20px' : '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: 'rgba(255,59,0,0.06)', border: '1px solid rgba(255,59,0,0.12)' }}>
                    <Icon size={18} color="#FF3B00" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.72, fontWeight: 300, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CÓMO LO HACEMOS ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', background: 'var(--color-dark)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
                Cómo lo hacemos
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#FAFAFA', maxWidth: '520px' }}>
                De la idea a la tienda
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.28)' }}> en producción.</em>
              </h2>
            </div>

            <div
              ref={stepsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {steps.map((step, idx) => (
                <div
                  key={step.num}
                  className="ec-step"
                  style={{
                    background: '#0A0A0A',
                    padding: isSmallViewport ? '32px 20px' : '40px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                  }}
                >
                  {/* Número big */}
                  <span aria-hidden="true" style={{ position: 'absolute', top: '16px', right: '24px', fontFamily: 'var(--font-display)', fontSize: '80px', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                    {idx + 1}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF3B00', border: '1px solid rgba(255,59,0,0.25)', padding: '4px 10px', alignSelf: 'flex-start' }}>
                    {step.tag}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 1.8vw, 24px)', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.72, fontWeight: 300, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GARANTÍAS RÁPIDAS ── */}
        <section style={{ paddingBlock: 'clamp(40px, 5vw, 64px)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div style={wrap}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isSmallViewport ? '16px' : '0', justifyContent: 'space-between', alignItems: 'center' }}>
              {[
                'Sin costos por mantenimiento mensual obligatorio',
                'Panel admin sin necesidad de conocimientos técnicos',
                'Código propio — no dependés de plataformas externas',
                'Soporte post-lanzamiento incluido en el precio',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: isSmallViewport ? 'auto' : '1 1 0', minWidth: isSmallViewport ? '100%' : '200px' }}>
                  <Check size={14} color="#FF3B00" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 400, lineHeight: 1.4 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={wrap}>
            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 2fr', gap: 'clamp(40px, 6vw, 96px)', alignItems: 'start' }}>
              <div style={{ position: isSmallViewport ? 'static' : 'sticky', top: '100px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '16px' }}>
                  Preguntas frecuentes
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 2.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--color-text)', marginBottom: '20px' }}>
                  Todo lo que necesitás saber
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7 }}>
                  ¿Quedó alguna duda? Escribinos y te respondemos en el día.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-accent)', background: 'none', border: '1px solid rgba(255,59,0,0.3)', padding: '10px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF3B00'; e.currentTarget.style.background = 'rgba(255,59,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,59,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Hacer una pregunta →
                </button>
              </div>

              <div>
                {faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ paddingBlock: 'clamp(80px, 12vw, 160px)', background: 'var(--color-accent)' }}>
          <div style={{ ...wrap, textAlign: 'center', maxWidth: '720px' }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 88px)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92, color: '#FFFFFF', marginBottom: '28px' }}>
                Tu tienda,
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>lista en 4 semanas.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.68, color: 'rgba(255,255,255,0.6)', fontWeight: 300, marginBottom: '44px', maxWidth: '460px', marginInline: 'auto' }}>
                Contanos tu negocio. En 24 horas te enviamos una propuesta con alcance, tecnología y precio exacto.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isSmallViewport ? 'column' : 'row', maxWidth: isSmallViewport ? '360px' : 'none', marginInline: 'auto' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                  data-track-event="cta_click"
                  data-track-label="Quiero mi tienda CTA final"
                  data-track-location="ecommerce_cta"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: 'var(--color-accent)', background: '#FFFFFF', border: 'none', padding: '16px 32px', cursor: 'pointer', transition: 'background 0.15s, transform 0.15s', width: isSmallViewport ? '100%' : 'auto', letterSpacing: '-0.01em' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F5F0E8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Quiero mi tienda online
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
                <Link
                  to="/contacto"
                  data-track-event="cta_click"
                  data-track-label="Contacto desde ecommerce"
                  data-track-location="ecommerce_cta"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '15px 32px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s', width: isSmallViewport ? '100%' : 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  Prefiero escribir primero
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
