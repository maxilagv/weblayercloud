import { useEffect, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ShoppingBag, Building2, Zap, Users, BarChart3, Shield } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

gsap.registerPlugin(ScrollTrigger);

const wrap: CSSProperties = {
  maxWidth: '1200px',
  marginInline: 'auto',
  paddingInline: 'clamp(20px, 6vw, 80px)',
};

const ecommerceFeatures = [
  { icon: ShoppingBag,   label: 'Tienda online completa'       },
  { icon: Zap,           label: 'Panel de administración'       },
  { icon: Users,         label: 'Gestión de clientes y pedidos' },
  { icon: BarChart3,     label: 'Métricas en tiempo real'       },
  { icon: Shield,        label: 'MercadoPago integrado'         },
  { icon: Building2,     label: 'SEO + dominio propio'          },
];

const erpFeatures = [
  { icon: Building2,     label: '40+ módulos operativos'        },
  { icon: Zap,           label: 'IA + automatización'           },
  { icon: Users,         label: 'CRM + roles granulares'        },
  { icon: BarChart3,     label: 'Reportes e inteligencia'       },
  { icon: Shield,        label: 'AFIP + MercadoLibre'           },
  { icon: ShoppingBag,   label: 'Multicanal sincronizado'       },
];

export default function Servicios() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const kill: ScrollTrigger[] = [];

    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.svc-card');
      const t = gsap.fromTo(cards,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 78%' } });
      if (t.scrollTrigger) kill.push(t.scrollTrigger);
    }

    return () => kill.forEach(st => st.kill());
  }, [prefersReducedMotion]);

  return (
    <PageTransition>
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          style={{
            paddingTop: 'clamp(120px, 14vw, 200px)',
            paddingBottom: 'clamp(72px, 9vw, 120px)',
            borderBottom: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fondo decorativo */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,59,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={wrap}>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <div style={{ width: 5, height: 5, background: 'var(--color-accent)', borderRadius: '50%' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', margin: 0 }}>
                  Lo que construimos
                </p>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 6.5vw, 96px)',
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 0.92,
                color: 'var(--color-text)',
                marginBottom: '32px',
              }}>
                Software que<br />
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>opera con vos.</em>
              </h1>

              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                lineHeight: 1.72,
                color: 'var(--color-muted)',
                fontWeight: 300,
                maxWidth: '520px',
              }}>
                No vendemos páginas web ni plantillas. Construimos sistemas que se integran
                al corazón de tu operación y la hacen crecer sin agregar complejidad.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CARDS ── */}
        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={wrap}>
            <div
              ref={cardsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr',
                gap: '2px',
                background: 'var(--color-border)',
              }}
            >
              {/* Card 1 — E-commerce */}
              <div
                className="svc-card"
                style={{
                  background: 'var(--color-bg)',
                  padding: isSmallViewport ? '40px 28px' : '56px 48px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Número decorativo */}
                <span aria-hidden="true" style={{ position: 'absolute', top: '-10px', right: '28px', fontFamily: 'var(--font-display)', fontSize: '140px', fontWeight: 900, color: 'var(--color-border)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>01</span>

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'rgba(255,59,0,0.08)', border: '1px solid rgba(255,59,0,0.18)', marginBottom: '24px' }}>
                    <ShoppingBag size={24} color="#FF3B00" strokeWidth={1.5} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '12px' }}>
                    E-commerce
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 2.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: 'var(--color-text)', marginBottom: '16px' }}>
                    Tu tienda online,<br />lista para vender.
                  </h2>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.72, color: 'var(--color-muted)', fontWeight: 300, maxWidth: '380px' }}>
                    Desde el catálogo hasta el cobro con MercadoPago. Un sistema completo con panel admin, gestión de pedidos y clientes. Tu marca, tu dominio, tu operación.
                  </p>
                </div>

                {/* Features mini */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ecommerceFeatures.map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={14} color="var(--color-accent)" strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', fontWeight: 400 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <Link
                    to="/servicios/ecommerce"
                    data-track-event="cta_click"
                    data-track-label="Ver E-commerce"
                    data-track-location="servicios_index"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: '2px',
                      transition: 'border-color 0.15s, color 0.15s',
                      letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                  >
                    Ver servicio completo
                    <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                </div>
              </div>

              {/* Card 2 — ERP B2B */}
              <div
                className="svc-card"
                style={{
                  background: 'var(--color-dark)',
                  padding: isSmallViewport ? '40px 28px' : '56px 48px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Número decorativo */}
                <span aria-hidden="true" style={{ position: 'absolute', top: '-10px', right: '28px', fontFamily: 'var(--font-display)', fontSize: '140px', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>02</span>

                {/* Badge "flagship" */}
                <div style={{ position: 'absolute', top: '28px', right: '28px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF3B00', background: 'rgba(255,59,0,0.1)', border: '1px solid rgba(255,59,0,0.25)', padding: '4px 10px' }}>
                    Producto estrella
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'rgba(255,59,0,0.1)', border: '1px solid rgba(255,59,0,0.2)', marginBottom: '24px' }}>
                    <Building2 size={24} color="#FF3B00" strokeWidth={1.5} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: '12px' }}>
                    ERP B2B
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 2.8vw, 40px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#FAFAFA', marginBottom: '16px' }}>
                    El sistema operativo<br />de tu empresa.
                  </h2>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.72, color: 'rgba(255,255,255,0.42)', fontWeight: 300, maxWidth: '380px' }}>
                    40+ módulos integrados. IA, MercadoLibre, AFIP, WhatsApp API, comisiones, multidepósito, rutas de reparto y CRM completo. Todo en un solo sistema diseñado para escalar.
                  </p>
                </div>

                {/* Features mini */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {erpFeatures.map(({ icon: Icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={14} color="rgba(255,59,0,0.8)" strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.42)', fontWeight: 400 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    to="/servicios/erp"
                    data-track-event="cta_click"
                    data-track-label="Ver ERP completo"
                    data-track-location="servicios_index"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
                      color: '#FFFFFF', background: '#FF3B00', textDecoration: 'none',
                      padding: '13px 24px', transition: 'background 0.15s', letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E03000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FF3B00'; }}
                  >
                    Ver sistema completo
                    <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                    data-track-event="cta_click"
                    data-track-label="Consultar ERP"
                    data-track-location="servicios_index"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400,
                      color: 'rgba(255,255,255,0.5)', background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '12px 20px', cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s', letterSpacing: '-0.01em',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    Consultar →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIFERENCIADOR ── */}
        <section style={{ paddingBlock: 'clamp(64px, 8vw, 112px)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={wrap}>
            <div style={{ display: 'grid', gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr', gap: 'clamp(40px, 6vw, 96px)', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '20px' }}>
                  Por qué LayerCloud
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--color-text)', marginBottom: '20px' }}>
                  No te vendemos<br />
                  <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-muted)' }}>horas de desarrollo.</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.75, color: 'var(--color-muted)', fontWeight: 300 }}>
                  Te entregamos un sistema en producción que resuelve tu problema específico. Sin sprints eternos, sin presupuestos abiertos, sin consultoras que cobran por reunión.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-border)' }}>
                {[
                  { num: '48h', label: 'De kickoff a primer entrega funcional' },
                  { num: '100%', label: 'Código propio — no dependés de terceros' },
                  { num: '∞', label: 'Soporte y evolución sin costo fijo por ticket' },
                ].map(({ num, label }) => (
                  <div key={label} style={{ background: 'var(--color-bg)', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--color-accent)', flexShrink: 0, minWidth: '80px' }}>{num}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.5 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ paddingBlock: 'clamp(80px, 10vw, 140px)', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '24px' }}>
              El primer paso
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.95, color: 'var(--color-text)', marginBottom: '28px' }}>
              Contanos tu operación.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.72, color: 'var(--color-muted)', fontWeight: 300, maxWidth: '440px', marginInline: 'auto', marginBottom: '40px' }}>
              En 5 minutos te decimos qué sistema te conviene, qué incluye y qué impacto podés esperar en la operación.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('layercloud:open-chat'))}
                data-track-event="cta_click"
                data-track-label="Hablar con LayerCloud desde servicios"
                data-track-location="servicios_cta"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, color: '#FFFFFF', background: 'var(--color-accent)', border: 'none', padding: '16px 32px', cursor: 'pointer', transition: 'background 0.15s', letterSpacing: '-0.01em' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E03000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-accent)'; }}
              >
                Hablar con el equipo →
              </button>
              <Link
                to="/contacto"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 400, color: 'var(--color-muted)', border: '1px solid var(--color-border)', padding: '15px 32px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-text)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                Escribir por escrito
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
