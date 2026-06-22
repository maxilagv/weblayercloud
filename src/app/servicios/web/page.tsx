'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import WebHero from '@/components/WebHero';
import ScrollReveal from '@/components/ScrollReveal';
import Counter from '@/components/Counter';

import styles from './page.module.css';

export default function ServiciosWebPage() {
  const { lang } = useLang();
  const isEN = lang === 'en';

  const [activeTab, setActiveTab] = useState('landing');

  useEffect(() => {
    // Set body classes specific to this page
    document.body.classList.add('video-hero');
    // Failsafe for reveal
    document.documentElement.classList.add('reveal-armed');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('reveal-armed');
    }, 2500);
    return () => {
      document.body.classList.remove('video-hero');
      document.documentElement.classList.remove('reveal-armed');
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { --page-accent: #7C5CFF; --page-accent-rgb: 124,92,255; }` }} />
      
      <WebHero />

      <div className="stats-strip">
        <div className="wrap">
          <div className="stat">
            <div className="sv">14%</div>
            <div className="sl">{isEN ? 'Average conversion rate (industry: 2–4%)' : 'Tasa de conversión promedio (industria: 2–4%)'}</div>
          </div>
          <div className="stat">
            <div className="sv"><Counter count={12} /></div>
            <div className="sl">{isEN ? 'Integrations (payment, CRM, email, analytics)' : 'Integraciones (pago, CRM, email, analítica)'}</div>
          </div>
          <div className="stat">
            <div className="sv">4.8x</div>
            <div className="sl">{isEN ? 'Average ROAS on optimized campaigns' : 'ROAS promedio en campañas optimizadas'}</div>
          </div>
          <div className="stat">
            <div className="sv">&lt;2s</div>
            <div className="sl">{isEN ? 'Page load time (Core Web Vitals optimized)' : 'Tiempo de carga (Core Web Vitals optimizado)'}</div>
          </div>
        </div>
      </div>

      <section className="section" id="soluciones" style={{ background: 'var(--paper-3)' }}>
        <div className="wrap">
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow brand">{isEN ? 'Our solutions' : 'Nuestras soluciones'}</span>
              <h2>{isEN ? 'One ecosystem, three levels of complexity' : 'Un ecosistema, tres niveles de complejidad'}</h2>
              <p>{isEN ? 'We match the solution to your actual business stage — and scale it as you grow.' : 'Adaptamos la solución a tu momento real y la escalamos con vos.'}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className="tab-nav" style={{ marginBottom: '28px' }}>
              <button className={`tab-btn ${activeTab === 'landing' ? 'active' : ''}`} onClick={() => setActiveTab('landing')}>Landing</button>
              <button className={`tab-btn ${activeTab === 'ecommerce' ? 'active' : ''}`} onClick={() => setActiveTab('ecommerce')}>E-commerce</button>
              <button className={`tab-btn ${activeTab === 'ecosystem' ? 'active' : ''}`} onClick={() => setActiveTab('ecosystem')}>{isEN ? 'Ecosystem' : 'Ecosistema'}</button>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className={styles.webTabContent}>
              <div className={`tab-pane ${activeTab === 'landing' ? 'active' : ''}`}>
                <div className={styles.landingMock}>
                  <div className={styles.lmLeft}>
                    <div className={styles.lmEyebrow}>Landing page</div>
                    <div className={styles.lmH}>{isEN ? 'Pages built to convert a specific audience into leads or customers' : 'Páginas construidas para convertir una audiencia específica en leads o clientes'}</div>
                    <div className={styles.lmP}>{isEN ? 'Clear architecture, persuasive copy, optimized forms and integrated analytics from day one.' : 'Arquitectura clara, copy persuasivo, formularios optimizados y analítica integrada desde el día uno.'}</div>
                    <div className={styles.lmSteps}>
                      <div className={styles.lmStep}><span className={styles.lsIc}>◧</span><span>{isEN ? 'Custom UX/UI design' : 'Diseño UX/UI a medida'}</span></div>
                      <div className={styles.lmStep}><span className={styles.lsIc}>⚡</span><span>{isEN ? 'CRM and automation integration' : 'Integración con CRM y automatizaciones'}</span></div>
                      <div className={styles.lmStep}><span className={styles.lsIc}>▩</span><span>{isEN ? 'Conversion tracking' : 'Seguimiento de conversiones'}</span></div>
                      <div className={styles.lmStep}><span className={styles.lsIc}>✦</span><span>A/B testing + <span>{isEN ? 'AI optimization' : 'optimización IA'}</span></span></div>
                    </div>
                  </div>
                  <div className={styles.lmRight}>
                    <div className={styles.lmForm}>
                      <div className={styles.lmFormTitle}>{isEN ? 'Lead capture form' : 'Formulario de captura'}</div>
                      <div className={styles.lmField}></div><div className={styles.lmField}></div><div className={styles.lmField}></div><div className={styles.lmBtn}></div>
                    </div>
                    <div className={styles.lmTrust}><span>{isEN ? 'SSL' : 'SSL seguro'}</span><span>GDPR</span><span>Mobile</span></div>
                  </div>
                </div>
              </div>

              <div className={`tab-pane ${activeTab === 'ecommerce' ? 'active' : ''}`}>
                <div className={styles.ecoMock}>
                  <div className={styles.ecoHeader}>
                    <b>{isEN ? 'Online store' : 'Tienda online'}</b>
                    <div className={styles.cartIc}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      <span>{isEN ? '3 items · $12,400' : '3 ítems · $12.400'}</span>
                    </div>
                  </div>
                  <div className={styles.ecoGrid}>
                    <div className={styles.ecoCard}><div className={styles.ecoImg}></div><div className={styles.ecoInfo}><div className={styles.en}>{isEN ? 'Product A' : 'Producto A'}</div><div className={styles.ep}>$1.200</div><div className={styles.ea}></div></div></div>
                    <div className={styles.ecoCard}><div className={styles.ecoImg}></div><div className={styles.ecoInfo}><div className={styles.en}>{isEN ? 'Product B' : 'Producto B'}</div><div className={styles.ep}>$3.800</div><div className={styles.ea}></div></div></div>
                    <div className={styles.ecoCard}><div className={styles.ecoImg}></div><div className={styles.ecoInfo}><div className={styles.en}>{isEN ? 'Product C' : 'Producto C'}</div><div className={styles.ep}>$890</div><div className={styles.ea}></div></div></div>
                    <div className={styles.ecoCard}><div className={styles.ecoImg}></div><div className={styles.ecoInfo}><div className={styles.en}>{isEN ? 'Product D' : 'Producto D'}</div><div className={styles.ep}>$5.200</div><div className={styles.ea}></div></div></div>
                  </div>
                  <div className={styles.ecoStats}>
                    <div className={styles.es}>{isEN ? 'Orders today:' : 'Pedidos hoy:'} <b>47</b></div>
                    <div className={styles.es} style={{ marginLeft: '14px' }}>{isEN ? 'Revenue:' : 'Ingresos:'} <b>$184K</b></div>
                    <div className={styles.es} style={{ marginLeft: '14px' }}>{isEN ? 'Avg ticket:' : 'Ticket prom.:'} <b>$3.9K</b></div>
                  </div>
                </div>
              </div>

              <div className={`tab-pane ${activeTab === 'ecosystem' ? 'active' : ''}`}>
                <div className={styles.esysMock}>
                  <div className={styles.esysNode}><div className={styles.enIc} style={{ background: 'var(--grad-firma)' }}>◧</div><div className={styles.enT}>{isEN ? 'Website + Landing' : 'Web + Landing'}</div><div className={styles.enS}>{isEN ? 'Forms, SEO, tracking' : 'Formularios, SEO, tracking'}</div></div>
                  <div className={styles.esysConnector}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                  <div className={styles.esysNode}><div className={styles.enIc} style={{ background: 'var(--indigo)' }}>▤</div><div className={styles.enT}>CRM / E-mail</div><div className={styles.enS}>{isEN ? 'Lead capture, nurturing, follow-up' : 'Captación, nurturing, seguimiento'}</div></div>
                  <div className={styles.esysConnector}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                  <div className={styles.esysNode}><div className={styles.enIc} style={{ background: 'linear-gradient(135deg,var(--coral),var(--amber))' }}>▩</div><div className={styles.enT}>{isEN ? 'Analytics + AI' : 'Analytics + IA'}</div><div className={styles.enS}>{isEN ? 'Real-time panels, predictions' : 'Paneles en tiempo real, predicciones'}</div></div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow brand">{isEN ? 'Capabilities' : 'Capacidades'}</span>
              <h2>{isEN ? "What's inside every project" : 'Qué hay dentro de cada proyecto'}</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="fcard-grid">
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>◧</div><div className="fc-title">{isEN ? 'UX/UI Design' : 'Diseño UX/UI'}</div><div className="fc-desc">{isEN ? 'Each interface is designed for its user — not copied from a template. Information architecture, visual hierarchy and interactions built from scratch.' : 'Cada interfaz se diseña para su usuario — no copiada de una plantilla. Arquitectura de información, jerarquía visual e interacciones construidas desde cero.'}</div></div>
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>↗</div><div className="fc-title">{isEN ? 'Conversion funnels' : 'Embudos de conversión'}</div><div className="fc-desc">{isEN ? 'Multi-step funnels with conditional logic, automated follow-ups and conversion tracking at each stage.' : 'Embudos multi-paso con lógica condicional, seguimientos automáticos y tracking de conversión en cada etapa.'}</div></div>
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>🛍</div><div className="fc-title">E-commerce</div><div className="fc-desc">{isEN ? 'Catalog, cart, payments, inventory and orders — integrated with your CRM and your delivery or billing operations.' : 'Catálogo, carrito, pagos, inventario y pedidos — integrado con tu CRM y tu operación de entrega o facturación.'}</div></div>
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>⚡</div><div className="fc-title">{isEN ? 'Integrations' : 'Integraciones'}</div><div className="fc-desc">{isEN ? 'Connect with Mercado Pago, Stripe, WhatsApp, email marketing, CRMs, analytics platforms and more via API.' : 'Conectá con Mercado Pago, Stripe, WhatsApp, email marketing, CRMs, plataformas de analytics y más vía API.'}</div></div>
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>▩</div><div className="fc-title">{isEN ? 'Metrics & analytics' : 'Métricas y analítica'}</div><div className="fc-desc">{isEN ? 'Real-time dashboard with traffic, conversion rates, revenue, sources and customer behavior — all on one screen.' : 'Dashboard en tiempo real con tráfico, tasas de conversión, ingresos, fuentes y comportamiento de clientes — en una sola pantalla.'}</div></div>
              <div className="fcard"><div className="fc-ic" style={{ background: 'var(--violet)' }}>✦</div><div className="fc-title">{isEN ? 'AI Optimization' : 'Optimización IA'}</div><div className="fc-desc">{isEN ? 'The AI suggests copy tweaks, form changes and A/B variants based on real behavior from your site.' : 'La IA sugiere ajustes de copy, cambios en formularios y variantes A/B basados en el comportamiento real de tu sitio.'}</div></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section inner-dark">
        <div className="wrap">
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow on-dark">{isEN ? 'Intelligence' : 'Inteligencia'}</span>
              <h2>{isEN ? 'Know exactly where each sale comes from' : 'Sabe exactamente de dónde viene cada venta'}</h2>
              <p>{isEN ? 'Conversion panel that connects traffic source, lead stage and closed revenue in a single view.' : 'Panel de conversión que conecta fuente de tráfico, etapa del lead e ingreso cerrado en una sola vista.'}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 'var(--r-xl)', border: '1px solid rgba(255,255,255,.1)', padding: 'clamp(24px,3vw,44px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-on-dark-2)', marginBottom: '16px' }}>{isEN ? 'FUNNEL BY SOURCE' : 'EMBUDO POR FUENTE'}</p>
                <div style={{ display: 'grid', gap: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '.86rem', color: '#fff', width: '80px' }}>{isEN ? 'Organic' : 'Orgánico'}</span><div style={{ flex: 1, height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '100px', background: 'var(--grad-firma)', width: '82%' }}></div></div><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--ink-on-dark-2)' }}>82%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '.86rem', color: '#fff', width: '80px' }}>Paid</span><div style={{ flex: 1, height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '100px', background: 'var(--grad-firma)', width: '61%' }}></div></div><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--ink-on-dark-2)' }}>61%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '.86rem', color: '#fff', width: '80px' }}>{isEN ? 'Referral' : 'Referidos'}</span><div style={{ flex: 1, height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '100px', background: 'var(--grad-firma)', width: '44%' }}></div></div><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--ink-on-dark-2)' }}>44%</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '.86rem', color: '#fff', width: '80px' }}>Email</span><div style={{ flex: 1, height: '8px', borderRadius: '100px', background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '100px', background: 'var(--grad-firma)', width: '28%' }}></div></div><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--ink-on-dark-2)' }}>28%</span></div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 'var(--r-md)', padding: '18px', border: '1px solid rgba(255,255,255,.1)' }}>
                  <small style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--ink-on-dark-2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{isEN ? 'MONTHLY REVENUE' : 'INGRESOS MES'}</small>
                  <b style={{ display: 'block', fontSize: '1.7rem', letterSpacing: '-0.025em', color: '#fff', marginTop: '6px' }}>$284,000</b>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: '#1F9D5B' }}>▲ 34% vs. mes anterior</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 'var(--r-md)', padding: '18px', border: '1px solid rgba(255,255,255,.1)' }}>
                  <small style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--ink-on-dark-2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>CONVERSIÓN</small>
                  <b style={{ display: 'block', fontSize: '1.7rem', letterSpacing: '-0.025em', color: '#fff', marginTop: '6px' }}>14.2%</b>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: '#1F9D5B' }}>▲ 2.4 puntos</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ScrollReveal>
            <div className="ic-band">
              <div className="aurora"></div><div className="grid-floor"></div><div className="sheen"></div>
              <div className="ic-inner">
                <h2>{isEN ? <>A site built to <em>convert.</em></> : <>Un sitio construido para <em>convertir.</em></>}</h2>
                <p>{isEN ? 'We design the architecture, build the code and connect every tool your operation needs.' : 'Diseñamos la arquitectura, construimos el código y conectamos cada herramienta que tu operación necesita.'}</p>
                <div className="ic-cta">
                  <Link href="/contacto" className="btn btn-lg btn-on-dark">{isEN ? 'Start project' : 'Iniciar proyecto'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                  <Link href="/contacto" className="btn btn-lg btn-ghost btn-on-dark">{isEN ? 'Book a call' : 'Agendar llamada'}</Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
