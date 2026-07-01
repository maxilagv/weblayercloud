"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import CampusHero from "@/components/CampusHero";
import CampusIcon, { type CampusIconKey } from "@/components/CampusIcons";
import CampusPreviewSection from "@/components/home/CampusPreviewSection";
import styles from "./page.module.css";

export default function CampusPage() {
  const { t } = useLang();

  const modules: { icon: CampusIconKey; title: string; sub: string; feats: string[]; highlight: string; audience: string }[] = [
    {
      icon: "ai",
      title: t("Aula inteligente", "Smart classroom"),
      sub: t("Organiza la clase antes de empezar: objetivos, recursos, actividades y seguimiento quedan conectados al curso.", "Organizes class before it starts: goals, resources, activities and follow-up stay connected to the course."),
      highlight: t("Mas tiempo ensenando", "More time teaching"),
      audience: t("Docentes y alumnos", "Teachers and students"),
      feats: [t("Planificacion por unidad", "Unit planning"), t("Recursos sugeridos", "Suggested resources"), t("Seguimiento posterior", "Follow-up")],
    },
    {
      icon: "report",
      title: t("Evaluacion y boletines", "Assessment and report cards"),
      sub: t("Convierte evaluaciones, devoluciones y boletines en un flujo claro para docentes, familias y direccion.", "Turns assessments, feedback and report cards into a clear flow for teachers, families and leadership."),
      highlight: t("Cierre academico sin friccion", "Frictionless academic closing"),
      audience: t("Docentes, directivos y familias", "Teachers, leadership and families"),
      feats: [t("Criterios y rubricas", "Criteria and rubrics"), t("Boletines verificables", "Verifiable reports"), t("Historial por alumno", "Student history")],
    },
    {
      icon: "attendance",
      title: t("Asistencia y permanencia", "Attendance and retention"),
      sub: t("Detecta ausencias, patrones de riesgo y necesidades de acompanamiento antes de que se transformen en problemas.", "Detects absences, risk patterns and support needs before they become problems."),
      highlight: t("Alertas tempranas accionables", "Actionable early alerts"),
      audience: t("Docentes, directivos y familias", "Teachers, leadership and families"),
      feats: [t("Registro por clase", "Per-class tracking"), t("Aviso automatico", "Automatic notice"), t("Riesgo por curso", "Course risk")],
    },
    {
      icon: "bell",
      title: t("Comunicacion familia-escuela", "Family-school communication"),
      sub: t("Mensajes importantes con destinatarios claros, confirmacion de lectura y trazabilidad para evitar informacion perdida.", "Important messages with clear recipients, read confirmation and traceability to avoid lost information."),
      highlight: t("Confianza en cada aviso", "Trust in every notice"),
      audience: t("Familias, docentes y direccion", "Families, teachers and leadership"),
      feats: [t("Segmentacion por rol", "Role segmentation"), t("Lectura confirmada", "Confirmed reading"), t("Canales integrados", "Integrated channels")],
    },
    {
      icon: "calendar",
      title: t("Calendario y reservas", "Calendar and booking"),
      sub: t("Ordena clases, reuniones, espacios, salidas y turnos con recordatorios y cupos visibles para cada actor.", "Organizes classes, meetings, spaces, trips and appointments with reminders and visible capacity for every actor."),
      highlight: t("Agenda institucional sin cruces", "Institutional schedule without clashes"),
      audience: t("Toda la comunidad", "The whole community"),
      feats: [t("Cupos y listas", "Capacity and lists"), t("Reservas de espacios", "Space booking"), t("Recordatorios utiles", "Useful reminders")],
    },
    {
      icon: "video",
      title: t("Biblioteca de contenidos", "Content library"),
      sub: t("Materiales, clases grabadas, guias y recursos curados por nivel para que el aprendizaje no dependa de archivos sueltos.", "Materials, recorded classes, guides and resources curated by level so learning does not depend on scattered files."),
      highlight: t("Conocimiento siempre disponible", "Knowledge always available"),
      audience: t("Alumnos y docentes", "Students and teachers"),
      feats: [t("Rutas por materia", "Subject paths"), t("Acceso por permiso", "Permission access"), t("Versiones ordenadas", "Organized versions")],
    },
    {
      icon: "certificate",
      title: t("Certificados verificables", "Verifiable certificates"),
      sub: t("Emision digital con identidad institucional, historial y validacion por QR para cursos, talleres y trayectos.", "Digital issuing with institutional identity, history and QR validation for courses, workshops and paths."),
      highlight: t("Credenciales con respaldo", "Credentials with backing"),
      audience: t("Institucion y estudiantes", "Institution and students"),
      feats: [t("QR de validacion", "Validation QR"), t("Plantillas de marca", "Branded templates"), t("Envio automatico", "Automatic delivery")],
    },
    {
      icon: "analytics",
      title: t("Analitica directiva", "Leadership analytics"),
      sub: t("Indicadores de asistencia, rendimiento, comunicacion y gestion en reportes que explican donde actuar.", "Attendance, performance, communication and management indicators in reports that explain where to act."),
      highlight: t("Datos claros para decidir", "Clear data for decisions"),
      audience: t("Directivos y coordinadores", "Leaders and coordinators"),
      feats: [t("Panel por nivel", "Level dashboard"), t("Comparativas por curso", "Course comparisons"), t("Reportes ejecutivos", "Executive reports")],
    },
    {
      icon: "vote",
      title: t("Tramites y autorizaciones", "Processes and authorizations"),
      sub: t("Digitaliza permisos, solicitudes, formularios y aprobaciones con estados visibles para escuela y familias.", "Digitizes permissions, requests, forms and approvals with visible statuses for school and families."),
      highlight: t("Menos papel, menos persecucion", "Less paper, less chasing"),
      audience: t("Familias y administracion", "Families and administration"),
      feats: [t("Firma y consentimiento", "Signature and consent"), t("Estados visibles", "Visible statuses"), t("Archivo institucional", "Institutional archive")],
    },
    {
      icon: "wrench",
      title: t("Integraciones y automatizaciones", "Integrations and automations"),
      sub: t("Conecta sistemas existentes y automatiza tareas repetitivas para que Campus sea el centro operativo de la institucion.", "Connects existing systems and automates repetitive tasks so Campus becomes the institution's operating center."),
      highlight: t("Operacion conectada", "Connected operations"),
      audience: t("Equipo directivo y gestion", "Leadership and operations team"),
      feats: [t("Pagos y administracion", "Payments and admin"), t("Importacion de datos", "Data import"), t("Flujos a medida", "Custom workflows")],
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
            <article className={`${styles.statCard} ${styles.surface} ${styles.reveal}`}>
              <span className={styles.statNum}>4</span>
              <div className={styles.statLabel}>{t("Roles claros con permisos simples", "Clear roles with simple permissions")}</div>
            </article>
            <article className={`${styles.statCard} ${styles.surface} ${styles.reveal}`}>
              <span className={styles.statNum}>1</span>
              <div className={styles.statLabel}>{t("Lugar para tareas, avisos y decisiones", "Place for tasks, notices and decisions")}</div>
            </article>
            <article className={`${styles.statCard} ${styles.surface} ${styles.reveal}`}>
              <span className={styles.statNum}>10</span>
              <div className={styles.statLabel}>{t("Modulos conectados capa por capa", "Connected modules layer by layer")}</div>
            </article>
            <article className={`${styles.statCard} ${styles.surface} ${styles.reveal}`}>
              <span className={styles.statNum}>100%</span>
              <div className={styles.statLabel}>{t("Pensado para usar desde el aula o la casa", "Built for classroom and home use")}</div>
            </article>
          </div>
        </div>
      </section>

      <div className={styles.thread} aria-hidden="true" />

      <CampusPreviewSection />

      <div className={styles.thread} aria-hidden="true" />

      {/* MODULES */}
      <section className="section">
        <div className={styles.atmos} aria-hidden="true">
          <span className={`${styles.orb} ${styles.orbA}`} />
          <span className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.dots} />
        </div>
        <div className="wrap">
          <div className={`${styles.head} ${styles.center} ${styles.inner}`}>
            <span className={styles.eyebrow}>{t("Modulos", "Modules")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Todo en una <em>sola plataforma.</em>", "Everything in <em>one platform.</em>") }} />
            <p className={styles.sub}>{t("Modulos conectados que resuelven el dia a dia escolar y convierten la gestion en una ventaja institucional.", "Connected modules that solve daily school work and turn operations into an institutional advantage.")}</p>
          </div>

          <div className={`${styles.modGrid} ${styles.inner}`}>
            {modules.map((m) => (
              <article key={m.title} className={`${styles.mcard} ${styles.surface} ${styles.reveal}`}>
                <span className={styles.iconTile}><CampusIcon name={m.icon} /></span>
                <span className={styles.moduleHighlight}>{m.highlight}</span>
                <span className={styles.moduleAudience}>{m.audience}</span>
                <div className={styles.mcardTtl}>{m.title}</div>
                <div className={styles.mcardSub}>{m.sub}</div>
                <ul className={styles.mcardFeats}>
                  {m.feats.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINALE / CTA */}
      <section className="section">
        <div className="wrap">
          <div className={styles.finale}>
            <div className={styles.fAurora} aria-hidden="true" />
            <div className={styles.fGrid} aria-hidden="true" />
            <div className={styles.fInner}>
              <h2 dangerouslySetInnerHTML={{ __html: t("Construi el campus que tu institucion <em>necesita.</em>", "Build the campus your institution <em>needs.</em>") }} />
              <p>{t("Disenamos roles, modulos y automatizaciones adaptados a los procesos reales de tu institucion.", "We design roles, modules and automations tailored to your institution's real processes.")}</p>
              <div className={styles.fCta}>
                <Link href="/contacto" className="btn btn-lg btn-on-dark">
                  {t("Iniciar proyecto", "Start project")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
                <Link href="/contacto" className="btn btn-lg btn-ghost btn-on-dark">{t("Agendar llamada", "Book a call")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
