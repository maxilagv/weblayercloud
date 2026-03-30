import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';

import { useTenant }            from '../../context/TenantContext';
import { useCart }              from '../../context/DemoCartContext';
import { useDemoCustomerAuth }  from '../../hooks/useDemoCustomerAuth';
import { useTenantOffers }      from '../../hooks/useTenantOffers';
import { getActiveOffersForTenant } from '../../utils/tenantOfferPrice';

import DemoBar             from '../../components/demo/DemoBar';
import DemoControlPanel    from '../../components/demo/DemoControlPanel';
import DemoProfileModal    from '../../components/demo/DemoProfileModal';
import StickyConversionBar from '../../components/demo/StickyConversionBar';

// ─── Icono de WhatsApp ────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M27.3 15.5c0 6.1-5 11.1-11.1 11.1-1.9 0-3.7-.5-5.3-1.4l-5.4 1.7 1.8-5.2A11.1 11.1 0 1 1 27.3 15.5Z"
        fill="currentColor"
      />
      <path
        d="M21.6 18.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.8-1-2.4-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.7 1.1 2.9c.1.2 2 3.1 4.8 4.3.7.3 1.2.5 1.7.7.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z"
        fill="#0f0f13"
      />
    </svg>
  );
}

// ─── Botón de WhatsApp flotante ───────────────────────────────────────────────

function WaButton({
  phone,
  bubbleStyle,
  primary,
  businessName,
}: {
  phone:         string;
  bubbleStyle:   string;
  primary:       string;
  businessName?: string;
}) {
  const [open, setOpen] = useState(false);

  const bgColor =
    bubbleStyle === 'primary' ? primary
    : bubbleStyle === 'dark'  ? '#0f0f13'
    : '#25D366';

  const href = `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <div
      style={{
        position:   'fixed',
        right:      24,
        bottom:     'calc(24px + var(--sticky-bar-h, 0px))',
        zIndex:     80,
        transition: 'bottom 0.3s ease',
      }}
    >
      {/* ── Mini chat popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 14, scale: 0.94  }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:     'absolute',
              bottom:       76,
              right:        0,
              width:        300,
              borderRadius: 16,
              overflow:     'hidden',
              boxShadow:    '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
              background:   '#fff',
            }}
          >
            {/* Header verde (estilo WhatsApp) */}
            <div
              style={{
                background: '#075e54',
                padding:    '16px 16px 18px',
                position:   'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                style={{
                  position:   'absolute',
                  top:        10,
                  right:      10,
                  background: 'none',
                  border:     'none',
                  color:      'rgba(255,255,255,0.6)',
                  cursor:     'pointer',
                  padding:    4,
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width:           46,
                    height:          46,
                    borderRadius:    '50%',
                    background:      '#128c7e',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    flexShrink:      0,
                    color:           '#fff',
                  }}
                >
                  <WhatsAppIcon />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                    {businessName || 'Atención al cliente'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                    <span
                      style={{
                        width:        7,
                        height:       7,
                        borderRadius: '50%',
                        background:   '#25D366',
                        display:      'inline-block',
                        flexShrink:   0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
                      En línea ahora
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de chat */}
            <div
              style={{
                background: '#e5ddd5',
                padding:    '16px 14px 12px',
              }}
            >
              <div
                style={{
                  background:   '#fff',
                  borderRadius: '2px 12px 12px 12px',
                  padding:      '10px 14px',
                  maxWidth:     '88%',
                  boxShadow:    '0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                <p style={{ fontSize: 14, color: '#0a0a0a', lineHeight: 1.55 }}>
                  👋 ¡Hola! Estamos disponibles para ayudarte. ¿En qué te podemos ayudar hoy?
                </p>
                <p
                  style={{
                    fontSize:  10,
                    color:     '#999',
                    textAlign: 'right',
                    marginTop: 5,
                  }}
                >
                  Ahora
                </p>
              </div>
            </div>

            {/* CTA enviar mensaje */}
            <div style={{ padding: '12px 14px 14px', background: '#fff' }}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  gap:             8,
                  width:           '100%',
                  padding:         '13px',
                  background:      '#25D366',
                  color:           '#fff',
                  fontWeight:      800,
                  fontSize:        14,
                  textDecoration:  'none',
                  borderRadius:    8,
                  letterSpacing:   '-0.01em',
                }}
              >
                <WhatsAppIcon />
                Enviar mensaje
              </a>
              <p
                style={{
                  fontSize:   10,
                  color:      '#a1a1aa',
                  textAlign:  'center',
                  marginTop:  8,
                  lineHeight: 1.4,
                }}
              >
                Al hacer click abrirás WhatsApp con un mensaje listo para enviar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Botón flotante ───────────────────────────────────────── */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 18 }}
        aria-label={open ? 'Cerrar chat' : 'Contactar por WhatsApp'}
        aria-expanded={open}
        style={{
          position:       'relative',
          width:          60,
          height:         60,
          borderRadius:   '50%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          '#fff',
          background:     bgColor,
          boxShadow:      `0 12px 40px ${bgColor}55, 0 4px 16px ${bgColor}33`,
          border:         'none',
          cursor:         'pointer',
        }}
      >
        <WhatsAppIcon />
        {!open && [0, 0.65, 1.3].map((delay) => (
          <motion.span
            key={delay}
            animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay }}
            style={{
              position:     'absolute',
              inset:        0,
              borderRadius: '50%',
              border:       `2px solid ${bgColor}`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </motion.button>
    </div>
  );
}

function upsertHeadMeta(name: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
  return meta;
}

function upsertPropertyMeta(property: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
  return meta;
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
  return link;
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function DemoLayout() {
  const { tenantId, tenantMeta }    = useTenant();
  const { itemCount }               = useCart();
  const { customerUser }            = useDemoCustomerAuth(tenantId);
  const { offers }                  = useTenantOffers(tenantId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  const base          = `/demo/${tenantId}`;
  const primary       = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const activeOffers  = getActiveOffersForTenant(offers);
  const featuredOffer = activeOffers[0];

  // ── Días restantes del trial ───────────────────────────────────────────────

  const daysLeft = useMemo(() => {
    if (!tenantMeta?.trialEndsAt) return null;
    return Math.max(
      0,
      Math.ceil(
        (tenantMeta.trialEndsAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );
  }, [tenantMeta?.trialEndsAt]);

  useEffect(() => {
    if (!tenantMeta) return;

    const previousTitle = document.title;
    const previousDescription = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.getAttribute('content');
    const previousRobots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.getAttribute('content');
    const previousOgTitle = document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.getAttribute('content');
    const previousOgDescription = document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.getAttribute('content');
    const previousOgType = document.head.querySelector<HTMLMetaElement>('meta[property="og:type"]')?.getAttribute('content');
    const previousOgUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.getAttribute('content');
    const previousOgImage = document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.getAttribute('content');
    const previousCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.getAttribute('href');
    const title = tenantMeta.siteConfig?.seoTitle || tenantMeta.businessName || 'Demo LayerCloud';
    const description =
      tenantMeta.siteConfig?.seoDescription ||
      tenantMeta.siteConfig?.heroSubtitle ||
      `Explorá la demo de ${tenantMeta.businessName} en LayerCloud.`;
    const canonicalHref = `${window.location.origin}/demo/${tenantId}`;
    const robotsContent = tenantMeta.isPublicDemo ? 'index,follow' : 'noindex,nofollow';
    const logoUrl = tenantMeta.siteConfig?.logoUrl || '';

    document.title = title;

    upsertHeadMeta('description', description);
    upsertHeadMeta('robots', robotsContent);
    upsertPropertyMeta('og:title', title);
    upsertPropertyMeta('og:description', description);
    upsertPropertyMeta('og:type', 'website');
    upsertPropertyMeta('og:url', canonicalHref);
    const ogImageMeta = document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (logoUrl) {
      upsertPropertyMeta('og:image', logoUrl);
    } else if (ogImageMeta) {
      ogImageMeta.remove();
    }
    upsertCanonical(canonicalHref);

    return () => {
      document.title = previousTitle;
      if (previousDescription) {
        upsertHeadMeta('description', previousDescription);
      }
      if (previousRobots) {
        upsertHeadMeta('robots', previousRobots);
      } else {
        const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
        if (robots) robots.remove();
      }
      if (previousOgTitle) upsertPropertyMeta('og:title', previousOgTitle);
      if (previousOgDescription) upsertPropertyMeta('og:description', previousOgDescription);
      if (previousOgType) upsertPropertyMeta('og:type', previousOgType);
      if (previousOgUrl) {
        upsertPropertyMeta('og:url', previousOgUrl);
      } else {
        const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
        if (ogUrl) ogUrl.remove();
      }
      if (previousOgImage) {
        upsertPropertyMeta('og:image', previousOgImage);
      } else {
        const ogImage = document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]');
        if (ogImage) ogImage.remove();
      }
      if (previousCanonical) {
        upsertCanonical(previousCanonical);
      } else {
        const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (canonical) canonical.remove();
      }
    };
  }, [tenantId, tenantMeta]);

  // ── Scroll detection ───────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Mobile menu: scroll lock ───────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // ── CSS vars iniciales ─────────────────────────────────────────────────────

  useEffect(() => {
    // Asegurar que --sticky-bar-h está definida desde el inicio
    document.documentElement.style.setProperty('--sticky-bar-h', '0px');
  }, []);

  // ── Nav links ──────────────────────────────────────────────────────────────

  const navLinks = [
    { label: 'Inicio',    to: base,               end: true  },
    { label: 'Productos', to: `${base}/products`, end: false },
    { label: 'Nosotros',  to: `${base}/about`,    end: false },
    { label: 'Contacto',  to: `${base}/contact`,  end: false },
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight:  '100svh',
        background: '#f6f6f2',
        fontFamily: 'var(--tk-font-family, Inter, system-ui, sans-serif)',
      }}
    >
      {/* ── Demo Bar (barra superior inteligente) ─────────────────────────── */}
      {!tenantMeta?.hideDemoBranding && (
        <DemoBar
          tenantId={tenantId}
          tenantMeta={tenantMeta}
          daysLeft={daysLeft}
        />
      )}

      {/* ── Barra de oferta / banner (si hay) ───────────────────────────── */}
      {tenantMeta?.siteConfig?.bannerText ? (
        <div
          style={{
            minHeight:  36,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:    '0 16px',
            background: primary,
            color:      '#fff',
            fontSize:   12,
            fontWeight: 700,
            textAlign:  'center',
            letterSpacing: '0.04em',
          }}
        >
          {tenantMeta.siteConfig.bannerText}
        </div>
      ) : featuredOffer ? (
        <div
          style={{
            minHeight:  32,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:    '0 16px',
            background: '#0f0f13',
            color:      '#fff',
            fontSize:   12,
            textAlign:  'center',
          }}
        >
          <span style={{ color: primary, fontWeight: 700, marginRight: 8 }}>
            {featuredOffer.titulo}
          </span>
          {featuredOffer.descripcion}
        </div>
      ) : null}

      {/* ── Header sticky ────────────────────────────────────────────────── */}
      <header
        style={{
          position:       'sticky',
          top:            0,
          zIndex:         60,
          background:     scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop:      `3px solid ${primary}`,
          borderBottom:   '1px solid rgba(15,15,19,0.06)',
          transition:     'background 0.2s ease, box-shadow 0.2s ease',
          boxShadow:      scrolled ? '0 2px 24px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth:       1200,
            margin:         '0 auto',
            padding:        '0 clamp(16px, 4vw, 48px)',
            minHeight:      68,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            16,
          }}
        >
          {/* Logo */}
          <Link
            to={base}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {tenantMeta?.siteConfig?.logoUrl ? (
              <img
                src={tenantMeta.siteConfig.logoUrl}
                alt={tenantMeta.businessName}
                loading="eager"
                style={{ height: 34, objectFit: 'contain' }}
              />
            ) : (
              <span
                style={{
                  fontSize:      20,
                  fontWeight:    800,
                  letterSpacing: '-0.03em',
                  color:         '#0f0f13',
                }}
              >
                {tenantMeta?.businessName ?? 'Demo'}
              </span>
            )}
          </Link>

          {/* Nav desktop */}
          <nav
            className="demo-store-desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 24 }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={{
                  textDecoration: 'none',
                  position:       'relative',
                  padding:        '4px 0',
                  display:        'inline-block',
                }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        fontSize:   13,
                        fontWeight: 700,
                        color:      isActive ? '#0f0f13' : '#71717a',
                        transition: 'color 0.18s',
                      }}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position:   'absolute',
                          bottom:     -3,
                          left:       0,
                          right:      0,
                          height:     2,
                          background: primary,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Mi cuenta */}
            <Link
              to={customerUser ? `${base}/mi-cuenta` : `${base}/login`}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            8,
                textDecoration: 'none',
                fontSize:       13,
                color:          '#0f0f13',
                fontWeight:     700,
              }}
            >
              <User size={16} aria-hidden="true" />
              {customerUser ? 'Mi cuenta' : 'Ingresar'}
            </Link>

            {/* Carrito */}
            <Link
              to={`${base}/checkout`}
              style={{
                position:        'relative',
                display:         'inline-flex',
                alignItems:      'center',
                gap:             10,
                textDecoration:  'none',
                background:      primary,
                color:           '#fff',
                fontWeight:      800,
                padding:         '11px 18px',
                transition:      'opacity 0.15s',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{    scale: 0 }}
                      style={{
                        position:        'absolute',
                        top:             -7,
                        right:           -7,
                        width:           16,
                        height:          16,
                        borderRadius:    '50%',
                        background:      '#0f0f13',
                        color:           '#fff',
                        display:         'flex',
                        alignItems:      'center',
                        justifyContent:  'center',
                        fontSize:        9,
                        fontWeight:      800,
                      }}
                      aria-label={`${itemCount} productos en el carrito`}
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              Carrito
            </Link>
          </nav>

          {/* Botón hamburguesa (mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            className="demo-store-mobile-toggle"
            style={{
              width:          42,
              height:         42,
              border:         '1px solid rgba(15,15,19,0.08)',
              background:     '#fff',
              display:        'none',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
            }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: 90,  opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Menú mobile (pantalla completa) ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            style={{
              position:      'fixed',
              inset:         0,
              zIndex:        90,
              background:    '#0a0a0a',
              color:         '#fff',
              display:       'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop:    96,
            }}
          >
            <div>
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '20px clamp(24px, 7vw, 56px)',
                    textDecoration: 'none',
                    color:          '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                    <span
                      style={{
                        fontSize:      11,
                        letterSpacing: '0.16em',
                        color:         'rgba(255,255,255,0.28)',
                      }}
                    >
                      0{index + 1}
                    </span>
                    <span
                      style={{
                        fontSize:      'clamp(34px, 10vw, 54px)',
                        fontWeight:    700,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {link.label}
                    </span>
                  </div>
                  <ArrowRight size={18} color="rgba(255,255,255,0.4)" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div style={{ padding: '24px clamp(24px, 7vw, 56px) 34px' }}>
              <Link
                to={customerUser ? `${base}/mi-cuenta` : `${base}/login`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  minHeight:      48,
                  textDecoration: 'none',
                  border:         '1px solid rgba(255,255,255,0.14)',
                  color:          '#fff',
                  marginBottom:   12,
                  fontSize:       14,
                  fontWeight:     600,
                }}
              >
                {customerUser ? 'Mi cuenta' : 'Ingresar'}
              </Link>
              <Link
                to={`${base}/checkout`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  minHeight:      52,
                  textDecoration: 'none',
                  background:     primary,
                  color:          '#fff',
                  fontWeight:     800,
                  fontSize:       15,
                }}
              >
                Ver carrito ({itemCount})
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contenido de la página ───────────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop:  80,
          background: '#111',
          color:      'rgba(255,255,255,0.58)',
          padding:    'clamp(40px, 7vw, 72px) clamp(20px, 6vw, 56px) 32px',
        }}
      >
        <div
          style={{
            maxWidth:              1200,
            margin:                '0 auto',
            display:               'grid',
            gridTemplateColumns:   'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                   28,
          }}
        >
          {/* Col 1: branding del tenant */}
          <div>
            <p
              style={{
                fontSize:      20,
                fontWeight:    800,
                color:         '#fff',
                letterSpacing: '-0.03em',
              }}
            >
              {tenantMeta?.businessName}
            </p>
            <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7 }}>
              {tenantMeta?.siteConfig?.footerTagline
                || tenantMeta?.siteConfig?.heroSubtitle
                || 'Demo comercial creada sobre LayerCloud.'}
            </p>
            {tenantMeta?.siteConfig?.scheduleText && (
              <p
                style={{
                  marginTop:  8,
                  fontSize:   12,
                  color:      'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                }}
              >
                {tenantMeta.siteConfig.scheduleText}
              </p>
            )}
          </div>

          {/* Col 2: datos de contacto */}
          <div style={{ display: 'grid', gap: 10 }}>
            {tenantMeta?.siteConfig?.address && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                  {tenantMeta.siteConfig.address}
                </span>
              </div>
            )}
            {tenantMeta?.siteConfig?.email && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: 13 }}>{tenantMeta.siteConfig.email}</span>
              </div>
            )}
            {tenantMeta?.siteConfig?.whatsappNumber && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: 13 }}>{tenantMeta.siteConfig.whatsappNumber}</span>
              </div>
            )}
          </div>

          {/* Col 3: nav */}
          <div style={{ display: 'grid', gap: 8 }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: 'none',
                  color:          'rgba(255,255,255,0.48)',
                  fontSize:       13,
                  transition:     'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.48)'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Línea inferior */}
        <div
          style={{
            maxWidth:       1200,
            margin:         '28px auto 0',
            paddingTop:     16,
            borderTop:      '1px solid rgba(255,255,255,0.08)',
            display:        'flex',
            justifyContent: 'space-between',
            gap:            12,
            flexWrap:       'wrap',
            fontSize:       12,
          }}
        >
          <span>© {new Date().getFullYear()} {tenantMeta?.businessName}</span>
          {!tenantMeta?.hideDemoBranding && (
            <a
              href="https://weblayer.cloud"
              target="_blank"
              rel="noreferrer"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            6,
                color:          'rgba(255,255,255,0.42)',
                textDecoration: 'none',
                transition:     'color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FF3B00'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.42)'; }}
            >
              Powered by LayerCloud
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </footer>

      {/* ── WhatsApp button ──────────────────────────────────────────────── */}
      {tenantMeta?.siteConfig?.whatsappNumber && (
        <WaButton
          phone={tenantMeta.siteConfig.whatsappNumber}
          bubbleStyle={tenantMeta.siteConfig.whatsappBubbleColor ?? 'green'}
          primary={primary}
          businessName={tenantMeta.businessName}
        />
      )}

      {/* ── Demo Journey: Panel de control guiado ────────────────────────── */}
      {!tenantMeta?.hideDemoBranding && <DemoControlPanel />}

      {/* ── Demo Journey: Sticky conversion bar ─────────────────────────── */}
      {!tenantMeta?.hideDemoBranding && (
        <StickyConversionBar tenantId={tenantId} primary={primary} />
      )}

      {/* ── Demo Journey: Modal de segmentación de perfil ───────────────── */}
      {!tenantMeta?.hideDemoBranding && <DemoProfileModal tenantId={tenantId} />}

      {/* ── Estilos responsive ───────────────────────────────────────────── */}
      <style>{`
        @media (min-width: 640px) {
          .demo-bar-tagline {
            display: inline !important;
          }
        }
        @media (max-width: 900px) {
          .demo-store-desktop-nav {
            display: none !important;
          }
          .demo-store-mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
