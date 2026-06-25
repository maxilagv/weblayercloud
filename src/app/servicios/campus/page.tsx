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
type Tone = "indigo" | "coral" | "amber" | "green";
type MeterWidth = "w38" | "w44" | "w52" | "w58" | "w64" | "w72" | "w78" | "w84" | "w91";

export default function CampusPage() {
  const { t } = useLang();
  const [activeRole, setActiveRole] = React.useState<Role>("alumno");

  // Staggered opacity reveal for depth cards - armed by JS so cards are never
  // stuck hidden when JS or motion is unavailable (CSS keeps them visible).
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

  const rolePanels: Record<Role, {
    title: string;
    pain: string;
    promise: string;
    summary: string;
    value: string;
    benefits: string[];
    includedModules: string[];
    outcomes: string[];
    dashboard: string;
    meta: string;
    tools: string[];
    kpis: { label: string; value: string; tone: Tone }[];
    focus: { label: string; status: string; tone: Tone }[];
    timeline: { time: string; title: string; meta: string; tone: Tone }[];
    meters: { label: string; value: string; width: MeterWidth }[];
  }> = {
    alumno: {
      title: t("Sabe que hacer hoy y no se pierde.", "They know what to do today and stay on track."),
      pain: t("Cuando todo esta repartido entre cuadernos, chats y archivos, el alumno pierde foco.", "When everything is split across notebooks, chats and files, students lose focus."),
      promise: t("Campus convierte cada jornada en una ruta simple: que mirar, que entregar y donde pedir ayuda.", "Campus turns each day into a simple route: what to review, what to submit and where to ask for help."),
      summary: t("Agenda, tareas, materiales y progreso aparecen en un recorrido claro. El alumno ve prioridades, avisos y acompanamiento sin buscar en distintos canales.", "Agenda, tasks, materials and progress are shown as a clear path. Students see priorities, alerts and guidance without searching across channels."),
      value: t("Menos dudas, mas autonomia.", "Less confusion, more autonomy."),
      benefits: [t("Prioridades del dia en primer plano", "Daily priorities upfront"), t("Materiales y avisos en contexto", "Materials and notices in context"), t("Progreso explicado sin tecnicismos", "Progress explained without jargon")],
      includedModules: [t("Agenda diaria", "Daily agenda"), t("Ruta de aprendizaje", "Learning path"), t("Biblioteca de contenidos", "Content library"), t("Acompanamiento", "Guidance")],
      outcomes: [t("Mas continuidad entre clases.", "More continuity between classes."), t("Menos consultas repetidas a docentes.", "Fewer repeated questions to teachers.")],
      dashboard: t("Panel diario del alumno", "Student daily panel"),
      meta: t("Hoy - 4 pendientes - 2 materiales nuevos", "Today - 4 pending - 2 new materials"),
      tools: [t("Agenda", "Agenda"), t("Tareas", "Tasks"), t("Materiales", "Materials"), t("Progreso", "Progress")],
      kpis: [
        { label: t("Prioridad de hoy", "Today's priority"), value: t("3 tareas", "3 tasks"), tone: "coral" },
        { label: t("Ruta semanal", "Weekly path"), value: "72%", tone: "indigo" },
        { label: t("Avisos leidos", "Read notices"), value: "8/9", tone: "green" },
      ],
      focus: [
        { label: t("Entregar guia de Lengua", "Submit language guide"), status: t("Vence hoy", "Due today"), tone: "coral" },
        { label: t("Repasar video de fracciones", "Review fractions video"), status: t("18 min", "18 min"), tone: "indigo" },
        { label: t("Confirmar material de laboratorio", "Confirm lab material"), status: t("Manana", "Tomorrow"), tone: "amber" },
      ],
      timeline: [
        { time: "08:10", title: t("Ingreso registrado", "Check-in registered"), meta: t("Familia notificada automaticamente", "Family notified automatically"), tone: "green" },
        { time: "10:30", title: t("Matematica - practica guiada", "Math - guided practice"), meta: t("Recurso recomendado listo", "Recommended resource ready"), tone: "indigo" },
        { time: "16:00", title: t("Tarea priorizada", "Prioritized task"), meta: t("La plataforma ordena que resolver primero", "The platform orders what to solve first"), tone: "coral" },
      ],
      meters: [
        { label: t("Comprension", "Understanding"), value: "84%", width: "w84" },
        { label: t("Habitos", "Habits"), value: "72%", width: "w72" },
        { label: t("Materiales vistos", "Materials viewed"), value: "91%", width: "w91" },
      ],
    },
    docente: {
      title: t("Menos carga administrativa y mas tiempo para ensenar.", "Less administrative work and more time to teach."),
      pain: t("El docente no necesita otro lugar para cargar datos; necesita recuperar tiempo de aula.", "Teachers do not need another place to enter data; they need classroom time back."),
      promise: t("Campus une planificacion, asistencia, notas y comunicacion en una mesa de trabajo rapida.", "Campus joins planning, attendance, grades and communication in a fast workspace."),
      summary: t("El docente planifica clases, toma asistencia, carga notas, deja devoluciones y detecta alumnos que necesitan ayuda desde un panel pensado para el ritmo del aula.", "Teachers plan classes, take attendance, enter grades, leave feedback and spot students who need help from a panel built for classroom pace."),
      value: t("El aula queda ordenada antes, durante y despues de clase.", "The classroom stays organized before, during and after class."),
      benefits: [t("Asistencia y alertas sin doble carga", "Attendance and alerts without duplicate work"), t("Planificacion lista para reutilizar", "Planning ready to reuse"), t("Devoluciones claras para familias", "Clear feedback for families")],
      includedModules: [t("Planificacion", "Planning"), t("Asistencia", "Attendance"), t("Evaluacion", "Assessment"), t("Comunicacion", "Communication")],
      outcomes: [t("Menos administracion fuera de horario.", "Less after-hours admin."), t("Mas seguimiento real por alumno.", "More real follow-up per student.")],
      dashboard: t("Mesa de trabajo docente", "Teacher workspace"),
      meta: t("4 B - Clase en curso - 27 alumnos", "4 B - Class in progress - 27 students"),
      tools: [t("Planificar", "Plan"), t("Asistencia", "Attendance"), t("Notas", "Grades"), t("Familias", "Families")],
      kpis: [
        { label: t("Asistencia tomada", "Attendance taken"), value: "26/27", tone: "green" },
        { label: t("Devoluciones", "Feedback"), value: t("12 listas", "12 ready"), tone: "indigo" },
        { label: t("Alertas de apoyo", "Support alerts"), value: "3", tone: "coral" },
      ],
      focus: [
        { label: t("Plan de clase - ecosistemas", "Lesson plan - ecosystems"), status: t("Listo", "Ready"), tone: "green" },
        { label: t("Sofia necesita seguimiento", "Sofia needs follow-up"), status: t("Alerta", "Alert"), tone: "coral" },
        { label: t("Enviar devolucion a familias", "Send feedback to families"), status: t("Borrador", "Draft"), tone: "amber" },
      ],
      timeline: [
        { time: "07:45", title: t("Planificacion sugerida", "Suggested plan"), meta: t("Objetivos, recursos y actividad de cierre", "Goals, resources and closing activity"), tone: "indigo" },
        { time: "08:05", title: t("Asistencia en 40 segundos", "Attendance in 40 seconds"), meta: t("Ausencias notificadas sin pasos extra", "Absences notified without extra steps"), tone: "green" },
        { time: "11:20", title: t("Devoluciones reutilizables", "Reusable feedback"), meta: t("Comentarios claros sin repetir carga", "Clear comments without repeated work"), tone: "amber" },
      ],
      meters: [
        { label: t("Carga administrativa", "Admin workload"), value: t("baja", "low"), width: "w38" },
        { label: t("Curso al dia", "Class up to date"), value: "78%", width: "w78" },
        { label: t("Recursos preparados", "Prepared resources"), value: "84%", width: "w84" },
      ],
    },
    directivo: {
      title: t("Dirigir con datos claros sin perseguir planillas.", "Lead with clear data without chasing spreadsheets."),
      pain: t("La direccion suele enterarse tarde porque la informacion llega fragmentada y con formatos distintos.", "Leadership often finds out late because information arrives fragmented and in different formats."),
      promise: t("Campus arma una capa institucional con indicadores, alertas y responsables visibles.", "Campus builds an institutional layer with visible indicators, alerts and owners."),
      summary: t("Direccion ve asistencia general, rendimiento por curso, tramites, morosidad, clima de comunicacion y alertas tempranas en un tablero institucional accionable.", "Leadership sees overall attendance, class performance, processes, payments, communication climate and early alerts in one actionable institutional board."),
      value: t("Decisiones rapidas con evidencia visible.", "Faster decisions with visible evidence."),
      benefits: [t("Indicadores por nivel y curso", "Indicators by level and course"), t("Alertas tempranas con contexto", "Early alerts with context"), t("Reportes listos para decidir", "Decision-ready reports")],
      includedModules: [t("Analitica directiva", "Leadership analytics"), t("Permanencia", "Retention"), t("Tramites", "Processes"), t("Reportes", "Reports")],
      outcomes: [t("Menos reuniones para reconstruir datos.", "Fewer meetings to rebuild data."), t("Mas capacidad de anticipar problemas.", "More ability to anticipate problems.")],
      dashboard: t("Tablero institucional", "Institutional dashboard"),
      meta: t("Secundario - Semana 24 - Actualizado ahora", "Secondary - Week 24 - Updated now"),
      tools: [t("Gestion", "Management"), t("Reportes", "Reports"), t("Alertas", "Alerts"), t("Tramites", "Processes")],
      kpis: [
        { label: t("Asistencia general", "Overall attendance"), value: "94%", tone: "green" },
        { label: t("Cursos en riesgo", "Courses at risk"), value: "2", tone: "coral" },
        { label: t("Tramites resueltos", "Resolved processes"), value: "87%", tone: "indigo" },
      ],
      focus: [
        { label: t("3 A bajo rendimiento en Matematica", "3 A low math performance"), status: t("Revisar", "Review"), tone: "coral" },
        { label: t("Autorizaciones de salida", "Trip authorizations"), status: "91%", tone: "green" },
        { label: t("Morosidad administrativa", "Administrative overdue items"), status: t("12 casos", "12 cases"), tone: "amber" },
      ],
      timeline: [
        { time: "09:00", title: t("Reporte semanal listo", "Weekly report ready"), meta: t("Asistencia, rendimiento y comunicaciones", "Attendance, performance and communications"), tone: "indigo" },
        { time: "12:15", title: t("Alerta temprana por curso", "Early course alert"), meta: t("Direccion ve causa y responsable sugerido", "Leadership sees cause and suggested owner"), tone: "coral" },
        { time: "15:40", title: t("Comunicacion confirmada", "Communication confirmed"), meta: t("Lectura de familias por nivel", "Family read rate by level"), tone: "green" },
      ],
      meters: [
        { label: t("Rendimiento", "Performance"), value: "78%", width: "w78" },
        { label: t("Permanencia", "Retention"), value: "91%", width: "w91" },
        { label: t("Tramites", "Processes"), value: "84%", width: "w84" },
      ],
    },
    familia: {
      title: t("Confianza, cercania y menos perdida de informacion.", "Trust, closeness and less lost information."),
      pain: t("Las familias pierden confianza cuando los avisos importantes quedan enterrados en canales informales.", "Families lose trust when important notices are buried in informal channels."),
      promise: t("Campus muestra lo importante con lenguaje claro, confirmacion y proximos pasos.", "Campus shows what matters with clear language, confirmation and next steps."),
      summary: t("La familia entiende como esta su hijo o hija, recibe avisos confirmables, calendario, autorizaciones, pagos, tramites y mensajes importantes en lenguaje simple.", "Families understand how their child is doing, receive confirmable notices, calendar items, authorizations, payments, processes and key messages in simple language."),
      value: t("La escuela se siente cerca, no dispersa.", "School feels close, not scattered."),
      benefits: [t("Avisos confirmados y ordenados", "Confirmed and organized notices"), t("Calendario familiar accionable", "Actionable family calendar"), t("Progreso en palabras simples", "Progress in simple words")],
      includedModules: [t("Seguimiento", "Follow-up"), t("Notificaciones", "Notifications"), t("Autorizaciones", "Authorizations"), t("Pagos y tramites", "Payments and processes")],
      outcomes: [t("Menos mensajes perdidos.", "Fewer lost messages."), t("Mas confianza en la gestion escolar.", "More trust in school operations.")],
      dashboard: t("Seguimiento familiar", "Family follow-up"),
      meta: t("Lucas - 2 avisos nuevos - 1 autorizacion", "Lucas - 2 new notices - 1 authorization"),
      tools: [t("Seguimiento", "Follow-up"), t("Calendario", "Calendar"), t("Mensajes", "Messages"), t("Pagos", "Payments")],
      kpis: [
        { label: t("Avisos confirmados", "Confirmed notices"), value: "100%", tone: "green" },
        { label: t("Progreso explicado", "Explained progress"), value: t("Claro", "Clear"), tone: "indigo" },
        { label: t("Tramites abiertos", "Open processes"), value: "1", tone: "amber" },
      ],
      focus: [
        { label: t("Autorizar salida didactica", "Authorize field trip"), status: t("Firmar", "Sign"), tone: "coral" },
        { label: t("Reunion docente", "Teacher meeting"), status: t("Jueves", "Thursday"), tone: "indigo" },
        { label: t("Cuota y comedor", "Tuition and lunch"), status: t("Al dia", "Up to date"), tone: "green" },
      ],
      timeline: [
        { time: "08:12", title: t("Ingreso confirmado", "Arrival confirmed"), meta: t("Notificacion recibida por la familia", "Notification received by the family"), tone: "green" },
        { time: "13:05", title: t("Mensaje importante", "Important message"), meta: t("Lectura confirmada, sin cadenas perdidas", "Read confirmed, no lost threads"), tone: "indigo" },
        { time: "18:00", title: t("Progreso en lenguaje simple", "Progress in simple language"), meta: t("Que avanzo y donde acompanar", "What improved and where to support"), tone: "amber" },
      ],
      meters: [
        { label: t("Comunicacion", "Communication"), value: "91%", width: "w91" },
        { label: t("Calendario", "Calendar"), value: "84%", width: "w84" },
        { label: t("Seguimiento", "Follow-up"), value: "78%", width: "w78" },
      ],
    },
  };

  const activePanel = rolePanels[activeRole];
  const activeTab = roleTabs.find((role) => role.key === activeRole) ?? roleTabs[0];

  const handleRoleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const lastIndex = roleTabs.length - 1;
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex === currentIndex && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextRole = roleTabs[nextIndex];
    setActiveRole(nextRole.key);
    window.requestAnimationFrame(() => document.getElementById(`campus-tab-${nextRole.key}`)?.focus());
  };

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
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={4} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Actores con permisos y panel propio", "Actors with permissions and their own panel")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={1} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Lugar para tareas, avisos y decisiones", "Place for tasks, notices and decisions")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <Counter count={10} className={styles.statNum} />
              <div className={styles.statLabel}>{t("Modulos conectados capa por capa", "Connected modules layer by layer")}</div>
            </TiltCard>
            <TiltCard className={`${styles.statCard} ${styles.depth} ${styles.reveal}`} lift={10}>
              <span className={styles.statNum}>100%</span>
              <div className={styles.statLabel}>{t("Pensado para usar desde el aula o la casa", "Built for classroom and home use")}</div>
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
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Un campus donde cada persona <em>sabe que hacer.</em>", "A campus where every person <em>knows what to do.</em>") }} />
            <p className={styles.sub}>{t("Alumnos, docentes, familias y directivos ven solo lo que necesitan: tareas, avisos, avances y decisiones en un mismo lugar.", "Students, teachers, families and leaders see only what they need: tasks, notices, progress and decisions in one place.")}</p>
            <p className={styles.microcopy}>{t("Lo armamos capa por capa con tu equipo. Sin sistema generico impuesto.", "We build it layer by layer with your team. No generic system imposed.")}</p>
          </ScrollReveal>

          <ScrollReveal className={`${styles.roleTabs} ${styles.inner}`} role="tablist" aria-label={t("Paneles por actor", "Panels by actor")}>
            {roleTabs.map((r, index) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                id={`campus-tab-${r.key}`}
                aria-controls={`campus-panel-${r.key}`}
                aria-selected={activeRole === r.key}
                tabIndex={activeRole === r.key ? 0 : -1}
                className={`${styles.roleBtn} ${activeRole === r.key ? styles.active : ""}`}
                onClick={() => setActiveRole(r.key)}
                onKeyDown={(event) => handleRoleKeyDown(event, index)}
                aria-label={`${t("Ver panel de", "View panel for")} ${r.label}`}
              >
                <span className={styles.rbAv}><CampusIcon name={r.icon} /></span>
                <span>{r.label}</span>
              </button>
            ))}
          </ScrollReveal>

          <ScrollReveal
            id={`campus-panel-${activeRole}`}
            className={`${styles.rolePane} ${styles.inner}`}
            role="tabpanel"
            aria-labelledby={`campus-tab-${activeRole}`}
            aria-live="polite"
          >
            <TiltCard className={`${styles.actorBrief} ${styles.depth}`} lift={8}>
              <span className={styles.iconTile}><CampusIcon name={activeTab.icon} /></span>
              <span className={styles.panelKicker}>{t("Panel para", "Panel for")} {activeTab.label}</span>
              <h3>{activePanel.title}</h3>
              <div className={styles.actorStory}>
                <span>{t("Dolor", "Pain")}</span>
                <p>{activePanel.pain}</p>
              </div>
              <div className={styles.actorStory}>
                <span>{t("Promesa", "Promise")}</span>
                <p>{activePanel.promise}</p>
              </div>
              <ul className={styles.benefitList}>
                {activePanel.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <div className={styles.valueStrip}>
                <span>{t("Valor visible", "Visible value")}</span>
                <strong>{activePanel.value}</strong>
              </div>
              <div className={styles.toolChips}>
                {activePanel.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </TiltCard>

            <TiltCard className={`${styles.liveDashboard} ${styles.depth}`} lift={7}>
              <div className={styles.dashTop}>
                <div>
                  <span className={styles.panelKicker}>{activeTab.label}</span>
                  <h3>{activePanel.dashboard}</h3>
                  <p>{activePanel.meta}</p>
                </div>
                <span className={styles.liveBadge}>{t("En vivo", "Live")}</span>
              </div>

              <div className={styles.dashShell}>
                <aside className={styles.dashNav} aria-label={t("Herramientas del panel", "Panel tools")}>
                  {activePanel.tools.map((tool, index) => (
                    <span key={tool} className={index === 0 ? styles.navActive : ""}>{tool}</span>
                  ))}
                </aside>

                <div className={styles.dashMain}>
                  <div className={styles.kpiGrid}>
                    {activePanel.kpis.map((kpi) => (
                      <div key={kpi.label} className={`${styles.kpiCard} ${styles[`tone${kpi.tone}`]}`}>
                        <span>{kpi.label}</span>
                        <strong>{kpi.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className={styles.panelColumns}>
                    <div className={styles.focusCard}>
                      <h4>{t("Prioridades visibles", "Visible priorities")}</h4>
                      <div className={styles.focusList}>
                        {activePanel.focus.map((item) => (
                          <div key={item.label} className={styles.focusItem}>
                            <span className={`${styles.statusDot} ${styles[`tone${item.tone}`]}`} />
                            <span>{item.label}</span>
                            <strong className={styles[item.tone]}>{item.status}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.timelineCard}>
                      <h4>{t("Linea de accion", "Action timeline")}</h4>
                      <div className={styles.timelineList}>
                        {activePanel.timeline.map((item) => (
                          <div key={`${item.time}-${item.title}`} className={styles.timelineItem}>
                            <span className={styles.time}>{item.time}</span>
                            <span className={`${styles.statusDot} ${styles[`tone${item.tone}`]}`} />
                            <div>
                              <strong>{item.title}</strong>
                              <p>{item.meta}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.meterPanel}>
                    {activePanel.meters.map((meter) => (
                      <div key={meter.label} className={styles.meterRow}>
                        <span>{meter.label}</span>
                        <div className={styles.meterTrack}><i className={styles[meter.width]} /></div>
                        <strong>{meter.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>

            <TiltCard className={`${styles.actorImpact} ${styles.depth}`} lift={6}>
              <div>
                <span className={styles.panelKicker}>{t("Incluye", "Includes")}</span>
                <h3>{t("Modulos que activan este panel", "Modules powering this panel")}</h3>
                <div className={styles.modulePills}>
                  {activePanel.includedModules.map((module) => (
                    <span key={module}>{module}</span>
                  ))}
                </div>
              </div>
              <div className={styles.translationBox}>
                <span>{t("Esto se traduce en", "This translates into")}</span>
                {activePanel.outcomes.map((outcome) => (
                  <strong key={outcome}>{outcome}</strong>
                ))}
              </div>
              <p>{activePanel.summary}</p>
            </TiltCard>
          </ScrollReveal>
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
            <span className={styles.eyebrow}>{t("Modulos", "Modules")}</span>
            <h2 className={styles.h2} dangerouslySetInnerHTML={{ __html: t("Todo en una <em>sola plataforma.</em>", "Everything in <em>one platform.</em>") }} />
            <p className={styles.sub}>{t("Modulos conectados que resuelven el dia a dia escolar y convierten la gestion en una ventaja institucional.", "Connected modules that solve daily school work and turn operations into an institutional advantage.")}</p>
          </ScrollReveal>

          <div className={`${styles.modGrid} ${styles.inner}`}>
            {modules.map((m) => (
              <TiltCard key={m.title} className={`${styles.mcard} ${styles.depth} ${styles.reveal}`}>
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
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
