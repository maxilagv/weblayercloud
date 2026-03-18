import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react';

import { useTenant } from '../../context/TenantContext';
import { useCart } from '../../context/DemoCartContext';
import { useDemoToast } from '../../context/DemoToastContext';
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
  const pricing = getProductOfferPrice(product, offers);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(15,15,19,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Link to={`${base}/products/${product.id}`} style={{ textDecoration: 'none' }}>
        {product.imagenes?.[0] ? (
          <img src={product.imagenes[0]} alt={product.nombre} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f4f4f5',
              color: '#71717a',
            }}
          >
            {product.nombre.slice(0, 1).toUpperCase()}
          </div>
        )}
      </Link>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {product.marca ? (
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#a1a1aa' }}>
            {product.marca}
          </p>
        ) : null}
        <Link to={`${base}/products/${product.id}`} style={{ textDecoration: 'none', color: '#0a0a0a' }}>
          <p style={{ marginTop: 8, fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>{product.nombre}</p>
        </Link>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          {pricing.hasOffer ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, textDecoration: 'line-through', color: '#a1a1aa' }}>
                {formatCurrency(pricing.originalPrice)}
              </p>
              <p style={{ fontSize: 19, fontWeight: 900, color: primary }}>
                {formatCurrency(pricing.finalPrice)}
              </p>
            </div>
          ) : (
            <p style={{ marginBottom: 12, fontSize: 19, fontWeight: 900, color: primary }}>
              {formatCurrency(Number(product.precio || 0))}
            </p>
          )}
          {product.stockActual > 0 ? (
            <motion.button
              type="button"
              onClick={handleAdd}
              animate={justAdded ? { scale: [1, 1.06, 1] } : {}}
              style={{
                width: '100%',
                minHeight: 44,
                border: 'none',
                cursor: 'pointer',
                background: justAdded ? '#22c55e' : primary,
                color: '#fff',
                fontWeight: 800,
              }}
            >
              {justAdded ? 'Agregado' : 'Agregar al carrito'}
            </motion.button>
          ) : (
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#71717a', fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              Sin stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DemoHome() {
  const { tenantId, tenantMeta } = useTenant();
  const { products } = useTenantProducts(tenantId);
  const { categories } = useTenantCategories(tenantId);
  const { offers } = useTenantOffers(tenantId);
  const { heroes } = useTenantLandingHeroes(tenantId, true);
  const { addToCart } = useCart();
  const { showToast } = useDemoToast();
  const [activeHero, setActiveHero] = useState(0);

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
                backgroundImage: `linear-gradient(90deg, rgba(10,10,10,0.84), rgba(10,10,10,0.26)), url(${currentHero.imageDesktop})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div style={{ maxWidth: 620 }}>
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
                    Catalogo completo
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

      <section style={{ padding: 'clamp(44px, 7vw, 84px) clamp(20px, 6vw, 80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="demo-admin-page-header" style={{ marginBottom: 24 }}>
            <div>
              <p className="demo-admin-page-eyebrow" style={{ color: primary }}>{productsSectionSubtitle}</p>
              <h2 className="demo-admin-page-title" style={{ color: '#0a0a0a', fontSize: 34 }}>
                {productsSectionTitle}
              </h2>
            </div>
            <Link to={`${base}/products`} style={{ textDecoration: 'none', color: primary, fontWeight: 800 }}>
              Ver todo
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                base={base}
                primary={primary}
                onAdd={handleAddToCart}
                offers={offers}
              />
            ))}
          </div>
        </div>
      </section>

      {visibleCategories.length > 0 ? (
        <section style={{ padding: '0 clamp(20px, 6vw, 80px) clamp(44px, 7vw, 84px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="demo-admin-page-header" style={{ marginBottom: 28 }}>
              <div>
                <p className="demo-admin-page-eyebrow" style={{ color: primary }}>Categorias</p>
                <h2 className="demo-admin-page-title" style={{ color: '#0a0a0a', fontSize: 34 }}>
                  Explora por rubro
                </h2>
              </div>
              <Link to={`${base}/products`} style={{ textDecoration: 'none', color: primary, fontWeight: 800, fontSize: 13 }}>
                Ver todo →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {visibleCategories.map((category, catIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: catIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <Link
                    to={`${base}/products?categoria=${category.slug}`}
                    style={{ display: 'block', position: 'relative', height: 280, textDecoration: 'none', overflow: 'hidden' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: category.imagen
                          ? `url(${category.imagen})`
                          : `linear-gradient(135deg, ${primary}dd, ${primary}88)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.28) 55%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 22px' }}>
                      <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {category.nombre}
                      </p>
                      {category.descripcion ? (
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 5, lineHeight: 1.5 }}>
                          {category.descripcion}
                        </p>
                      ) : null}
                      <p style={{ marginTop: 10, fontSize: 11, color: primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Ver productos →
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(aboutTitle || aboutText) ? (
        <section style={{ padding: '0 clamp(20px, 6vw, 80px) clamp(44px, 7vw, 84px)' }}>
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
                  Conocer mas
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

    </div>
  );
}
