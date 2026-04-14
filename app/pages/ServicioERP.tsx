import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { type MetaFunction } from 'react-router';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Building2, ShoppingCart, Package, DollarSign, Users, Truck,
  BarChart3, Zap, MessageSquare, Brain, Globe, Shield, FileText,
  ChevronDown, ArrowRight, Check, Layers, GitBranch, Cpu,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StructuredData from '../components/seo/StructuredData';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';
import { breadcrumbJsonLd, buildMeta, faqJsonLd, serviceJsonLd } from '../lib/seo';

gsap.registerPlugin(ScrollTrigger);

/* ─── Datos: módulos del sistema ─────────────────────────────────────── */

const moduleCategories = [
  {
    id:    'ventas',
    label: 'Ventas & Comercial',
    Icon:  ShoppingCart,
    color: '#FF3B00',
    modules: [
      'Gestión de pedidos web y manual',
      'Cotizaciones y presupuestos',
      'Catálogo multicanal sincronizado',
      'Precios con estructura de costo',
      'Ofertas y descuentos por categoría',
      'Listas de precio por cliente',
      'Canal Tienda online',
      'Canal MercadoLibre',
    ],
  },
  {
    id:    'inventario',
    label: 'Inventario & Logística',
    Icon:  Package,
    color: '#34D399',
    modules: [
      'Stock multidepósito en tiempo real',
      'Historial de movimientos',
      'Alertas de quiebre automáticas',
      'Transferencias entre depósitos',
      'Remitos de entrada y salida',
      'Rutas de reparto optimizadas',
      'Gestión de flota',
      'Trazabilidad hasta entrega final',
    ],
  },
  {
    id:    'finanzas',
    label: 'Finanzas & Facturación',
    Icon:  DollarSign,
    color: '#00D4AA',
    modules: [
      'Caja diaria con arqueo',
      'Facturación electrónica ARCA/AFIP',
      'Facturas A, B y C automáticas',
      'Conciliación MercadoPago',
      'Registro de gastos y proveedores',
      'Cierre mensual automático',
      'Exportación a Excel/PDF',
      'KPIs financieros por período',
    ],
  },
  {
    id:    'crm',
    label: 'CRM & Clientes',
    Icon:  Users,
    color: '#A78BFA',
    modules: [
      'Historial completo por cliente',
      'Segmentación por comportamiento',
      'Ranking de clientes VIP',
      'Motor de comisiones por vendedor',
      'Liquidación automática de comisiones',
      'Clientes con deuda en tiempo real',
      'Fidelización y scoring crediticio',
      'Notas y tags por cliente',
    ],
  },
  {
    id:    'operaciones',
    label: 'Operaciones',
    Icon:  Layers,
    color: '#F59E0B',
    modules: [
      'Órdenes de trabajo completas',
      'Inspecciones con IA (Gemini)',
      'Historial por vehículo / activo',
      'Turnos y agenda de atención',
      'Recibos PDF server-side',
      'Notificaciones automáticas al cerrar',
      'Seguimiento de estado por etapa',
      'Roles: admin / gerente / operario',
    ],
  },
  {
    id:    'integraciones',
    label: 'Integraciones & API',
    Icon:  GitBranch,
    color: '#00BCFF',
    modules: [
      'MercadoLibre OAuth completo',
      'MercadoPago nativo',
      'WhatsApp API empresarial',
      'ARCA / AFIP certificado',
      'Google Analytics',
      'Webhooks personalizados',
      'API REST documentada',
      'Firebase real-time sync',
    ],
  },
];

const industries = [
  {
    tag:   'Gomería',
    title: 'Control total del taller',
    items: ['Órdenes de trabajo', 'Historial por vehículo', 'Stock de neumáticos y llantas', 'WhatsApp al cerrar servicio'],
  },
  {
    tag:   'Retail',
    title: 'Venta unificada',
    items: ['Catálogo local + web + ML', 'Stock multidepósito', 'Facturación automática', 'CRM con historial de compras'],
  },
  {
    tag:   'Logística',
    title: 'De pedido a entrega',
    items: ['Rutas optimizadas', 'Trazabilidad en tiempo real', 'Gestión de flota', 'Remitos digitales'],
  },
  {
    tag:   'Servicios profesionales',
    title: 'Agenda y facturación',
    items: ['Turnos y agenda', 'Presupuestos y contratos', 'Facturación AFIP', 'Reportes por cliente'],
  },
];

const differentials = [
  { Icon: Brain,        label: 'IA generativa integrada',       desc: 'Gemini analiza fotos, genera diagnósticos y propone acciones. No requiere ingeniería de datos.' },
  { Icon: MessageSquare,label: 'WhatsApp como canal nativo',    desc: 'Notificaciones automáticas, campañas segmentadas y atención 24/7 sin apps externas.' },
  { Icon: Globe,        label: 'Multi-canal y multi-depósito',  desc: 'Un solo sistema para tu local, tienda online, MercadoLibre y varios almacenes.' },
  { Icon: Cpu,          label: 'Arquitectura de escala real',   desc: 'Firebase + Node.js optimizado para operaciones de alto volumen. Sin límites de crecimiento.' },
  { Icon: Shield,       label: 'Seguridad y auditoría',         desc: 'Roles granulares, log de acciones por usuario y backup automático de toda la operación.' },
  { Icon: FileText,     label: 'Documentación automática',      desc: 'Facturas, remitos, recibos y reportes generados en PDF server-side sin herramientas externas.' },
];

const faqs = [
  {
    q: '¿Cuánto tiempo lleva implementar el ERP completo?',
    a: 'Depende del alcance y la cantidad de módulos. El núcleo operativo (ventas, stock, finanzas) tarda entre 6 y 10 semanas. Las integraciones avanzadas (MercadoLibre, AFIP, WhatsApp) se agregan en fases adicionales. Siempre definimos plazos concretos antes de arrancar.',
  },
  {
    q: '¿El sistema puede adaptarse a mi rubro específico?',
    a: 'Sí. La plataforma tiene módulos base y módulos especializados por industria. Gomería, logística, retail y servicios profesionales tienen configuraciones preexistentes que se adaptan en días, no semanas.',
  },
  {
    q: '¿Puedo integrar el ERP con mi tienda online existente?',
    a: 'Si tu tienda fue construida sobre MotorCloud, la integración es nativa. Si viene de otra plataforma, evaluamos la API disponible y construimos el conector. En la mayoría de los casos es viable.',
  },
  {
    q: '¿La facturación AFIP está incluida desde el inicio?',
    a: 'El módulo de facturación ARCA/AFIP está disponible desde el día uno. Solo necesitamos tu certificado digital y CUIT. La configuración tarda menos de 24 horas.',
  },
  {
    q: '¿Qué pasa con los datos que tenemos en Excel o en otro sistema?',
    a: 'Hacemos la migración de datos históricos como parte del proyecto. Clientes, productos, precios y movimientos anteriores se importan antes del lanzamiento para que no arranqués desde cero.',
  },
  {
    q: '¿Cuántos usuarios puede tener el sistema?',
    a: 'Sin límite de usuarios. Cada empleado tiene su perfil con los módulos y permisos que corresponden a su rol. No cobramos por seat adicional.',
  },
  {
    q: '¿Qué nivel de soporte incluye después del lanzamiento?',
    a: 'Soporte por WhatsApp y canal dedicado con respuesta en el día. Actualizaciones de seguridad y mejoras de performance incluidas. Las nuevas funcionalidades se cotizan por separado según el alcance.',
  },
];

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'ERP moderno para operaciones B2B',
    description:
      'ERP moderno con módulos comerciales, inventario, finanzas, CRM e integraciones sobre MotorCloud.',
    path: '/servicios/erp',
    keywords: ['erp moderno', 'erp b2b', 'motorcloud erp', 'microservicios erp', 'integraciones empresariales'],
  });

/* ─── Componente FAQ ────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 1.3vw, 17px)', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} style={{ flexShrink: 0 }}>
          <ChevronDown size={18} color="rgba(255,255,255,0.3)" strokeWidth={2} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.78, color: 'rgba(255,255,255,0.38)', fontWeight: 300, paddingBottom: '24px', maxWidth: '680px' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────────────────── */

export default function ServicioERP() {
  const modulesRef  = useRef<HTMLDivElement>(null);
  const diffRef     = useRef<HTMLDivElement>(null);
  const indRef      = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('ventas');
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const kill: ScrollTrigger[] = [];

    const stagger = (ref: HTMLElement | null, sel: string, start = 'top 80%') => {
      if (!ref) return;
      const t = gsap.fromTo(ref.querySelectorAll(sel),
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.78, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: ref, start } });
      if (t.scrollTrigger) kill.push(t.scrollTrigger);
    };

    stagger(diffRef.current,  '.diff-card');
    stagger(indRef.current,   '.ind-card');

    return () => kill.forEach(st => st.kill());
  }, [prefersReducedMotion]);

  const wrap: CSSProperties = {
    maxWidth: '1200px',
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 6vw, 80px)',
  };

  const activeCategory = moduleCategories.find(c => c.id === activeTab)!;

  return (
    <PageTransition>
      <StructuredData
        data={serviceJsonLd({
          name: 'ERP moderno MotorCloud',
          description:
            'ERP moderno con ventas, inventario, finanzas, CRM e integraciones sobre una plataforma SaaS en Java.',
          path: '/servicios/erp',
          serviceType: 'ERP moderno',
        })}
      />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Servicios', path: '/servicios' },
          { name: 'ERP', path: '/servicios/erp' },
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
      <div style={{ background: '#050505', minHeight: '100vh', color: '#FAFAFA' }}>

        {/* ── HERO ── */}
        <section style={{ paddingTop: 'clamp(120px, 14vw, 200px)', paddingBottom: 'clamp(72px, 9vw, 120px)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>

          {/* Grid de ruido decorativo */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 90% 70% at 60% 50%, rgba(255,59,0,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(0,188,255,0.04) 0%, transparent 60%)' }} />

          <div style={wrap}>
            {/* Breadcrumb */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '44px' }}>
              <Link to="/servicios" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
              >
                Servicios
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>→</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF3B00' }}>ERP B2B</span>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'end' }}>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'rgba(255,59,0,0.1)', border: '1px solid rgba(255,59,0,0.2)', marginBottom: '28px' }}>
                  <Building2 size={26} color="#FF3B00" strokeWidth={1.5} />
                </div>

                {/* Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,59,0,0.08)', border: '1px solid rgba(255,59,0,0.2)', padding: '5px 12px', marginBottom: '24px', width: 'fit-content' }}>
                  <div style={{ width: 5, height: 5, background: '#FF3B00', borderRadius: '50%' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF3B00' }}>
                    Producto estrella · 40+ módulos
                  </span>
                </div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 6vw, 88px)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92, color: '#FAFAFA', marginBottom: '0' }}>
                  El sistema
                  <br />
                  operativo de
                  <br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.22)' }}>
                    tu empresa.
                  </em>
                </h1>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.75, color: 'rgba(255,255,255,0.38)', fontWeight: 300, marginBottom: '36px' }}>
                  No es un software genérico adaptado a tu rubro. Es una arquitectura construida sobre tu operación real, con los módulos que necesitás desde el día uno y la capacidad de crecer sin límite.
                </p>

                {/* Stats rápidos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '36px' }}>
                  {[
                    { num: '40+', lbl: 'módulos integrados' },
                    { num: '6',   lbl: 'industrias probadas' },
                    { num: '∞',   lbl: 'usuarios sin costo extra' },
                  ].map(({ num, lbl }) => (
                    <div key={lbl} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px 16px', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FF3B00', lineHeight: 1, marginBottom: '6px' }}>{num}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{lbl}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                    data-track-event="cta_click" data-track-label="Consultar ERP Hero" data-track-location="erp_hero"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', background: '#FF3B00', border: 'none', padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#E03000'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FF3B00'; }}
                  >
                    Consultar disponibilidad <ArrowRight size={14} strokeWidth={2} />
                  </button>
                  <Link to="/solucion"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', padding: '13px 24px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                  >
                    Ver arquitectura →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── MÓDULOS INTERACTIVOS ── */}
        <section ref={modulesRef} style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080808' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '52px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                Arquitectura modular
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#FAFAFA', maxWidth: '560px' }}>
                Todo conectado,
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}> nada duplicado.</em>
              </h2>
            </div>

            {/* Tab selector */}
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', marginBottom: '2px', background: 'rgba(255,255,255,0.04)' }}>
              {moduleCategories.map(cat => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#FAFAFA' : 'rgba(255,255,255,0.35)',
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none', padding: isSmallViewport ? '12px 14px' : '14px 20px',
                      cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                      borderBottom: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                  >
                    <cat.Icon size={14} strokeWidth={2} style={{ color: isActive ? cat.color : 'inherit', flexShrink: 0 }} />
                    {isSmallViewport ? cat.label.split(' ')[0] : cat.label}
                  </button>
                );
              })}
            </div>

            {/* Panel activo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: isSmallViewport ? '28px 20px' : '36px 40px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr', gap: isSmallViewport ? '28px' : '48px', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: `${activeCategory.color}12`, border: `1px solid ${activeCategory.color}28` }}>
                        <activeCategory.Icon size={20} color={activeCategory.color} strokeWidth={1.5} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 1.8vw, 24px)', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.025em', margin: 0 }}>
                        {activeCategory.label}
                      </h3>
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.72, fontWeight: 300 }}>
                      {activeTab === 'ventas' && 'Desde la toma del pedido hasta la factura. Todos los canales sincronizados en tiempo real sin trabajo doble.'}
                      {activeTab === 'inventario' && 'Control de stock en múltiples depósitos con trazabilidad completa. Desde la recepción hasta la entrega al cliente final.'}
                      {activeTab === 'finanzas' && 'Caja, facturación electrónica AFIP, pagos y reportes financieros. Todo automatizado desde la operación diaria.'}
                      {activeTab === 'crm' && 'Cada cliente tiene su historial completo. El sistema calcula comisiones, detecta deudas y rankea a los mejores clientes automáticamente.'}
                      {activeTab === 'operaciones' && 'Las órdenes de trabajo se abren, ejecutan y cierran con notificaciones automáticas. La IA analiza fotos y genera diagnósticos en segundos.'}
                      {activeTab === 'integraciones' && 'El sistema habla con MercadoLibre, AFIP, MercadoPago y WhatsApp sin apps externas. Una sola consola para todo el ecosistema.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {activeCategory.modules.map((mod, idx) => (
                      <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: idx < activeCategory.modules.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <Check size={13} strokeWidth={2.5} style={{ color: activeCategory.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.18)', marginTop: '16px', textAlign: 'right' }}>
              Módulos adicionales disponibles según rubro · Consultanos por el alcance
            </p>
          </div>
        </section>

        {/* ── DIFERENCIADORES TÉCNICOS ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '52px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                Lo que lo hace diferente
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#FAFAFA', maxWidth: '580px' }}>
                Tecnología real,
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}> no buzzwords.</em>
              </h2>
            </div>

            <div ref={diffRef} style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {differentials.map(({ Icon, label, desc }) => (
                <div
                  key={label}
                  className="diff-card"
                  style={{ background: '#050505', padding: isSmallViewport ? '28px 20px' : '36px 32px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#050505'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'rgba(255,59,0,0.07)', border: '1px solid rgba(255,59,0,0.15)' }}>
                    <Icon size={20} color="#FF3B00" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                    {label}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.72, fontWeight: 300, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POR INDUSTRIA ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#080808' }}>
          <div style={wrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '52px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                  Por industria
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#FAFAFA', maxWidth: '500px' }}>
                  Adaptado a tu rubro,
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}> listo para operar.</em>
                </h2>
              </div>
            </div>

            <div ref={indRef} style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(2, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {industries.map((ind, idx) => (
                <div
                  key={ind.tag}
                  className="ind-card"
                  style={{ background: '#080808', padding: isSmallViewport ? '32px 20px' : '40px 36px', transition: 'background 0.2s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#080808'; }}
                >
                  <span aria-hidden="true" style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'var(--font-display)', fontSize: '80px', fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1, userSelect: 'none' }}>0{idx + 1}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: '12px', display: 'block' }}>
                    {ind.tag}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '20px' }}>
                    {ind.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ind.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 4, height: 4, background: 'rgba(255,59,0,0.6)', borderRadius: '50%', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.38)', fontWeight: 400 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESO ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '52px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                Cómo lo implementamos
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.2vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: '#FAFAFA', maxWidth: '520px' }}>
                De la operación actual
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}> al sistema completo.</em>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
              {[
                { num: '01', tag: 'Semana 1',          title: 'Diagnóstico profundo',        desc: 'Mapeamos tu operación completa. Flujos, dolores, integraciones existentes y prioridades del negocio.' },
                { num: '02', tag: 'Semanas 2–4',        title: 'Núcleo operativo',            desc: 'Ventas, stock y finanzas en producción. El equipo empieza a operar desde el sistema real desde el inicio.' },
                { num: '03', tag: 'Semanas 5–8',        title: 'Módulos avanzados',           desc: 'IA, integraciones (ML, AFIP, WhatsApp), comisiones y reportes. Se activan sobre la base que ya funciona.' },
                { num: '04', tag: 'Semana 9 en adelante', title: 'Evolución continua',        desc: 'El sistema crece con el negocio. Nuevos módulos, ajustes operativos y soporte sin costo por ticket.' },
              ].map((step, idx) => (
                <div
                  key={step.num}
                  style={{
                    background: '#050505',
                    padding: isSmallViewport ? '32px 20px' : '40px 28px',
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    position: 'relative',
                  }}
                >
                  <span aria-hidden="true" style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'var(--font-display)', fontSize: '72px', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF3B00', border: '1px solid rgba(255,59,0,0.2)', padding: '4px 10px', alignSelf: 'flex-start' }}>
                    {step.tag}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(17px, 1.5vw, 21px)', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.32)', lineHeight: 1.72, fontWeight: 300, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GARANTÍAS ── */}
        <section style={{ paddingBlock: 'clamp(36px, 5vw, 56px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={wrap}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isSmallViewport ? '16px' : '0', justifyContent: 'space-between', alignItems: 'center' }}>
              {[
                'Migración de datos históricos incluida',
                'Sin límite de usuarios ni costo por seat',
                'Código propio — no dependés de terceros',
                'Soporte por WhatsApp con respuesta en el día',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: isSmallViewport ? 'auto' : '1 1 0', minWidth: isSmallViewport ? '100%' : '200px' }}>
                  <Check size={14} color="#FF3B00" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 400, lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
          <div style={wrap}>
            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 2fr', gap: 'clamp(40px, 6vw, 96px)', alignItems: 'start' }}>
              <div style={{ position: isSmallViewport ? 'static' : 'sticky', top: '100px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '16px' }}>
                  Preguntas frecuentes
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 2.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, color: '#FAFAFA', marginBottom: '20px' }}>
                  Todo lo que necesitás saber
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(255,255,255,0.28)', fontWeight: 300, lineHeight: 1.7 }}>
                  ¿Quedó alguna duda? Escribinos y te respondemos en el día.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: '#FF3B00', background: 'none', border: '1px solid rgba(255,59,0,0.3)', padding: '10px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF3B00'; e.currentTarget.style.background = 'rgba(255,59,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,59,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Hacer una pregunta →
                </button>
              </div>

              <div>
                {faqs.map(faq => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ paddingBlock: 'clamp(80px, 12vw, 160px)', background: '#050505', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,59,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ ...wrap, textAlign: 'center', maxWidth: '760px', position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '24px' }}>
                El siguiente paso
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 88px)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92, color: '#FAFAFA', marginBottom: '28px' }}>
                Contanos tu
                <br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>operación.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.72, color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginBottom: '44px', maxWidth: '480px', marginInline: 'auto' }}>
                En una primera llamada de 30 minutos te mostramos el sistema en vivo, mapeamos tu operación y te enviamos una propuesta con módulos, plazos y precio exacto.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isSmallViewport ? 'column' : 'row', maxWidth: isSmallViewport ? '360px' : 'none', marginInline: 'auto' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                  data-track-event="cta_click" data-track-label="Solicitar diagnostico ERP CTA final" data-track-location="erp_cta"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: '#FFFFFF', background: '#FF3B00', border: 'none', padding: '16px 32px', cursor: 'pointer', transition: 'background 0.15s, transform 0.15s', width: isSmallViewport ? '100%' : 'auto', letterSpacing: '-0.01em' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E03000'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FF3B00'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Solicitar diagnóstico técnico <ArrowRight size={16} strokeWidth={2} />
                </button>
                <Link to="/contacto"
                  data-track-event="cta_click" data-track-label="Contacto desde ERP" data-track-location="erp_cta"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '15px 32px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s', width: isSmallViewport ? '100%' : 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
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
