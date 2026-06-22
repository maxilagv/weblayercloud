'use client';

import React, { useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import ContactForm from '@/components/ContactForm';
import styles from './page.module.css';

export default function ContactPage() {
  const { lang } = useLang();

  useEffect(() => {
    document.body.classList.add('contact-page');
    return () => {
      document.body.classList.remove('contact-page');
    };
  }, []);

  const toggleFaq = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = e.currentTarget;
    const isOpen = item.classList.contains(styles.open);
    
    // Close all other FAQs
    const allFaqs = document.querySelectorAll(`.${styles.faqItem}`);
    allFaqs.forEach(f => f.classList.remove(styles.open));
    
    if (!isOpen) {
      item.classList.add(styles.open);
    }
  };

  return (
    <div className={styles.ctPage}>
      <div className={styles.ctWrap}>
        
        {/* LEFT */}
        <div className={styles.ctLeft}>
          <div className={styles.ctEyebrow}>{lang === 'en' ? 'Start your project' : 'Iniciá tu proyecto'}</div>
          <h1 className={styles.ctHeadline}>
            {lang === 'en' ? 
              <><em>Let's build</em> the system your operation needs.</> : 
              <><em>Construyamos</em> el sistema que tu operación necesita.</>
            }
          </h1>
          <p className={styles.ctSub}>
            {lang === 'en' ? 
              'Tell us what you need. We diagnose, design the architecture, build the interfaces and automate the processes — from scratch.' : 
              'Contanos qué necesitás. Diagnosticamos, diseñamos la arquitectura, construimos las interfaces y automatizamos los procesos — desde cero.'
            }
          </p>

          <div className={styles.ctTimeline}>
            {[
              { id: 1, title: 'Completás el formulario', titleEn: 'Complete the form', desc: '3 pasos, menos de 3 minutos', descEn: '3 steps, less than 3 minutes' },
              { id: 2, title: 'Te contactamos en 24h', titleEn: 'We contact you in 24h', desc: 'Llamada o mensaje para entender el contexto', descEn: 'Call or message to understand the context' },
              { id: 3, title: 'Diagnóstico del negocio', titleEn: 'Business diagnosis', desc: 'Sesión de discovery para mapear procesos y datos', descEn: 'Discovery session to map processes and data' },
              { id: 4, title: 'Arquitectura y propuesta', titleEn: 'Architecture and proposal', desc: 'Diseño del sistema, plazos e inversión', descEn: 'System design, timeline and investment' }
            ].map(step => (
              <div key={step.id} className={styles.ctlStep} id={`tl-${step.id}`}>
                <div className={styles.ctlLine}>
                  <div className={styles.ctlDot}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  {step.id < 4 && <div className={styles.ctlConnector}></div>}
                </div>
                <div className={styles.ctlBody}>
                  <div className={styles.ctlTitle}>{lang === 'en' ? step.titleEn : step.title}</div>
                  <div className={styles.ctlDesc}>{lang === 'en' ? step.descEn : step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.ctChannels}>
            <a href="mailto:soporte@weblayer.cloud" className={styles.ctChannel}>
              <div className={styles.ctChIcon} style={{ background: 'rgba(61,56,224,.12)', border: '1px solid rgba(61,56,224,.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--violet)' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className={styles.ctChInfo}>
                <div className={styles.ctChLabel}>Email</div>
                <div className={styles.ctChVal}>soporte@weblayer.cloud</div>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className={styles.ctFormWrap} id="ctFormWrap">
          <ContactForm />
        </div>

      </div>

      {/* FAQ */}
      <div className={styles.ctFaq}>
        <div className={styles.faqGrid}>
          <div className={styles.faqLeft}>
            <div className={styles.flEyebrow}>{lang === 'en' ? 'Common questions' : 'Preguntas frecuentes'}</div>
            <h2>{lang === 'en' ? <em>Before we talk,</em> : <em>Antes de hablar,</em>} {lang === 'en' ? 'maybe your answer is here.' : 'quizás tu respuesta está acá.'}</h2>
            <p>{lang === 'en' ? 'If you still have questions, write to us directly.' : 'Si todavía tenés dudas, escribinos directamente.'}</p>
          </div>
          <div className={styles.faqList}>
            {[
              { q: '¿Cuánto cuesta un sistema a medida?', qEn: 'How much does a custom system cost?', a: 'Cada sistema es diferente...', aEn: 'Every system is different...' },
              { q: '¿Cuánto tiempo tarda un proyecto?', qEn: 'How long does a project take?', a: 'Una landing o web...', aEn: 'A landing page...' },
            ].map((faq, i) => (
              <div key={i} className={styles.faqItem} onClick={toggleFaq}>
                <div className={styles.faqQ}>
                  <span>{lang === 'en' ? faq.qEn : faq.q}</span>
                  <div className={styles.faqIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.faqA}>
                  {lang === 'en' ? faq.aEn : faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
