"use client";

import type { CSSProperties, ReactNode } from "react";

import { useLang } from "@/context/LangContext";
import styles from "./CampusPreviewSection.module.css";

type IconName = "calendar" | "book" | "progress" | "route" | "sparkle" | "play" | "help";

const iconPaths: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M7.5 13h3v3h-3z" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h8a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3V4.5z" />
      <path d="M16 7.5h3a1 1 0 0 1 1 1V20h-4" />
      <path d="M8.5 8.5h4M8.5 12h4" />
    </>
  ),
  progress: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7.5 15.5l3.5-3.8 3 2.4 5-6.4" />
      <path d="M16.3 7.6H19v2.7" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.45 5.05L18.5 9.5l-5.05 1.45L12 16l-1.45-5.05L5.5 9.5l5.05-1.45L12 3z" />
      <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  play: <path d="M9 7.5v9l7-4.5-7-4.5z" />,
  help: (
    <>
      <path d="M12 21a8.5 8.5 0 1 0-8.5-8.5" />
      <path d="M9.7 9.4a2.6 2.6 0 1 1 4.4 1.9c-.9.8-1.7 1.3-1.7 2.7" />
      <path d="M12.4 17h.01" />
    </>
  ),
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

function CampusLogo() {
  return (
    <svg className={styles.mockupLogo} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M22 7 36 14.7 22 22.4 8 14.7 22 7Z" fill="url(#campusLogoTop)" />
      <path d="M10.5 21.4 22 27.7l11.5-6.3 3 1.7L22 31.2 7.5 23.1l3-1.7Z" fill="#24232c" opacity="0.9" />
      <path d="M12.6 29 22 34.2 31.4 29l2.8 1.55L22 37.3 9.8 30.55 12.6 29Z" fill="#d8d4df" />
      <defs>
        <linearGradient id="campusLogoTop" x1="8" y1="7" x2="35.6" y2="22.9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2f6bff" />
          <stop offset="0.48" stopColor="#6c4cff" />
          <stop offset="1" stopColor="#ff735f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function CampusPreviewSection() {
  const { t, lang } = useLang();

  const chips = [
    t("Agenda diaria", "Daily agenda"),
    t("Tareas", "Tasks"),
    t("Materiales", "Materials"),
    t("Progreso", "Progress"),
    t("Acompañamiento", "Support"),
  ];

  const tasks = [
    {
      title: t("Entregar guía de Lengua", "Submit Language guide"),
      hint: t("Prioridad alta", "High priority"),
      badge: t("Vence hoy", "Due today"),
    },
    {
      title: t("Repasar video de fracciones", "Review fractions video"),
      hint: t("Material sugerido", "Suggested material"),
      badge: "18 min",
    },
    {
      title: t("Confirmar material de laboratorio", "Confirm lab material"),
      hint: t("Aviso en contexto", "Context notice"),
      badge: t("Mañana", "Tomorrow"),
    },
  ];

  const progress = [
    { label: t("Comprensión", "Understanding"), value: "84%" },
    { label: t("Hábitos", "Habits"), value: "72%" },
    { label: t("Materiales vistos", "Materials viewed"), value: "91%" },
  ];

  const route = [
    {
      title: t("Ingreso registrado", "Check-in registered"),
      detail: t("Familia notificada automáticamente", "Family notified automatically"),
    },
    {
      title: t("Práctica guiada", "Guided practice"),
      detail: t("Recurso recomendado listo", "Recommended resource ready"),
    },
    {
      title: t("Tarea priorizada", "Prioritized task"),
      detail: t("La plataforma ordena qué resolver primero", "The platform orders what to solve first"),
    },
  ];

  const benefits = [
    {
      icon: "help" as const,
      title: t("Menos dudas", "Fewer doubts"),
      text: t("Cada alumno entiende qué tiene que hacer.", "Every student understands what to do."),
    },
    {
      icon: "route" as const,
      title: t("Más continuidad", "More continuity"),
      text: t("Clases, tareas y avisos quedan conectados.", "Classes, tasks and notices stay connected."),
    },
    {
      icon: "progress" as const,
      title: t("Más autonomía", "More autonomy"),
      text: t("El progreso se vuelve visible y fácil de seguir.", "Progress becomes visible and easy to follow."),
    },
  ];

  return (
    <section className={styles.campusSection} aria-labelledby="campus-preview-title">
      <span className={`${styles.ambientOrb} ${styles.ambientOrbOne}`} aria-hidden="true" />
      <span className={`${styles.ambientOrb} ${styles.ambientOrbTwo}`} aria-hidden="true" />

      <div className={styles.campusContainer}>
        <div className={styles.campusHeader}>
          <span className={styles.campusKicker}>{t("Campus virtual", "Virtual campus")}</span>
          <h2 className={styles.campusTitle} id="campus-preview-title">
            {lang === "es" ? (
              <>
                Todo lo que el alumno necesita, <span>en un solo recorrido.</span>
              </>
            ) : (
              <>
                Everything the student needs, <span>in one clear path.</span>
              </>
            )}
          </h2>
          <span className={styles.titleRule} aria-hidden="true" />
          <p className={styles.campusCopy}>
            {t(
              "Agenda, tareas, materiales, avisos y progreso aparecen ordenados en una experiencia simple, visual y fácil de seguir.",
              "Agenda, tasks, materials, notices and progress appear in a simple, visual experience that is easy to follow."
            )}
          </p>
          <div className={styles.campusChips} aria-label={t("Capacidades del campus", "Campus capabilities")}>
            {chips.map((chip) => (
              <span className={styles.campusChip} key={chip}>
                <i aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.campusPreview}>
          <div className={styles.campusPreviewInner}>
            <div className={styles.mockupTopbar}>
              <div className={styles.mockupBrand}>
                <CampusLogo />
                <div>
                  <span className={styles.mockupTitle}>LayerCloud Campus</span>
                  <span className={styles.mockupBadge}>{t("Alumno", "Student")}</span>
                </div>
              </div>
              <div className={styles.mockupStatus}>
                <span className={styles.mockupStatusText}>{t("Hoy · 4 pendientes · 2 materiales nuevos", "Today · 4 pending · 2 new materials")}</span>
                <span className={styles.windowDots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>

            <div className={styles.mockupGrid}>
              <div className={styles.mockupColumn}>
                <article className={styles.previewPanel}>
                  <div className={styles.panelTop}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <Icon name="calendar" />
                        {t("Agenda de hoy", "Today's agenda")}
                      </h3>
                      <span className={styles.panelSub}>{t("Prioridades claras para avanzar sin perderse.", "Clear priorities to move forward without getting lost.")}</span>
                    </div>
                    <span className={styles.panelPill}>{t("Ordenado", "Ordered")}</span>
                  </div>
                  <div className={styles.taskList}>
                    {tasks.map((task) => (
                      <div className={styles.taskRow} key={task.title}>
                        <div className={styles.taskMain}>
                          <span className={styles.taskDot} aria-hidden="true" />
                          <div>
                            <strong className={styles.taskTitle}>{task.title}</strong>
                            <span className={styles.taskHint}>{task.hint}</span>
                          </div>
                        </div>
                        <span className={styles.taskBadge}>{task.badge}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.previewPanel}>
                  <div className={styles.panelTop}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <Icon name="progress" />
                        {t("Progreso semanal", "Weekly progress")}
                      </h3>
                      <span className={styles.panelSub}>{t("Se entiende sin reportes técnicos.", "Readable without technical reports.")}</span>
                    </div>
                  </div>
                  <div className={styles.progressRows}>
                    {progress.map((item) => (
                      <div className={styles.progressItem} key={item.label}>
                        <span className={styles.progressLabel}>
                          {item.label}
                          <strong>{item.value}</strong>
                        </span>
                        <span className={styles.progressTrack} aria-hidden="true">
                          <span className={styles.progressFill} style={{ "--value": item.value } as CSSProperties} />
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className={styles.mockupColumn}>
                <article className={styles.previewPanel}>
                  <div className={styles.panelTop}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <Icon name="route" />
                        {t("Ruta del alumno", "Student path")}
                      </h3>
                      <span className={styles.panelSub}>{t("Cada paso aparece en contexto.", "Every step appears in context.")}</span>
                    </div>
                  </div>
                  <div className={styles.routeList}>
                    {route.map((item) => (
                      <div className={styles.routeItem} key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.previewPanel}>
                  <div className={styles.panelTop}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        <Icon name="book" />
                        {t("Material recomendado", "Recommended material")}
                      </h3>
                    </div>
                  </div>
                  <div className={styles.materialCard}>
                    <div className={styles.materialThumb} aria-hidden="true">
                      <span className={styles.playIcon}>
                        <Icon name="play" />
                      </span>
                    </div>
                    <div>
                      <strong className={styles.materialTitle}>{t("Fracciones equivalentes", "Equivalent fractions")}</strong>
                      <span className={styles.materialMeta}>{t("Video · 12 min", "Video · 12 min")}</span>
                      <span className={styles.materialLine} aria-hidden="true" />
                    </div>
                  </div>
                </article>

                <div className={styles.supportCard}>
                  <span className={styles.supportIcon}>
                    <Icon name="sparkle" />
                  </span>
                  <div>
                    <strong>{t("Acompañamiento activo", "Active support")}</strong>
                    <span>{t("El alumno sabe dónde pedir ayuda.", "The student knows where to ask for help.")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.campusBenefits}>
          {benefits.map((benefit) => (
            <article className={styles.campusBenefit} key={benefit.title}>
              <span className={styles.benefitIcon}>
                <Icon name={benefit.icon} />
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
