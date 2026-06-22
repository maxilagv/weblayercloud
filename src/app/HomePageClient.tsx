"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import Counter from "@/components/Counter";
import ScrollReveal from "@/components/ScrollReveal";
import HomeHero from "@/components/HomeHero";
import TiltCard from "@/components/TiltCard";
import CampusIcon, { type CampusIconKey } from "@/components/CampusIcons";
import styles from "./page.module.css";

export default function HomePageClient() {
  const { t } = useLang();

  // Staggered opacity reveal for depth cards (armed by JS; visible if JS/motion off).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(`.${styles.reveal}`));
    if (reduced || !cards.length || !("IntersectionObserver" in window)) return;

    cards.forEach((el) => {
      el.style.transition = "none";
      el.style.opacity = "0";
    });
    void document.body.offsetHeight;

    const REVEAL = "opacity .6s cubic-bezier(.2,.7,.2,1), transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s";
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const group = el.parentElement?.children;
          const idx = group ? Array.from(group).indexOf(el) : 0;
          window.setTimeout(() => {
            el.style.transition = REVEAL;
            el.style.opacity = "1";
          }, idx * 80);
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const services: { icon: CampusIconKey; href: string; title: string; desc: string }[] = [
    {
      icon: "web",
      href: "/servicios/web",
      title: t("Webs y comercio", "Web & commerce"),
      desc: t("Landings, sitios institucionales, e-commerce, embudos y medición de conversión.", "Landing pages, institutional sites, e-commerce, funnels and conversion measurement."),
    },
    {
      icon: "crm",
      href: "/servicios/crm",
      title: "CRM / ERP",
      desc: t("Procesos comerciales, administrativos y operativos con roles, paneles y reportes.", "Commercial, administrative and operational processes with roles, panels and reports."),
    },
    {
      icon: "student",
      href: "/servicios/campus",
      title: t("Campus virtual", "Virtual campus"),
      desc: t("Notas, boletines, asistencia, avisos, inscripciones y paneles por rol.", "Grades, report cards, attendance, notices, enrollment and role-based panels."),
    },
    {
      icon: "ai",
      href: "/servicios/ia",
      title: t("Automatización IA", "AI automation"),
      desc: t("Captación, calificación, respuestas, integraciones y seguimiento automatizado.", "Capture, qualification, replies, integrations and automated follow-up."),
    },
  ];

  const steps: { n: string; title: string; desc: string }[] = [
    {
      n: "01",
      title: t("Descubrimiento", "Discovery"),
      desc: t("Mapeamos tus procesos, roles y datos reales antes de escribir una línea de código.", "We map your real processes, roles and data before writing a single line of code."),
    },
    {
      n: "02",
      title: t("Arquitectura", "Architecture"),
      desc: t("Diseñamos flujos, permisos, estados y modelos que vuelven la idea una plataforma.", "We design flows, permissions, states and models that turn the idea into a platform."),
    },
    {
      n: "03",
      title: t("Construcción", "Build"),
      desc: t("Construimos capa por capa, con interfaces claras y veloces para cada equipo.", "We build layer by layer, with clear, fast interfaces for every team."),
    },
    {
      n: "04",
      title: t("Escala", "Scale"),
      desc: t("Automatizamos con IA, medimos y dejamos trazabilidad para que el sistema crezca.", "We automate with AI, measure and leave traceability so the system keeps growing."),
    },
  ];

  const values: { icon: CampusIconKey; title: string; desc: string }[] = [
    {
      icon: "wrench",
      title: t("Hecho a medida", "Built to measure"),
      desc: t("Nada de plantillas. Cada capa se diseña alrededor de tu operación real.", "No templates. Every layer is designed around your real operation."),
    },
    {
      icon: "ai",
      title: t("Innovación constante", "Always innovating"),
      desc: t("Seguimos los avances de cerca y lanzamos productos innovadores para pymes y para developers.", "We track what's next and ship innovative products for both SMBs and developers."),
    },
    {
      icon: "route",
      title: t("Socios, no proveedores", "Partners, not vendors"),
      desc: t("No entregamos y desaparecemos. Cuando nos elegís, nos volvemos parte de tu trabajo.", "We don't build and vanish. Once you choose us, we become part of your work."),
    },
    {
      icon: "gauge",
      title: t("Te llevamos a tu cima", "We take you to your summit"),
      desc: t("Vamos por la cima — y llevamos a cada cliente a la suya, con crecimiento medible.", "We aim for the top — and take every client to theirs, with measurable growth."),
    },
  ];

  return (
    <main className={styles.home}>
      <HomeHero />

      {/* PROOF / built layer by layer */}
      <section className={styles.proofScene}>
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbA}`} />
          <span className={`${styles.orb} ${styles.orbB}`} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.center} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("La diferencia", "The difference")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("No entregamos páginas aisladas. Entregamos una <em>operación conectada.</em>", "We don't ship isolated pages. We ship a <em>connected operation.</em>") }} />
            <p className={styles.sub}>{t("Cada capa captura datos, automatiza decisiones y le da a cada equipo una interfaz que puede usar todos los días.", "Each layer captures data, automates decisions and gives every team an interface they can use every day.")}</p>
          </ScrollReveal>

          <div className={`${styles.statsGrid} ${styles.inner}`}>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={4} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Capas de servicio", "Service layers")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={1} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Fuente operativa única", "One operating source")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>24/7</span>
              <div className={styles.statLabel}>{t("Automatización con IA", "AI automation")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>100%</span>
              <div className={styles.statLabel}>{t("Software a medida", "Custom software")}</div>
            </TiltCard>
          </div>
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      {/* SOLUCIONES */}
      <section className="section" id="soluciones">
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbC}`} />
          <div className={styles.dots} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Soluciones", "Solutions")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Una sola arquitectura, <em>cuatro capas.</em>", "One architecture, <em>four layers.</em>") }} />
            <p className={styles.sub}>{t("Construimos cada capa por separado o como un ecosistema completo, integrado de punta a punta.", "We build each layer on its own or as one end-to-end ecosystem.")}</p>
          </ScrollReveal>

          <div className={`${styles.serviceGrid} ${styles.inner}`}>
            {services.map((s, i) => (
              <TiltCard key={s.title} as="div" className={`${styles.serviceCard} ${styles.depth} ${styles.reveal}`}>
                <Link href={s.href} className={styles.serviceLink}>
                  <span className={styles.svcTop}>
                    <span className={styles.iconTile}><CampusIcon name={s.icon} /></span>
                    <span className={styles.svcNum}>0{i + 1}</span>
                  </span>
                  <span className={styles.svcTitle}>{s.title}</span>
                  <span className={styles.svcDesc}>{s.desc}</span>
                  <span className={styles.svcGo}>
                    {t("Explorar", "Explore")}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      {/* PROCESO */}
      <section className="section">
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.center} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Proceso", "Process")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("De la idea al sistema, <em>capa por capa.</em>", "From idea to system, <em>layer by layer.</em>") }} />
          </ScrollReveal>

          <div className={`${styles.procGrid} ${styles.inner}`}>
            {steps.map((s) => (
              <TiltCard key={s.n} className={`${styles.procStep} ${styles.depth} ${styles.reveal}`} lift={12}>
                <span className={styles.procNum}>{s.n}</span>
                <span className={styles.procTitle}>{s.title}</span>
                <span className={styles.procDesc}>{s.desc}</span>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      {/* EQUIPO — honest positioning */}
      <section className="section">
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbB}`} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("El equipo", "The team")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Somos 4. Trabajás directo con quienes <em>construyen y venden.</em>", "We're four. You work directly with the people who <em>build and sell.</em>") }} />
            <p className={styles.sub}>{t("Dos ingenieros en informática y dos vendedores certificados. No somos una corporación con capas de gestión — somos un equipo con la profesionalidad de una empresa consolidada y el trato directo de hablar con quien hace el trabajo.", "Two software engineers and two certified salespeople. We're not a corporation with layers of management — we're a team with the professionalism of an established company and the directness of talking to the person doing the work.")}</p>
          </ScrollReveal>

          <div className={`${styles.statsGrid} ${styles.inner}`}>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>2</span>
              <div className={styles.statLabel}>{t("Ingenieros en informática", "Software engineers")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>2</span>
              <div className={styles.statLabel}>{t("Vendedores certificados", "Certified salespeople")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>0</span>
              <div className={styles.statLabel}>{t("Capas corporativas / intermediarios", "Corporate layers / middlemen")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>1</span>
              <div className={styles.statLabel}>{t("Equipo, de punta a punta", "Team, end to end")}</div>
            </TiltCard>
          </div>

          <p className={`${styles.aspire} ${styles.inner}`}>
            {t("Construimos cada proyecto como si ya cotizáramos en bolsa.", "We build every project as if we were already public.")}
          </p>
        </div>
      </section>

      {/* VALOR */}
      <section className="section" style={{ background: "var(--paper-3)" }}>
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbA}`} />
          <div className={styles.dots} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Por qué LayerCloud", "Why LayerCloud")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("No hacemos algo y <em>desaparecemos.</em>", "We don't build and <em>disappear.</em>") }} />
            <p className={styles.sub}>{t("Buscamos la cima — y llevamos a cada cliente a la suya. Una vez que nos elegís, nos volvemos parte de tu trabajo.", "We aim for the top — and take every client to theirs. Once you choose us, we become part of your work.")}</p>
          </ScrollReveal>

          <div className={`${styles.valueGrid} ${styles.inner}`}>
            {values.map((v) => (
              <TiltCard key={v.title} className={`${styles.valueCard} ${styles.depth} ${styles.reveal}`}>
                <span className={styles.iconTile}><CampusIcon name={v.icon} /></span>
                <span className={styles.svcTitle}>{v.title}</span>
                <span className={styles.svcDesc}>{v.desc}</span>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* FINALE / CTA */}
      <section className="section">
        <div className="wrap">
          <ScrollReveal className={styles.finale}>
            <div className={styles.fAurora} aria-hidden="true" />
            <div className={styles.fGrid} aria-hidden="true" />
            <div className={styles.fInner}>
              <h2 dangerouslySetInnerHTML={{ __html: t("Construyamos el sistema que tu equipo <em>merece mostrar.</em>", "Let's build the system your team <em>deserves to show.</em>") }} />
              <p>{t("Contanos qué proceso querés ordenar, automatizar o escalar. Lo convertimos en software real, medible y elegante.", "Tell us which process you want to organize, automate or scale. We turn it into real, measurable and elegant software.")}</p>
              <div className={styles.fCta}>
                <Link href="/contacto" className="btn btn-lg btn-on-dark">
                  {t("Iniciar proyecto", "Start project")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
                <Link href="/contacto" className="btn btn-lg btn-ghost btn-on-dark">{t("Agendar llamada", "Book a call")}</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
