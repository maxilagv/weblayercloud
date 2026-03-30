import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  ExternalLink,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useDemoJourney } from '../../context/DemoJourneyContext';
import { useCollectionHasItems } from '../../hooks/useCollectionHasItems';
import {
  DEMO_JOURNEY_STEPS,
  getCompletedCount,
  getCompletionMap,
  getNextIncompleteStepId,
  persistDemoShareCompleted,
  readDemoShareCompleted,
  type DemoActivationLiveData,
  type DemoJourneyStepDefinition,
} from '../../lib/demoActivation';
import { trackTenantEvent } from '../../utils/trackTenantEvent';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export default function DemoControlPanel() {
  const { tenantId, tenantMeta } = useTenant();
  const { panelOpen, setPanelOpen, spotlightStepId, setSpotlightStepId } = useDemoJourney();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const hasProducts = useCollectionHasItems(tenantId, 'products');
  const hasCategories = useCollectionHasItems(tenantId, 'categories');
  const hasOffers = useCollectionHasItems(tenantId, 'offers');
  const hasOrders = useCollectionHasItems(tenantId, 'orders');
  const [hasShared, setHasShared] = useState(() => readDemoShareCompleted(tenantId));

  const liveData: DemoActivationLiveData = {
    hasProducts,
    hasCategories,
    hasOffers,
    hasOrders,
    hasShared,
  };

  useEffect(() => {
    setHasShared(readDemoShareCompleted(tenantId));
  }, [tenantId]);

  const completionMap = useMemo(
    () => getCompletionMap(DEMO_JOURNEY_STEPS, tenantMeta, liveData),
    [tenantMeta, liveData],
  );

  const completedCount = getCompletedCount(completionMap);
  const totalCount = DEMO_JOURNEY_STEPS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const nextStepId = getNextIncompleteStepId(DEMO_JOURNEY_STEPS, completionMap);

  const previousCompletionRef = useRef<Record<string, boolean>>({});
  const completionReadyRef = useRef(false);
  const [newlyCompleted, setNewlyCompleted] = useState<string | null>(null);

  useEffect(() => {
    if (!completionReadyRef.current) {
      previousCompletionRef.current = { ...completionMap };
      completionReadyRef.current = true;
      return;
    }

    const previous = previousCompletionRef.current;
    let completionTimer: number | undefined;

    for (const step of DEMO_JOURNEY_STEPS) {
      if (!previous[step.id] && completionMap[step.id]) {
        setNewlyCompleted(step.id);
        trackTenantEvent(tenantId, 'demo_panel_step_completed', { stepId: step.id });
        completionTimer = window.setTimeout(() => setNewlyCompleted(null), 2500);
        break;
      }
    }

    previousCompletionRef.current = { ...completionMap };

    return () => {
      if (completionTimer) {
        window.clearTimeout(completionTimer);
      }
    };
  }, [completionMap, tenantId]);

  const previousPanelOpen = useRef(false);
  useEffect(() => {
    if (panelOpen && !previousPanelOpen.current) {
      trackTenantEvent(tenantId, 'demo_panel_opened', {
        completedCount,
        spotlightStep: spotlightStepId ?? undefined,
      });
    } else if (!panelOpen && previousPanelOpen.current) {
      trackTenantEvent(tenantId, 'demo_panel_closed', { completedCount });
    }
    previousPanelOpen.current = panelOpen;
  }, [completedCount, panelOpen, spotlightStepId, tenantId]);

  useEffect(() => {
    if (panelOpen) {
      setSpotlightStepId(null);
    }
  }, [panelOpen, setSpotlightStepId]);

  if (tenantMeta?.hideDemoBranding) {
    return null;
  }

  const handleOpen = () => setPanelOpen(true);
  const handleClose = () => setPanelOpen(false);

  const handleStepClick = (step: DemoJourneyStepDefinition) => {
    trackTenantEvent(tenantId, 'demo_panel_step_clicked', {
      stepId: step.id,
      completed: completionMap[step.id],
    });

    if (!step.adminPath) {
      return;
    }

    navigate(`/demo/${tenantId}/${step.adminPath}`);
    if (isMobile) {
      handleClose();
    }
  };

  const handleCopyUrl = async () => {
    const storeUrl = `${window.location.origin}/demo/${tenantId}`;
    await navigator.clipboard.writeText(storeUrl).catch(() => undefined);
    persistDemoShareCompleted(tenantId);
    setHasShared(true);
    trackTenantEvent(tenantId, 'store_url_copied', { source: 'control_panel' });
  };

  const storeUrl = `${window.location.origin}/demo/${tenantId}`;

  return (
    <>
      <motion.button
        type="button"
        onClick={handleOpen}
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Abrir guía de demo"
        aria-expanded={panelOpen}
        style={{
          position: 'fixed',
          left: 20,
          bottom: 'calc(20px + var(--sticky-bar-h, 0px))',
          zIndex: 75,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 15px 9px 11px',
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <ProgressRing pct={progressPct} size={26} stroke={2.5} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1,
              marginBottom: 3,
            }}
          >
            Demo guiada
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {completedCount}/{totalCount} pasos
          </span>
        </div>

        <AnimatePresence>
          {spotlightStepId && !panelOpen ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#FF3B00',
                border: '2px solid #0a0a0a',
              }}
              aria-hidden="true"
            />
          ) : null}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {panelOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 64,
              background: isMobile ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.32)',
              backdropFilter: isMobile ? 'blur(3px)' : 'none',
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {panelOpen ? (
          <motion.aside
            initial={isMobile ? { y: '100%' } : { x: '-100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Panel de guía de demo"
            style={{
              position: 'fixed',
              zIndex: 65,
              background: '#0d0d0d',
              border: isMobile
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid rgba(255,255,255,0.08)',
              borderTop: '3px solid #FF3B00',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 72px rgba(0,0,0,0.5)',
              ...(isMobile
                ? {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    maxHeight: '72vh',
                  }
                : {
                    top: 0,
                    left: 0,
                    width: 360,
                    height: '100vh',
                  }),
            }}
          >
            <div
              style={{
                padding: isMobile ? '14px 18px 16px' : '20px 20px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
              }}
            >
              {isMobile ? (
                <div
                  aria-hidden="true"
                  style={{
                    width: 48,
                    height: 4,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.16)',
                    margin: '0 auto 16px',
                  }}
                />
              ) : null}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#FF3B00',
                      marginBottom: 6,
                    }}
                  >
                    Demo LayerCloud
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                    Tu progreso en vivo
                  </h2>
                  <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>
                    Cada cambio que hagas en el admin se refleja acá automáticamente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Cerrar guía de demo"
                  style={{
                    width: 34,
                    height: 34,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.46)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: '12px 14px 13px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      color: 'rgba(255,255,255,0.38)',
                    }}
                  >
                    {completedCount} de {totalCount} completados
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      color: completedCount === totalCount ? '#22c55e' : '#FF3B00',
                    }}
                  >
                    {progressPct}%
                  </span>
                </div>

                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: '100%',
                      background:
                        completedCount === totalCount
                          ? '#22c55e'
                          : 'linear-gradient(90deg, #FF3B00, #ff6b40)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '8px 0' : '10px 0',
                scrollbarWidth: 'none',
              }}
            >
              {DEMO_JOURNEY_STEPS.map((step) => (
                <StepItem
                  key={step.id}
                  step={step}
                  storeUrl={storeUrl}
                  isCompleted={completionMap[step.id]}
                  isNew={newlyCompleted === step.id}
                  isNext={nextStepId === step.id}
                  isSpotlit={spotlightStepId === step.id}
                  hasShared={hasShared}
                  onStepClick={() => handleStepClick(step)}
                  onCopyUrl={handleCopyUrl}
                />
              ))}
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <Link
                to="/registro"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  background: '#FF3B00',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '-0.01em',
                }}
              >
                Crear mi tienda real →
              </Link>

              <Link
                to={`/demo/${tenantId}/admin`}
                onClick={() => trackTenantEvent(tenantId, 'demo_panel_admin_link_clicked', {})}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.56)',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <LayoutDashboard size={13} strokeWidth={1.8} aria-hidden="true" />
                Ver panel de administración
              </Link>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ProgressRing({ pct, size, stroke }: { pct: number; size: number; stroke: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={pct === 100 ? '#22c55e' : '#FF3B00'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </svg>
  );
}

interface StepItemProps {
  step: DemoJourneyStepDefinition;
  storeUrl: string;
  isCompleted: boolean;
  isNew: boolean;
  isNext: boolean;
  isSpotlit: boolean;
  hasShared: boolean;
  onStepClick: () => void;
  onCopyUrl: () => Promise<void> | void;
}

function StepItem({
  step,
  storeUrl,
  isCompleted,
  isNew,
  isNext,
  isSpotlit,
  hasShared,
  onStepClick,
  onCopyUrl,
}: StepItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const StepIcon = step.icon;

  useEffect(() => {
    if (isNext || isSpotlit) {
      setExpanded(true);
    }
  }, [isNext, isSpotlit]);

  const handleCopy = async () => {
    await onCopyUrl();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.div
      animate={isNew ? { backgroundColor: ['rgba(34,197,94,0.12)', 'transparent'] } : {}}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      style={{
        borderLeft: isNext && !isCompleted ? '3px solid #FF3B00' : '3px solid transparent',
        marginBottom: 2,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '11px 20px 11px 17px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 400 }}
              >
                <CheckCircle2 size={20} strokeWidth={1.8} style={{ color: '#22c55e' }} />
              </motion.div>
            ) : (
              <motion.div key="circle" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <Circle
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: isNext ? '#FF3B00' : 'rgba(255,255,255,0.2)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isCompleted
              ? 'rgba(34,197,94,0.08)'
              : isNext
                ? 'rgba(255,59,0,0.1)'
                : 'rgba(255,255,255,0.05)',
            color: isCompleted ? '#22c55e' : isNext ? '#FF3B00' : 'rgba(255,255,255,0.42)',
            flexShrink: 0,
          }}
        >
          <StepIcon size={17} strokeWidth={1.8} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 8,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isNext ? '#FF3B00' : 'rgba(255,255,255,0.28)',
              marginBottom: 2,
            }}
          >
            {step.eyebrow}
          </p>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isCompleted ? 'rgba(255,255,255,0.6)' : '#fff',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {step.title}
          </p>
        </div>

        {isNext && !isCompleted ? (
          <span
            style={{
              flexShrink: 0,
              fontSize: 9,
              fontWeight: 700,
              color: '#FF3B00',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(255,59,0,0.1)',
              padding: '3px 7px',
              whiteSpace: 'nowrap',
            }}
          >
            Siguiente
          </span>
        ) : null}

        <ChevronRight
          size={13}
          strokeWidth={2}
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: 'rgba(255,255,255,0.2)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }}
        />
      </button>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 20px 14px 81px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>
                {step.description}
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.28)',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  borderLeft: '2px solid rgba(255,255,255,0.1)',
                  paddingLeft: 10,
                }}
              >
                {step.benefit}
              </p>

              {step.id === 'publish' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: 'rgba(255,255,255,0.55)',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {storeUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Copiar link"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copied || hasShared ? '#22c55e' : 'rgba(255,255,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px 4px',
                        flexShrink: 0,
                      }}
                    >
                      <Copy size={13} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>

                  {copied ? (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ fontSize: 11, color: '#22c55e', fontFamily: 'monospace' }}
                    >
                      ✓ Link copiado al portapapeles
                    </motion.p>
                  ) : null}

                  <a
                    href="https://weblayer.cloud"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.35)',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={11} strokeWidth={1.8} aria-hidden="true" />
                    Activar dominio propio en el sistema real
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onStepClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 16px',
                    background: isCompleted ? 'rgba(255,255,255,0.06)' : '#FF3B00',
                    color: isCompleted ? 'rgba(255,255,255,0.5)' : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '-0.01em',
                    alignSelf: 'flex-start',
                  }}
                >
                  {isCompleted ? 'Editar configuración' : 'Ir a configurar'}
                  <ChevronRight size={13} strokeWidth={2.5} aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
