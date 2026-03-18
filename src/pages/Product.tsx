import { useEffect, useRef, type CSSProperties } from 'react';
import {
  Database,
  LayoutDashboard,
  MonitorSmartphone,
  Search,
  Shield,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import TiltCard from '../components/TiltCard';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

gsap.registerPlugin(ScrollTrigger);

const injectArchitectureHeroStyles = (() => {
  let injected = false;

  return () => {
    if (injected || typeof document === 'undefined') {
      return;
    }

    injected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes architecture-hero-fade {
        from {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes architecture-card-float {
        0%, 100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(0, -6px, 0);
        }
      }

      @keyframes architecture-beam-run {
        0% {
          transform: translate3d(-18%, 0, 0);
          opacity: 0;
        }
        16% {
          opacity: 0.9;
        }
        100% {
          transform: translate3d(116%, 0, 0);
          opacity: 0;
        }
      }

      @keyframes architecture-shell-glow {
        0%, 100% {
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
        }
        50% {
          box-shadow: 0 22px 58px rgba(255, 59, 0, 0.10);
        }
      }

      .architecture-hero-visual {
        opacity: 0;
        animation: architecture-hero-fade 760ms cubic-bezier(0.22, 1, 0.36, 1) 140ms forwards;
      }

      .architecture-shell {
        animation: architecture-shell-glow 7.5s ease-in-out infinite;
      }

      .architecture-layer {
        opacity: 0;
        animation: architecture-hero-fade 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
          architecture-card-float 7.5s ease-in-out infinite;
      }

      .architecture-layer:nth-child(1) {
        animation-delay: 220ms, 0.3s;
      }

      .architecture-layer:nth-child(2) {
        animation-delay: 320ms, 0.9s;
      }

      .architecture-layer:nth-child(3) {
        animation-delay: 420ms, 1.5s;
      }

      .architecture-beam::after {
        content: '';
        position: absolute;
        top: 0;
        left: -12%;
        width: 30%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 59, 0, 0.9), rgba(255, 120, 0, 0.6), transparent);
        animation: architecture-beam-run 5.8s linear infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .architecture-hero-visual,
        .architecture-shell,
        .architecture-layer,
        .architecture-beam::after {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }

      /* Mobile product page improvements */
      @media (max-width: 768px) {
        .prod-mockup-grid {
          grid-template-columns: 1fr !important;
        }
        .prod-ecom-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .prod-tech-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        .prod-principles-grid {
          grid-template-columns: 1fr !important;
          gap: 28px !important;
        }
      }

      @media (max-width: 480px) {
        .prod-ecom-grid {
          grid-template-columns: 1fr !important;
        }
        .prod-tech-grid {
          grid-template-columns: 1fr !important;
        }
      }

      /* Stagger animation classes for scroll reveal */
      .prod-reveal {
        opacity: 0;
        transform: translateY(32px);
        transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .prod-reveal.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  };
})();

const architectureLayers = [
  {
    code: '01',
    title: 'Captura',
    desc: 'Web, chat, formularios y senales de comportamiento entrando en una sola capa.',
    accent: '#FF3B00',
  },
  {
    code: '02',
    title: 'Operacion',
    desc: 'Pedidos, stock, precios y clientes sincronizados con reglas claras.',
    accent: '#FF6B35',
  },
  {
    code: '03',
    title: 'Decision',
    desc: 'Visibilidad comercial, contexto y accion sobre la misma base.',
    accent: '#FFB347',
  },
] as const;

const architectureSignals = ['WEB', 'CHAT', 'ERP', 'STOCK', 'CLIENTES', 'IA'];

const principles = [
  {
    type: 'Principio 01',
    text: 'Primero sistema, despues interfaz.',
    sub: 'Cada decision de producto busca que operacion, datos y crecimiento hablen el mismo idioma.',
    variant: 'primary',
  },
  {
    type: 'Principio 02',
    text: 'La automatizacion tiene que liberar foco.',
    sub: 'Quitamos friccion repetitiva para que el equipo pueda pensar en clientes, expansion y ejecucion.',
    variant: 'accent',
  },
  {
    type: 'Principio 03',
    text: 'Si no escala en complejidad, no escala en mercados.',
    sub: 'Disenamos bases que puedan crecer en volumen, canales y territorios sin empezar de cero.',
    variant: 'warn',
  },
  {
    type: 'Principio 04',
    text: 'La marca tambien es infraestructura.',
    sub: 'El frente digital no es decoracion: es una capa comercial alineada con la operacion interna.',
    variant: 'primary',
  },
];

const techFeatures = [
  {
    icon: <ShoppingCart size={18} />,
    title: 'Orquestacion de pedidos',
    desc: 'Cada pedido avanza con reglas claras desde la compra hasta la entrega.',
  },
  {
    icon: <LayoutDashboard size={18} />,
    title: 'Inventario en tiempo real',
    desc: 'Stock, disponibilidad y movimientos visibles desde un mismo tablero.',
  },
  {
    icon: <TrendingUp size={18} />,
    title: 'Analitica accionable',
    desc: 'Reportes de ventas, costos, margenes y desvio operativo listos para decidir.',
  },
  {
    icon: <Users size={18} />,
    title: 'Contexto comercial',
    desc: 'Clientes, historial y seguimiento en una capa conectada con la operacion.',
  },
];

const ecommerceFeatures = [
  {
    icon: <Search size={18} />,
    num: '// 01',
    title: 'SEO tecnico avanzado',
    desc: 'Arquitectura semantica, schema y metadatos para competir bien desde una base seria.',
  },
  {
    icon: <Shield size={18} />,
    num: '// 02',
    title: 'Seguridad y confianza',
    desc: 'SSL, buenas practicas y una experiencia que transmite control desde el primer contacto.',
  },
  {
    icon: <Zap size={18} />,
    num: '// 03',
    title: 'Rendimiento real',
    desc: 'Frontends optimizados para cargar rapido, sostener campanas y reducir perdida por friccion.',
  },
  {
    icon: <MonitorSmartphone size={18} />,
    num: '// 04',
    title: 'Diseno de categoria',
    desc: 'Interfaces con criterio visual y narrativo para marcas que quieren proyectarse en grande.',
  },
  {
    icon: <ShoppingCart size={18} />,
    num: '// 05',
    title: 'Conversion enfocada',
    desc: 'Flujos de compra claros, menos ruido y una experiencia que acompana la decision.',
  },
  {
    icon: <TrendingUp size={18} />,
    num: '// 06',
    title: 'Analitica integrada',
    desc: 'Eventos, embudos y atribucion para saber que canal mueve el negocio y cual solo hace ruido.',
  },
];

const frontendImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
];

const backendImages = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
];

export default function Product() {
  const frontendRef = useRef<HTMLDivElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const ecomRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    injectArchitectureHeroStyles();

    if (prefersReducedMotion) {
      return;
    }

    const yFrom = isSmallViewport ? 40 : 80;
    const yFromMed = isSmallViewport ? 28 : 60;
    const yFromSm = isSmallViewport ? 20 : 40;

    [frontendRef, backendRef].forEach((ref) => {
      if (ref.current) {
        const cards = ref.current.querySelectorAll('.mockup-card');
        gsap.fromTo(
          cards,
          { y: yFrom, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: isSmallViewport ? 0.65 : 0.9,
            stagger: isSmallViewport ? 0.1 : 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 82%' },
          },
        );
      }
    });

    if (ecomRef.current) {
      const cards = ecomRef.current.querySelectorAll('.prop-card');
      gsap.fromTo(
        cards,
        { y: yFromMed, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: isSmallViewport ? 0.07 : 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ecomRef.current, start: 'top 82%' },
        },
      );
    }

    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll('.tech-feature');
      gsap.fromTo(
        cards,
        { y: yFromSm, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: isSmallViewport ? 0.07 : 0.1,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 82%' },
        },
      );
    }
  }, [isSmallViewport, prefersReducedMotion]);

  const sec = (extra?: CSSProperties): CSSProperties => ({
    padding: 'clamp(48px, 8vw, 80px) clamp(20px, 6vw, 56px)',
    borderBottom: '1px solid var(--color-border)',
    position: 'relative',
    zIndex: 1,
    ...extra,
  });

  return (
    <PageTransition>
      <div className="w-full pt-24" style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Hero ── */}
        <section
          data-track-section="product_hero"
          style={sec({
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 84% 16%, rgba(255,59,0,0.04), transparent 24%), radial-gradient(circle at 14% 80%, rgba(255,59,0,0.02), transparent 28%)',
          })}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isSmallViewport ? '1fr' : 'minmax(0, 1fr) minmax(360px, 0.94fr)',
              gap: isSmallViewport ? '36px' : '52px',
              alignItems: 'center',
            }}
          >
            <div>
              <p className="eyebrow">// Arquitectura LayerCloud</p>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 4vw, 56px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  marginBottom: '16px',
                  maxWidth: '760px',
                }}
              >
                ERP, automatizacion y e-commerce en una sola{' '}
                <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>arquitectura operativa</span>
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: 'var(--color-muted)',
                  fontWeight: 300,
                  maxWidth: '620px',
                  marginBottom: '32px',
                }}
              >
                Un ecosistema pensado para empresas que necesitan control hoy y una base lista
                para expandirse a nuevos canales, equipos y mercados.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginBottom: '26px',
                }}
              >
                <a
                  href="#ecommerce"
                  className="btn-primary"
                  data-track-event="pricing_interest"
                  data-track-label="Ver capa comercial"
                  data-track-location="product_hero"
                >
                  Ver capa comercial
                </a>
                <Link
                  to="/contacto"
                  className="btn-ghost"
                  data-track-event="cta_click"
                  data-track-label="Agendar diagnostico"
                  data-track-location="product_hero"
                >
                  Agendar diagnostico →
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {architectureSignals.map((signal) => (
                  <span
                    key={signal}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                      padding: '7px 10px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                    }}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture visual — always dark panel */}
            <div
              className={prefersReducedMotion ? undefined : 'architecture-hero-visual'}
              style={{
                position: 'relative',
                minHeight: isSmallViewport ? 'auto' : '460px',
              }}
            >
              <div
                className={prefersReducedMotion ? undefined : 'architecture-shell'}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(30, 42, 56, 0.96)',
                  background:
                    'linear-gradient(180deg, rgba(16, 21, 28, 0.97) 0%, rgba(10, 14, 18, 0.99) 100%)',
                  padding: isSmallViewport ? '20px' : '26px',
                  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.28)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    alignItems: 'flex-start',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#FF3B00',
                        marginBottom: '10px',
                      }}
                    >
                      System map
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(22px, 3vw, 34px)',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-0.04em',
                        color: '#FAFAFA',
                      }}
                    >
                      Una sola base.
                      <br />
                      Varias capas alineadas.
                    </p>
                  </div>

                  <div
                    style={{
                      minWidth: '92px',
                      padding: '12px 14px',
                      border: '1px solid rgba(255, 59, 0, 0.22)',
                      background: 'rgba(255, 59, 0, 0.06)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '6px',
                      }}
                    >
                      STACK
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FF3B00',
                      }}
                    >
                      ACTIVE
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '14px',
                    marginBottom: '18px',
                  }}
                >
                  {architectureLayers.map((layer) => (
                    <div
                      key={layer.code}
                      className={prefersReducedMotion ? undefined : 'architecture-layer'}
                      style={{
                        position: 'relative',
                        border: '1px solid rgba(30, 42, 56, 0.82)',
                        background: 'rgba(255,255,255,0.025)',
                        padding: '16px 18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '14px',
                          marginBottom: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: layer.accent,
                              boxShadow: `0 0 14px ${layer.accent}`,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '18px',
                              fontWeight: 700,
                              color: '#FAFAFA',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {layer.title}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            color: 'rgba(255,255,255,0.3)',
                          }}
                        >
                          {layer.code}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 300,
                        }}
                      >
                        {layer.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    border: '1px solid rgba(30, 42, 56, 0.82)',
                    background: 'rgba(255,255,255,0.025)',
                    padding: '14px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#FF3B00',
                      }}
                    >
                      Flujo operativo
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      Input → sistema → decision
                    </span>
                  </div>
                  <div
                    className={prefersReducedMotion ? undefined : 'architecture-beam'}
                    style={{
                      position: 'relative',
                      height: '6px',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, rgba(255,59,0,0.2), rgba(255,120,0,0.15))',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  {[
                    { label: 'Pedidos', value: 'Sync' },
                    { label: 'Stock', value: 'Live' },
                    { label: 'Clientes', value: 'Context' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid rgba(30, 42, 56, 0.82)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          letterSpacing: '0.1em',
                          color: 'rgba(255,255,255,0.3)',
                          marginBottom: '6px',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#FAFAFA',
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 01 Capa comercial ── */}
        <section
          id="ecommerce"
          data-track-section="product_commercial_layer"
          style={sec({
            background: 'linear-gradient(to bottom, rgba(255,59,0,0.02) 0%, transparent 60%)',
          })}
        >
          <p className="eyebrow">// 01 - Capa comercial</p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '16px',
            }}
          >
            Experiencias digitales que{' '}
            <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>convierten con criterio</span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--color-muted)',
              fontWeight: 300,
              maxWidth: '620px',
              marginBottom: '52px',
            }}
          >
            Disenamos sitios y e-commerce de alto rendimiento con SEO tecnico, seguridad y
            una narrativa lista para proyectar autoridad en cualquier mercado.
          </p>

          <div
            ref={ecomRef}
            className="prod-ecom-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
              marginBottom: '2px',
            }}
          >
            {ecommerceFeatures.map((feature) => (
              <div key={feature.num} className="prop-card">
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    color: 'var(--color-accent)',
                    marginBottom: '16px',
                  }}
                >
                  {feature.num}
                </p>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255,59,0,0.06)',
                    border: '1px solid rgba(255,59,0,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    marginBottom: '16px',
                  }}
                >
                  {feature.icon}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {feature.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--color-muted)',
                    fontWeight: 300,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="roi-banner"
            style={{
              marginTop: '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '32px',
              flexWrap: 'wrap',
              borderLeft: '4px solid var(--color-accent)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                  marginBottom: '8px',
                }}
              >
                // Base incluida en cada proyecto
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                }}
              >
                SEO tecnico | seguridad | rendimiento | analitica | soporte
              </p>
            </div>
            <Link
              to="/contacto"
              className="btn-primary"
              data-track-event="cta_click"
              data-track-label="Quiero esta arquitectura"
              data-track-location="product_commercial_layer"
              style={{ whiteSpace: 'nowrap' }}
            >
              Quiero esta arquitectura
            </Link>
          </div>
        </section>

        {/* ── 02 Front-end ── */}
        <section ref={frontendRef} data-track-section="product_frontend" style={sec()}>
          <p className="eyebrow">// 02 - Front-end</p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 2.5vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}
          >
            La cara visible del{' '}
            <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>sistema</span>
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--color-muted)',
              fontWeight: 300,
              maxWidth: '560px',
              marginBottom: '48px',
            }}
          >
            No se trata de verse moderno. Se trata de transmitir control, confianza y una
            ambicion de categoria desde el primer segundo.
          </p>
          <div
            className="prod-mockup-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}
          >
            {frontendImages.map((img, index) => (
              <TiltCard key={index} className="mockup-card">
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, #0A0A0A 0%, transparent 60%)',
                      zIndex: 1,
                      opacity: 0.75,
                    }}
                  />
                  <img
                    src={img}
                    alt={`Frontend ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.8s',
                    }}
                    referrerPolicy="no-referrer"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px', zIndex: 2 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(255,59,0,0.15)',
                        border: '1px solid rgba(255,59,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <MonitorSmartphone size={16} color="#FF3B00" />
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: '#FAFAFA',
                        fontSize: '15px',
                      }}
                    >
                      Percepcion premium
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── 03 Back-end ERP ── */}
        <section ref={backendRef} data-track-section="product_backend" style={sec()}>
          <div
            style={{
              textAlign: isSmallViewport ? 'left' : 'right',
              maxWidth: '560px',
              marginLeft: isSmallViewport ? 0 : 'auto',
              marginBottom: '48px',
            }}
          >
            <p className="eyebrow" style={{ textAlign: isSmallViewport ? 'left' : 'right' }}>
              // 03 - Back-end ERP
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 2.5vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                marginBottom: '12px',
              }}
            >
              El nucleo{' '}
              <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>operativo</span>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: 'var(--color-muted)',
                fontWeight: 300,
              }}
            >
              Pedidos, stock, precios, clientes y datos en un mismo sistema con criterio de
              ingenieria.
            </p>
          </div>
          <div
            className="prod-mockup-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}
          >
            {backendImages.map((img, index) => (
              <TiltCard key={index} className="mockup-card">
                <div style={{ position: 'relative', overflow: 'hidden', height: '280px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, #0A0A0A 0%, transparent 60%)',
                      zIndex: 1,
                      opacity: 0.8,
                    }}
                  />
                  <img
                    src={img}
                    alt={`Backend ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.8,
                      transition: 'transform 0.8s',
                    }}
                    referrerPolicy="no-referrer"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px', zIndex: 2 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: 'rgba(255,59,0,0.15)',
                        border: '1px solid rgba(255,59,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <Database size={16} color="#FF3B00" />
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: '#FAFAFA',
                        fontSize: '15px',
                      }}
                    >
                      Control central
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── 04 Potencia tecnica ── */}
        <section ref={featuresRef} data-track-section="product_tech_power" style={sec()}>
          <p className="eyebrow">// 04 - Potencia tecnica</p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 2.5vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '48px',
            }}
          >
            La capa que sostiene la escala
          </h2>
          <div
            className="prod-tech-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px' }}
          >
            {techFeatures.map((feature, index) => (
              <div key={index} className="tech-feature prop-card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(255,59,0,0.06)',
                    border: '1px solid rgba(255,59,0,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    marginBottom: '16px',
                  }}
                >
                  {feature.icon}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '17px',
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {feature.title}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--color-muted)',
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 05 Principios ── */}
        <section
          data-track-section="product_principles"
          style={{ ...sec(), borderBottom: 'none' }}
        >
          <p className="eyebrow">// 05 - Principios</p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3vw, 40px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              marginBottom: '16px',
            }}
          >
            Asi piensa LayerCloud
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--color-muted)',
              fontWeight: 300,
              maxWidth: '620px',
              marginBottom: '52px',
            }}
          >
            Ingenieria, claridad y expansion. Esa es la base sobre la que construimos.
          </p>
          <div
            className="prod-principles-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}
          >
            {principles.map((principle) => (
              <div key={principle.type} className={`msg-block ${principle.variant}`}>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    marginBottom: '12px',
                  }}
                >
                  {principle.type}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    marginBottom: '12px',
                  }}
                >
                  {principle.text}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: 'var(--color-muted)',
                    fontWeight: 300,
                  }}
                >
                  {principle.sub}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 2.5vw, 36px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                marginBottom: '24px',
                maxWidth: '700px',
                marginInline: 'auto',
                lineHeight: 1.2,
              }}
            >
              Si tu empresa quiere dejar de improvisar y empezar a operar como una
              referencia, conversemos.
            </p>
            <Link
              to="/contacto"
              className="btn-primary-accent"
              data-track-event="cta_click"
              data-track-label="Solicitar diagnostico"
              data-track-location="product_footer"
            >
              Solicitar diagnostico →
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
