'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import ScrollReveal from '@/components/ScrollReveal';
import ServiciosHero from '@/components/ServiciosHero';

import styles from './page.module.css';

export default function ServiciosPage() {
  const { lang } = useLang();
  
  // SVC Hero Picker State
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const toggleService = (svc: string) => {
    setSelectedServices(prev => 
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };
  
  // Explorer Tabs State
  const [activeTab, setActiveTab] = useState('web');
  
  // Builder State
  const [builderModules, setBuilderModules] = useState<string[]>([]);
  
  const toggleBuilderModule = (mod: string) => {
    setBuilderModules(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };
  
  const resetBuilder = () => setBuilderModules([]);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    document.body.classList.add('services-light-hero');
    // Failsafe for reveal
    document.documentElement.classList.add('reveal-armed');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('reveal-armed');
    }, 2500);
    return () => {
      document.body.classList.remove('services-light-hero');
      clearTimeout(timer);
    };
  }, []);

  const isEN = lang === 'en';

  const NAMES: Record<string, Record<string, string>> = {
    es: { web: 'Webs y comercio', crm: 'CRM / ERP', campus: 'Campus virtual', ia: 'Automatización IA' },
    en: { web: 'Web & Commerce', crm: 'CRM / ERP', campus: 'Virtual Campus', ia: 'AI Automation' }
  };
  
  const URLS: Record<string, string> = {
    web: '/servicios/web',
    crm: '/servicios/crm',
    campus: '/servicios/campus',
    ia: '/servicios/ia'
  };

  const getFeedbackContent = () => {
    if (selectedServices.length === 0) {
      return (
        <div className={styles.shvFeedbackEmpty}>
          {isEN ? "Select the solutions you're interested in." : 'Seleccioná las soluciones que te interesan.'}
        </div>
      );
    }
    
    const names = selectedServices.map((s, i) => (
      <React.Fragment key={s}>
        <strong>{NAMES[lang]?.[s] || NAMES['es'][s]}</strong>
        {i < selectedServices.length - 1 ? ', ' : ''}
      </React.Fragment>
    ));
    
    const url = selectedServices.length === 1 ? URLS[selectedServices[0]] : '/contacto';
    const cta = isEN ? 'Explore →' : 'Ver solución →';
    
    return (
      <div className={styles.shvFeedbackBanner}>
        <span className={styles.shvFeedbackText}>
          {isEN ? 'Ready: ' : ''}{names}
        </span>
        <Link href={url} className={styles.shvFeedbackCta}>
          {cta}
        </Link>
      </div>
    );
  };

  const MODULES: Record<string, any> = {
    web:          { name: 'Web', name_en: 'Website', cat: 'Presentación', cat_en: 'Presentation', color: '#7C5CFF', ic: '◧' },
    ecommerce:    { name: 'E-commerce', name_en: 'E-commerce', cat: 'Presentación', cat_en: 'Presentation', color: '#7C5CFF', ic: '🛍' },
    landing:      { name: 'Landing & embudos', name_en: 'Landing & funnels', cat: 'Presentación', cat_en: 'Presentation', color: '#7C5CFF', ic: '↗' },
    crm:          { name: 'CRM', name_en: 'CRM', cat: 'Operación', cat_en: 'Operations', color: '#3D38E0', ic: '▤' },
    erp:          { name: 'ERP', name_en: 'ERP', cat: 'Operación', cat_en: 'Operations', color: '#3D38E0', ic: '▦' },
    campus:       { name: 'Campus virtual', name_en: 'Virtual campus', cat: 'Operación', cat_en: 'Operations', color: '#3D38E0', ic: '◎' },
    dashboards:   { name: 'Dashboards', name_en: 'Dashboards', cat: 'Inteligencia', cat_en: 'Intelligence', color: '#FB7A5B', ic: '▩' },
    ia:           { name: 'IA aplicada', name_en: 'Applied AI', cat: 'Inteligencia', cat_en: 'Intelligence', color: '#FB7A5B', ic: '✦' },
    automat:      { name: 'Automatizaciones', name_en: 'Automations', cat: 'Inteligencia', cat_en: 'Intelligence', color: '#F4A93B', ic: '⚡' },
    integ:        { name: 'Integraciones', name_en: 'Integrations', cat: 'Inteligencia', cat_en: 'Intelligence', color: '#F4A93B', ic: '⇄' }
  };
  
  const CAT_ORDER: Record<string, number> = { 'Presentación': 0, 'Operación': 1, 'Inteligencia': 2 };
  
  const orderedBuilderModules = [...builderModules].sort((a, b) => CAT_ORDER[MODULES[a].cat] - CAT_ORDER[MODULES[b].cat]);
  
  const builderLayersCount = new Set(orderedBuilderModules.map(id => MODULES[id].cat)).size;

  return (
    <>
      <ServiciosHero />

      <section className={styles.svcPickerSection} aria-labelledby="svc-picker-title">
        <div className={styles.svcPickerWrap}>
          <div className={styles.svcPickerIntro}>
            <span className={styles.svcPickerEyebrow}>{isEN ? 'Compose' : 'Componer'}</span>
            <h2 id="svc-picker-title">{isEN ? 'Choose the layers your operation needs.' : 'Elegí las capas que necesita tu operación.'}</h2>
            <p>{isEN ? 'Select one solution to explore it, or combine layers to start from a custom architecture.' : 'Elegí una solución para explorarla o combiná capas para partir de una arquitectura a medida.'}</p>
          </div>

          <div className={styles.shvPicker}>
            <div className={styles.shvPickerLabel}>{isEN ? 'What do you need?' : '¿Qué necesitás?'}</div>
            <div className={styles.shvPills}>
              <button className={`${styles.shvPill} ${selectedServices.includes('web') ? styles.active : ''}`} data-svc="web" onClick={() => toggleService('web')}>
                <svg className={styles.pillCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{isEN ? 'Web & Commerce' : 'Webs y comercio'}</span>
              </button>
              <button className={`${styles.shvPill} ${selectedServices.includes('crm') ? styles.active : ''}`} data-svc="crm" onClick={() => toggleService('crm')}>
                <svg className={styles.pillCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                <span>CRM / ERP</span>
              </button>
              <button className={`${styles.shvPill} ${selectedServices.includes('campus') ? styles.active : ''}`} data-svc="campus" onClick={() => toggleService('campus')}>
                <svg className={styles.pillCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{isEN ? 'Virtual Campus' : 'Campus virtual'}</span>
              </button>
              <button className={`${styles.shvPill} ${selectedServices.includes('ia') ? styles.active : ''}`} data-svc="ia" onClick={() => toggleService('ia')}>
                <svg className={styles.pillCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                <span>{isEN ? 'AI Automation' : 'Automatización IA'}</span>
              </button>
            </div>
            <div>
              {getFeedbackContent()}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="explorador">
        <div className="wrap">
          <div className="head-block">
            <div>
              <ScrollReveal>
                <span className="eyebrow brand">{isEN ? 'Explore' : 'Explorar'}</span>
              </ScrollReveal>
              <ScrollReveal delay={60}>
                <h2 className="h-section">{isEN ? 'Pick a practice. See it in detail.' : 'Elegí una práctica. Vela en detalle.'}</h2>
              </ScrollReveal>
            </div>
            <ScrollReveal>
              <p className="lead" style={{ maxWidth: '32ch' }}>
                {isEN ? 'Each solution, with its real capabilities, deliverables and a live interface preview.' : 'Cada solución, con sus capacidades reales, entregables y una vista previa de la interfaz.'}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="explorer">
              <div className="explorer-shell">
                <div className="exp-rail" role="tablist" aria-label="Servicios">
                  <button className={`exp-tab ${activeTab === 'web' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'web'} onClick={() => setActiveTab('web')}>
                    <span className="et-ic" style={{ background: 'var(--violet)' }}>◧</span>
                    <span className="et-tx"><b>{isEN ? 'Web & commerce' : 'Webs y comercio'}</b><span>01 — Web</span></span>
                    <span className="et-prog"></span>
                    <span className="et-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </button>
                  <button className={`exp-tab ${activeTab === 'crm' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'crm'} onClick={() => setActiveTab('crm')}>
                    <span className="et-ic" style={{ background: 'var(--indigo)' }}>▤</span>
                    <span className="et-tx"><b>CRM / ERP</b><span>02 — Operación</span></span>
                    <span className="et-prog"></span>
                    <span className="et-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </button>
                  <button className={`exp-tab ${activeTab === 'campus' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'campus'} onClick={() => setActiveTab('campus')}>
                    <span className="et-ic" style={{ background: 'var(--coral)' }}>◎</span>
                    <span className="et-tx"><b>{isEN ? 'Virtual campus' : 'Campus virtual'}</b><span>03 — Campus</span></span>
                    <span className="et-prog"></span>
                    <span className="et-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </button>
                  <button className={`exp-tab ${activeTab === 'ia' ? 'active' : ''}`} role="tab" aria-selected={activeTab === 'ia'} onClick={() => setActiveTab('ia')}>
                    <span className="et-ic" style={{ background: 'var(--amber)' }}>✦</span>
                    <span className="et-tx"><b>{isEN ? 'AI automation' : 'Automatización IA'}</b><span>04 — IA</span></span>
                    <span className="et-prog"></span>
                    <span className="et-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
                  </button>
                </div>

                <div className="exp-stage">
                  <div className={`exp-panel ${activeTab === 'web' ? 'active' : ''}`} role="tabpanel">
                    <div className="ep-copy">
                      <span className="ep-tag">01 — WEB &amp; COMMERCE</span>
                      <h3>{isEN ? 'Sites that capture, measure and convert' : 'Sitios que capturan, miden y convierten'}</h3>
                      <p className="ep-desc">{isEN ? 'From a landing page to a full sales ecosystem — engineered for performance and connected to your data from day one.' : 'Desde una landing hasta un ecosistema de venta completo — diseñados para rendir y conectados a tus datos desde el día uno.'}</p>
                      <ul className="ep-feats">
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Landing & institutional sites' : 'Landings e institucionales'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>E-commerce</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Funnels & forms' : 'Embudos y formularios'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Lead tracking' : 'Seguimiento de leads'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'SEO & speed' : 'SEO y velocidad'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Metrics dashboard' : 'Panel de métricas'}</span></li>
                      </ul>
                      <div className="ep-deliver">
                        <span className="pill">{isEN ? 'Custom UX/UI' : 'UX/UI a medida'}</span>
                        <span className="pill">{isEN ? 'Responsive build' : 'Build responsive'}</span>
                        <span className="pill">{isEN ? 'CRM integration' : 'Integración con CRM'}</span>
                      </div>
                      <Link href="/contacto" className="btn ep-cta">{isEN ? 'Quote this solution' : 'Cotizar esta solución'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                    </div>
                    <div className="ep-media">
                      <div className="glow"></div>
                      <div className="ep-mock">
                        <div className="m-browser">
                          <div className="m-bbar"><i></i><i></i><i></i><span className="url">layercloud.dev</span></div>
                          <div className="m-bbody">
                            <div className="m-whero"></div>
                            <div className="m-wgrid"><i></i><i></i><i></i></div>
                            <div className="m-funnel">
                              <div className="fstep2"><div className="fbar"></div><small>{isEN ? 'Visits' : 'Visitas'}</small></div>
                              <span className="arr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
                              <div className="fstep2"><div className="fbar"></div><small>Leads</small></div>
                              <span className="arr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
                              <div className="fstep2"><div className="fbar"></div><small>{isEN ? 'Sales' : 'Ventas'}</small></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`exp-panel ${activeTab === 'crm' ? 'active' : ''}`} role="tabpanel">
                    <div className="ep-copy">
                      <span className="ep-tag">02 — CRM / ERP</span>
                      <h3>{isEN ? 'Your operation, in one system' : 'Tu operación, en un solo sistema'}</h3>
                      <p className="ep-desc">{isEN ? 'Commercial, operational, administrative and financial management — automated, with roles, states and AI on top.' : 'Gestión comercial, operativa, administrativa y financiera — automatizada, con roles, estados e IA por encima.'}</p>
                      <ul className="ep-feats">
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Sales management' : 'Gestión comercial'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Billing & inventory' : 'Facturación e inventario'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Roles & permissions' : 'Roles y permisos'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Workflows & states' : 'Flujos y estados'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Reports & dashboards' : 'Reportes y dashboards'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Predictive AI' : 'IA predictiva'}</span></li>
                      </ul>
                      <div className="ep-deliver">
                        <span className="pill">{isEN ? 'Tailored data model' : 'Modelo de datos a medida'}</span>
                        <span className="pill">{isEN ? 'Integrations' : 'Integraciones'}</span>
                        <span className="pill">{isEN ? 'Role-based panels' : 'Paneles por rol'}</span>
                      </div>
                      <Link href="/contacto" className="btn ep-cta">{isEN ? 'Quote this solution' : 'Cotizar esta solución'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                    </div>
                    <div className="ep-media">
                      <div className="glow"></div>
                      <div className="ep-mock">
                        <div className="m-crm">
                          <div className="m-crm-top">
                            <div className="m-kpi"><small>{isEN ? 'REVENUE' : 'INGRESOS'}</small><b>$1.42M<u>▲28%</u></b></div>
                            <div className="m-kpi"><small>{isEN ? 'DEALS' : 'DEALS'}</small><b>312<u>▲9%</u></b></div>
                          </div>
                          <div className="m-cols">
                            <div className="m-col"><div className="ch"><span>{isEN ? 'New' : 'Nuevo'}</span><span>4</span></div>
                              <div className="m-deal"><div className="dt">{isEN ? 'Retail Sur' : 'Comercio Sur'}</div><div className="dv">$320K</div><div className="db" style={{ width: '80%' }}></div></div>
                              <div className="m-deal"><div className="dt">Helios</div><div className="dv">$96K</div><div className="db" style={{ width: '48%' }}></div></div>
                            </div>
                            <div className="m-col"><div className="ch"><span>{isEN ? 'Won' : 'Ganado'}</span><span>2</span></div>
                              <div className="m-deal"><div className="dt">Vértice</div><div className="dv">$184K</div><div className="db" style={{ width: '92%' }}></div></div>
                            </div>
                            <div className="m-col"><div className="ch">IA</div>
                              <div className="m-deal" style={{ boxShadow: 'var(--shadow-sm),inset 0 0 0 1.5px rgba(124,92,255,.4)' }}><div className="dt">{isEN ? 'Priority' : 'Prioridad'}</div><div className="dv">{isEN ? '3 to close' : '3 por cerrar'}</div><div className="db" style={{ width: '70%' }}></div></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`exp-panel ${activeTab === 'campus' ? 'active' : ''}`} role="tabpanel">
                    <div className="ep-copy">
                      <span className="ep-tag">03 — CAMPUS</span>
                      <h3>{isEN ? 'Institution, teachers, students and families' : 'Institución, docentes, alumnos y familias'}</h3>
                      <p className="ep-desc">{isEN ? 'An advanced, automated campus where everyone stays connected and informed in real time — well beyond a simple Moodle.' : 'Un campus avanzado y automatizado donde todos se mantienen conectados e informados en tiempo real — mucho más que un Moodle.'}</p>
                      <ul className="ep-feats">
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Audiovisual content' : 'Contenido audiovisual'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Grades & report cards' : 'Notas y boletines'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Attendance alerts' : 'Alertas de ausencias'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Family notifications' : 'Notificaciones a familias'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Online enrollment' : 'Inscripción online'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Live voting & reminders' : 'Votaciones y recordatorios'}</span></li>
                      </ul>
                      <div className="ep-deliver">
                        <span className="pill">{isEN ? 'Role-based panels' : 'Paneles por rol'}</span>
                        <span className="pill">{isEN ? 'Mobile-first' : 'Mobile-first'}</span>
                        <span className="pill">{isEN ? 'Real-time' : 'Tiempo real'}</span>
                      </div>
                      <Link href="/contacto" className="btn ep-cta">{isEN ? 'Quote this solution' : 'Cotizar esta solución'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                    </div>
                    <div className="ep-media">
                      <div className="glow"></div>
                      <div className="ep-mock">
                        <div className="m-campus">
                          <div className="m-cnote"><span className="av" style={{ background: 'var(--grad-firma)' }}></span><span className="tx"><b>{isEN ? 'Report card · Math' : 'Boletín · Matemática'}</b><span>{isEN ? 'Sent to 28 families' : 'Enviado a 28 familias'}</span></span><span className="bell" style={{ background: 'rgba(244,169,59,.18)' }}>🔔</span></div>
                          <div className="m-crow"><div className="r"><b>{isEN ? 'Robotics — counter-shift' : 'Robótica — contraturno'}</b><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--ink-3)' }}>16:30</span></div><div className="bar"><i style={{ width: '64%' }}></i></div></div>
                          <div className="m-crow"><div className="r"><b>{isEN ? 'Student council vote' : 'Votación del centro'}</b><span className="live"><i></i><span>{isEN ? 'LIVE' : 'EN VIVO'}</span></span></div><div className="bar"><i style={{ width: '82%' }}></i></div></div>
                          <div className="m-cnote"><span className="av" style={{ background: 'var(--grad-soft)' }}></span><span className="tx"><b>{isEN ? 'Attendance 96%' : 'Asistencia 96%'}</b><span>{isEN ? 'This week · 4th grade' : 'Esta semana · 4° grado'}</span></span><span className="bell" style={{ background: 'rgba(31,157,91,.16)' }}>✓</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`exp-panel ${activeTab === 'ia' ? 'active' : ''}`} role="tabpanel">
                    <div className="ep-copy">
                      <span className="ep-tag">04 — AI AUTOMATION</span>
                      <h3>{isEN ? 'From lead to decision, automatically' : 'Del lead a la decisión, automáticamente'}</h3>
                      <p className="ep-desc">{isEN ? 'AI applied to your commercial and internal processes — capturing, qualifying, replying and measuring without your team chasing tasks.' : 'IA aplicada a tus procesos comerciales e internos — captando, calificando, respondiendo y midiendo sin que tu equipo persiga tareas.'}</p>
                      <ul className="ep-feats">
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Lead capture' : 'Captación de leads'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'AI qualification' : 'Calificación con IA'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Marketing campaigns' : 'Campañas de marketing'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Automated replies' : 'Respuestas automáticas'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Sales flows' : 'Flujos comerciales'}</span></li>
                        <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg><span>{isEN ? 'Integrations' : 'Integraciones'}</span></li>
                      </ul>
                      <div className="ep-deliver">
                        <span className="pill">{isEN ? 'AI agents' : 'Agentes IA'}</span>
                        <span className="pill">{isEN ? 'Measurement' : 'Medición'}</span>
                        <span className="pill">{isEN ? 'Tool integrations' : 'Integración de herramientas'}</span>
                      </div>
                      <Link href="/contacto" className="btn ep-cta">{isEN ? 'Quote this solution' : 'Cotizar esta solución'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                    </div>
                    <div className="ep-media">
                      <div className="glow"></div>
                      <div className="ep-mock">
                        <div className="m-flow">
                          <div className="m-fnode"><span className="ic" style={{ background: 'var(--indigo)' }}>↧</span><span><b>{isEN ? 'Lead arrives' : 'Entra un lead'}</b><small>{isEN ? 'Form / Ads / Web' : 'Formulario / Ads / Web'}</small></span><span className="bd">trigger</span></div>
                          <div className="m-fline"></div>
                          <div className="m-fnode"><span className="ic" style={{ background: 'var(--violet)' }}>✦</span><span><b>{isEN ? 'AI classifies & replies' : 'IA clasifica y responde'}</b><small>{isEN ? '0.8s avg.' : '0.8s prom.'}</small></span><span className="bd">AI</span></div>
                          <div className="m-fline"></div>
                          <div className="m-fnode"><span className="ic" style={{ background: 'var(--coral)' }}>▤</span><span><b>{isEN ? 'CRM updates state' : 'CRM actualiza estado'}</b><small>{isEN ? 'Owner assigned' : 'Responsable asignado'}</small></span><span className="bd">action</span></div>
                          <div className="m-fline"></div>
                          <div className="m-fnode"><span className="ic" style={{ background: 'linear-gradient(135deg,var(--coral),var(--amber))' }}>▩</span><span><b>{isEN ? 'Dashboard measures' : 'El panel mide'}</b><small>{isEN ? 'Conversion & results' : 'Conversión y resultados'}</small></span><span className="bd">insight</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section builder-sec" id="constructor">
        <div className="wrap">
          <div className="head-block">
            <div>
              <ScrollReveal>
                <span className="eyebrow brand">{isEN ? 'Compose your system' : 'Compone tu sistema'}</span>
              </ScrollReveal>
              <ScrollReveal delay={60}>
                <h2 className="h-section">{isEN ? <>Build it <em className="serif">layer by layer.</em></> : <>Constrúyelo <em className="serif">capa por capa.</em></>}</h2>
              </ScrollReveal>
            </div>
            <ScrollReveal>
              <p className="lead" style={{ maxWidth: '34ch' }}>
                {isEN ? 'Select the modules your operation needs and watch your custom architecture take shape in real time.' : 'Elegí los módulos que tu operación necesita y mirá cómo tu arquitectura a medida toma forma en tiempo real.'}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="builder">
              <div className="bld-cat">
                <div className="bld-group">
                  <div className="bg-head"><span className="sw" style={{ background: 'var(--violet)' }}></span><span>{isEN ? 'Presentation layer' : 'Capa de presentación'}</span></div>
                  <div className="bld-chips">
                    <button className={`bld-chip ${builderModules.includes('web') ? 'on' : ''}`} aria-pressed={builderModules.includes('web')} onClick={() => toggleBuilderModule('web')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span>Web</button>
                    <button className={`bld-chip ${builderModules.includes('ecommerce') ? 'on' : ''}`} aria-pressed={builderModules.includes('ecommerce')} onClick={() => toggleBuilderModule('ecommerce')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span>E-commerce</button>
                    <button className={`bld-chip ${builderModules.includes('landing') ? 'on' : ''}`} aria-pressed={builderModules.includes('landing')} onClick={() => toggleBuilderModule('landing')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>{isEN ? 'Landing & funnels' : 'Landing y embudos'}</span></button>
                  </div>
                </div>
                <div className="bld-group">
                  <div className="bg-head"><span className="sw" style={{ background: 'var(--indigo)' }}></span><span>{isEN ? 'Operations layer' : 'Capa de operación'}</span></div>
                  <div className="bld-chips">
                    <button className={`bld-chip ${builderModules.includes('crm') ? 'on' : ''}`} aria-pressed={builderModules.includes('crm')} onClick={() => toggleBuilderModule('crm')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span>CRM</button>
                    <button className={`bld-chip ${builderModules.includes('erp') ? 'on' : ''}`} aria-pressed={builderModules.includes('erp')} onClick={() => toggleBuilderModule('erp')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span>ERP</button>
                    <button className={`bld-chip ${builderModules.includes('campus') ? 'on' : ''}`} aria-pressed={builderModules.includes('campus')} onClick={() => toggleBuilderModule('campus')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>{isEN ? 'Virtual campus' : 'Campus virtual'}</span></button>
                  </div>
                </div>
                <div className="bld-group">
                  <div className="bg-head"><span className="sw" style={{ background: 'linear-gradient(90deg,var(--coral),var(--amber))' }}></span><span>{isEN ? 'Intelligence layer' : 'Capa de inteligencia'}</span></div>
                  <div className="bld-chips">
                    <button className={`bld-chip ${builderModules.includes('dashboards') ? 'on' : ''}`} aria-pressed={builderModules.includes('dashboards')} onClick={() => toggleBuilderModule('dashboards')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span>Dashboards</button>
                    <button className={`bld-chip ${builderModules.includes('ia') ? 'on' : ''}`} aria-pressed={builderModules.includes('ia')} onClick={() => toggleBuilderModule('ia')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>{isEN ? 'Applied AI' : 'IA aplicada'}</span></button>
                    <button className={`bld-chip ${builderModules.includes('automat') ? 'on' : ''}`} aria-pressed={builderModules.includes('automat')} onClick={() => toggleBuilderModule('automat')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>{isEN ? 'Automations' : 'Automatizaciones'}</span></button>
                    <button className={`bld-chip ${builderModules.includes('integ') ? 'on' : ''}`} aria-pressed={builderModules.includes('integ')} onClick={() => toggleBuilderModule('integ')}><span className="bc-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>{isEN ? 'Integrations' : 'Integraciones'}</span></button>
                  </div>
                </div>
                <button className="bld-reset" onClick={resetBuilder}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>
                  <span>{isEN ? 'Reset selection' : 'Reiniciar selección'}</span>
                </button>
              </div>

              <div className="bld-preview">
                <div className="bp-glow" aria-hidden="true"></div>
                <div className="bp-head">
                  <span className="t">{isEN ? 'Your architecture' : 'Tu arquitectura'}</span>
                  <span className="count"><b>{builderModules.length}</b> <span>{isEN ? 'modules' : 'módulos'}</span></span>
                </div>
                <div className="bp-stack">
                  {orderedBuilderModules.length === 0 ? (
                    <div className="bp-empty">
                      {isEN ? 'Select modules to compose your system, layer by layer.' : 'Elegí módulos para componer tu sistema, capa por capa.'}
                    </div>
                  ) : (
                    orderedBuilderModules.map(id => {
                      const m = MODULES[id];
                      return (
                        <div key={id} className="bp-layer">
                          <span className="bl-ic" style={{ background: m.color }}>{m.ic}</span>
                          <b>{isEN ? m.name_en : m.name}</b>
                          <span className="bl-cat">{isEN ? m.cat_en : m.cat}</span>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="bp-summary">
                  <p>
                    {builderModules.length === 0 
                      ? (isEN ? 'Your custom architecture builds here as you choose what your operation needs.' : 'Acá se construye tu arquitectura a medida según lo que tu operación necesita.')
                      : (isEN 
                          ? <>A system of <b>{builderModules.length} modules</b> across <b>{builderLayersCount} layer{builderLayersCount > 1 ? 's' : ''}</b>, connected into one architecture.</>
                          : <>Un sistema de <b>{builderModules.length} módulos</b> en <b>{builderLayersCount} capa{builderLayersCount > 1 ? 's' : ''}</b>, conectados en una sola arquitectura.</>
                        )
                    }
                  </p>
                  <Link href="/contacto" className="btn btn-on-dark">{isEN ? 'Quote this system' : 'Cotizar este sistema'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section" id="matriz">
        <div className="wrap">
          <div className="head-block">
            <div>
              <ScrollReveal>
                <span className="eyebrow brand">{isEN ? 'Compare' : 'Comparar'}</span>
              </ScrollReveal>
              <ScrollReveal delay={60}>
                <h2 className="h-section">{isEN ? 'What each solution includes.' : 'Qué incluye cada solución.'}</h2>
              </ScrollReveal>
            </div>
            <ScrollReveal>
              <p className="lead" style={{ maxWidth: '32ch' }}>
                {isEN ? 'Core capabilities across our four practices — every project is tailored from here.' : 'Capacidades base de nuestras cuatro prácticas — cada proyecto se ajusta desde acá.'}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="matrix-wrap">
              <table className="matrix">
                <thead>
                  <tr>
                    <th>{isEN ? 'Capability' : 'Capacidad'}</th>
                    <th className="mid">{isEN ? 'Web' : 'Web'}</th>
                    <th className="mid">CRM / ERP</th>
                    <th className="mid">Campus</th>
                    <th className="mid">IA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{isEN ? 'Custom UX/UI design' : 'Diseño UX/UI a medida'}</td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-no">—</span></td>
                  </tr>
                  <tr>
                    <td>{isEN ? 'Dashboards & reports' : 'Dashboards y reportes'}</td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                  </tr>
                  <tr>
                    <td>{isEN ? 'Roles & permissions' : 'Roles y permisos'}</td>
                    <td className="mid"><span className="mx-no">—</span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-no">—</span></td>
                  </tr>
                  <tr>
                    <td>{isEN ? 'Process automation' : 'Automatización de procesos'}</td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                  </tr>
                  <tr>
                    <td>{isEN ? 'Applied AI & insights' : 'IA aplicada e insights'}</td>
                    <td className="mid"><span className="mx-no">—</span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-no">—</span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                  </tr>
                  <tr>
                    <td>{isEN ? 'Third-party integrations' : 'Integraciones con terceros'}</td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                    <td className="mid"><span className="mx-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-tight" id="faq" style={{ background: 'var(--paper-3)' }}>
        <div className="wrap">
          <div className="head-block">
            <div>
              <ScrollReveal>
                <span className="eyebrow brand">{isEN ? 'Questions' : 'Preguntas'}</span>
              </ScrollReveal>
              <ScrollReveal delay={60}>
                <h2 className="h-section">{isEN ? 'Before you start.' : 'Antes de empezar.'}</h2>
              </ScrollReveal>
            </div>
            <ScrollReveal>
              <p className="lead" style={{ maxWidth: '30ch' }}>
                {isEN ? 'The things teams usually ask us first.' : 'Lo que los equipos suelen preguntarnos primero.'}
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <div className="faq">
              <div className={`faq-item ${openFaq === 0 ? 'open' : ''}`}>
                <button className="faq-q" aria-expanded={openFaq === 0} onClick={() => toggleFaq(0)}>
                  <span>{isEN ? 'Do you work with templates?' : '¿Trabajan con plantillas?'}</span>
                  <span className="fq-ic"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === 0 ? '500px' : undefined }}>
                  <div className="faq-a-inner">
                    {isEN ? 'No. Every system is engineered from scratch around your real processes and data. The builder above shows how we compose each architecture, module by module.' : 'No. Cada sistema se construye desde cero sobre tus procesos y datos reales. El constructor de arriba muestra cómo componemos cada arquitectura, módulo a módulo.'}
                  </div>
                </div>
              </div>
              <div className={`faq-item ${openFaq === 1 ? 'open' : ''}`}>
                <button className="faq-q" aria-expanded={openFaq === 1} onClick={() => toggleFaq(1)}>
                  <span>{isEN ? 'Can I start with one solution and grow later?' : '¿Puedo empezar con una solución y crecer después?'}</span>
                  <span className="fq-ic"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === 1 ? '500px' : undefined }}>
                  <div className="faq-a-inner">
                    {isEN ? "Yes — that's the point of the layered approach. You can start with a website or CRM and add operations, campus or AI layers as your operation scales." : 'Sí — ese es el sentido del enfoque por capas. Podés empezar con una web o un CRM y sumar capas de operación, campus o IA a medida que tu operación escala.'}
                  </div>
                </div>
              </div>
              <div className={`faq-item ${openFaq === 2 ? 'open' : ''}`}>
                <button className="faq-q" aria-expanded={openFaq === 2} onClick={() => toggleFaq(2)}>
                  <span>{isEN ? 'How does AI fit into my system?' : '¿Cómo se integra la IA en mi sistema?'}</span>
                  <span className="fq-ic"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === 2 ? '500px' : undefined }}>
                  <div className="faq-a-inner">
                    {isEN ? 'AI sits on top of your data: it qualifies leads, suggests priorities, automates replies and surfaces insights — always grounded in the specific data of your business.' : 'La IA se apoya sobre tus datos: califica leads, sugiere prioridades, automatiza respuestas y revela insights — siempre a partir de los datos específicos de tu negocio.'}
                  </div>
                </div>
              </div>
              <div className={`faq-item ${openFaq === 3 ? 'open' : ''}`}>
                <button className="faq-q" aria-expanded={openFaq === 3} onClick={() => toggleFaq(3)}>
                  <span>{isEN ? 'How long does a project take?' : '¿Cuánto tarda un proyecto?'}</span>
                  <span className="fq-ic"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === 3 ? '500px' : undefined }}>
                  <div className="faq-a-inner">
                    {isEN ? 'It depends on scope, but most systems go from kickoff to launch in a defined timeline we agree up front, with deliverables at each stage of the method.' : 'Depende del alcance, pero la mayoría de los sistemas van del kickoff al lanzamiento en un plazo definido que acordamos al inicio, con entregables en cada etapa del método.'}
                  </div>
                </div>
              </div>
              <div className={`faq-item ${openFaq === 4 ? 'open' : ''}`}>
                <button className="faq-q" aria-expanded={openFaq === 4} onClick={() => toggleFaq(4)}>
                  <span>{isEN ? 'Do you offer support after launch?' : '¿Ofrecen soporte después del lanzamiento?'}</span>
                  <span className="fq-ic"></span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === 4 ? '500px' : undefined }}>
                  <div className="faq-a-inner">
                    {isEN ? 'Yes. We measure, improve and scale the system with you — the last stage of our method is ongoing, not a hand-off.' : 'Sí. Medimos, mejoramos y escalamos el sistema con vos — la última etapa de nuestro método es continua, no una entrega y adiós.'}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ScrollReveal>
            <div className="cta-band dark-zone">
              <div className="cta-anim" aria-hidden="true">
                <span className="cta-aurora"></span>
                <span className="cta-grid"></span>
                <span className="cta-sheen"></span>
                <span className="blob b1"></span><span className="blob b2"></span><span className="blob b3"></span>
              </div>
              <div className="cta-inner">
                <h2>{isEN ? <>Let&apos;s build the system your <em>operation</em> needs.</> : <>Construyamos el sistema que tu <em>operación</em> necesita.</>}</h2>
                <p>{isEN ? 'Tell us which process you want to organize, automate or scale. We design the architecture, interfaces and automations to turn it into real software.' : 'Contanos qué proceso querés ordenar, automatizar o escalar. Diseñamos la arquitectura, las interfaces y las automatizaciones necesarias para convertirlo en software real.'}</p>
                <div className="svc-hero-cta">
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
