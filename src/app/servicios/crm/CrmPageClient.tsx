'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CrmHero from '@/components/CrmHero';
import { useLang } from '@/context/LangContext';
import styles from './page.module.css';

type SpecData = {
  title: string;
  desc: string;
  num: string;
  icon: React.ReactNode;
  bullets: string[];
};

export default function CRMServicesPage() {
  const { lang } = useLang();
  const [specOpen, setSpecOpen] = useState(false);
  const [specData, setSpecData] = useState<SpecData>({ title: '', desc: '', num: '', icon: null, bullets: [] });

  useEffect(() => {
    document.body.classList.add('video-hero');

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-crm-reveal]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | null = null;

    if (!reduceMotion && revealElements.length > 0) {
      document.documentElement.classList.add('crm-reveal-armed');
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute('data-crm-visible', 'true');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
      );

      revealElements.forEach((element) => observer?.observe(element));
    } else {
      revealElements.forEach((element) => element.setAttribute('data-crm-visible', 'true'));
    }

    return () => {
      document.body.classList.remove('video-hero');
      document.documentElement.classList.remove('crm-reveal-armed');
      observer?.disconnect();
      revealElements.forEach((element) => element.removeAttribute('data-crm-visible'));
    };
  }, []);

  const pipelineIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );

  const automationIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );

  const integrationIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );

  const modules = [
    {
      num: '01',
      title: lang === 'en' ? 'Visual Pipeline' : 'Pipeline Visual',
      desc:
        lang === 'en'
          ? 'Track every opportunity from first contact to closing, without guessing where the deal stands.'
          : 'Seguís cada oportunidad desde el primer contacto hasta el cierre, sin adivinar dónde está la venta.',
      drawerTitle: 'Pipeline Visual',
      drawerDesc:
        lang === 'en'
          ? 'A commercial board designed around your real sales stages.'
          : 'Un tablero comercial diseñado alrededor de tus etapas reales de venta.',
      bullets:
        lang === 'en'
          ? ['Stages that match your process', 'Owners, next steps and deal value', 'Lost reasons and bottlenecks visible']
          : ['Etapas según tu proceso real', 'Responsables, próximos pasos y monto', 'Motivos de pérdida y cuellos de botella visibles'],
      icon: pipelineIcon,
    },
    {
      num: '02',
      title: lang === 'en' ? 'Automations' : 'Automatizaciones',
      desc:
        lang === 'en'
          ? 'Stop relying on memory: reminders, assignments, approvals and follow-ups happen on their own.'
          : 'Dejás de depender de la memoria: recordatorios, asignaciones, aprobaciones y seguimientos salen solos.',
      drawerTitle: lang === 'en' ? 'Automations' : 'Automatizaciones',
      drawerDesc:
        lang === 'en'
          ? 'Business rules that keep the team moving without manual chasing.'
          : 'Reglas de negocio para que el equipo avance sin perseguir tareas a mano.',
      bullets:
        lang === 'en'
          ? ['Follow-up alerts', 'Automatic owner assignment', 'Approval and quote flows']
          : ['Alertas de seguimiento', 'Asignación automática de responsables', 'Flujos de aprobación y cotización'],
      icon: automationIcon,
    },
    {
      num: '03',
      title: lang === 'en' ? 'Integrations' : 'Integraciones',
      desc:
        lang === 'en'
          ? 'WhatsApp, email, forms, billing and reports working from the same source of truth.'
          : 'WhatsApp, email, formularios, facturación y reportes trabajando desde una sola fuente de verdad.',
      drawerTitle: lang === 'en' ? 'Integrations' : 'Integraciones',
      drawerDesc:
        lang === 'en'
          ? 'Connections with the tools your business already uses.'
          : 'Conexión con las herramientas que tu negocio ya usa.',
      bullets:
        lang === 'en'
          ? ['WhatsApp and email history', 'Forms and lead capture', 'Exports, APIs and billing links']
          : ['Historial de WhatsApp y email', 'Formularios y captura de leads', 'Exportaciones, APIs y conexión con facturación'],
      icon: integrationIcon,
    },
  ];

  const painPoints = [
    {
      title: lang === 'en' ? 'Leads arrive, but nobody owns them' : 'Entran consultas, pero nadie sabe quién las tomó',
      pain:
        lang === 'en'
          ? 'The lead comes from WhatsApp, web, referral or Instagram. If it is not assigned fast, it goes cold.'
          : 'El lead cae por WhatsApp, web, referido o Instagram. Si no se asigna rápido, se enfría.',
      fix: lang === 'en' ? 'We centralize capture, assign owners and show what must happen next.' : 'Centralizamos la entrada, asignamos responsable y dejamos claro qué sigue.',
    },
    {
      title: lang === 'en' ? 'Every salesperson has their own spreadsheet' : 'Cada vendedor tiene su planilla',
      pain:
        lang === 'en'
          ? 'Management sees part of the truth, late and usually after asking three times.'
          : 'La dirección ve una parte de la verdad, tarde y después de pedirla tres veces.',
      fix: lang === 'en' ? 'One live pipeline, with clean stages, values, probability and reasons.' : 'Un pipeline vivo, con etapas claras, montos, probabilidad y motivos.',
    },
    {
      title: lang === 'en' ? 'Quotes depend on who answers' : 'La cotización depende de quién responde',
      pain:
        lang === 'en'
          ? 'Prices, discounts and conditions change by person. Margin leaks without anyone noticing.'
          : 'Precios, descuentos y condiciones cambian según la persona. El margen se escapa sin que nadie lo vea.',
      fix: lang === 'en' ? 'Rules, approvals and quote flows that protect the business.' : 'Reglas, aprobaciones y flujos de cotización que protegen el negocio.',
    },
    {
      title: lang === 'en' ? 'Post-sale lives in chats' : 'La postventa vive en chats',
      pain:
        lang === 'en'
          ? 'Claims, renewals, deliveries and support are scattered across conversations.'
          : 'Reclamos, renovaciones, entregas y soporte quedan repartidos en conversaciones.',
      fix: lang === 'en' ? 'Customer history, tickets and tasks connected to the same account.' : 'Historial del cliente, tickets y tareas conectadas a la misma cuenta.',
    },
    {
      title: lang === 'en' ? 'The owner asks for numbers and nobody has them' : 'El dueño pide números y nadie los tiene',
      pain:
        lang === 'en'
          ? 'Revenue forecast, pending quotes, churn risk and team performance are built manually.'
          : 'Forecast, cotizaciones pendientes, riesgo de baja y rendimiento del equipo se arman a mano.',
      fix: lang === 'en' ? 'Dashboards that show the business without waiting for a report.' : 'Paneles que muestran el negocio sin esperar un reporte.',
    },
    {
      title: lang === 'en' ? 'Tools are added, but the operation stays messy' : 'Se suman herramientas, pero la operación sigue desordenada',
      pain:
        lang === 'en'
          ? 'A generic CRM forces your team to adapt to someone else’s process.'
          : 'Un CRM genérico obliga a tu equipo a adaptarse al proceso de otro.',
      fix: lang === 'en' ? 'We build the technology around how your company actually works.' : 'Construimos la tecnología alrededor de cómo trabaja tu empresa de verdad.',
    },
  ];

  const processSteps = [
    {
      step: '01',
      title: lang === 'en' ? 'We map the business' : 'Mapeamos el negocio',
      text:
        lang === 'en'
          ? 'Sales, admin, delivery, support, billing and management. We look at the whole route, not an isolated screen.'
          : 'Ventas, administración, entrega, soporte, facturación y dirección. Miramos la ruta completa, no una pantalla aislada.',
    },
    {
      step: '02',
      title: lang === 'en' ? 'We define the rules' : 'Definimos las reglas',
      text:
        lang === 'en'
          ? 'Stages, permissions, alerts, approvals, responsibilities and data that must never get lost.'
          : 'Etapas, permisos, alertas, aprobaciones, responsables y datos que no se pueden perder.',
    },
    {
      step: '03',
      title: lang === 'en' ? 'We build your system' : 'Construimos tu sistema',
      text:
        lang === 'en'
          ? 'CRM, ERP, automations and dashboards designed as one operation, not as a pile of tools.'
          : 'CRM, ERP, automatizaciones y paneles diseñados como una operación, no como una pila de herramientas.',
    },
    {
      step: '04',
      title: lang === 'en' ? 'We leave you on top' : 'Te dejamos en la cima',
      text:
        lang === 'en'
          ? 'Your team works with clarity, leadership sees the numbers, and the system keeps improving with the business.'
          : 'Tu equipo trabaja con claridad, la dirección ve los números y el sistema mejora con el negocio.',
    },
  ];

  const openSpec = (num: string, title: string, desc: string, icon: React.ReactNode, bullets: string[]) => {
    setSpecData({ num, title, desc, icon, bullets });
    setSpecOpen(true);
  };

  return (
    <>
      <CrmHero />

      <section className={styles.b2bIntro} id="crm-b2b">
        <div className={styles.introWrap}>
          <div className={styles.introCopy} data-crm-reveal>
            <span className={styles.crmEyebrow}>{lang === 'en' ? 'For B2B businesses' : 'Para negocios B2B'}</span>
            <h2>{lang === 'en' ? 'If you sell to companies, your operation cannot live in memory.' : 'Si vendés a empresas, tu operación no puede vivir en la memoria.'}</h2>
            <p>
              {lang === 'en'
                ? 'B2B means business to business: one company sells to another company. The deal is longer, more people decide, pricing matters, follow-up matters, and trust is built with consistency.'
                : 'B2B significa business to business: una empresa le vende a otra empresa. La venta tarda más, decide más de una persona, el precio importa, el seguimiento importa y la confianza se gana siendo consistente.'}
            </p>
          </div>
          <div className={styles.introPanel} data-crm-reveal style={{ '--i': 1 } as React.CSSProperties}>
            <b>{lang === 'en' ? 'In plain language:' : 'En criollo:'}</b>
            <p>
              {lang === 'en'
                ? 'Your buyer is not just “a lead”. It is a company comparing providers, asking internally, measuring risk and deciding if you can solve the problem without creating another one.'
                : 'Tu comprador no es “un lead” y listo. Es una empresa comparando proveedores, preguntando internamente, midiendo riesgo y decidiendo si podés resolverle el problema sin crearle otro.'}
            </p>
            <div className={styles.introTags}>
              <span>{lang === 'en' ? 'Longer decisions' : 'Decisiones más largas'}</span>
              <span>{lang === 'en' ? 'More stakeholders' : 'Más decisores'}</span>
              <span>{lang === 'en' ? 'More follow-up' : 'Más seguimiento'}</span>
              <span>{lang === 'en' ? 'More need for data' : 'Más necesidad de datos'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.painSection} id="crm-dolores">
        <div className={styles.sectionHead} data-crm-reveal>
          <span className={styles.crmEyebrow}>{lang === 'en' ? 'Where it hurts' : 'Dónde duele'}</span>
          <h2>{lang === 'en' ? 'We know the mess because it always shows up in the same places.' : 'Sabemos dónde se arma el lío porque casi siempre aparece en los mismos lugares.'}</h2>
          <p>
            {lang === 'en'
              ? 'Most companies do not lose sales because they lack effort. They lose them because information arrives late, tasks depend on memory and the process changes depending on who is working.'
              : 'La mayoría de las empresas no pierde ventas por falta de esfuerzo. Las pierde porque la información llega tarde, las tareas dependen de la memoria y el proceso cambia según quién esté trabajando.'}
          </p>
        </div>

        <div className={styles.painGrid}>
          {painPoints.map((item, index) => (
            <article className={styles.painCard} key={item.title} data-crm-reveal style={{ '--i': index } as React.CSSProperties}>
              <h3>{item.title}</h3>
              <p>{item.pain}</p>
              <div className={styles.fixLine}>
                <span>{lang === 'en' ? 'We build:' : 'Construimos:'}</span>
                <b>{item.fix}</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ownershipBand} id="crm-propio">
        <div className={styles.ownershipInner} data-crm-reveal>
          <span className={styles.crmEyebrow}>{lang === 'en' ? 'Not another license' : 'No es otra licencia'}</span>
          <h2>{lang === 'en' ? 'We do not give you a technology. We give you your technology.' : 'No te damos una tecnología. Te damos tu tecnología.'}</h2>
          <p>
            {lang === 'en'
              ? 'A generic CRM tells your company how to work. A custom CRM/ERP learns your route: how you sell, quote, deliver, collect, support and decide. That is the difference between buying software and building an operating advantage.'
              : 'Un CRM genérico le dice a tu empresa cómo trabajar. Un CRM/ERP a medida aprende tu recorrido: cómo vendés, cotizás, entregás, cobrás, atendés y decidís. Esa es la diferencia entre comprar software y construir una ventaja operativa.'}
          </p>
          <div className={styles.promiseList}>
            <span>{lang === 'en' ? 'Your process' : 'Tu proceso'}</span>
            <span>{lang === 'en' ? 'Your language' : 'Tu lenguaje'}</span>
            <span>{lang === 'en' ? 'Your roles' : 'Tus roles'}</span>
            <span>{lang === 'en' ? 'Your numbers' : 'Tus números'}</span>
          </div>
        </div>
      </section>

      <section className={styles.processSection} id="crm-proceso">
        <div className={styles.sectionHead} data-crm-reveal>
          <span className={styles.crmEyebrow}>{lang === 'en' ? 'How we take you there' : 'Cómo llegamos a esa cima'}</span>
          <h2>{lang === 'en' ? 'The goal is not to install a CRM. The goal is to leave the business operating better.' : 'El objetivo no es instalar un CRM. El objetivo es dejar el negocio funcionando mejor.'}</h2>
        </div>
        <div className={styles.processGrid}>
          {processSteps.map((item, index) => (
            <article className={styles.processStep} key={item.step} data-crm-reveal style={{ '--i': index } as React.CSSProperties}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.modulesSection} id="crm-modulos">
        <div className={styles.sectionHead} data-crm-reveal>
          <span className={styles.crmEyebrow}>{lang === 'en' ? 'Core modules' : 'Módulos centrales'}</span>
          <h2>{lang === 'en' ? 'The system starts where your operation needs order first.' : 'El sistema empieza donde tu operación necesita orden primero.'}</h2>
          <p>
            {lang === 'en'
              ? 'We can start with sales, administration, integrations or reporting. The important part is that every module is born connected.'
              : 'Podemos empezar por ventas, administración, integraciones o reportes. Lo importante es que cada módulo nace conectado.'}
          </p>
        </div>

        <div className={styles.modGrid}>
          {modules.map((module, index) => (
            <button
              type="button"
              key={module.num}
              className={styles.modCard}
              data-crm-reveal
              style={{ '--i': index } as React.CSSProperties}
              onClick={() => openSpec(module.num, module.drawerTitle, module.drawerDesc, module.icon, module.bullets)}
            >
              <div className={styles.mcAccent}></div>
              <div className={styles.mcTop}>
                <div className={styles.mcNum}>MOD_{module.num}</div>
                <div className={styles.mcIcon}>{module.icon}</div>
              </div>
              <div className={styles.mcTitle}>{module.title}</div>
              <div className={styles.mcDesc}>{module.desc}</div>
              <div className={styles.mcCta}>
                {lang === 'en' ? 'See details' : 'Ver detalles'}{' '}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="crm-contacto">
        <div className={styles.finalGlow} aria-hidden="true"></div>
        <div className={styles.finalInner} data-crm-reveal>
          <span className={styles.crmEyebrow}>{lang === 'en' ? 'Next step' : 'Próximo paso'}</span>
          <h2>{lang === 'en' ? 'Let’s turn your way of working into a system your team wants to use.' : 'Convirtamos tu forma de trabajar en un sistema que tu equipo quiera usar.'}</h2>
          <p>
            {lang === 'en'
              ? 'Tell us where the operation gets stuck today. We map it, order it and build the platform that leaves you there: at the top, with control.'
              : 'Contanos dónde se traba hoy la operación. La mapeamos, la ordenamos y construimos la plataforma que te deja ahí: arriba, con control.'}
          </p>
          <div className={styles.finalActions}>
            <Link href="/contacto" className="btn btn-lg btn-on-dark">
              {lang === 'en' ? 'Start project' : 'Iniciar proyecto'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="/contacto" className="btn btn-lg btn-ghost btn-on-dark">
              {lang === 'en' ? 'Book a call' : 'Agendar llamada'}
            </Link>
          </div>
        </div>
      </section>

      <div className={`${styles.specOverlay} ${specOpen ? styles.open : ''}`} onClick={() => setSpecOpen(false)}></div>
      <div className={`${styles.specDrawer} ${specOpen ? styles.open : ''}`}>
        <div className={styles.sdHead}>
          <div className={styles.sdIconWrap}>{specData.icon}</div>
          <div className={styles.sdInfo}>
            <div className={styles.sdNum}>MOD_{specData.num}</div>
            <h3 className={styles.sdTitle}>{specData.title}</h3>
            <div className={styles.sdSubtitle}>{specData.desc}</div>
          </div>
          <button className={styles.sdClose} onClick={() => setSpecOpen(false)} aria-label={lang === 'en' ? 'Close' : 'Cerrar'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.sdBody}>
          <div className={styles.ssBlock}>
            <h4>{lang === 'en' ? 'OVERVIEW' : 'VISIÓN GENERAL'}</h4>
            <p className={styles.ssDesc}>{specData.desc}</p>
          </div>
          {specData.bullets.length > 0 && (
            <div className={styles.ssBlock}>
              <h4>{lang === 'en' ? 'WHAT IT INCLUDES' : 'QUÉ INCLUYE'}</h4>
              <ul className={styles.ssList}>
                {specData.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className={styles.sdFoot}>
          <Link href="/contacto" className="btn primary">
            {lang === 'en' ? 'Request demo' : 'Solicitar demo'}
          </Link>
        </div>
      </div>
    </>
  );
}
