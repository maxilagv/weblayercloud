import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { type DemoProfile, useDemoJourney } from '../../context/DemoJourneyContext';
import { trackTenantEvent } from '../../utils/trackTenantEvent';

// ─── Datos de perfiles ────────────────────────────────────────────────────────

interface ProfileOption {
  id:       DemoProfile;
  emoji:    string;
  title:    string;
  subtitle: string;
  cta:      string;
}

const PROFILES: ProfileOption[] = [
  {
    id:       'emprendedor',
    emoji:    '🚀',
    title:    'Soy emprendedor',
    subtitle: 'Arranco solo o con un equipo chico y quiero vender online.',
    cta:      'Crear mi tienda gratis',
  },
  {
    id:       'pyme',
    emoji:    '🏢',
    title:    'Tengo un negocio establecido',
    subtitle: 'PyME o comercio que quiere escalar su operación digital.',
    cta:      'Hablar con un especialista',
  },
  {
    id:       'agencia',
    emoji:    '💼',
    title:    'Soy agencia o freelancer',
    subtitle: 'Quiero ofrecer tiendas online a mis clientes con mi marca.',
    cta:      'Ver programa de partners',
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DemoProfileModal({ tenantId }: { tenantId: string }) {
  const { profileModalVisible, setProfile, dismissProfileModal } = useDemoJourney();
  const modalRef      = useRef<HTMLDivElement>(null);
  const firstBtnRef   = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // ── Gestión de foco ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profileModalVisible) return;

    previousFocus.current = document.activeElement as HTMLElement;
    trackTenantEvent(tenantId, 'demo_profile_modal_shown', {});

    // Pequeño delay para que el modal haya terminado de animarse
    const raf = window.requestAnimationFrame(() => {
      firstBtnRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      previousFocus.current?.focus();
    };
  }, [profileModalVisible, tenantId]);

  // ── Focus trap + ESC ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!profileModalVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [profileModalVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll lock del body ───────────────────────────────────────────────────

  useEffect(() => {
    if (!profileModalVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [profileModalVisible]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = (p: DemoProfile) => {
    trackTenantEvent(tenantId, 'demo_profile_selected', { profile: p });
    setProfile(p);
  };

  const handleDismiss = () => {
    trackTenantEvent(tenantId, 'demo_profile_dismissed', {});
    dismissProfileModal();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {profileModalVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleDismiss}
            aria-hidden="true"
            style={{
              position:       'fixed',
              inset:          0,
              zIndex:         110,
              background:     'rgba(0,0,0,0.76)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="profile-modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:        'fixed',
              inset:           0,
              zIndex:          120,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              padding:         'clamp(16px, 4vw, 40px)',
              pointerEvents:   'none',
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
              style={{
                width:          '100%',
                maxWidth:       520,
                background:     '#0a0a0a',
                border:         '1px solid rgba(255,255,255,0.1)',
                borderTop:      '3px solid #FF3B00',
                padding:        'clamp(24px, 5vw, 40px)',
                pointerEvents:  'auto',
                position:       'relative',
                boxShadow:      '0 32px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Cerrar"
                style={{
                  position:       'absolute',
                  top:            14,
                  right:          14,
                  width:          32,
                  height:         32,
                  border:         '1px solid rgba(255,255,255,0.12)',
                  background:     'transparent',
                  color:          'rgba(255,255,255,0.44)',
                  cursor:         'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  transition:     'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color        = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color        = 'rgba(255,255,255,0.44)';
                  e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.12)';
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>

              {/* Header */}
              <p
                style={{
                  fontFamily:    'monospace',
                  fontSize:      10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color:         '#FF3B00',
                  marginBottom:  12,
                }}
              >
                Personalizá tu experiencia
              </p>

              <h2
                id="profile-modal-title"
                style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'clamp(22px, 4vw, 28px)',
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         '#fff',
                  lineHeight:    1.1,
                  marginBottom:  8,
                }}
              >
                ¿Cómo llegaste acá?
              </h2>

              <p
                style={{
                  fontSize:     13,
                  color:        'rgba(255,255,255,0.42)',
                  lineHeight:   1.6,
                  marginBottom: 28,
                }}
              >
                Así podemos mostrarte lo que más te sirve de LayerCloud.
              </p>

              {/* Cards de perfil */}
              <div style={{ display: 'grid', gap: 10 }}>
                {PROFILES.map((p, index) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    ref={index === 0 ? firstBtnRef : undefined}
                    onSelect={handleSelect}
                  />
                ))}
              </div>

              {/* Skip link */}
              <button
                type="button"
                onClick={handleDismiss}
                style={{
                  display:       'block',
                  width:         '100%',
                  marginTop:     20,
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  fontSize:      12,
                  color:         'rgba(255,255,255,0.24)',
                  textAlign:     'center',
                  transition:    'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.24)'; }}
              >
                Omitir por ahora
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-componente: card de perfil ──────────────────────────────────────────

import { forwardRef } from 'react';

const ProfileCard = forwardRef<
  HTMLButtonElement,
  { profile: ProfileOption; onSelect: (p: DemoProfile) => void }
>(({ profile: p, onSelect }, ref) => (
  <motion.button
    ref={ref}
    type="button"
    onClick={() => onSelect(p.id)}
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ duration: 0.14 }}
    style={{
      display:    'flex',
      alignItems: 'center',
      gap:        16,
      padding:    '16px 20px',
      background: 'rgba(255,255,255,0.04)',
      border:     '1px solid rgba(255,255,255,0.08)',
      cursor:     'pointer',
      textAlign:  'left',
      width:      '100%',
      transition: 'border-color 0.15s, background 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#FF3B00';
      e.currentTarget.style.background  = 'rgba(255,59,0,0.06)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.background  = 'rgba(255,255,255,0.04)';
    }}
  >
    <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }} aria-hidden="true">
      {p.emoji}
    </span>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3, lineHeight: 1.2 }}>
        {p.title}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
        {p.subtitle}
      </p>
    </div>

    <span
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           5,
        fontSize:      11,
        fontWeight:    700,
        color:         '#FF3B00',
        flexShrink:    0,
        letterSpacing: '0.01em',
        whiteSpace:    'nowrap',
      }}
    >
      {p.cta}
      <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
    </span>
  </motion.button>
));

ProfileCard.displayName = 'ProfileCard';
