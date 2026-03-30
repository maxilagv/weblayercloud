import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { type DemoProfile, useDemoJourney } from '../../context/DemoJourneyContext';
import { getStickyDelayMs, getStickyDelayVariant } from '../../lib/abTest';
import { trackTenantEvent } from '../../utils/trackTenantEvent';

interface BarConfig {
  text: string;
  cta: string;
  href: string;
}

const PROFILE_CONFIG: Record<DemoProfile, BarConfig> = {
  emprendedor: {
    text: 'Tu tienda online lista para vender.',
    cta: 'Crear la mía gratis',
    href: '/registro',
  },
  pyme: {
    text: 'Potenciá tu negocio con un sistema propio.',
    cta: 'Hablar con un especialista',
    href: '/contacto',
  },
  agencia: {
    text: 'Ofrecé tiendas online a tus clientes con tu propia marca.',
    cta: 'Ver programa de partners',
    href: '/contacto?tipo=agencia',
  },
};

const DEFAULT_CONFIG: BarConfig = {
  text: '¿Te gustó esta demo? Creá tu propia tienda igual a esta.',
  cta: 'Empezar gratis',
  href: '/registro',
};

interface StickyConversionBarProps {
  tenantId: string;
  primary: string;
}

export default function StickyConversionBar({ tenantId, primary }: StickyConversionBarProps) {
  const { profile, panelOpen, stickyDismissed, setStickyDismissed } = useDemoJourney();
  const [visible, setVisible] = useState(false);
  const [tracked, setTracked] = useState(false);
  const delayMs = useMemo(() => getStickyDelayMs(), []);
  const delayVariant = useMemo(() => getStickyDelayVariant(), []);

  useEffect(() => {
    if (stickyDismissed) return;
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, stickyDismissed]);

  const isShown = visible && !stickyDismissed;

  useEffect(() => {
    document.documentElement.style.setProperty('--sticky-bar-h', isShown ? '60px' : '0px');
    return () => document.documentElement.style.setProperty('--sticky-bar-h', '0px');
  }, [isShown]);

  useEffect(() => {
    if (!isShown || tracked) return;
    setTracked(true);
    trackTenantEvent(tenantId, 'sticky_bar_shown', {
      profile: profile ?? 'sin_perfil',
      delayVariant,
    });
  }, [delayVariant, isShown, profile, tenantId, tracked]);

  const config = profile ? PROFILE_CONFIG[profile] ?? DEFAULT_CONFIG : DEFAULT_CONFIG;

  const handleCTA = () => {
    trackTenantEvent(tenantId, 'sticky_bar_cta_clicked', {
      profile: profile ?? 'sin_perfil',
      cta: config.cta,
      delayVariant,
    });
  };

  const handleDismiss = () => {
    setStickyDismissed(true);
    setVisible(false);
    trackTenantEvent(tenantId, 'sticky_bar_dismissed', {
      profile: profile ?? 'sin_perfil',
      delayVariant,
    });
  };

  return (
    <AnimatePresence>
      {isShown && !panelOpen ? (
        <motion.div
          key="sticky-bar"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          role="complementary"
          aria-label="Crear tu propia tienda"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '0 clamp(16px, 4vw, 32px)',
            minHeight: 60,
            background: 'rgba(10,10,10,0.97)',
            backdropFilter: 'blur(16px)',
            borderTop: `2px solid ${primary}`,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.4,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {config.text}
          </p>

          <Link
            to={config.href}
            onClick={handleCTA}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              background: primary,
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {config.cta}
            <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar barra"
            style={{
              width: 32,
              height: 32,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.36)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={13} strokeWidth={2} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
