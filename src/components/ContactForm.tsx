'use client';

import React, { useState } from 'react';
import { useLang } from '@/context/LangContext';
import styles from '@/app/contacto/page.module.css';

export default function ContactForm() {
  const { lang } = useLang();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');
  const [sector, setSector] = useState('');
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('');
  const [terms, setTerms] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (val: string) => {
    if (services.includes(val)) {
      setServices(services.filter(s => s !== val));
    } else {
      setServices([...services, val]);
    }
  };

  const handleNext1 = () => {
    if (services.length === 0) {
      // Could add shake animation here
      return;
    }
    setStep(2);
  };

  const handleNext2 = () => {
    if (!desc.trim()) {
      setErrors({ ...errors, desc: true });
      return;
    }
    setErrors({ ...errors, desc: false });
    setStep(3);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    let valid = true;

    if (!name.trim()) { newErrors.name = true; valid = false; }
    if (!company.trim()) { newErrors.company = true; valid = false; }
    
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) { newErrors.email = true; valid = false; }
    
    if (!terms) { newErrors.terms = true; valid = false; }

    setErrors(newErrors);

    if (valid) {
      // In a real app, send data to backend
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={`${styles.formSuccess} ${styles.show}`}>
        <div className={styles.successRing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div className={styles.successTitle}>{lang === 'en' ? 'Project received!' : '¡Proyecto recibido!'}</div>
        <div className={styles.successSub}>
          {lang === 'en' ? 'We will contact you within 24 business hours.' : 'En menos de 24 horas hábiles te contactamos.'}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.ctProgress}>
        <div className={styles.cpSteps}>
          <div className={`${styles.cpStep} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.done : ''}`}>
            <div className={styles.cpNum}>1</div>
            <div className={styles.cpStepLabel}>{lang === 'en' ? 'Service' : 'Servicio'}</div>
          </div>
          <div className={`${styles.cpConnector} ${step > 1 ? styles.done : ''}`}></div>
          <div className={`${styles.cpStep} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.done : ''}`}>
            <div className={styles.cpNum}>2</div>
            <div className={styles.cpStepLabel}>{lang === 'en' ? 'Project' : 'Proyecto'}</div>
          </div>
          <div className={`${styles.cpConnector} ${step > 2 ? styles.done : ''}`}></div>
          <div className={`${styles.cpStep} ${step >= 3 ? styles.active : ''}`}>
            <div className={styles.cpNum}>3</div>
            <div className={styles.cpStepLabel}>{lang === 'en' ? 'Contact' : 'Contacto'}</div>
          </div>
        </div>
        <div className={styles.stepCounter}>{step} / 3</div>
      </div>

      <div className={styles.ctFormBody}>
        
        {/* STEP 1 */}
        <div className={`${styles.formStep} ${step === 1 ? styles.active : step > 1 ? styles.exit : ''}`}>
          <div className={styles.fsTitle}>{lang === 'en' ? 'What do you need to build?' : '¿Qué necesitás construir?'}</div>
          <div className={styles.fsSub}>{lang === 'en' ? 'Select one or more services.' : 'Seleccioná uno o más servicios.'}</div>
          
          <div className={styles.svcGrid}>
            {[
              { val: 'web', name: 'Webs & commerce', nameEs: 'Webs y comercio' },
              { val: 'crm', name: 'CRM / ERP', nameEs: 'CRM / ERP' },
              { val: 'campus', name: 'Virtual campus', nameEs: 'Campus virtual' },
              { val: 'ia', name: 'AI automations', nameEs: 'Automatizaciones IA' }
            ].map(svc => (
              <div 
                key={svc.val} 
                className={`${styles.svcCard} ${services.includes(svc.val) ? styles.selected : ''}`}
                onClick={() => toggleService(svc.val)}
              >
                <div className={styles.scCheck}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div className={styles.scName}>{lang === 'en' ? svc.name : svc.nameEs}</div>
              </div>
            ))}
          </div>

          <div className={styles.formNav}>
            <span></span>
            <button className={`${styles.btnNext} ${styles.btnNextPrimary}`} onClick={handleNext1}>
              {lang === 'en' ? 'Continue →' : 'Continuar →'}
            </button>
          </div>
        </div>

        {/* STEP 2 */}
        <div className={`${styles.formStep} ${step === 2 ? styles.active : step < 2 ? '' : styles.exit}`}>
          <div className={styles.fsTitle}>{lang === 'en' ? 'Tell us about your project' : 'Contanos sobre tu proyecto'}</div>
          
          <div className={styles.fieldGroup}>
            <div className={`${styles.field} ${errors.desc ? styles.hasError : ''}`}>
              <label>{lang === 'en' ? 'WHAT DO YOU WANT TO BUILD?' : '¿QUÉ QUERÉS CONSTRUIR?'}</label>
              <textarea 
                value={desc} 
                onChange={e => { setDesc(e.target.value); setErrors({...errors, desc: false}) }}
                className={errors.desc ? styles.error : ''}
              />
            </div>
          </div>

          <div className={styles.budgetChips}>
            {['< $3K', '3-8K', '8-20K', '> $20K'].map(b => (
              <div 
                key={b} 
                className={`${styles.bChip} ${budget === b ? styles.sel : ''}`}
                onClick={() => setBudget(b)}
              >
                {b}
              </div>
            ))}
          </div>

          <div className={styles.formNav}>
            <button className={styles.btnBack} onClick={() => setStep(1)}>{lang === 'en' ? 'Back' : 'Volver'}</button>
            <button className={`${styles.btnNext} ${styles.btnNextPrimary}`} onClick={handleNext2}>
              {lang === 'en' ? 'Continue →' : 'Continuar →'}
            </button>
          </div>
        </div>

        {/* STEP 3 */}
        <div className={`${styles.formStep} ${step === 3 ? styles.active : ''}`}>
          <div className={styles.fsTitle}>{lang === 'en' ? 'Your contact info' : 'Tu información de contacto'}</div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldRow}>
              <div className={`${styles.field} ${errors.name ? styles.hasError : ''}`}>
                <label>NAME</label>
                <input value={name} onChange={e => { setName(e.target.value); setErrors({...errors, name: false}) }} />
              </div>
              <div className={`${styles.field} ${errors.company ? styles.hasError : ''}`}>
                <label>COMPANY</label>
                <input value={company} onChange={e => { setCompany(e.target.value); setErrors({...errors, company: false}) }} />
              </div>
            </div>
            <div className={`${styles.field} ${errors.email ? styles.hasError : ''}`}>
              <label>EMAIL</label>
              <input value={email} onChange={e => { setEmail(e.target.value); setErrors({...errors, email: false}) }} />
            </div>
          </div>

          <label className={styles.ctCheck}>
            <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors({...errors, terms: false}) }} />
            <div className={styles.ctCheckBox} style={{ borderColor: errors.terms ? 'var(--coral)' : '' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className={styles.ctCheckLabel}>I accept the privacy policy</span>
          </label>

          <div className={styles.formNav}>
            <button className={styles.btnBack} onClick={() => setStep(2)}>{lang === 'en' ? 'Back' : 'Volver'}</button>
            <button className={`${styles.btnNext} ${styles.submitBtn}`} onClick={handleSubmit}>
              {lang === 'en' ? 'Send project ✦' : 'Enviar proyecto ✦'}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
