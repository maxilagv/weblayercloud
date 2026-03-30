import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';

import { useTenant }      from '../../context/TenantContext';
import { useDemoJourney } from '../../context/DemoJourneyContext';
import { useCart }        from '../../context/DemoCartContext';
import { useDemoToast }   from '../../context/DemoToastContext';
import { useDemoSpotlight } from '../../hooks/useDemoSpotlight';
import { useTenantCategories } from '../../hooks/useTenantCategories';
import { useTenantLandingHeroes } from '../../hooks/useTenantLandingHeroes';
import { useTenantOffers } from '../../hooks/useTenantOffers';
import { useTenantProducts, type TenantProduct } from '../../hooks/useTenantProducts';
import { getProductOfferPrice } from '../../utils/tenantOfferPrice';
import { formatCurrency } from './admin/adminHelpers';

function ProductCard({
  product,
  base,
  primary,
  onAdd,
  offers,
}: {
  product: TenantProduct;
  base: string;
  primary: string;
  onAdd: (product: TenantProduct) => void;
  offers: ReturnType<typeof useTenantOffers>['offers'];
}) {
  const [justAdded, setJustAdded] = useState(false);
  const [hovered, setHovered]     = useState(false);
  const pricing = getProductOfferPrice(product, offers);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    onAdd(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      style={{
        background:    '#fff',
        display:       'flex',
        flexDirection: 'column',
        overflow:      'hidden',
        transition:    'box-shadow 0.22s ease',
        boxShadow:     hovered ? '0 8px 32px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagen */}
      <Link
        to={`${base}/products/${product.id}`}
        style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden' }}
      >
        {product.imagenes?.[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            loading="lazy"
            decoding="async"
            style={{
              width:      '100%',
              height:     280,
              objectFit:  'cover',
              display:    'block',
              transform:  hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        ) : (
          <div
            style={{
              height:          280,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              background:      `${primary}12`,
              color:           primary,
              fontSize:        52,
              fontWeight:      900,
              letterSpacing:   '-0.05em',
            }}
          >
            {product.nombre.slice(0, 1).toUpperCase()}
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {pricing.hasOffer && (
            <span style={{
              background:    primary,
              color:         '#fff',
              fontSize:      10,
              fontWeight:    800,
              letterSpacing: '0.1em',
              padding:       '3px 8px',
              textTransform: 'uppercase',
            }}>
              -{pricing.discountPct}%
            </span>
          )}
          {product.destacado && !pricing.hasOffer && (
            <span style={{
              background:    '#0f0f13',
              color:         '#fff',
              fontSize:      10,
              fontWeight:    800,
              letterSpacing: '0.1em',
              padding:       '3px 8px',
              textTransform: 'uppercase',
            }}>
              Destacado
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.marca ? (
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#a1a1aa', marginBottom: 4 }}>
            {product.marca}
          </p>
        ) : null}
        <Link to={`${base}/products/${product.id}`} style={{ textDecoration: 'none', color: '#0a0a0a' }}>
          <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>{product.nombre}</p>
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {pricing.hasOffer ? (
              <>
                <p style={{ fontSize: 11, textDecoration: 'line-through', color: '#a1a1aa', lineHeight: 1 }}>
                  {formatCurrency(pricing.originalPrice)}
                </p>
                <p style={{ fontSize: 21, fontWeight: 900, color: primary, lineHeight: 1, marginTop: 2 }}>
                  {formatCurrency(pricing.finalPrice)}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 21, fontWeight: 900, color: primary }}>
                {formatCurrency(Number(product.precio || 0))}
              </p>
            )}
          </div>

          {product.stockActual > 0 ? (
            <motion.button
              type="button"
              onClick={handleAdd}
              animate={justAdded ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.26 }}
              style={{
                padding:       '10px 16px',
                border:        'none',
                cursor:        'pointer',
                background:    justAdded ? '#22c55e' : primary,
                color:         '#fff',
                fontWeight:    800,
                fontSize:      12,
                letterSpacing: '0.04em',
                flexShrink:    0,
                transition:    'background 0.2s ease',
                fontFamily:    'inherit',
              }}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="done"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'block' }}
                  >
                    ✓ Agregado
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'block' }}
                  >
                    + Agregar
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717a', fontSize: 11, flexShrink: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
              Sin stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DemoHome() {
  const { tenantId, tenantMeta }      = useTenant();
  const { setSpotlightStepId }        = useDemoJourney();
  const { products }                  = useTenantProducts(tenantId);
  const { categories }                = useTenantCategories(tenantId);
  const { offers }                    = useTenantOffers(tenantId);
  const { heroes }                    = useTenantLandingHeroes(tenantId, true);
  const { addToCart }                 = useCart();
  const { showToast }                 = useDemoToast();
  const [activeHero, setActiveHero]   = useState(0);

  // Spotlight: cuando el usuario llega a cada sección, sugerimos el paso del panel
  useDemoSpotlight({
    onHeroVisible:       () => setSpotlightStepId('branding'),
    onProductsVisible:   () => setSpotlightStepId('catalog'),
    onCategoriesVisible: () => setSpotlightStepId('catalog'),
    onAboutVisible:      () => setSpotlightStepId('contact'),
  });

  // Respetar prefers-reduced-motion en animaciones de entrada
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const activeProducts = products.filter((product) => product.activo);
  const featuredProducts = activeProducts.filter((product) => product.destacado).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 4);
  const visibleCategories = categories.filter((category) => category.activo).slice(0, 6);

  useEffect(() => {
    if (heroes.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroes.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [heroes.length]);

  const currentHero = heroes[activeHero];

  const handleAddToCart = (product: TenantProduct) => {
    addToCart(product);
    showToast({
      title: `${product.nombre} agregado al carrito`,
      action: { label: 'Ver carrito', to: `${base}/checkout` },
    });
  };

  const sc = tenantMeta?.siteConfig;
  const heroTitle    = sc?.heroTitle    || tenantMeta?.businessName || 'Bienvenidos';
  const heroSubtitle = sc?.heroSubtitle || 'Descubre nuestros productos';
  const heroCTALabel = sc?.heroCTALabel || 'Ver productos';
  const heroSecondaryLabel = sc?.heroSecondaryCTALabel || null;
  const productsSectionTitle    = sc?.productsSectionTitle    || 'Productos principales';
  const productsSectionSubtitle = sc?.productsSectionSubtitle || 'Destacados';
  const aboutTitle = sc?.aboutTitle || null;
  const aboutText  = sc?.aboutText  || null;

  return (
    <div>
      <section
        data-demo-section="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#0a0a0a',
          color: '#fff',
          minHeight: 'min(86svh, 780px)',
        }}
      >
        <AnimatePresence mode="wait">
          {currentHero ? (
            <motion.div
              key={currentHero.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              style={{
                minHeight: 'min(86svh, 780px)',
                display: 'grid',
                alignItems: 'center',
                padding: 'clamp(60px, 10vw, 120px) clamp(20px, 6vw, 80px)',
                position: 'relative',
              }}
            >
              <picture style={{ position: 'absolute', inset: 0, display: 'block' }}>
                {currentHero.imageMobile ? (
                  <source media="(max-width: 768px)" srcSet={currentHero.imageMobile} />
                ) : null}
                <img
                  src={currentHero.imageDesktop}
                  alt={currentHero.titulo}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </picture>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(10,10,10,0.84), rgba(10,10,10,0.26))',
                }}
              />
              <div style={{ maxWidth: 620, position: 'relative', zIndex: 1 }}>
                <p className="eyebrow-accent">{tenantMeta?.businessType || 'Tienda demo'}</p>
                <h1 style={{ marginTop: 18, fontSize: 'clamp(40px, 7vw, 78px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {currentHero.titulo}
                </h1>
                <p style={{ marginTop: 18, fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7 }}>
                  {currentHero.subtitulo}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                  <Link to={currentHero.ctaUrl || `${base}/products`} className="btn-primary-accent">
                    {currentHero.ctaLabel || 'Ver productos'}
                  </Link>
                  <Link to={`${base}/products`} className="btn-ghost-dark">
                    Catálogo completo
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="fallback-hero"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                minHeight: 'min(86svh, 780px)',
                display: 'grid',
                alignItems: 'center',
                padding: 'clamp(60px, 10vw, 120px) clamp(20px, 6vw, 80px)',
                background: `radial-gradient(circle at 70% 20%, rgba(var(--tk-primary-rgb),0.24), transparent 30%), #0a0a0a`,
              }}
            >
              <div style={{ maxWidth: 620 }}>
                <p className="eyebrow-accent">{tenantMeta?.businessType || 'Tienda demo'}</p>
                <h1 style={{ marginTop: 18, fontSize: 'clamp(40px, 7vw, 78px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {heroTitle}
                </h1>
                <p style={{ marginTop: 18, fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.66)', lineHeight: 1.7 }}>
                  {heroSubtitle}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                  <Link to={`${base}/products`} className="btn-primary-accent">
                    {heroCTALabel}
                  </Link>
                  {heroSecondaryLabel && sc?.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${sc.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost-dark"
                    >
                      <MessageCircle size={16} />
                      {heroSecondaryLabel}
                    </a>
                  ) : heroSecondaryLabel ? (
                    <Link to={`${base}/products`} className="btn-ghost-dark">
                      {heroSecondaryLabel}
                    </Link>
                  ) : sc?.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${sc.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost-dark"
                    >
                      <MessageCircle size={16} />
                      Consultar
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {heroes.length > 1 ? (
          <>
            <div style={{ position: 'absolute', left: 24, bottom: 24, display: 'flex', gap: 10 }}>
              {heroes.map((hero, index) => (
                <button
                  key={hero.id}
                  type="button"
                  onClick={() => setActiveHero(index)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: 'none',
                    background: index === activeHero ? primary : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 10 }}>
              <button className="btn-ghost-dark" type="button" onClick={() => setActiveHero((current) => (current - 1 + heroes.length) % heroes.length)}>
                <ArrowLeft size={16} />
              </button>
              <button className="btn-ghost-dark" type="button" onClick={() => setActiveHero((current) => (current + 1) % heroes.length)}>
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section
        data-demo-section="products"
        style={{ padding: 'clamp(56px, 8vw, 100px) clamp(20px, 6vw, 80px)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header editorial */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 10 }}>
                {productsSectionSubtitle}
              </p>
              <h2
                style={{
                  fontSize:      'clamp(42px, 6vw, 72px)',
                  fontWeight:    900,
                  letterSpacing: '-0.05em',
                  lineHeight:    0.95,
                  color:         '#0a0a0a',
                }}
              >
                {productsSectionTitle}
              </h2>
            </div>
            <Link
              to={`${base}/products`}
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             8,
                textDecoration:  'none',
                color:           '#0a0a0a',
                fontWeight:      700,
                fontSize:        13,
                borderBottom:    `2px solid ${primary}`,
                paddingBottom:   2,
                whiteSpace:      'nowrap',
              }}
            >
              Ver catálogo completo
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Hero product (primer destacado con imagen) */}
          {(() => {
            const hero = displayProducts.find((p) => p.destacado && p.imagenes?.[0]);
            const rest = hero ? displayProducts.filter((p) => p.id !== hero.id) : displayProducts;
            const heroOfferPricing = hero ? getProductOfferPrice(hero, offers) : null;

            return (
              <>
                {hero && heroOfferPricing && (
                  <motion.div
                    initial={prefersReduced ? {} : { opacity: 0, y: 28 }}
                    whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={prefersReduced ? {} : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ marginBottom: 16 }}
                  >
                    <Link
                      to={`${base}/products/${hero.id}`}
                      style={{
                        display:        'grid',
                        gridTemplateColumns: '1fr 1fr',
                        textDecoration: 'none',
                        background:     '#fff',
                        overflow:       'hidden',
                        minHeight:      340,
                      }}
                      className="demo-hero-product"
                    >
                      <div style={{ overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={hero.imagenes[0]}
                          alt={hero.nombre}
                          loading="lazy"
                          decoding="async"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 340 }}
                          className="demo-hero-product-img"
                        />
                        <span
                          style={{
                            position:      'absolute',
                            top:           16,
                            left:          16,
                            background:    '#0f0f13',
                            color:         '#fff',
                            fontSize:      10,
                            fontWeight:    800,
                            letterSpacing: '0.14em',
                            padding:       '4px 10px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Destacado
                        </span>
                      </div>
                      <div
                        style={{
                          padding:         'clamp(24px, 4vw, 48px)',
                          display:         'flex',
                          flexDirection:   'column',
                          justifyContent:  'space-between',
                          borderTop:       `4px solid ${primary}`,
                        }}
                      >
                        <div>
                          {hero.marca && (
                            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a1a1aa', marginBottom: 10 }}>
                              {hero.marca}
                            </p>
                          )}
                          <h3
                            style={{
                              fontSize:      'clamp(20px, 2.4vw, 32px)',
                              fontWeight:    900,
                              letterSpacing: '-0.03em',
                              color:         '#0a0a0a',
                              lineHeight:    1.15,
                            }}
                          >
                            {hero.nombre}
                          </h3>
                          {hero.descripcion && (
                            <p
                              style={{
                                marginTop:  14,
                                fontSize:   14,
                                color:      '#71717a',
                                lineHeight: 1.65,
                                display:    '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow:   'hidden',
                              }}
                            >
                              {hero.descripcion}
                            </p>
                          )}
                        </div>
                        <div>
                          {heroOfferPricing.hasOffer ? (
                            <>
                              <p style={{ fontSize: 12, textDecoration: 'line-through', color: '#a1a1aa', lineHeight: 1 }}>
                                {formatCurrency(heroOfferPricing.originalPrice)}
                              </p>
                              <p style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, color: primary, lineHeight: 1, marginTop: 4 }}>
                                {formatCurrency(heroOfferPricing.finalPrice)}
                              </p>
                            </>
                          ) : (
                            <p style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, color: primary, lineHeight: 1 }}>
                              {formatCurrency(Number(hero.precio || 0))}
                            </p>
                          )}
                          <span
                            style={{
                              display:         'inline-flex',
                              alignItems:      'center',
                              gap:             8,
                              marginTop:       20,
                              padding:         '12px 20px',
                              background:      primary,
                              color:           '#fff',
                              fontWeight:      800,
                              fontSize:        13,
                            }}
                          >
                            Ver producto <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Grid de productos con stagger */}
                <div className="demo-home-products-grid">
                  {rest.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={prefersReduced ? {} : { opacity: 0, y: 24 }}
                      whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={prefersReduced ? {} : { duration: 0.48, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard
                        key={product.id}
                        product={product}
                        base={base}
                        primary={primary}
                        onAdd={handleAddToCart}
                        offers={offers}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {visibleCategories.length > 0 ? (
        <section
          data-demo-section="categories"
          style={{ padding: 'clamp(56px, 8vw, 100px) 0', overflow: 'hidden' }}
        >
          {/* Encabezado con padding lateral */}
          <div style={{ padding: '0 clamp(20px, 6vw, 80px)', marginBottom: 36 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: primary, marginBottom: 10 }}>
                  Categorías
                </p>
                <h2
                  style={{
                    fontSize:      'clamp(42px, 6vw, 72px)',
                    fontWeight:    900,
                    letterSpacing: '-0.05em',
                    lineHeight:    0.95,
                    color:         '#0a0a0a',
                  }}
                >
                  Explorá por rubro
                </h2>
              </div>
              <Link
                to={`${base}/products`}
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            8,
                  textDecoration: 'none',
                  color:          '#0a0a0a',
                  fontWeight:     700,
                  fontSize:       13,
                  borderBottom:   `2px solid ${primary}`,
                  paddingBottom:  2,
                  whiteSpace:     'nowrap',
                }}
              >
                Ver todo
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Strip full-bleed con snap scroll */}
          <div
            style={{
              display:              'flex',
              gap:                  12,
              overflowX:            'auto',
              scrollSnapType:       'x mandatory',
              scrollbarWidth:       'none',
              paddingLeft:          'clamp(20px, 6vw, 80px)',
              paddingRight:         'clamp(20px, 6vw, 80px)',
              paddingBottom:        4,
            }}
          >
            {visibleCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={prefersReduced ? {} : { opacity: 0, x: 32 }}
                whileInView={prefersReduced ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={prefersReduced ? {} : { duration: 0.5, delay: catIndex * 0.06, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  flexShrink:     0,
                  width:          'clamp(220px, 28vw, 340px)',
                  height:         380,
                  scrollSnapAlign: 'start',
                  overflow:       'hidden',
                  position:       'relative',
                }}
              >
                <Link
                  to={`${base}/products?categoria=${category.slug}`}
                  style={{ display: 'block', height: '100%', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}
                >
                  {category.imagen ? (
                    <motion.img
                      src={category.imagen}
                      alt={category.nombre}
                      loading="lazy"
                      decoding="async"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position:   'absolute',
                        inset:      0,
                        width:      '100%',
                        height:     '100%',
                        objectFit:  'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position:   'absolute',
                        inset:      0,
                        background: `linear-gradient(135deg, ${primary}ee, ${primary}88)`,
                      }}
                    />
                  )}

                  {/* Gradient overlay */}
                  <div
                    style={{
                      position:   'absolute',
                      inset:      0,
                      background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.08) 100%)',
                    }}
                  />

                  {/* Texto */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom:   0,
                      left:     0,
                      right:    0,
                      padding:  '24px 22px',
                    }}
                  >
                    <p
                      style={{
                        fontSize:      'clamp(18px, 2.2vw, 24px)',
                        fontWeight:    900,
                        color:         '#fff',
                        letterSpacing: '-0.03em',
                        lineHeight:    1.15,
                      }}
                    >
                      {category.nombre}
                    </p>
                    {category.descripcion ? (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 6, lineHeight: 1.5 }}>
                        {category.descripcion}
                      </p>
                    ) : null}
                    <div
                      style={{
                        display:       'inline-flex',
                        alignItems:    'center',
                        gap:           6,
                        marginTop:     14,
                        padding:       '6px 12px',
                        background:    primary,
                        color:         '#fff',
                        fontSize:      11,
                        fontWeight:    800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Ver productos <ArrowRight size={11} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {(aboutTitle || aboutText) ? (
        <section
          data-demo-section="about"
          style={{ padding: '0 clamp(20px, 6vw, 80px) clamp(44px, 7vw, 84px)' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 48,
                alignItems: 'center',
                padding: 'clamp(36px, 5vw, 64px) clamp(28px, 5vw, 56px)',
                background: '#fff',
                border: '1px solid rgba(15,15,19,0.08)',
              }}
            >
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: primary, marginBottom: 14 }}>
                  Nosotros
                </p>
                <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0a0a0a', lineHeight: 1.1 }}>
                  {aboutTitle || tenantMeta?.businessName}
                </h2>
              </div>
              <div>
                <p style={{ fontSize: 16, color: '#52525b', lineHeight: 1.8, maxWidth: 520 }}>
                  {aboutText}
                </p>
                <Link
                  to={`${base}/about`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, fontSize: 13, fontWeight: 700, color: primary, textDecoration: 'none' }}
                >
                  Conocer más
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <style>{`
        .demo-home-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 1024px) {
          .demo-home-products-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
          .demo-home-products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .demo-hero-product { grid-template-columns: 1fr !important; }
        }
        .demo-hero-product-img {
          transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .demo-hero-product:hover .demo-hero-product-img {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}
