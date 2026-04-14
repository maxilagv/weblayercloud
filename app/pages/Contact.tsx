import { useState, useEffect, useRef, type FormEvent } from 'react';
import { type MetaFunction } from 'react-router';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Shield, Lock, Star } from 'lucide-react';
import gsap from 'gsap';
import PageTransition from '../components/PageTransition';
import StructuredData from '../components/seo/StructuredData';
import { submitContactSubmission } from '../lib/crm';
import { trackBehaviorEvent } from '../lib/tracking';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';
import { breadcrumbJsonLd, buildMeta, faqJsonLd, serviceJsonLd } from '../lib/seo';

const injectContactStyles = (() => {
  let injected = false;

  return () => {
    if (injected || typeof document === 'undefined') {
      return;
    }

    injected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes contact-panel-fade {
        from {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes contact-panel-float {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50%       { transform: translate3d(0, -5px, 0); }
      }

      @keyframes contact-line-run {
        0%   { transform: translate3d(-12%, 0, 0); opacity: 0; }
        18%  { opacity: 0.9; }
        100% { transform: translate3d(112%, 0, 0); opacity: 0; }
      }

      .contact-visual-shell {
        opacity: 0;
        animation: contact-panel-fade 760ms cubic-bezier(0.22, 1, 0.36, 1) 140ms forwards;
      }

      .contact-floating-card {
        opacity: 0;
        animation: contact-panel-fade 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
          contact-panel-float 7.4s ease-in-out infinite;
      }
      .contact-floating-card:nth-child(1) { animation-delay: 220ms, 0.5s; }
      .contact-floating-card:nth-child(2) { animation-delay: 320ms, 1.2s; }
      .contact-floating-card:nth-child(3) { animation-delay: 420ms, 1.9s; }

      .contact-signal-line::after {
        content: '';
        position: absolute;
        top: 0; left: -16%;
        width: 28%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,59,0,0.9), rgba(255,120,0,0.6), transparent);
        animation: contact-line-run 5.2s linear infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .contact-visual-shell,
        .contact-floating-card,
        .contact-signal-line::after {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
})();

const contactSignals = ['DIAGNOSTICO', 'MAPA OPERATIVO', 'SIGUIENTE PASO'];

const diagnosticSteps = [
  {
    code: '01',
    title: 'Lectura',
    desc: 'Detectamos donde hoy se traba la operacion, la atencion o la visibilidad.',
    accent: '#FF3B00',
  },
  {
    code: '02',
    title: 'Estructura',
    desc: 'Convertimos ese problema en arquitectura, no en una lista de parches.',
    accent: '#FF6B35',
  },
  {
    code: '03',
    title: 'Direccion',
    desc: 'Salimos con un siguiente paso concreto y una oferta alineada al momento real.',
    accent: '#FFB347',
  },
] as const;

const faqs = [
  {
    q: '¿Cuánto tarda la implementación?',
    a: 'Depende del alcance. Un módulo puntual (stock, ventas, turnos) puede estar operativo en 3 a 6 semanas. Un sistema completo toma entre 2 y 4 meses. El diagnóstico inicial nos ayuda a darte un plazo real, no uno de folleto.',
  },
  {
    q: '¿Qué pasa con mis datos actuales (planillas, Excel)?',
    a: 'Los migramos. Trabajamos con exportaciones de Excel, Access, sistemas legacy o incluso datos en papel escaneados. El objetivo es que no pierdas historia operativa al hacer el cambio.',
  },
  {
    q: '¿Puedo empezar con una sola parte y escalar después?',
    a: 'Sí, es la forma más común. Arrancamos por el punto de mayor fricción — ventas, stock, caja — y construimos sobre esa base. No hace falta comprometerse con todo desde el día uno.',
  },
  {
    q: '¿Qué pasa si el negocio cambia o crece?',
    a: 'El sistema crece con vos. Diseñamos con extensibilidad desde el principio: nuevas sucursales, nuevos canales, nuevos módulos. No te vas a quedar con un techo bajo a los 12 meses.',
  },
  {
    q: '¿Cómo es el soporte después de entregar el sistema?',
    a: 'Ofrecemos soporte activo post-entrega: canal directo con el equipo técnico, correcciones sin costo dentro del período de garantía, y planes de mantenimiento para quienes quieren iterar de forma continua.',
  },
  {
    q: '¿Tienen experiencia con mi industria?',
    a: 'Trabajamos con retail, logística, e-commerce, servicios y manufactura PyME. Si tu sector es específico, el diagnóstico inicial nos permite entender tus particularidades antes de proponer cualquier solución.',
  },
] as const;

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'Contacto y diagnóstico técnico',
    description:
      'Contactá a MotorCloud para evaluar arquitectura, migración, integraciones y operación B2B sobre una plataforma SaaS moderna en Java.',
    path: '/contacto',
    keywords: [
      'contacto motorcloud',
      'diagnostico tecnico',
      'arquitectura saas',
      'microservicios b2b',
      'migracion legacy',
    ],
  });

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasStartedFormRef = useRef(false);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    injectContactStyles();

    if (prefersReducedMotion) {
      return;
    }

    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power3.out', delay: 0.2 },
      );
    }
  }, [isSmallViewport, prefersReducedMotion]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitContactSubmission(formState);
      void trackBehaviorEvent({
        eventName: 'form_submit',
        path: '/contacto',
        payload: { form: 'contact', company: formState.company },
      }).catch(() => undefined);
      void trackBehaviorEvent({
        eventName: 'contact_conversion',
        path: '/contacto',
        payload: { conversionType: 'contact_form' },
      }).catch(() => undefined);
      setIsSuccess(true);
      setFormState({ name: '', email: '', phone: '', company: '', message: '' });
      hasStartedFormRef.current = false;
      window.setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('[MotorCloud Contact]', error);
      setSubmitError('No pude guardar tu solicitud ahora. Proba de nuevo en unos segundos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <StructuredData
        data={serviceJsonLd({
          name: 'Diagnóstico técnico MotorCloud',
          description:
            'Evaluación técnica inicial para arquitectura SaaS, microservicios, integraciones y migración de sistemas legacy.',
          path: '/contacto',
          serviceType: 'Diagnóstico técnico',
        })}
      />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contacto' },
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
      <div className="w-full pt-24" style={{ position: 'relative', zIndex: 1 }}>
        <section
          data-track-section="contact_hero"
          style={{
            padding: 'clamp(48px, 8vw, 80px) clamp(20px, 6vw, 56px) clamp(64px, 10vw, 100px)',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid var(--color-dark-border)',
            background: 'var(--color-dark)',
          }}
        >
          {/* Dot-grid */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            pointerEvents: 'none',
            maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
          }} />
          {/* Orange orb right */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 45% 55% at 100% 50%, rgba(255,59,0,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div ref={contentRef} style={{ position: 'relative', zIndex: 1 }}>
            {/* ── Hero header ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : 'minmax(0, 1fr) minmax(340px, 0.94fr)',
                gap: isSmallViewport ? '36px' : '52px',
                alignItems: 'center',
                marginBottom: '64px',
              }}
            >
              <div style={{ maxWidth: '760px' }}>
                <p className="eyebrow-accent" style={{ marginBottom: '20px' }}>// Diagnostico inicial</p>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 4vw, 56px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#FAFAFA',
                    marginBottom: '16px',
                    lineHeight: 1.05,
                  }}
                >
                  Conversemos sobre
                  <br />
                  la operacion que queres construir.
                  <br />
                  <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>
                    Pensada para escalar.
                  </span>
                </h1>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '17px',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 300,
                    maxWidth: '560px',
                    marginBottom: '26px',
                  }}
                >
                  Contanos donde esta la friccion y te mostramos como convertirla en sistema,
                  control y expansion.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {contactSignals.map((signal) => (
                    <span
                      key={signal}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.38)',
                        padding: '7px 10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Dark diagnostic panel (desktop only) ── */}
              {!isSmallViewport && (
                <div className={prefersReducedMotion ? undefined : 'contact-visual-shell'}>
                  <div
                    style={{
                      border: '1px solid rgba(30, 42, 56, 0.95)',
                      background:
                        'linear-gradient(180deg, rgba(16, 21, 28, 0.97) 0%, rgba(10, 14, 18, 0.99) 100%)',
                      padding: '26px',
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginBottom: '22px',
                        alignItems: 'flex-start',
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
                          Ruta de entrada
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '30px',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.04em',
                            color: '#FAFAFA',
                          }}
                        >
                          Del dolor actual
                          <br />
                          al sistema correcto.
                        </p>
                      </div>

                      <div
                        style={{
                          minWidth: '90px',
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
                          STATUS
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#FF3B00',
                          }}
                        >
                          READY
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '14px', marginBottom: '18px' }}>
                      {diagnosticSteps.map((step) => (
                        <div
                          key={step.code}
                          className={prefersReducedMotion ? undefined : 'contact-floating-card'}
                          style={{
                            border: '1px solid rgba(30, 42, 56, 0.82)',
                            background: 'rgba(255,255,255,0.025)',
                            padding: '16px 18px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '12px',
                              alignItems: 'center',
                              marginBottom: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: step.accent,
                                  boxShadow: `0 0 12px ${step.accent}`,
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
                                {step.title}
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
                              {step.code}
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
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        border: '1px solid rgba(30, 42, 56, 0.82)',
                        background: 'rgba(255,255,255,0.025)',
                        padding: '14px 16px',
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
                          Diagnostico activo
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                          }}
                        >
                          Input → lectura → siguiente paso
                        </span>
                      </div>
                      <div
                        className={prefersReducedMotion ? undefined : 'contact-signal-line'}
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
                            background: 'linear-gradient(90deg, rgba(255,59,0,0.2), rgba(255,120,0,0.15))',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Form + sidebar ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr',
                gap: isSmallViewport ? '36px' : '64px',
              }}
            >
              {/* Form card */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: isSmallViewport ? '28px 20px' : '40px',
                  position: 'relative',
                }}
              >
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-surface)',
                      zIndex: 10,
                      padding: '40px',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(255,59,0,0.08)',
                        border: '1px solid rgba(255,59,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                      }}
                    >
                      <CheckCircle2 size={28} color="var(--color-accent)" />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '22px',
                        color: 'var(--color-text)',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Solicitud recibida
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        color: 'var(--color-muted)',
                        textAlign: 'center',
                        fontWeight: 300,
                      }}
                    >
                      Recibimos tu mensaje. Te contactamos con el siguiente paso.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <div className="input-group">
                      <input
                        type="text"
                        required
                        placeholder=" "
                        value={formState.name}
                        onChange={(event) => {
                          if (!hasStartedFormRef.current) {
                            hasStartedFormRef.current = true;
                            void trackBehaviorEvent({
                              eventName: 'form_start',
                              path: '/contacto',
                              payload: { form: 'contact' },
                            }).catch(() => undefined);
                          }
                          setFormState({ ...formState, name: event.target.value });
                        }}
                      />
                      <label>Nombre completo</label>
                    </div>
                    <div className="input-group">
                      <input
                        type="email"
                        required
                        placeholder=" "
                        value={formState.email}
                        onChange={(event) => {
                          setFormState({ ...formState, email: event.target.value });
                        }}
                      />
                      <label>Email de trabajo</label>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isSmallViewport ? '1fr' : '1fr 1fr',
                      gap: '16px',
                    }}
                  >
                    <div className="input-group">
                      <input
                        type="tel"
                        required
                        placeholder=" "
                        value={formState.phone}
                        onChange={(event) => {
                          setFormState({ ...formState, phone: event.target.value });
                        }}
                      />
                      <label>WhatsApp o telefono</label>
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        required
                        placeholder=" "
                        value={formState.company}
                        onChange={(event) => {
                          setFormState({ ...formState, company: event.target.value });
                        }}
                      />
                      <label>Empresa o marca</label>
                    </div>
                  </div>

                  <div className="input-group">
                    <textarea
                      required
                      rows={4}
                      placeholder=" "
                      value={formState.message}
                      onChange={(event) => {
                        setFormState({ ...formState, message: event.target.value });
                      }}
                      style={{ resize: 'none' }}
                    />
                    <label>Cual es el punto de friccion principal hoy?</label>
                  </div>

                  {submitError && (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        color: '#EF4444',
                        marginBottom: '16px',
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-accent"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      'Guardando...'
                    ) : (
                      <>
                        <Send size={14} /> Solicitar diagnostico
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '32px',
                }}
              >
                {/* Que pasa despues */}
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '28px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: '20px',
                    }}
                  >
                    Que pasa despues
                  </p>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {[
                      'Leemos tu contexto operativo y comercial.',
                      'Definimos la mejor entrada: ERP, integracion o demo diagnostica.',
                      'Te devolvemos un siguiente paso con direccion clara.',
                    ].map((item, index) => (
                      <div
                        key={item}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '34px 1fr',
                          gap: '14px',
                          alignItems: 'start',
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            border: '1px solid rgba(255,59,0,0.18)',
                            background: 'rgba(255,59,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--color-accent)',
                            letterSpacing: '0.1em',
                            flexShrink: 0,
                          }}
                        >
                          0{index + 1}
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            color: 'var(--color-text)',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            paddingTop: '5px',
                          }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shield + Lock items */}
                {[
                  {
                    icon: <Shield size={20} color="var(--color-accent)" />,
                    title: 'Infraestructura segura',
                    desc: 'Tus datos y los de tu operacion viven en un entorno mas ordenado, con accesos, respaldos y criterio tecnico.',
                  },
                  {
                    icon: <Lock size={20} color="var(--color-accent)" />,
                    title: 'Relacion por resultado',
                    desc: 'No buscamos retenerte por friccion. Queremos que te quedes porque el sistema te da control, velocidad y direccion.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: 'rgba(255,59,0,0.06)',
                        border: '1px solid rgba(255,59,0,0.14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '17px',
                          color: 'var(--color-text)',
                          marginBottom: '6px',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          color: 'var(--color-muted)',
                          fontWeight: 300,
                          lineHeight: 1.65,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Testimonial */}
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderLeft: '4px solid var(--color-accent)',
                    padding: '28px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Star key={item} size={14} color="#FBBF24" fill="#FBBF24" />
                    ))}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      color: 'var(--color-text)',
                      fontStyle: 'italic',
                      lineHeight: 1.7,
                      marginBottom: '20px',
                      fontWeight: 300,
                    }}
                  >
                    "Lo mas valioso no fue solo ordenar ventas; fue empezar a operar con una
                    base preparada para crecer sin perder identidad."
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop"
                        alt="Perfil de cliente"
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--color-text)',
                        }}
                      >
                        Valeria Costa
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: 'var(--color-muted)',
                          letterSpacing: '0.08em',
                        }}
                      >
                        COO, marca omnicanal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* ── FAQ ── */}
            <div style={{ marginTop: 'clamp(64px, 10vw, 100px)' }}>
              <p className="eyebrow">// Preguntas frecuentes</p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text)',
                  marginBottom: 'clamp(28px, 4vw, 48px)',
                  lineHeight: 1.1,
                  maxWidth: '560px',
                }}
              >
                Todo lo que querés saber antes de dar el paso.
              </h2>

              <div style={{ maxWidth: '780px' }}>
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="faq-item">
                      <button
                        className="faq-q"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <span
                          className="faq-icon"
                          style={{
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                            display: 'inline-block',
                          }}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="faq-a">
                          <p
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '15px',
                              color: 'var(--color-muted)',
                              lineHeight: 1.72,
                              fontWeight: 300,
                            }}
                          >
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
