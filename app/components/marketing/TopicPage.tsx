import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../PageTransition';
import StructuredData from '../seo/StructuredData';

interface TopicHighlight {
  label: string;
  value: string;
  detail: string;
}

interface TopicSection {
  title: string;
  description: string;
  bullets: string[];
}

interface TopicLink {
  href: string;
  label: string;
  description: string;
}

interface TopicPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  emphasis: string;
  highlights: TopicHighlight[];
  sections: TopicSection[];
  relatedLinks: TopicLink[];
  jsonLd?: unknown[];
}

const wrap = {
  maxWidth: '1200px',
  marginInline: 'auto',
  paddingInline: 'clamp(20px, 6vw, 80px)',
};

export default function TopicPage({
  eyebrow,
  title,
  intro,
  emphasis,
  highlights,
  sections,
  relatedLinks,
  jsonLd,
}: TopicPageProps) {
  return (
    <PageTransition>
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
        {jsonLd?.map((entry, index) => (
          <StructuredData key={index} data={entry} />
        ))}

        <section
          style={{
            paddingTop: 'clamp(128px, 14vw, 200px)',
            paddingBottom: 'clamp(72px, 9vw, 120px)',
            borderBottom: '1px solid var(--color-border)',
            background:
              'radial-gradient(circle at 82% 18%, rgba(255,59,0,0.07), transparent 24%), var(--color-bg)',
          }}
        >
          <div style={wrap}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: '18px',
              }}
            >
              {eyebrow}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(38px, 6vw, 92px)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.94,
                color: 'var(--color-text)',
                marginBottom: '22px',
                maxWidth: '880px',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(16px, 1.7vw, 19px)',
                lineHeight: 1.75,
                color: 'var(--color-muted)',
                fontWeight: 300,
                maxWidth: '720px',
                marginBottom: '18px',
              }}
            >
              {intro}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                lineHeight: 1.8,
                color: 'var(--color-text)',
                fontWeight: 400,
                maxWidth: '680px',
              }}
            >
              {emphasis}
            </p>
          </div>
        </section>

        <section style={{ paddingBlock: 'clamp(48px, 6vw, 72px)', borderBottom: '1px solid var(--color-border)' }}>
          <div
            style={{
              ...wrap,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'var(--color-border)',
            }}
          >
            {highlights.map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--color-bg)',
                  padding: '28px',
                  minHeight: '170px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    marginBottom: '8px',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: 'var(--color-accent)',
                    marginBottom: '8px',
                  }}
                >
                  {item.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'var(--color-muted)',
                    fontWeight: 300,
                  }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ ...wrap, display: 'grid', gap: '28px' }}>
            {sections.map((section, index) => (
              <div
                key={section.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
                  gap: 'clamp(24px, 5vw, 64px)',
                  padding: 'clamp(24px, 4vw, 36px)',
                  border: '1px solid var(--color-border)',
                  background: index % 2 === 0 ? 'var(--color-bg)' : 'var(--color-surface)',
                }}
                className="topic-grid"
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      marginBottom: '14px',
                    }}
                  >
                    MotorCloud
                  </p>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(24px, 3.2vw, 44px)',
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      lineHeight: 1.05,
                      color: 'var(--color-text)',
                      marginBottom: '16px',
                    }}
                  >
                    {section.title}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      lineHeight: 1.75,
                      color: 'var(--color-muted)',
                      fontWeight: 300,
                    }}
                  >
                    {section.description}
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                  {section.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        borderTop: '1px solid rgba(255,59,0,0.12)',
                        paddingTop: '12px',
                      }}
                    >
                      <CheckCircle2 size={16} strokeWidth={2.2} color="#FF3B00" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          lineHeight: 1.7,
                          color: 'var(--color-text)',
                          fontWeight: 400,
                        }}
                      >
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBlock: 'clamp(72px, 9vw, 120px)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div style={wrap}>
            <div style={{ marginBottom: '28px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  marginBottom: '14px',
                }}
              >
                Temas relacionados
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 3.6vw, 52px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  color: 'var(--color-text)',
                }}
              >
                Explorá la arquitectura completa
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1px',
                background: 'var(--color-border)',
              }}
            >
              {relatedLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  style={{
                    background: 'var(--color-bg)',
                    padding: '24px',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minHeight: '180px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: 'var(--color-text)',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      lineHeight: 1.75,
                      color: 'var(--color-muted)',
                      fontWeight: 300,
                      flexGrow: 1,
                    }}
                  >
                    {item.description}
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                    }}
                  >
                    Ver tema <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ paddingBlock: 'clamp(80px, 10vw, 140px)', background: 'var(--color-accent)' }}>
          <div style={{ ...wrap, textAlign: 'center', maxWidth: '760px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 84px)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.92,
                color: '#FFFFFF',
                marginBottom: '24px',
              }}
            >
              Convirtamos complejidad
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.52)' }}>
                en plataforma operable.
              </em>
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                lineHeight: 1.72,
                color: 'rgba(255,255,255,0.72)',
                fontWeight: 300,
                maxWidth: '520px',
                marginInline: 'auto',
                marginBottom: '34px',
              }}
            >
              Si tu operación ya superó las planillas, los parches y los sistemas desconectados,
              armemos el mapa técnico correcto.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/contacto"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  color: 'var(--color-accent)',
                  padding: '16px 28px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                Solicitar diagnóstico <ArrowRight size={15} strokeWidth={2.2} />
              </Link>
              <Link
                to="/solucion"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: 'rgba(255,255,255,0.85)',
                  padding: '15px 28px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 400,
                }}
              >
                Ver plataforma
              </Link>
            </div>
          </div>
        </section>

        <style>{`
          @media (max-width: 860px) {
            .topic-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </PageTransition>
  );
}
