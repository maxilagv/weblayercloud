import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Zap } from 'lucide-react';
import { useDemoJourney, type DemoProfile } from '../../context/DemoJourneyContext';
import type { TenantMeta } from '../../context/TenantContext';
import { getDemoBarVariant } from '../../lib/abTest';
import { trackTenantEvent } from '../../utils/trackTenantEvent';

const PROFILE_CTA: Record<DemoProfile, { label: string; href: string }> = {
  emprendedor: { label: 'Crear mi tienda', href: '/registro' },
  pyme: { label: 'Hablar con un especialista', href: '/contacto' },
  agencia: { label: 'Ver programa de partners', href: '/contacto?tipo=agencia' },
};

function getDefaultCTA() {
  const variant = getDemoBarVariant();
  return variant === 'probar-7-dias'
    ? { label: 'Probar 7 días', href: '/registro' }
    : { label: 'Crear mi tienda', href: '/registro' };
}

interface DemoBarProps {
  tenantId: string;
  tenantMeta: TenantMeta | null;
  daysLeft: number | null;
}

export default function DemoBar({ tenantId, tenantMeta, daysLeft }: DemoBarProps) {
  const { profile } = useDemoJourney();

  if (!tenantMeta || tenantMeta.hideDemoBranding) {
    return null;
  }

  const isPublicDemo = !!tenantMeta.isPublicDemo;
  const shouldShowConversionBar = isPublicDemo || tenantMeta.plan === 'trial';

  if (!shouldShowConversionBar) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 36,
          padding: '0 16px',
          background: 'rgba(10,10,10,0.88)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.42)',
          gap: 6,
        }}
      >
        Potenciado por{' '}
        <a
          href="https://weblayer.cloud"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#FF3B00',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          LayerCloud
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </div>
    );
  }

  const defaultCta = getDefaultCTA();
  const cta = profile ? PROFILE_CTA[profile] ?? defaultCta : defaultCta;
  const isUrgent = !isPublicDemo && daysLeft !== null && daysLeft <= 2;

  const countdownText =
    daysLeft === null
      ? 'Demo interactiva activa'
      : daysLeft === 0
        ? 'Tu demo vence hoy'
        : `Demo activa · ${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`;

  const publicDemoText = `Demo pública curada · ${tenantMeta.businessName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      role="banner"
      aria-label="Estado de la demo"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
        padding: '0 clamp(12px, 3vw, 28px)',
        background: isUrgent ? 'rgba(180,30,0,0.96)' : 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(8px)',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <motion.span
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isUrgent ? '#fca5a5' : '#FF3B00',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: '0.06em',
            color: isUrgent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.62)',
            whiteSpace: 'nowrap',
          }}
        >
          {isPublicDemo ? publicDemoText : countdownText}
        </span>
      </div>

      <span
        className="demo-bar-tagline"
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.32)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {isPublicDemo ? 'Probá cómo queda tu tienda antes de contratar.' : '¿Te gustó? Creá la tuya igual a esta.'}
      </span>

      <Link
        to={cta.href}
        onClick={() =>
          trackTenantEvent(tenantId, 'demo_bar_cta_clicked', {
            daysLeft,
            profile: profile ?? 'sin_perfil',
            cta: cta.label,
            isPublicDemo,
          })
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 16px',
          background: isUrgent ? '#fff' : '#FF3B00',
          color: isUrgent ? '#b41e00' : '#fff',
          fontWeight: 800,
          fontSize: 12,
          textDecoration: 'none',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <Zap size={12} strokeWidth={2.5} aria-hidden="true" />
        {cta.label}
      </Link>
    </motion.div>
  );
}
