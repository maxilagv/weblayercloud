import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ExternalLink, Mail, MapPin, Menu, MessageCircle, Phone, ShoppingBag, User } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useCart } from '../../context/DemoCartContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';
import { useTenantOffers } from '../../hooks/useTenantOffers';
import { getActiveOffersForTenant } from '../../utils/tenantOfferPrice';

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

function DemoBadge() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        zIndex: 80,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setExpanded((v) => !v)}
    >
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="pill"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.16 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(10,10,10,0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '7px 13px 7px 10px',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#FF3B00',
              flexShrink: 0,
            }} />
            DEMO BÁSICA
            <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 2 }}>↑</span>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '18px 20px',
              maxWidth: 280,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3B00', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF3B00' }}>
                Demo básica
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 700, lineHeight: 1.4, marginBottom: 8, letterSpacing: '-0.01em' }}>
              Esto es el 10% de lo que LayerCloud puede construir.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: 14 }}>
              El sistema real es a medida: más módulos, integraciones, roles y sin límites.
            </p>
            <a
              href="https://weblayer.cloud"
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                background: '#FF3B00',
                padding: '7px 14px',
                letterSpacing: '0.04em',
              }}
            >
              Ver sistema completo →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WaButton({ phone, bubbleStyle, primary }: { phone: string; bubbleStyle: string; primary: string }) {
  const [hovered, setHovered] = useState(false);

  const bgColor =
    bubbleStyle === 'primary' ? primary
    : bubbleStyle === 'dark'  ? '#0f0f13'
    : '#25D366';

  const shadowColor =
    bubbleStyle === 'primary' ? primary
    : bubbleStyle === 'dark'  ? '#0f0f13'
    : '#25D366';

  const href = `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 80, display: 'flex', alignItems: 'center', gap: 14 }}>
      <AnimatePresence>
        {hovered ? (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.92 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              background: '#0f0f13',
              color: '#fff',
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              boxShadow: '0 6px 24px rgba(0,0,0,0.24)',
              pointerEvents: 'none',
            }}
          >
            ¿Hablamos?
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 18 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          position: 'relative',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: bgColor,
          boxShadow: `0 12px 40px ${shadowColor}55, 0 4px 16px ${shadowColor}33`,
          flexShrink: 0,
          textDecoration: 'none',
        }}
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon />
        {[0, 0.65, 1.3].map((delay) => (
          <motion.span
            key={delay}
            animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${bgColor}`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </motion.a>
    </div>
  );
}

export default function DemoLayout() {
  const { tenantId, tenantMeta } = useTenant();
  const { itemCount } = useCart();
  const { customerUser } = useDemoCustomerAuth(tenantId);
  const { offers } = useTenantOffers(tenantId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const activeOffers = getActiveOffersForTenant(offers);
  const featuredOffer = activeOffers[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Inicio', to: base, end: true },
    { label: 'Productos', to: `${base}/products`, end: false },
    { label: 'Nosotros', to: `${base}/about`, end: false },
    { label: 'Contacto', to: `${base}/contact`, end: false },
  ];

  return (
    <div style={{ minHeight: '100svh', background: '#f6f6f2', fontFamily: 'var(--tk-font-family, Inter, system-ui, sans-serif)' }}>
      {!tenantMeta?.hideDemoBranding ? (
        <div
          style={{
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: 'rgba(0,0,0,0.84)',
            color: 'rgba(255,255,255,0.62)',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {tenantMeta?.plan === 'paid' ? (
            <>
              Powered by{' '}
              <a href="https://weblayer.cloud" target="_blank" rel="noreferrer" style={{ color: '#FF3B00', textDecoration: 'none', marginLeft: 4 }}>
                weblayer.cloud
              </a>
            </>
          ) : (
            <>
              Esta es una demo de 7 dias · Sistema provisto por{' '}
              <a href="https://weblayer.cloud" target="_blank" rel="noreferrer" style={{ color: '#FF3B00', textDecoration: 'none', marginLeft: 4 }}>
                weblayer.cloud
              </a>
            </>
          )}
        </div>
      ) : null}

      {tenantMeta?.siteConfig?.bannerText ? (
        <div
          style={{
            minHeight: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: primary,
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          {tenantMeta.siteConfig.bannerText}
        </div>
      ) : featuredOffer ? (
        <div
          style={{
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: '#0f0f13',
            color: '#fff',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          <span style={{ color: primary, fontWeight: 700, marginRight: 8 }}>{featuredOffer.titulo}</span>
          {featuredOffer.descripcion}
        </div>
      ) : null}

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          borderTop: '3px solid var(--tk-primary, #FF3B00)',
          borderBottom: '1px solid rgba(15,15,19,0.06)',
          transition: 'background 0.2s ease',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 clamp(16px, 4vw, 48px)',
            minHeight: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Link to={base} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            {tenantMeta?.siteConfig?.logoUrl ? (
              <img src={tenantMeta.siteConfig.logoUrl} alt={tenantMeta.businessName} style={{ height: 34, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f0f13' }}>
                {tenantMeta?.businessName ?? 'Demo'}
              </span>
            )}
          </Link>

          <nav className="demo-store-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                style={{ textDecoration: 'none', position: 'relative', padding: '4px 0', display: 'inline-block' }}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#0f0f13' : '#71717a', transition: 'color 0.18s' }}>
                      {link.label}
                    </span>
                    {isActive ? (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position: 'absolute',
                          bottom: -3,
                          left: 0,
                          right: 0,
                          height: 2,
                          background: primary,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
            <Link
              to={customerUser ? `${base}/mi-cuenta` : `${base}/login`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                fontSize: 13,
                color: '#0f0f13',
                fontWeight: 700,
              }}
            >
              <User size={16} />
              {customerUser ? 'Mi cuenta' : 'Ingresar'}
            </Link>
            <Link
              to={`${base}/checkout`}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                background: primary,
                color: '#fff',
                fontWeight: 800,
                padding: '11px 18px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={18} strokeWidth={1.7} />
                {itemCount > 0 ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: -7,
                      right: -7,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#0f0f13',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 800,
                    }}
                  >
                    {itemCount}
                  </motion.span>
                ) : null}
              </div>
              Carrito
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            style={{
              width: 42,
              height: 42,
              border: '1px solid rgba(15,15,19,0.08)',
              background: '#fff',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            className="demo-store-mobile-toggle"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: '#0a0a0a',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop: 96,
            }}
          >
            <div>
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px clamp(24px, 7vw, 56px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    textDecoration: 'none',
                    color: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.28)' }}>
                      0{index + 1}
                    </span>
                    <span style={{ fontSize: 'clamp(34px, 10vw, 54px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                      {link.label}
                    </span>
                  </div>
                  <ArrowRight size={18} color="rgba(255,255,255,0.4)" />
                </Link>
              ))}
            </div>
            <div style={{ padding: '24px clamp(24px, 7vw, 56px) 34px' }}>
              <Link
                to={customerUser ? `${base}/mi-cuenta` : `${base}/login`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#fff',
                  marginBottom: 12,
                }}
              >
                {customerUser ? 'Mi cuenta' : 'Ingresar'}
              </Link>
              <Link
                to={`${base}/checkout`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 52,
                  textDecoration: 'none',
                  background: primary,
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                Ver carrito ({itemCount})
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main>
        <Outlet />
      </main>

      <footer
        style={{
          marginTop: 80,
          background: '#111',
          color: 'rgba(255,255,255,0.58)',
          padding: 'clamp(40px, 7vw, 72px) clamp(20px, 6vw, 56px) 32px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 28,
          }}
        >
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              {tenantMeta?.businessName}
            </p>
            <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.7 }}>
              {tenantMeta?.siteConfig?.footerTagline || tenantMeta?.siteConfig?.heroSubtitle || 'Demo comercial creada sobre LayerCloud.'}
            </p>
            {tenantMeta?.siteConfig?.scheduleText ? (
              <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                {tenantMeta.siteConfig.scheduleText}
              </p>
            ) : null}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {tenantMeta?.siteConfig?.address ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <MapPin size={16} />
                <span>{tenantMeta.siteConfig.address}</span>
              </div>
            ) : null}
            {tenantMeta?.siteConfig?.email ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={16} />
                <span>{tenantMeta.siteConfig.email}</span>
              </div>
            ) : null}
            {tenantMeta?.siteConfig?.whatsappNumber ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={16} />
                <span>{tenantMeta.siteConfig.whatsappNumber}</span>
              </div>
            ) : null}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.48)' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: '28px auto 0',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            fontSize: 12,
          }}
        >
          <span>© {new Date().getFullYear()} {tenantMeta?.businessName}</span>
          <a
            href="https://weblayer.cloud"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.54)',
              textDecoration: 'none',
            }}
          >
            Powered by LayerCloud
            <ExternalLink size={14} />
          </a>
        </div>
      </footer>

      {tenantMeta?.siteConfig?.whatsappNumber ? (
        <WaButton
          phone={tenantMeta.siteConfig.whatsappNumber}
          bubbleStyle={tenantMeta.siteConfig.whatsappBubbleColor ?? 'green'}
          primary={primary}
        />
      ) : null}

      {!tenantMeta?.hideDemoBranding ? <DemoBadge /> : null}

      <style>{`
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
