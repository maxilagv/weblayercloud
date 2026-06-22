"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";
import { useLang } from "@/context/LangContext";
import ScrollReveal from "@/components/ScrollReveal";
import Counter from "@/components/Counter";
import styles from "./page.module.css";

export default function IAClientPage() {
  const { t, lang } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [activeState, setActiveState] = useState(0);

  const [simRunning, setSimRunning] = useState(false);
  const [activeNode, setActiveNode] = useState(-1);
  const [simStatus, setSimStatus] = useState(
    t("Listo — hacé clic para ejecutar el pipeline IA", "Ready — click to run the AI pipeline")
  );

  // Background color override
  useEffect(() => {
    document.body.style.backgroundColor = "#06050E";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Three.js animation
  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    let W = hero.clientWidth;
    let H = hero.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 6.5;

    const N = window.innerWidth < 768 ? 700 : 1400;
    const geo = new THREE.BufferGeometry();
    const posArr = new Float32Array(N * 3);
    const colArr = new Float32Array(N * 3);
    const COLORS = [
      new THREE.Color("#7C5CFF"),
      new THREE.Color("#3D38E0"),
      new THREE.Color("#F4A93B"),
      new THREE.Color("#FB7A5B"),
      new THREE.Color("#ffffff"),
    ];

    for (let i = 0; i < N; i++) {
      colArr[i * 3] = COLORS[i % COLORS.length].r;
      colArr[i * 3 + 1] = COLORS[i % COLORS.length].g;
      colArr[i * 3 + 2] = COLORS[i % COLORS.length].b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

    const mat = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.055 : 0.044,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    function fScatter() {
      const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 4 + Math.random() * 3.5;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        a[i * 3] = r * Math.sin(p) * Math.cos(t);
        a[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        a[i * 3 + 2] = r * Math.cos(p);
      }
      return a;
    }

    function fSphere() {
      const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 2.3;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        a[i * 3] = r * Math.sin(p) * Math.cos(t);
        a[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        a[i * 3 + 2] = r * Math.cos(p);
      }
      return a;
    }

    function fTorus() {
      const a = new Float32Array(N * 3);
      const R = 2.2;
      const r = 0.8;
      for (let i = 0; i < N; i++) {
        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI * 2;
        a[i * 3] = (R + r * Math.cos(p)) * Math.cos(t);
        a[i * 3 + 1] = (R + r * Math.cos(p)) * Math.sin(t);
        a[i * 3 + 2] = r * Math.sin(p);
      }
      return a;
    }

    function fNodes() {
      const a = new Float32Array(N * 3);
      const centers = [
        [0, 0, 0],
        [2.5, 0.5, -0.5],
        [-2.2, 1, -0.3],
        [1.8, -1.5, 0.4],
        [-1.4, -1.8, 0.6],
        [2, -1, 0.8],
      ];
      for (let i = 0; i < N; i++) {
        const c = centers[i % centers.length];
        const sp = i < 350 ? 0.1 : 0.4;
        a[i * 3] = c[0] + (Math.random() - 0.5) * sp;
        a[i * 3 + 1] = c[1] + (Math.random() - 0.5) * sp;
        a[i * 3 + 2] = c[2] + (Math.random() - 0.5) * sp;
      }
      return a;
    }

    function fCompress() {
      const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = Math.random() * 0.35;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        a[i * 3] = r * Math.sin(p) * Math.cos(t);
        a[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        a[i * 3 + 2] = r * Math.cos(p);
      }
      return a;
    }

    function fLines() {
      const a = new Float32Array(N * 3);
      const L = 24;
      for (let i = 0; i < N; i++) {
        const ln = i % L;
        const tt = 0.06 + Math.random() * 0.94;
        const ang = (ln / L) * Math.PI * 2;
        const el = (Math.random() - 0.5) * 0.9;
        const d = tt * 5.2;
        a[i * 3] = d * Math.cos(el) * Math.cos(ang);
        a[i * 3 + 1] = d * Math.sin(el);
        a[i * 3 + 2] = d * Math.cos(el) * Math.sin(ang);
      }
      return a;
    }

    function fDNA() {
      const a = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 8;
        const r = 1.4 + 0.3 * Math.sin(i * 0.3);
        const strand = i % 2 === 0 ? 1 : -1;
        a[i * 3] = r * Math.cos(t + strand * 1.2);
        a[i * 3 + 1] = t * 0.22 - 2.8;
        a[i * 3 + 2] = r * Math.sin(t + strand * 1.2);
      }
      return a;
    }

    const FORMS: Record<string, Float32Array> = {
      scatter: fScatter(),
      sphere: fSphere(),
      torus: fTorus(),
      nodes: fNodes(),
      compress: fCompress(),
      lines: fLines(),
      dna: fDNA(),
    };
    const STATE_ORDER = ["scatter", "sphere", "torus", "nodes", "compress", "lines", "dna"];

    posArr.set(FORMS.scatter);
    geo.attributes.position.needsUpdate = true;

    let morphTw: gsap.core.Tween | null = null;
    function morphTo(name: string, dur: number) {
      if (morphTw) morphTw.kill();
      const src = new Float32Array(geo.attributes.position.array);
      const tgt = FORMS[name];
      const p = { t: 0 };
      morphTw = gsap.to(p, {
        t: 1,
        duration: dur || 2.6,
        ease: "power2.inOut",
        onUpdate: () => {
          const arr = geo.attributes.position.array as Float32Array;
          for (let j = 0; j < N * 3; j++) {
            arr[j] = src[j] + (tgt[j] - src[j]) * p.t;
          }
          geo.attributes.position.needsUpdate = true;
        },
      });
      return morphTw;
    }

    let stateIdx = 0;
    function nextState() {
      stateIdx = (stateIdx + 1) % STATE_ORDER.length;
      const name = STATE_ORDER[stateIdx];
      morphTo(name, 2.8);
      setActiveState(stateIdx);
      mat.opacity = name === "compress" ? 0.95 : 0.85;
    }
    const cycleId = setInterval(nextState, 4200);

    let mx = 0,
        my = 0,
        tmx = 0,
        tmy = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.9;
      my = (e.clientY / window.innerHeight - 0.5) * 0.55;
    };
    const handleMouseLeave = () => {
      mx = 0;
      my = 0;
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    const onResize = () => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const tTime = clock.getElapsedTime();
      points.rotation.y = tTime * 0.032;
      points.rotation.x = tTime * 0.012;
      tmx += (mx - tmx) * 0.046;
      tmy += (my - tmy) * 0.046;
      camera.position.x += (tmx - camera.position.x) * 0.07;
      camera.position.y += (-tmy - camera.position.y) * 0.07;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();

    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(cycleId);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(cycleId);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (hero) {
        hero.removeEventListener("mousemove", handleMouseMove);
        hero.removeEventListener("mouseleave", handleMouseLeave);
      }
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  const runSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    const steps = lang === "en"
      ? ["Lead detected...","Qualifying with AI...","Updating CRM...","Sending message...","Scheduling follow-up...","Measuring results...","Pipeline complete ✓"]
      : ["Lead detectado...","Calificando con IA...","Actualizando CRM...","Enviando mensaje...","Agendando seguimiento...","Midiendo resultados...","Pipeline completo ✓"];
    
    let i = 0;
    const step = () => {
      setActiveNode(i);
      if (i < 6) {
        setSimStatus(steps[i]);
        i++;
        setTimeout(step, 780);
      } else {
        setSimStatus(steps[steps.length - 1]);
        setTimeout(() => {
          setActiveNode(-1);
          setSimRunning(false);
          setSimStatus(lang === "en" ? "Ready — click to run again" : "Listo — hacé clic para volver a ejecutar");
        }, 1400);
      }
    };
    step();
  };

  return (
    <main>
      <section className={styles.wglHero} id="wgl-hero" ref={heroRef}>
        <canvas className={styles.wglCanvas} id="wgl-canvas" aria-hidden="true" ref={canvasRef}></canvas>
        <div className={styles.wglGlow} aria-hidden="true">
          <div className={styles.g1}></div>
          <div className={styles.g2}></div>
        </div>
        
        <div className={styles.wglLabels} aria-hidden="true">
          <span className={`${styles.wl} ${styles.nlCore} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>IA Core</span>
          <span className={`${styles.wl} ${styles.nlCrm} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>CRM</span>
          <span className={`${styles.wl} ${styles.nlLeads} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>Leads</span>
          <span className={`${styles.wl} ${styles.nlChat} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>Chat</span>
          <span className={`${styles.wl} ${styles.nlFact} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>Facturación</span>
          <span className={`${styles.wl} ${styles.nlRep} ${activeState === 3 ? styles.show : ""}`}><span className={styles.wd}></span>Reportes</span>
        </div>
        
        <div className={styles.wglLayout}>
          <div className={styles.wglCopy}>
            <ScrollReveal>
              <div className={styles.wglEy}><span className={styles.pulse}></span>{t("Automatización IA · Agentes · 24/7", "AI Automation · Agents · 24/7")}</div>
            </ScrollReveal>
            <ScrollReveal delay={60}>
              <h1 className={styles.wglH1}>
                {t("Inteligencia que", "Intelligence that")}<br />
                <em>{t("opera sola.", "operates itself.")}</em>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={140}>
              <p className={styles.wglLead}>
                {t("Agentes IA que captan, califican, responden y sincronizan cada proceso de tu negocio — de forma autónoma, sin fricción, las 24 horas.", "AI agents that capture, qualify, respond and sync every process in your business — autonomously, without friction, 24 hours a day.")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={220}>
              <div className={styles.wglCta}>
                <Link href="/contacto" className="btn btn-lg btn-on-dark">
                  {t("Iniciar proyecto", "Start project")} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
                <a href="#agentes" className="btn btn-lg btn-ghost btn-on-dark">{t("Ver agentes", "See agents")}</a>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className={styles.wglBadges}>
                <span className={styles.wglBadge}><span className={styles.bd}></span>{t("Agentes IA", "AI agents")}</span>
                <span className={styles.wglBadge}><span className={styles.bd}></span>Chatbots</span>
                <span className={styles.wglBadge}><span className={styles.bd}></span>{t("Integraciones", "Integrations")}</span>
                <span className={styles.wglBadge}><span className={styles.bd}></span>24/7</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        <div className={styles.wglStates} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className={`${styles.wsD} ${activeState === i ? styles.on : ""}`}></span>
          ))}
        </div>
        <div className={styles.wglScr} aria-hidden="true">Scroll</div>
      </section>

      <div className="stats-strip">
        <div className="wrap">
          <div className="stat">
            <div className="sv">73%</div>
            <div className="sl">{t("Reducción en seguimiento manual", "Reduction in manual follow-up time")}</div>
          </div>
          <div className="stat">
            <div className="sv">0.8s</div>
            <div className="sl">{t("Respuesta IA a un lead nuevo", "Average AI response to a new lead")}</div>
          </div>
          <div className="stat">
            <div className="sv"><Counter count={24} /></div>
            <div className="sl">{t("Automatizaciones activas en simultáneo", "Simultaneous active automations")}</div>
          </div>
          <div className="stat">
            <div className="sv">100%</div>
            <div className="sl">{t("Medible — cada paso trackeado", "Measurable — every step tracked")}</div>
          </div>
        </div>
      </div>

      <section className={`section ${styles.agentAdmin}`} id="agentes">
        <div className={styles.agentAdminBg} aria-hidden="true">
          <img src="/assets/img/ia-office.png" alt="" />
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow brand">{t("Agentes administrativos", "Admin agents")}</span>
              <h2>{t("IA que resuelve lo que frena a tu equipo", "AI that handles what slows your team down")}</h2>
              <p>{t("Cada agente está entrenado sobre tus procesos específicos y resuelve un problema real y concreto.", "Each agent is trained on your specific processes and solves a real, concrete problem.")}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className={styles.agentProblemGrid}>
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#3D38E0,#7C5CFF)" }}>📄</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("Facturas y facturación", "Invoice & billing")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Procesás facturas manualmente: abrís cada una, extraés datos, validás montos y cargás en tu sistema. Horas de trabajo puramente mecánico.", "You process invoices manually: open each one, extract data, validate amounts and enter into your system. Hours of purely mechanical work.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente lee la factura, extrae los campos, valida contra tu catálogo, detecta duplicados y registra en el ERP en segundos.", "The agent reads the invoice (PDF or email), extracts fields, validates against your catalog, detects duplicates and registers in ERP in seconds.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("Factura 00432", "Invoice 00432")}</b> · hace 3 min</span>
                </div>
              </div>
              
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#1F9D5B,#0E7A47)" }}>👤</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("RRHH y personal", "HR & personnel")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Los contratos vencen sin aviso, los empleados hacen preguntas repetitivas y los legajos están dispersos en carpetas, emails y planillas.", "Contracts expire without warning, employees ask repetitive questions and HR files are scattered across folders, emails and spreadsheets.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente gestiona vencimientos, responde consultas de RRHH, genera documentos estándar y centraliza todos los legajos.", "The agent manages expiration dates, answers HR questions, generates standard documents and centralizes all employee files.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("Alerta: contrato vence en 5 días", "Alert: contract due in 5 days")}</b> · López M.</span>
                </div>
              </div>
              
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#FB7A5B,#F4A93B)" }}>🎙️</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("Reuniones y actas", "Meetings & minutes")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Nadie toma notas, los acuerdos se olvidan y las decisiones que se toman en reuniones nunca llegan al CRM ni al backlog.", "Nobody takes notes, agreements get forgotten and decisions made in meetings never reach the CRM or the team's task list.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente transcribe, resume, extrae compromisos y asigna tareas en el CRM — automáticamente, antes de que termine la reunión.", "The agent transcribes, summarizes, extracts commitments and assigns tasks in the CRM — automatically, before the meeting ends.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("3 tareas asignadas del kickoff", "3 tasks assigned from kickoff")}</b> · hace 12 min</span>
                </div>
              </div>
              
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#7C5CFF,#3D38E0)" }}>📋</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("Revisión de contratos", "Contract review")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Revisar un contrato lleva horas: buscás cláusulas clave, términos de penalidad y renovaciones — a menudo con riesgos que se escapan.", "Reviewing a contract takes hours: you read it fully looking for key clauses, penalty terms and automatic renewals — often missing risks.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente lee el documento en segundos, extrae cláusulas clave, resalta términos de riesgo y devuelve un resumen estructurado.", "The agent reads the full document in seconds, extracts key clauses, highlights risk terms and returns a structured summary.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("Riesgo detectado en cláusula 8.3", "Risk detected in clause 8.3")}</b></span>
                </div>
              </div>
              
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#F4A93B,#E8852A)" }}>📊</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("Reportes automáticos", "Automated reports")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Todos los lunes lo mismo: alguien pasa horas extrayendo datos de distintas herramientas, consolidando en planilla y formateando.", "Every Monday the same: someone spends hours pulling data from different tools, consolidating in a spreadsheet and formatting for management.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente consolida los datos, genera el informe en el formato acordado y lo distribuye automáticamente a la hora configurada.", "The agent consolidates data from your sources, generates the report in the agreed format and distributes it automatically at the set time.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("Reporte semanal enviado (Lun 08:00)", "Weekly report sent (Mon 08:00)")}</b></span>
                </div>
              </div>
              
              <div className={styles.apCard}>
                <div className={styles.apHead}>
                  <span className={styles.apIc} style={{ background: "linear-gradient(135deg,#FB7A5B,#7C5CFF)" }}>🤖</span>
                  <div className={styles.apHeadTx}>
                    <div className={styles.apLabel}>{t("Agente admin", "Admin agent")}</div>
                    <div className={styles.apName}>{t("Soporte interno", "Internal support")}</div>
                  </div>
                </div>
                <div className={styles.apProblem}>
                  <div className={styles.apProbLabel}>⚠ {t("Problema", "Problem")}</div>
                  <p>{t("Tu equipo pierde tiempo con preguntas internas repetitivas: vacaciones, accesos, procedimientos operativos y dudas de IT.", "Your team loses time with repetitive internal questions: vacation policies, system access, operational procedures and IT issues.")}</p>
                </div>
                <div className={styles.apSolution}>
                  <div className={styles.apSolLabel}>✓ {t("Solución", "Solution")}</div>
                  <p>{t("El agente responde consultas de RRHH, IT y operaciones 24/7, entrenado con tu documentación — escala a humano solo cuando no puede resolverlo.", "The agent answers HR, IT and operations queries 24/7, trained on your real documentation — escalates to human only when truly needed.")}</p>
                </div>
                <div className={styles.apFeed}>
                  <span className={styles.afDot}></span>
                  <span className={styles.afTx}><b>{t("47 consultas internas resueltas hoy", "47 internal queries resolved today")}</b></span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className={`section ${styles.flowSection}`} id="flujo">
        <div className={styles.flowBg}>
          <div className={styles.fb1}></div>
          <div className={styles.fb2}></div>
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow brand">{t("Cómo funciona", "How it works")}</span>
              <h2>{t("Del lead a la decisión, paso a paso", "From lead to decision, step by step")}</h2>
              <p>{t("Activá la simulación para ver cómo la IA procesa un lead a través de cada etapa.", "Activate the simulation to see how the AI processes a lead through each stage.")}</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal>
            <div className={styles.simBar}>
              <button className={styles.simBtn} onClick={runSimulation} disabled={simRunning}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>{t("Activar simulación", "Run simulation")}</span>
              </button>
              <span className={styles.simStatus} dangerouslySetInnerHTML={{ __html: simStatus.includes('—') || simStatus.includes('✓') ? simStatus : `<span>${simStatus}</span>` }}></span>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className={styles.flowGrid}>
              <div className={`${styles.flowNode} ${activeNode === 0 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>01</div>
                <div className={styles.fnIcWrap}>↧</div>
                <div className={styles.fnTitle}>{t("Captación del lead", "Lead capture")}</div>
                <div className={styles.fnDesc}>{t("Entra por formulario, anuncio, web o chatbot. El flujo arranca automáticamente.", "Enters via form, ad, website or chatbot.")}</div>
                <div className={styles.fnTag}>trigger</div>
                <div className={styles.flowArrow}>→</div>
              </div>
              <div className={`${styles.flowNode} ${activeNode === 1 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>02</div>
                <div className={styles.fnIcWrap}>✦</div>
                <div className={styles.fnTitle}>{t("Calificación con IA", "AI qualification")}</div>
                <div className={styles.fnDesc}>{t("Analiza datos, detecta intención, puntúa y asigna prioridad.", "Analyzes data, detects intent, scores and assigns priority.")}</div>
                <div className={styles.fnTag}>AI</div>
                <div className={styles.flowArrow}>→</div>
              </div>
              <div className={`${styles.flowNode} ${activeNode === 2 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>03</div>
                <div className={styles.fnIcWrap}>▤</div>
                <div className={styles.fnTitle}>{t("Actualización CRM", "CRM update")}</div>
                <div className={styles.fnDesc}>{t("Registra lead, asigna responsable y dispara automatizaciones.", "Records lead, assigns owner, sets stage and fires automations.")}</div>
                <div className={styles.fnTag}>action</div>
              </div>
              <div className={`${styles.flowNode} ${activeNode === 3 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>04</div>
                <div className={styles.fnIcWrap}>💬</div>
                <div className={styles.fnTitle}>{t("Respuesta automática", "Automated reply")}</div>
                <div className={styles.fnDesc}>{t("Mensaje personalizado vía WhatsApp, email o SMS — con contexto.", "Personalized message via WhatsApp, email or SMS.")}</div>
                <div className={styles.fnTag}>send</div>
                <div className={styles.flowArrow}>→</div>
              </div>
              <div className={`${styles.flowNode} ${activeNode === 4 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>05</div>
                <div className={styles.fnIcWrap}>📅</div>
                <div className={styles.fnTitle}>{t("Seguimiento inteligente", "Smart follow-up")}</div>
                <div className={styles.fnDesc}>{t("Si no hay respuesta, la IA agenda contactos y adapta el mensaje.", "If no reply, AI schedules new touchpoints.")}</div>
                <div className={styles.fnTag}>schedule</div>
                <div className={styles.flowArrow}>→</div>
              </div>
              <div className={`${styles.flowNode} ${activeNode === 5 ? styles.lit : ""}`}>
                <div className={styles.fnNum}>06</div>
                <div className={styles.fnIcWrap}>▩</div>
                <div className={styles.fnTitle}>{t("Medición", "Measurement")}</div>
                <div className={styles.fnDesc}>{t("Cada paso medido. El dashboard muestra conversión, ROI y abandono.", "Every step measured. Dashboard shows conversion, ROI and drop-off.")}</div>
                <div className={styles.fnTag}>insight</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-3)" }}>
        <div className="wrap">
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow brand">{t("Casos de uso", "Use cases")}</span>
              <h2>{t("IA aplicada a tus procesos reales", "AI applied to your real processes")}</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className={styles.ucGrid}>
              <div className={styles.ucCard}>
                <div className={styles.ucHeader}><span className={styles.ucIc}>📈</span><b>{t("Ventas y comercial", "Sales & commercial")}</b></div>
                <ul className={styles.ucList}>
                  <li>{t("Scoring y calificación de leads", "Lead scoring and qualification")}</li>
                  <li>{t("Seguimientos comerciales automatizados", "Automated commercial follow-ups")}</li>
                  <li>{t("Detección IA de upsell / cross-sell", "AI upsell/cross-sell detection")}</li>
                  <li>{t("Predicción de churn y alerta", "Churn prediction and alert")}</li>
                </ul>
              </div>
              <div className={styles.ucCard}>
                <div className={styles.ucHeader}><span className={styles.ucIc}>🎯</span><b>{t("Marketing y campañas", "Marketing & campaigns")}</b></div>
                <ul className={styles.ucList}>
                  <li>{t("Secuencias de email segmentadas y automáticas", "Automated segmented email sequences")}</li>
                  <li>{t("Flujos de retargeting por comportamiento", "Behavior-based retargeting flows")}</li>
                  <li>{t("Optimización de contenido A/B", "A/B content optimization")}</li>
                  <li>{t("Recuperación de carritos abandonados", "Intelligent abandoned cart recovery")}</li>
                </ul>
              </div>
              <div className={styles.ucCard}>
                <div className={styles.ucHeader}><span className={styles.ucIc}>💬</span><b>{t("Soporte y atención", "Support & service")}</b></div>
                <ul className={styles.ucList}>
                  <li>{t("Chatbot IA entrenado con tu base de conocimiento", "AI chatbot trained on your knowledge base")}</li>
                  <li>{t("Clasificación y enrutamiento de tickets", "Auto-classification and ticket routing")}</li>
                  <li>{t("Respuestas personalizadas instantáneas", "Instant personalized replies")}</li>
                  <li>{t("Escalado humano cuando se necesita", "Human escalation when needed")}</li>
                </ul>
              </div>
              <div className={styles.ucCard}>
                <div className={styles.ucHeader}><span className={styles.ucIc}>⚙️</span><b>{t("Operaciones internas", "Internal operations")}</b></div>
                <ul className={styles.ucList}>
                  <li>{t("Generación automática de reportes", "Automated report generation")}</li>
                  <li>{t("Clasificación y extracción IA de documentos", "AI document classification and extraction")}</li>
                  <li>{t("Sincronización entre sistemas", "Inter-system synchronization")}</li>
                  <li>{t("Flujos de aprobación con recomendaciones IA", "Approval workflows with AI recommendations")}</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section inner-dark">
        <div className="wrap">
          <ScrollReveal>
            <div className="inner-head">
              <span className="eyebrow on-dark">{t("En vivo", "Live")}</span>
              <h2>{t("Agentes IA trabajando ahora mismo", "AI agents working right now")}</h2>
              <p>{t("Cada agente atiende un flujo específico — de forma automática, 24/7.", "Each agent handles a specific flow — automatically, 24/7.")}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className={styles.iaMetrics}>
              <div className={styles.iaMet}>
                <small>{t("PROCESADOS ESTE MES", "PROCESSED THIS MONTH")}</small>
                <b><Counter count={4820} /></b>
                <p>{t("Leads atendidos automáticamente", "Leads automatically handled from entry to first reply")}</p>
              </div>
              <div className={styles.iaMet}>
                <small>{t("TIEMPO AHORRADO", "TIME SAVED")}</small>
                <b>214h</b>
                <p>{t("Horas de trabajo manual reemplazadas", "Hours of manual work replaced by AI flows this month")}</p>
              </div>
              <div className={styles.iaMet}>
                <small>{t("TIEMPO RESP. PROM.", "AVG RESPONSE TIME")}</small>
                <b>0.8s</b>
                <p>{t("Desde entrada hasta primera respuesta", "From lead entry to first personalized reply")}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className={styles.iaAgentList}>
              <div className={styles.iaAgent}>
                <span className={styles.agDot} style={{ background: "#1F9D5B" }}></span>
                <span className={styles.agName}>{t("Agente de calificación de leads", "Lead qualification agent")}</span>
                <span className={styles.agStat}>● {t("Activo", "Active")}</span>
                <span className={styles.agCount}>{t("312 procesados hoy", "312 processed today")}</span>
              </div>
              <div className={styles.iaAgent}>
                <span className={styles.agDot} style={{ background: "var(--amber)" }}></span>
                <span className={styles.agName}>{t("Agente de procesamiento de facturas", "Invoice processing agent")}</span>
                <span className={styles.agStat}>● {t("Activo", "Active")}</span>
                <span className={styles.agCount}>{t("47 facturas hoy", "47 invoices today")}</span>
              </div>
              <div className={styles.iaAgent}>
                <span className={styles.agDot} style={{ background: "var(--violet)" }}></span>
                <span className={styles.agName}>{t("Chatbot de soporte (24/7)", "Support chatbot (24/7)")}</span>
                <span className={styles.agStat}>● {t("Activo", "Active")}</span>
                <span className={styles.agCount}>{t("1.204 consultas resueltas", "1,204 queries resolved")}</span>
              </div>
              <div className={styles.iaAgent}>
                <span className={styles.agDot} style={{ background: "var(--coral)" }}></span>
                <span className={styles.agName}>{t("Agente de reuniones y actas", "Meeting summary & task agent")}</span>
                <span className={styles.agStat}>● {t("Activo", "Active")}</span>
                <span className={styles.agCount}>{t("8 reuniones hoy", "8 meetings today")}</span>
              </div>
              <div className={styles.iaAgent}>
                <span className={styles.agDot} style={{ background: "#F4A93B" }}></span>
                <span className={styles.agName}>{t("Generador de reportes", "Report generator")}</span>
                <span className={styles.agStat}>● {t("Activo", "Active")}</span>
                <span className={styles.agCount}>{t("Ejecuta Lun y Vie 08:00", "Runs Mon & Fri 08:00")}</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <ScrollReveal>
            <div className="ic-band">
              <div className="aurora"></div>
              <div className="grid-floor"></div>
              <div className="sheen"></div>
              <div className="ic-inner">
                <h2 dangerouslySetInnerHTML={{ __html: t("Que la IA maneje lo que tu equipo <em>no necesita tocar.</em>", "Let AI handle what your team <em>doesn't need to touch.</em>") }}></h2>
                <p>{t("Mapeamos tus procesos, construimos los flujos y desplegamos agentes que trabajan en forma autónoma.", "We map your processes, build the flows and deploy agents that work autonomously.")}</p>
                <div className="ic-cta">
                  <Link href="/contacto" className="btn btn-lg btn-on-dark">
                    {t("Iniciar proyecto", "Start project")} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                  <Link href="/contacto" className="btn btn-lg btn-ghost btn-on-dark">
                    {t("Agendar llamada", "Book a call")}
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
