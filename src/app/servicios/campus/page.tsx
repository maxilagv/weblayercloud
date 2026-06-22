"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import Counter from "@/components/Counter";
import ScrollReveal from "@/components/ScrollReveal";
import CampusHero from "@/components/CampusHero";
import TiltCard from "@/components/TiltCard";
import CampusIcon, { type CampusIconKey } from "@/components/CampusIcons";
import styles from "./page.module.css";

type Role = "alumno" | "docente" | "directivo" | "familia";

export default function CampusPage() {
  const { t } = useLang();
  const [activeRole, setActiveRole] = React.useState<Role>("alumno");

  // Staggered opacity reveal for depth cards — armed by JS so cards are never
  // stuck hidden when JS or motion is unavailable (CSS keeps them visible).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(`.${styles.reveal}`));
    if (reduced || !cards.length || !("IntersectionObserver" in window)) return;

    // Hide without transition first (no flash), reflow, then animate in.
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
          }, idx * 70);
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [activeRole]);

  const roleTabs: { key: Role; icon: CampusIconKey; label: string }[] = [
    { key: "alumno", icon: "student", label: t("Alumno", "Student") },
    { key: "docente", icon: "teacher", label: t("Docente", "Teacher") },
    { key: "directivo", icon: "director", label: t("Directivo", "Director") },
    { key: "familia", icon: "family", label: t("Familia", "Family") },
  ];

  const modules: { icon: CampusIconKey; title: string; sub: string; feats: string[] }[] = [
    {
      icon: "video",
      title: t("Contenido audiovisual", "Audiovisual content"),
      sub: t("Subí clases, materiales y recursos directamente a la plataforma.", "Upload classes, materials and resources directly to the platform."),
      feats: [t("Video + PDF + presentaciones", "Video + PDF + presentations"), t("Contenido por materia y nivel", "Content by course and level"), t("Acceso controlado por alumno", "Controlled student access")],
    },
    {
      icon: "report",
      title: t("Notas y boletines", "Grades & report cards"),
      sub: t("Generación y envío automatizados a familias, con historial y firmas.", "Automated generation and delivery to families, with history and signatures."),
      feats: [t("Carga de notas masiva", "Bulk grade entry"), t("Autogeneración en PDF", "PDF auto-generation"), t("Confirmación de recepción", "Delivery confirmation")],
    },
    {
      icon: "bell",
      title: t("Notif. a familias", "Family notifications"),
      sub: t("Push, email y WhatsApp. Segmentadas por grado, nivel o rol.", "Push, email and WhatsApp. Segmented by class, level or role."),
      feats: [t("Instantáneas o programadas", "Instant or scheduled"), t("Confirmación de lectura", "Read confirmation"), t("Alertas de emergencia", "Emergency alerts")],
    },
    {
      icon: "calendar",
      title: t("Horarios y clases", "Schedule & classes"),
      sub: t("Contraturnos, recordatorios e inscripciones online gestionados automáticamente.", "Counter-shifts, reminders and online enrollment managed automatically."),
      feats: [t("Recordatorio automático 24hs antes", "Automatic reminder 24h prior"), t("Inscripción online con cupo", "Online enrollment with cap"), t("Gestión de lista de espera", "Waitlist management")],
    },
    {
      icon: "attendance",
      title: t("Asistencia", "Attendance"),
      sub: t("Registro en tiempo real. Alerta automática a familias ante ausencia.", "Real-time tracking. Automatic alert to families when a student is absent."),
      feats: [t("Asistencia digital por clase", "Digital attendance per class"), t("Historial de inasistencias", "Absence history"), t("Justificada / injustificada", "Justified / unjustified")],
    },
    {
      icon: "vote",
      title: t("Votaciones en vivo", "Live voting"),
      sub: t("Elecciones del centro estudiantil, encuestas y decisiones en tiempo real.", "Student council elections, surveys and decisions in real time, with verified results."),
      feats: [t("Anónima o identificada", "Anonymous or identified"), t("Resultados en tiempo real", "Live results"), t("Auditoría completa", "Full audit trail")],
    },
    {
      icon: "certificate",
      title: t("Certificaciones", "Certifications"),
      sub: t("Autogeneradas, firmadas digitalmente y enviadas al completar el curso.", "Auto-generated, digitally signed and sent to students on course completion."),
      feats: [t("Diseño de certificado a medida", "Custom certificate design"), t("QR de verificación", "Verifiable QR code"), t("Envío automático", "Automatic delivery")],
    },
    {
      icon: "analytics",
      title: t("Analítica educativa", "Educational analytics"),
      sub: t("Rendimiento, retención y predicciones por alumno, clase, nivel o institución.", "Performance, retention and predictions by student, class, level or institution."),
      feats: [t("Detección temprana de abandono", "Early dropout detection"), t("Rendimiento por materia", "Performance by subject"), t("Reportes exportables", "Exportable reports")],
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root{ --page-accent:#FB7A5B; --page-accent-rgb:251,122,91; }
      `}} />

      <CampusHero />

      {/* STATS */}
      <section className={styles.statsScene}>
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbA}`} />
          <span className={`${styles.orb} ${styles.orbB}`} />
        </div>
        <div className="wrap">
          <div className={`${styles.statsGrid} ${styles.inner}`}>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={2400} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Alumnos en una plataforma", "Students on one platform")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={98} className={styles.statNum} />
              <div className={styles.statLabel}>{t("% entrega notificaciones familias", "% family notification delivery")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={12} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Paneles por rol", "Role-based panels")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>100%</span>
              <div className={styles.statLabel}>{t("Mobile-first", "Mobile-first")}</div>
            </TiltCard>
          </div>
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      {/* ROLES */}
      <section className="section" id="roles">
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbC}`} />
          <div className={styles.dots} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Roles", "Roles")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Un panel para <em>cada actor.</em>", "A panel for <em>every actor.</em>") }} />
            <p className={styles.sub}>{t("Cada usuario ve exactamente lo que necesita — sus datos, sus herramientas, sus permisos.", "Each user sees exactly what they need — their data, their tools, their permissions.")}</p>
          </ScrollReveal>

          <ScrollReveal className={`${styles.roleTabs} ${styles.inner}`}>
            {roleTabs.map((r) => (
              <button
                key={r.key}
                className={`${styles.roleBtn} ${activeRole === r.key ? styles.active : ""}`}
                onClick={() => setActiveRole(r.key)}
                aria-pressed={activeRole === r.key}
              >
                <span className={styles.rbAv}><CampusIcon name={r.icon} /></span>
                <span>{r.label}</span>
              </button>
            ))}
          </ScrollReveal>

          {/* Role Pane - Alumno */}
          {activeRole === "alumno" && (
            <div className={`${styles.rolePane} ${styles.roleAlumno} ${styles.inner}`}>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Mis materias", "My courses")}</h4>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Matemática", "Mathematics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "78%" }} /></div><span className={styles.rp}>78%</span></div>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Física", "Physics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "56%" }} /></div><span className={styles.rp}>56%</span></div>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Robótica", "Robotics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "91%" }} /></div><span className={styles.rp}>91%</span></div>
              </TiltCard>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Notas + próxima clase", "Grades + upcoming")}</h4>
                <div className={styles.rrow}><span>{t("Mat. · Unidad 3", "Maths · Unit 3")}</span><span className={styles.rv} style={{ color: "#1F9D5B" }}>9.2</span></div>
                <div className={styles.rrow}><span>{t("Fís. · TP1", "Physics · TP1")}</span><span className={styles.rv} style={{ color: "var(--amber)" }}>7.8</span></div>
                <div className={styles.rrow}><span>{t("Rob. · Proyecto", "Robotics · Project")}</span><span className={styles.rv} style={{ color: "#1F9D5B" }}>10</span></div>
                <div className={styles.rrow} style={{ marginTop: "6px", paddingTop: "10px", borderTop: "1px solid var(--line)", borderBottom: 0 }}><span>{t("Prox.: Robótica 16:30 · Aula 4", "Next: Robotics 16:30 · Room 4")}</span></div>
              </TiltCard>
            </div>
          )}

          {/* Role Pane - Docente */}
          {activeRole === "docente" && (
            <div className={`${styles.rolePane} ${styles.roleDocente} ${styles.inner}`}>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Asistencia hoy — 4° grado", "Attendance — 4th grade")}</h4>
                <div className={styles.rrow}><span className={styles.rdot} style={{ background: "#1F9D5B", marginRight: "8px" }} />García, Lucas<span className={styles.rst} style={{ background: "rgba(31,157,91,.1)", color: "#1F9D5B" }}>{t("Presente", "Present")}</span></div>
                <div className={styles.rrow}><span className={styles.rdot} style={{ background: "#1F9D5B", marginRight: "8px" }} />López, María<span className={styles.rst} style={{ background: "rgba(31,157,91,.1)", color: "#1F9D5B" }}>{t("Presente", "Present")}</span></div>
                <div className={styles.rrow}><span className={styles.rdot} style={{ background: "var(--coral)", marginRight: "8px" }} />Pérez, Sofía<span className={styles.rst} style={{ background: "rgba(251,122,91,.1)", color: "var(--coral)" }}>{t("Ausente", "Absent")}</span></div>
                <div className={styles.rrow}><span className={styles.rdot} style={{ background: "#1F9D5B", marginRight: "8px" }} />Torres, Iván<span className={styles.rst} style={{ background: "rgba(31,157,91,.1)", color: "#1F9D5B" }}>{t("Presente", "Present")}</span></div>
              </TiltCard>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Notas — Unidad 3", "Grades — Unit 3")}</h4>
                <div className={styles.rrow}><span>García</span><span className={styles.rv} style={{ color: "#1F9D5B" }}>9.2</span></div>
                <div className={styles.rrow}><span>López</span><span className={styles.rv} style={{ color: "#1F9D5B" }}>8.7</span></div>
                <div className={styles.rrow}><span>Pérez</span><span className={styles.rv} style={{ color: "var(--coral)" }}>{t("Pendiente", "Pending")}</span></div>
                <div className={styles.rrow}><span>Torres</span><span className={styles.rv} style={{ color: "#1F9D5B" }}>10</span></div>
              </TiltCard>
            </div>
          )}

          {/* Role Pane - Directivo */}
          {activeRole === "directivo" && (
            <div className={`${styles.rolePane} ${styles.roleDirectivo} ${styles.inner}`}>
              <TiltCard className={`${styles.rcard} ${styles.depth}`} style={{ textAlign: "center" }}>
                <small style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t("ALUMNOS TOTALES", "TOTAL STUDENTS")}</small>
                <div style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-.025em", marginTop: "6px" }}>2,847</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".64rem", color: "#1F9D5B" }}>{t("▲ 12% vs. 2025", "▲ 12% vs. 2025")}</div>
              </TiltCard>
              <TiltCard className={`${styles.rcard} ${styles.depth}`} style={{ textAlign: "center" }}>
                <small style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t("ASISTENCIA", "ATTENDANCE")}</small>
                <div style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-.025em", marginTop: "6px" }}>94.2%</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".64rem", color: "#1F9D5B" }}>{t("▲ 1.8 pts", "▲ 1.8 pts")}</div>
              </TiltCard>
              <TiltCard className={`${styles.rcard} ${styles.depth}`} style={{ textAlign: "center" }}>
                <small style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t("CERTIF. EMITIDOS", "CERTIF. ISSUED")}</small>
                <div style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-.025em", marginTop: "6px" }}>384</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: ".64rem", color: "#1F9D5B" }}>{t("Este año", "This year")}</div>
              </TiltCard>
            </div>
          )}

          {/* Role Pane - Familia */}
          {activeRole === "familia" && (
            <div className={`${styles.rolePane} ${styles.roleFamilia} ${styles.inner}`}>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Lucas García — notificaciones", "Lucas García — notifications")}</h4>
                <div className={styles.rrow}><span>{t("Boletín — Matemática: 9.2", "Report card — Math: 9.2")}</span><span className={styles.rst} style={{ background: "rgba(251,122,91,.1)", color: "var(--coral)" }}>{t("Nuevo", "New")}</span></div>
                <div className={styles.rrow}><span>{t("Presente hoy — 08:12 hs", "Present today — 08:12 hs")}</span><span className={styles.rst} style={{ background: "rgba(31,157,91,.1)", color: "#1F9D5B" }}>{t("Hoy", "Today")}</span></div>
                <div className={styles.rrow}><span>{t("Robótica: mañana 16:30", "Robotics: tomorrow 16:30")}</span><span className={styles.rst} style={{ background: "rgba(244,169,59,.1)", color: "var(--amber)" }}>{t("Recordatorio", "Reminder")}</span></div>
              </TiltCard>
              <TiltCard className={`${styles.rcard} ${styles.depth}`}>
                <h4>{t("Progreso por materia", "Progress by subject")}</h4>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Matemática", "Mathematics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "92%" }} /></div><span className={styles.rp}>9.2</span></div>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Física", "Physics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "78%" }} /></div><span className={styles.rp}>7.8</span></div>
                <div className={styles.rbarRow}><span className={styles.rl}>{t("Robótica", "Robotics")}</span><div className={styles.rbBg}><div className={styles.rbFg} style={{ width: "100%" }} /></div><span className={styles.rp}>10</span></div>
              </TiltCard>
            </div>
          )}
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      {/* MODULES */}
      <section className="section">
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbA}`} />
          <span className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.dots} />
        </div>
        <div className="wrap">
          <ScrollReveal className={`${styles.head} ${styles.center} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Módulos", "Modules")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Todo en una <em>sola plataforma.</em>", "Everything in <em>one platform.</em>") }} />
            <p className={styles.sub}>{t("Ocho módulos que trabajan juntos — diseñados para los procesos reales de tu institución.", "Eight modules working together — designed around your institution's real workflows.")}</p>
          </ScrollReveal>

          <div className={`${styles.modGrid} ${styles.inner}`}>
            {modules.map((m) => (
              <TiltCard key={m.title} className={`${styles.mcard} ${styles.depth} ${styles.reveal}`}>
                <span className={styles.iconTile}><CampusIcon name={m.icon} /></span>
                <div className={styles.mcardTtl}>{m.title}</div>
                <div className={styles.mcardSub}>{m.sub}</div>
                <ul className={styles.mcardFeats}>
                  {m.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
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
              <h2 dangerouslySetInnerHTML={{ __html: t("Construí el campus que tu institución <em>necesita.</em>", "Build the campus your institution <em>needs.</em>") }} />
              <p>{t("Diseñamos roles, módulos y automatizaciones adaptados a los procesos reales de tu institución.", "We design roles, modules and automations tailored to your institution's real processes.")}</p>
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
    </>
  );
}
