'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './page.module.css';

export default function ClientPage() {
  const { isEn } = useLang();

  useEffect(() => {
    // Add specific body classes for this page
    document.body.classList.add('grain', 'photo-hero');
    return () => {
      document.body.classList.remove('grain', 'photo-hero');
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <header className={styles.nosHero}>
        <div className={styles.nhImg}>
          <Image src="/images/nos-hero-office.jpg" alt="Equipo LayerCloud trabajando en la oficina" fill style={{ objectFit: 'cover', objectPosition: 'center 30%' }} priority />
        </div>
        <div className={styles.nhVeil} aria-hidden="true"></div>
        <div className={styles.nhContent}>
          <div className={styles.nhInner}>
            <div className={styles.nhBadge}><span className={styles.nhDot}></span><span>{isEn ? 'LayerCloud · About' : 'LayerCloud · Nosotros'}</span></div>
            <h1 className={styles.nhH1}>
              {isEn ? (
                <>No templates.<br/><em className={styles.em}>Real systems.</em></>
              ) : (
                <>No hacemos plantillas.<br/><em className={styles.em}>Construimos sistemas.</em></>
              )}
            </h1>
            <p className={styles.nhLead}>
              {isEn ? 'We are a custom software engineering team. We design, build and automate digital systems from scratch for businesses, educational institutions and commercial teams that need more than off-the-shelf solutions.' : 'Somos un equipo de ingeniería de software a medida. Diseñamos, construimos y automatizamos sistemas digitales desde cero para negocios, instituciones educativas y equipos comerciales que necesitan más que soluciones genéricas.'}
            </p>
            <div className={styles.nhBtns}>
              <Link href="/contacto" className={styles.nhBtnP}>
                {isEn ? 'Start a project' : 'Iniciar un proyecto'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px' }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <a href="#enfoque" className={styles.nhBtnG}>
                {isEn ? 'Our approach' : 'Ver nuestro enfoque'}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* MANIFESTO */}
      <section className={styles.manifesto}>
        <div className="wrap">
          <div className={styles.mfGrid}>
            <ScrollReveal>
              <p className={styles.mfQuote}>
                {isEn ? (
                  <>&#34;Every business has its own logic. Our job is to <strong>translate that logic into software</strong> that actually works for the people who use it every day.&#34;</>
                ) : (
                  <>&#34;Cada negocio tiene su propia lógica. Nuestro trabajo es <strong>traducir esa lógica en software</strong> que funcione de verdad para las personas que lo usan todos los días.&#34;</>
                )}
              </p>
              <div className={styles.mfBody}>
                <p>
                  {isEn ? 'LayerCloud was founded with a clear conviction: the most common software problems are not technical — they are contextual. Generic tools force teams to adapt to the software, instead of the software adapting to the team.' : 'LayerCloud nació con una convicción clara: los problemas de software más frecuentes no son técnicos, son contextuales. Las herramientas genéricas obligan a los equipos a adaptarse al software, en vez de que el software se adapte al equipo.'}
                </p>
                <p>
                  {isEn ? 'We work as an engineering and design team. Before we write a line of code, we do a deep diagnosis of the business: its processes, data, people and goals. From there we design the architecture, the interfaces and the automations that turn it into a real, scalable, measurable system.' : 'Trabajamos como un equipo de ingeniería y diseño. Antes de escribir una línea de código, hacemos un diagnóstico profundo del negocio: sus procesos, sus datos, su gente y sus objetivos. A partir de ahí diseñamos la arquitectura, las interfaces y las automatizaciones que lo convierten en un sistema real, escalable y medible.'}
                </p>
                <p>
                  {isEn ? 'We build webs and sales ecosystems, custom CRM/ERP systems, virtual campuses for educational institutions, and AI automation flows that run processes without human intervention.' : 'Construimos webs y ecosistemas de venta, sistemas CRM/ERP a medida, campus virtuales para instituciones educativas, y flujos de automatización con IA que ejecutan procesos sin intervención humana.'}
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <div className={styles.mfImg}>
                <Image src="/images/nos-exec-dashboard.jpg" alt="Directivo con dashboard de datos en pantalla" fill style={{ objectFit: 'cover' }} />
                <div className={styles.mfImgOverlay}></div>
                <div className={styles.mfImgLabel}>
                  <span>{isEn ? 'Our focus' : 'Nuestro enfoque'}</span>
                  <b>{isEn ? 'Data-driven decisions' : 'Decisiones basadas en datos reales'}</b>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className={styles.nosStats}>
        <div className="wrap">
          <div className={styles.nsGrid}>
            <ScrollReveal className={styles.nsStat}>
              <div className={styles.nsNum}>24+</div>
              <div className={styles.nsLabel}>{isEn ? 'Systems built from scratch' : 'Sistemas construidos desde cero'}</div>
              <div className={styles.nsMeta}>{isEn ? 'Webs, CRM, campus, IA' : 'Webs, CRM, campus, IA'}</div>
            </ScrollReveal>
            <ScrollReveal className={styles.nsStat} delay={100}>
              <div className={styles.nsNum}>3</div>
              <div className={styles.nsLabel}>{isEn ? 'Sectors with active deployments' : 'Sectores con despliegues activos'}</div>
              <div className={styles.nsMeta}>{isEn ? 'Commerce, education, enterprise' : 'Comercio, educación, empresa'}</div>
            </ScrollReveal>
            <ScrollReveal className={styles.nsStat} delay={200}>
              <div className={styles.nsNum}>180+</div>
              <div className={styles.nsLabel}>{isEn ? 'Active automations running' : 'Automatizaciones activas corriendo'}</div>
              <div className={styles.nsMeta}>{isEn ? 'Without human intervention' : 'Sin intervención humana'}</div>
            </ScrollReveal>
            <ScrollReveal className={styles.nsStat} delay={300}>
              <div className={styles.nsNum}>100%</div>
              <div className={styles.nsLabel}>{isEn ? 'Custom-built, from scratch' : 'Software hecho a medida'}</div>
              <div className={styles.nsMeta}>{isEn ? 'No templates. No shortcuts.' : 'Sin plantillas. Sin atajos.'}</div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* PROJECTS */}
      <section className={styles.nosProjects}>
        <div className="wrap">
          <ScrollReveal className="inner-head">
            <span className="eyebrow brand">{isEn ? 'What we build' : 'Lo que construimos'}</span>
            <h2>{isEn ? 'Systems that operate, sell and connect' : 'Sistemas que operan, venden y conectan'}</h2>
            <p>{isEn ? 'Each project starts with a deep understanding of the business. We design from scratch — no templates, no limitations.' : 'Cada proyecto comienza con un entendimiento profundo del negocio. Diseñamos desde cero, sin plantillas ni limitaciones.'}</p>
          </ScrollReveal>
          <ScrollReveal className={styles.projGrid}>
            {/* Main */}
            <div className={styles.projMain}>
              <span className={styles.projTag}>{isEn ? 'Web & Commerce' : 'Webs y comercio'}</span>
              <Image className={styles.projImg} src="/images/nos-project-ecommerce.jpg" alt="Ecosistema de e-commerce MarketCell construido por LayerCloud" fill />
              <div className={styles.projOverlay}></div>
              <div className={styles.projLabel}>
                <div className={styles.plCat}>{isEn ? 'Complete ecosystem' : 'Ecosistema completo'}</div>
                <div className={styles.plTitle}>{isEn ? 'E-commerce + CRM + Automation' : 'E-commerce + CRM + Automatización'}</div>
                <div className={styles.plDesc}>{isEn ? 'Full digital sales system: catalog, cart, payments, real-time inventory, integrated CRM and post-sale automation.' : 'Sistema digital de ventas completo: catálogo, carrito, pagos, inventario en tiempo real, CRM integrado y automatización postventa.'}</div>
              </div>
            </div>
            {/* Side top */}
            <div className={styles.projSide}>
              <span className={styles.projTag}>{isEn ? 'Retail + Digital' : 'Retail + Digital'}</span>
              <Image className={styles.projImg} src="/images/nos-project-retail.jpg" alt="Operación de retail con sistema digital LayerCloud" fill />
              <div className={styles.projOverlay}></div>
              <div className={styles.projLabel}>
                <div className={styles.plCat}>{isEn ? 'Operations' : 'Operaciones'}</div>
                <div className={styles.plTitle}>{isEn ? 'Retail operation connected end to end' : 'Operación retail conectada de punta a punta'}</div>
              </div>
            </div>
            {/* Side bottom */}
            <div className={styles.projSide}>
              <span className={styles.projTag}>{isEn ? 'Virtual Campus' : 'Campus Virtual'}</span>
              <Image className={styles.projImg} src="/images/nos-sector-campus-hall.jpg" alt="Campus universitario con plataforma educativa digital" fill />
              <div className={styles.projOverlay}></div>
              <div className={styles.projLabel}>
                <div className={styles.plCat}>{isEn ? 'Education' : 'Educación'}</div>
                <div className={styles.plTitle}>{isEn ? 'Platform for directors, teachers, students and families' : 'Plataforma para directivos, docentes, alumnos y familias'}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTORS */}
      <section className={styles.nosSectors}>
        <div className="wrap">
          <ScrollReveal className="inner-head">
            <span className="eyebrow brand">{isEn ? 'Who we work with' : 'Para quiénes trabajamos'}</span>
            <h2>{isEn ? 'Three sectors. One methodology.' : 'Tres sectores. Una metodología.'}</h2>
            <p>{isEn ? 'We understand the particularities of each context — commercial, educational and institutional — and we build systems adapted to each one.' : 'Entendemos las particularidades de cada contexto — comercial, educativo e institucional — y construimos sistemas adaptados a cada uno.'}</p>
          </ScrollReveal>
          <ScrollReveal className={styles.sectGrid}>
            <div className={styles.sectCard}>
              <div className={styles.scImgWrap}>
                <Image className={styles.scImg} src="/images/nos-exec-dashboard.jpg" alt="Directivo con sistema CRM de gestión comercial" fill />
                <div className={styles.scOverlay}></div>
              </div>
              <div className={styles.scBody}>
                <div className={styles.scSector}>{isEn ? 'Commercial sector' : 'Sector comercial'}</div>
                <div className={styles.scTitle}>{isEn ? 'Companies and commercial teams' : 'Empresas y equipos de ventas'}</div>
                <div className={styles.scChips}>
                  <span className={styles.scChip}>CRM / ERP</span>
                  <span className={styles.scChip}>{isEn ? 'Pipelines' : 'Pipelines'}</span>
                  <span className={styles.scChip}>{isEn ? 'AI' : 'IA'}</span>
                </div>
              </div>
            </div>
            <div className={styles.sectCard}>
              <div className={styles.scImgWrap}>
                <Image className={styles.scImg} src="/images/nos-sector-teacher.jpg" alt="Docente presentando en plataforma educativa digital" fill />
                <div className={styles.scOverlay}></div>
              </div>
              <div className={styles.scBody}>
                <div className={styles.scSector}>{isEn ? 'Educational sector' : 'Sector educativo'}</div>
                <div className={styles.scTitle}>{isEn ? 'Educational institutions and universities' : 'Instituciones educativas y universidades'}</div>
                <div className={styles.scChips}>
                  <span className={styles.scChip}>{isEn ? 'Virtual Campus' : 'Campus virtual'}</span>
                  <span className={styles.scChip}>{isEn ? 'Grades' : 'Notas'}</span>
                  <span className={styles.scChip}>{isEn ? 'Certifications' : 'Certificaciones'}</span>
                </div>
              </div>
            </div>
            <div className={styles.sectCard}>
              <div className={styles.scImgWrap}>
                <Image className={styles.scImg} src="/images/nos-sector-family.jpg" alt="Familia recibiendo notificaciones del campus virtual en su teléfono" fill />
                <div className={styles.scOverlay}></div>
              </div>
              <div className={styles.scBody}>
                <div className={styles.scSector}>{isEn ? 'Families & students' : 'Familias y alumnos'}</div>
                <div className={styles.scTitle}>{isEn ? 'Connected parents and students' : 'Padres y estudiantes conectados'}</div>
                <div className={styles.scChips}>
                  <span className={styles.scChip}>{isEn ? 'Notifications' : 'Notificaciones'}</span>
                  <span className={styles.scChip}>{isEn ? 'Report cards' : 'Boletines'}</span>
                  <span className={styles.scChip}>{isEn ? 'Real time' : 'Tiempo real'}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* APPROACH */}
      <section className={styles.nosApproach} id="enfoque">
        <div className="wrap">
          <ScrollReveal className="inner-head">
            <span className="eyebrow on-dark">{isEn ? 'Our method' : 'Nuestro método'}</span>
            <h2 style={{ color: 'var(--ink-on-dark)' }}>{isEn ? 'A precise process, not a guess' : 'Un proceso preciso, no una corazonada'}</h2>
            <p style={{ color: 'var(--ink-on-dark-2)' }}>{isEn ? 'Before we design anything, we understand the business. Before we code anything, we validate the architecture. Every layer is built with intention.' : 'Antes de diseñar nada, entendemos el negocio. Antes de programar nada, validamos la arquitectura. Cada capa se construye con intención.'}</p>
          </ScrollReveal>
          <ScrollReveal className={styles.apGrid}>
            <div className={styles.apStep}>
              <div className={styles.apNum}>01</div>
              <div className={styles.apTitle}>{isEn ? 'Business diagnosis' : 'Diagnóstico del negocio'}</div>
              <div className={styles.apDesc}>{isEn ? 'We map processes, data, roles and real bottlenecks. We don\'t build until we understand deeply what problem we\'re solving.' : 'Mapeamos procesos, datos, roles y cuellos de botella reales. No construimos hasta no entender en profundidad qué problema estamos resolviendo.'}</div>
              <div className={styles.apAccent}></div>
            </div>
            <div className={styles.apStep}>
              <div className={styles.apNum}>02</div>
              <div className={styles.apTitle}>{isEn ? 'System architecture' : 'Arquitectura del sistema'}</div>
              <div className={styles.apDesc}>{isEn ? 'We define data models, modules, integrations and flows before writing code. The architecture determines the quality of everything that follows.' : 'Definimos modelos de datos, módulos, integraciones y flujos antes de escribir código. La arquitectura determina la calidad de todo lo que viene después.'}</div>
              <div className={styles.apAccent}></div>
            </div>
            <div className={styles.apStep}>
              <div className={styles.apNum}>03</div>
              <div className={styles.apTitle}>{isEn ? 'UX/UI design' : 'Diseño de experiencia e interfaces'}</div>
              <div className={styles.apDesc}>{isEn ? 'We design each interface for its user — not copied from a template. Information architecture, visual hierarchy and interactions built from scratch.' : 'Diseñamos cada interfaz para su usuario. Arquitectura de información, jerarquía visual e interacciones construidas desde cero.'}</div>
              <div className={styles.apAccent}></div>
            </div>
            <div className={styles.apStep}>
              <div className={styles.apNum}>04</div>
              <div className={styles.apTitle}>{isEn ? 'Development & integrations' : 'Desarrollo e integraciones'}</div>
              <div className={styles.apDesc}>{isEn ? 'We build the system with clean code, scalable architecture and real integrations with the tools already used by the team.' : 'Construimos el sistema con código limpio, arquitectura escalable e integraciones reales con las herramientas que ya usa el equipo.'}</div>
              <div className={styles.apAccent}></div>
            </div>
            <div className={styles.apStep}>
              <div className={styles.apNum}>05</div>
              <div className={styles.apTitle}>{isEn ? 'AI automation' : 'Automatización e IA'}</div>
              <div className={styles.apDesc}>{isEn ? 'We layer automations and AI on top of the system. Workflows that run on their own, intelligent agents and smart triggers that reduce manual work.' : 'Sumamos automatizaciones e IA por encima del sistema. Flujos que se ejecutan solos, agentes inteligentes y disparadores que reducen el trabajo manual.'}</div>
              <div className={styles.apAccent}></div>
            </div>
            <div className={styles.apStep}>
              <div className={styles.apNum}>06</div>
              <div className={styles.apTitle}>{isEn ? 'Measurement & scaling' : 'Medición, mejora y escalado'}</div>
              <div className={styles.apDesc}>{isEn ? 'After launch we monitor, optimize and scale. We add modules, integrations and automations as the operation grows and needs evolve.' : 'Luego del lanzamiento monitoreamos, optimizamos y escalamos. Sumamos módulos, integraciones y automatizaciones a medida que la operación crece.'}</div>
              <div className={styles.apAccent}></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* VALUES */}
      <section className={styles.nosValues}>
        <div className="wrap">
          <ScrollReveal className="inner-head">
            <span className="eyebrow brand">{isEn ? 'Principles' : 'Principios'}</span>
            <h2>{isEn ? 'How we think, how we build' : 'Cómo pensamos, cómo construimos'}</h2>
          </ScrollReveal>
          <ScrollReveal className={styles.valGrid}>
            <div className={styles.valCard}>
              <div className={styles.valIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div className={styles.valTitle}>{isEn ? 'No templates' : 'Sin plantillas'}</div>
              <div className={styles.valDesc}>{isEn ? 'Every system we build is designed from scratch for the specific client. We don\'t recycle code or copy components between projects.' : 'Cada sistema que construimos es diseñado desde cero para el cliente específico. No reciclamos código ni copiamos componentes entre proyectos.'}</div>
            </div>
            <div className={styles.valCard}>
              <div className={styles.valIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
              <div className={styles.valTitle}>{isEn ? 'Long-term thinking' : 'Pensamiento a largo plazo'}</div>
              <div className={styles.valDesc}>{isEn ? 'We build for scalability. The systems we design today must be able to grow, integrate new modules and adapt to changes without rebuilding everything.' : 'Construimos para la escalabilidad. Los sistemas que diseñamos hoy deben poder crecer, integrar nuevos módulos y adaptarse a cambios sin reconstruirlo todo.'}</div>
            </div>
            <div className={styles.valCard}>
              <div className={styles.valIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg></div>
              <div className={styles.valTitle}>{isEn ? 'AI as a layer, not a product' : 'IA como capa, no como producto'}</div>
              <div className={styles.valDesc}>{isEn ? 'We don\'t sell AI as a standalone feature. We integrate it as a layer on top of real processes: automations, scoring, agents and decisions with context.' : 'No vendemos IA como feature aislado. La integramos como capa sobre procesos reales: automatizaciones, scoring, agentes y decisiones con contexto.'}</div>
            </div>
            <div className={styles.valCard}>
              <div className={styles.valIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div className={styles.valTitle}>{isEn ? 'The team that uses it, at the center' : 'El equipo que lo usa, en el centro'}</div>
              <div className={styles.valDesc}>{isEn ? 'We design for the people who use the system every day: the vendor, the teacher, the coordinator, the parent. Not just for the person who approved the budget.' : 'Diseñamos para las personas que usan el sistema todos los días: el vendedor, el docente, el coordinador, el padre. No solo para quien aprobó el presupuesto.'}</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.nosCta}>
        <div className="wrap">
          <ScrollReveal className={styles.ncInner}>
            <div className={styles.ncEyebrow}>{isEn ? 'Ready to start' : 'Listo para empezar'}</div>
            <h2 className={styles.ncH2}>{isEn ? 'Let\'s build the system your operation needs.' : 'Construyamos el sistema que tu operación necesita.'}</h2>
            <p className={styles.ncP}>{isEn ? 'Tell us what process you want to organize, automate or scale. We design the architecture, the interfaces and the automations to turn it into real software.' : 'Contanos qué proceso querés ordenar, automatizar o escalar. Diseñamos la arquitectura, las interfaces y las automatizaciones necesarias para convertirlo en software real.'}</p>
            <div className={styles.ncBtns}>
              <Link href="/contacto" className={styles.ncBtnP}>
                {isEn ? 'Start a project' : 'Iniciar un proyecto'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '15px', height: '15px', display: 'inline' }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <Link href="/servicios" className={styles.ncBtnG}>
                {isEn ? 'Explore services' : 'Explorar servicios'}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
