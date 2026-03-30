import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  LayoutDashboard,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { useTenantStats } from '../../hooks/useTenantStats';
import { useCollectionHasItems } from '../../hooks/useCollectionHasItems';
import type { TenantMeta } from '../../context/TenantContext';
import {
  DASHBOARD_ACTIVATION_STEPS,
  getCompletedCount,
  getCompletionMap,
  getNextIncompleteStepId,
  persistDemoShareCompleted,
  readDemoShareCompleted,
  type DemoActivationLiveData,
} from '../../lib/demoActivation';
import { trackTenantEvent } from '../../utils/trackTenantEvent';

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        marginBottom: 16,
      }}
    >
      <div style={{ padding: '24px 28px 24px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
            marginBottom: 20,
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user, logout, resendVerificationEmail, tenantId } = useTenantAuth();
  const { stats } = useTenantStats(tenantId ?? '');
  const [tenantMeta, setTenantMeta] = useState<TenantMeta | null>(null);
  const [hasShared, setHasShared] = useState(() => (tenantId ? readDemoShareCompleted(tenantId) : false));
  const [verificationState, setVerificationState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const hasProducts = useCollectionHasItems(tenantId ?? '', 'products');
  const hasCategories = useCollectionHasItems(tenantId ?? '', 'categories');
  const hasOffers = useCollectionHasItems(tenantId ?? '', 'offers');
  const hasOrders = useCollectionHasItems(tenantId ?? '', 'orders');

  useEffect(() => {
    if (!tenantId) return;

    const unsub = onSnapshot(doc(db, 'tenants', tenantId), (snapshot) => {
      if (snapshot.exists()) {
        setTenantMeta(snapshot.data() as TenantMeta);
      }
    });

    setHasShared(readDemoShareCompleted(tenantId));
    return unsub;
  }, [tenantId]);

  const liveData: DemoActivationLiveData = {
    hasProducts,
    hasCategories,
    hasOffers,
    hasOrders,
    hasShared,
  };

  const completionMap = useMemo(
    () => getCompletionMap(DASHBOARD_ACTIVATION_STEPS, tenantMeta, liveData),
    [liveData, tenantMeta],
  );
  const completedCount = getCompletedCount(completionMap);
  const progressPct = Math.round((completedCount / DASHBOARD_ACTIVATION_STEPS.length) * 100);
  const nextStepId = getNextIncompleteStepId(DASHBOARD_ACTIVATION_STEPS, completionMap);
  const nextStepTitle =
    DASHBOARD_ACTIVATION_STEPS.find((step) => step.id === nextStepId)?.title ?? 'Checklist completo';

  const daysLeft = tenantMeta?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((tenantMeta.trialEndsAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  const storeUrl = tenantId ? `${window.location.origin}/demo/${tenantId}` : '';
  const storePath = tenantId ? `/demo/${tenantId}` : '/';
  const adminPath = tenantId ? `/demo/${tenantId}/admin` : '/';
  const qrUrl = storeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0A0A0A&color=FAFAFA&data=${encodeURIComponent(storeUrl)}`
    : '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyStoreUrl = async () => {
    if (!tenantId || !storeUrl) return;
    await navigator.clipboard.writeText(storeUrl).catch(() => undefined);
    persistDemoShareCompleted(tenantId);
    setHasShared(true);
    trackTenantEvent(tenantId, 'store_url_copied', { source: 'dashboard' });
  };

  const handleResendVerification = async () => {
    setVerificationState('sending');
    try {
      await resendVerificationEmail();
      setVerificationState('sent');
    } catch {
      setVerificationState('idle');
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)', padding: 'clamp(20px, 5vw, 56px)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: '-0.04em',
                color: 'var(--color-text)',
              }}
            >
              Layer<span style={{ color: 'var(--color-accent)' }}>Cloud</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-muted)',
                letterSpacing: '0.06em',
              }}
            >
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--color-muted)',
                background: 'none',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                padding: '7px 14px',
              }}
            >
              Salir
            </button>
          </div>
        </div>

        <p className="eyebrow">// Activación de tu demo</p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 4vw, 42px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
            marginBottom: 14,
            lineHeight: 1.08,
          }}
        >
          Hola, {tenantMeta?.ownerName?.split(' ')[0] ?? 'bienvenido'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            lineHeight: 1.75,
            color: 'var(--color-muted)',
            maxWidth: 620,
            marginBottom: 28,
          }}
        >
          Tu tienda está al {progressPct}% lista. Completá los próximos pasos para convertir
          esta demo en una prueba real de tu operación.
        </p>

        {user && !user.emailVerified ? (
          <div
            style={{
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.18)',
              padding: '18px 20px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 6,
                }}
              >
                Verificacion pendiente
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#1f2937' }}>
                Revisa tu correo y verifica la cuenta para cerrar el alta con una identidad confirmada.
                {verificationState === 'sent' ? ' Reenviamos el enlace de verificacion.' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResendVerification}
              className="btn-ghost"
              disabled={verificationState === 'sending'}
              style={{ width: 'auto', justifyContent: 'center' }}
            >
              {verificationState === 'sending' ? 'Enviando...' : 'Reenviar verificacion'}
            </button>
          </div>
        ) : null}

        {daysLeft !== null && tenantMeta?.plan === 'trial' ? (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: `4px solid ${daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)'}`,
              padding: '24px 28px',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
                marginBottom: 14,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)',
                    marginBottom: 4,
                  }}
                >
                  {daysLeft <= 1 ? 'Prueba por vencer' : 'Período de prueba activo'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--color-text)',
                  }}
                >
                  {daysLeft === 0
                    ? 'Vence hoy'
                    : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
                </p>
              </div>

              <Link
                to="/contacto"
                className="btn-primary-accent"
                style={{ fontSize: 13, padding: '10px 20px', whiteSpace: 'nowrap' }}
                onClick={() => trackTenantEvent(tenantId ?? '', 'dashboard_conversion_cta_clicked', { source: 'trial_banner' })}
              >
                Activar sistema →
              </Link>
            </div>

            <div style={{ height: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)',
                  transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>
        ) : null}

        <Section eyebrow="01 / Accesos rápidos" title="Tu demo lista para compartir">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <QuickActionCard
              eyebrow="Tienda pública"
              title={tenantMeta?.businessName ?? 'Tu tienda'}
              body="Abrí la demo storefront tal como la ve un cliente."
              href={storePath}
              Icon={Store}
            />
            <QuickActionCard
              eyebrow="Panel admin"
              title="Gestionar tienda"
              body="Productos, pedidos, configuración y módulos operativos."
              href={adminPath}
              Icon={LayoutDashboard}
              dark
            />
            <div
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: '100%',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                    marginBottom: 6,
                  }}
                >
                  Link directo
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                  }}
                >
                  Copiá o escaneá tu demo
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--color-muted)',
                    lineHeight: 1.7,
                  }}
                >
                  Compartila con un cliente o con tu equipo para validar la experiencia completa.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-muted)',
                  }}
                >
                  {storeUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyStoreUrl}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: hasShared ? '#22c55e' : 'var(--color-accent)',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  <Copy size={14} strokeWidth={1.8} />
                  {hasShared ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                  paddingTop: 6,
                }}
              >
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR de tu tienda"
                    width={160}
                    height={160}
                    style={{ display: 'block', border: '1px solid var(--color-border)' }}
                  />
                ) : null}
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                    textAlign: 'center',
                  }}
                >
                  QR de la tienda
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section eyebrow="02 / Activación" title="Checklist de onboarding">
          <div
            style={{
              padding: '16px 18px 18px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--color-text)',
                  }}
                >
                  Tu tienda está al {progressPct}% lista
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--color-muted)',
                    lineHeight: 1.7,
                    marginTop: 6,
                  }}
                >
                  {completedCount} de {DASHBOARD_ACTIVATION_STEPS.length} pasos completos.
                </p>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                }}
              >
                Próximo paso: {nextStepTitle}
              </span>
            </div>

            <div style={{ height: 5, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, var(--color-accent), #ff8a5b)',
                  transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {DASHBOARD_ACTIVATION_STEPS.map((step) => {
              const StepIcon = step.icon;
              const completed = completionMap[step.id];
              const isNext = step.id === nextStepId && !completed;
              const actionHref = step.actionPath && tenantId ? `/demo/${tenantId}/${step.actionPath}` : null;

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px minmax(0, 1fr) auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '16px 18px',
                    background: completed ? 'rgba(34,197,94,0.07)' : 'var(--color-bg)',
                    border: completed
                      ? '1px solid rgba(34,197,94,0.28)'
                      : isNext
                        ? '1px solid var(--color-accent)'
                        : '1px dashed var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: completed
                        ? 'rgba(34,197,94,0.12)'
                        : isNext
                          ? 'rgba(255,59,0,0.1)'
                          : 'var(--color-surface)',
                      color: completed ? '#22c55e' : isNext ? 'var(--color-accent)' : 'var(--color-muted)',
                    }}
                  >
                    {completed ? (
                      <CheckCircle2 size={18} strokeWidth={2} />
                    ) : (
                      <StepIcon size={17} strokeWidth={1.8} />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 6,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 17,
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          color: 'var(--color-text)',
                        }}
                      >
                        {step.title}
                      </p>
                      {completed ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#22c55e',
                            background: 'rgba(34,197,94,0.12)',
                            padding: '4px 8px',
                          }}
                        >
                          Completado
                        </span>
                      ) : isNext ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--color-accent)',
                            background: 'rgba(255,59,0,0.08)',
                            padding: '4px 8px',
                          }}
                        >
                          Hacé esto ahora
                        </span>
                      ) : null}
                    </div>

                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        color: 'var(--color-muted)',
                        lineHeight: 1.7,
                      }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {step.id === 'share' ? (
                    <button
                      type="button"
                      onClick={handleCopyStoreUrl}
                      style={stepActionStyle(completed)}
                    >
                      {hasShared ? 'Link copiado' : step.actionLabel}
                      <Copy size={14} strokeWidth={2} />
                    </button>
                  ) : actionHref ? (
                    <Link to={actionHref} style={stepActionStyle(completed)}>
                      {step.actionLabel}
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>

        <Section eyebrow="03 / Métricas" title="Tu tienda en números">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Productos', value: stats.productCount },
              { label: 'Pedidos', value: stats.orderCount },
              { label: 'Categorías', value: stats.categoryCount },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  padding: '20px 24px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 36,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: 'var(--color-text)',
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {item.value}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                  }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-accent)',
            padding: '28px 32px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: 6,
              }}
            >
              ¿Te convenciste?
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                lineHeight: 1.18,
              }}
            >
              Activá el sistema completo
              <br />
              <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: 16 }}>
                Sin perder los datos que ya cargaste.
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <Link
              to="/contacto"
              className="btn-primary-accent"
              style={{ fontSize: 15, padding: '14px 28px', whiteSpace: 'nowrap' }}
              onClick={() => trackTenantEvent(tenantId ?? '', 'dashboard_conversion_cta_clicked', { source: 'dashboard_cta' })}
            >
              Quiero contratar →
            </Link>
            <Link
              to="/contacto"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                color: 'var(--color-muted)',
                fontSize: 13,
                fontWeight: 600,
              }}
              onClick={() => trackTenantEvent(tenantId ?? '', 'dashboard_support_cta_clicked', { source: 'dashboard_cta' })}
            >
              ¿Tenés dudas? Hablemos
              <ExternalLink size={13} strokeWidth={1.8} />
            </Link>
          </div>
        </div>

        {tenantMeta ? (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-muted)',
              letterSpacing: '0.1em',
            }}
          >
            <span style={badgeStyle}>RUBRO: {tenantMeta.businessType}</span>
            <span style={badgeStyle}>ID: {tenantId}</span>
            <span style={badgeStyle}>PLAN: {tenantMeta.plan?.toUpperCase()}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuickActionCard({
  eyebrow,
  title,
  body,
  href,
  Icon,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  Icon: LucideIcon;
  dark?: boolean;
}) {
  return (
    <Link
      to={href}
      style={{
        background: dark ? '#0A0A0A' : 'var(--color-bg)',
        border: dark ? '1px solid #222' : '1px solid var(--color-border)',
        padding: '20px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: '100%',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: dark ? 'rgba(255,59,0,0.12)' : 'var(--color-surface)',
          color: dark ? '#FF3B00' : 'var(--color-text)',
        }}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: dark ? '#FF3B00' : 'var(--color-accent)',
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: dark ? '#FAFAFA' : 'var(--color-text)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: dark ? 'rgba(255,255,255,0.4)' : 'var(--color-muted)',
            lineHeight: 1.7,
          }}
        >
          {body}
        </p>
      </div>
    </Link>
  );
}

function stepActionStyle(completed: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    background: completed ? 'rgba(255,255,255,0.06)' : 'var(--color-accent)',
    color: completed ? 'var(--color-muted)' : '#fff',
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
  };
}

const badgeStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  padding: '4px 10px',
  background: 'var(--color-surface)',
};
