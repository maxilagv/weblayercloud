import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageCircle, Package, Share2, ShoppingBag } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTenant } from '../../context/TenantContext';
import { useCart } from '../../context/DemoCartContext';
import { useDemoToast } from '../../context/DemoToastContext';
import { useTenantOffers } from '../../hooks/useTenantOffers';
import { useTenantProducts } from '../../hooks/useTenantProducts';
import { getProductOfferPrice } from '../../utils/tenantOfferPrice';
import type { TenantProduct } from '../../hooks/useTenantProducts';
import { formatCurrency } from './admin/adminHelpers';

export default function DemoProductDetail() {
  const { tenantId, tenantMeta } = useTenant();
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { showToast } = useDemoToast();
  const { offers } = useTenantOffers(tenantId);
  const { products } = useTenantProducts(tenantId);
  const navigate = useNavigate();

  const [product, setProduct] = useState<TenantProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';

  useEffect(() => {
    if (!tenantId || !productId) return;
    getDoc(doc(db, 'tenants', tenantId, 'products', productId))
      .then((snap) => {
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as TenantProduct);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tenantId, productId]);

  const handleAdd = () => {
    if (!product) return;
    addToCart(product, quantity);
    setJustAdded(true);
    showToast({
      title: `${product.nombre} agregado al carrito`,
      action: { label: 'Ver carrito', to: `${base}/checkout` },
    });
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product?.nombre, url: window.location.href }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => null);
      showToast({ title: 'Link copiado al portapapeles' });
    }
  };

  const relatedProducts = products
    .filter(
      (p) =>
        p.activo &&
        p.id !== productId &&
        p.categorySlug === product?.categorySlug,
    )
    .slice(0, 4);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 48 }}>
          <div className="dp-skeleton" style={{ height: 380 }} />
          <div>
            <div className="dp-skeleton" style={{ height: 14, width: '30%', marginBottom: 14 }} />
            <div className="dp-skeleton" style={{ height: 36, marginBottom: 10 }} />
            <div className="dp-skeleton" style={{ height: 36, width: '50%', marginBottom: 20 }} />
            <div className="dp-skeleton" style={{ height: 14, marginBottom: 8 }} />
            <div className="dp-skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
            <div className="dp-skeleton" style={{ height: 14, width: '65%', marginBottom: 28 }} />
            <div className="dp-skeleton" style={{ height: 52 }} />
          </div>
        </div>
        <style>{`
          .dp-skeleton {
            background: rgba(15,15,19,0.06);
            position: relative;
            overflow: hidden;
          }
          .dp-skeleton::after {
            content: '';
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
            animation: dp-shimmer 1.3s infinite;
          }
          @keyframes dp-shimmer { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <Package size={56} strokeWidth={1} color="#d4d4d8" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0a' }}>Producto no encontrado</h2>
        <Link
          to={`${base}/products`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: primary,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          Ver catálogo
        </Link>
      </div>
    );
  }

  const images = product.imagenes ?? [];
  const pricing = getProductOfferPrice(product, offers);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)' }}>
      <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Link to={base} style={{ color: '#a1a1aa', textDecoration: 'none' }}>Inicio</Link>
        <span>/</span>
        <Link to={`${base}/products`} style={{ color: '#a1a1aa', textDecoration: 'none' }}>Productos</Link>
        <span>/</span>
        <span style={{ color: '#52525b' }}>{product.nombre}</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 48, alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ background: '#f5f5f5', overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={product.nombre}
                    style={{ width: '100%', height: 380, objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 380,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d4d4d8',
                    }}
                  >
                    <Package size={80} strokeWidth={1} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {pricing.hasOffer ? (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: primary,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                }}
              >
                -{pricing.discountPct}%
              </span>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  style={{
                    width: 64,
                    height: 64,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${idx === activeImage ? primary : '#ddd'}`,
                    padding: 0,
                    background: 'none',
                    transition: 'border-color 0.14s ease',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div>
          {product.marca ? (
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: 10 }}>
              {product.marca}
            </p>
          ) : null}
          <h1
            style={{
              fontSize: 'clamp(24px,3.5vw,36px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0a0a0a',
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            {product.nombre}
          </h1>

          {pricing.hasOffer ? (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, textDecoration: 'line-through', color: '#a1a1aa', lineHeight: 1, marginBottom: 4 }}>
                {formatCurrency(pricing.originalPrice)}
              </p>
              <p style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: primary, lineHeight: 1 }}>
                {formatCurrency(pricing.finalPrice)}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, color: primary, marginBottom: 20 }}>
              {formatCurrency(Number(product.precio || 0))}
            </p>
          )}

          {product.descripcion ? (
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.75, marginBottom: 24 }}>
              {product.descripcion}
            </p>
          ) : null}

          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: 'monospace',
              marginBottom: 20,
              color: product.stockActual > 0 ? '#16a34a' : '#ef4444',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: product.stockActual > 0 ? '#16a34a' : '#ef4444',
                flexShrink: 0,
              }}
            />
            {product.stockActual > 0
              ? `En stock — ${product.stockActual} disponibles`
              : 'Sin stock'}
          </p>

          {product.stockActual > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: '#71717a' }}>Cantidad:</span>
                <div style={{ display: 'flex', border: '1px solid rgba(15,15,19,0.1)', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: 38,
                      height: 38,
                      border: 'none',
                      cursor: 'pointer',
                      background: '#f5f5f5',
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockActual, q + 1))}
                    style={{
                      width: 38,
                      height: 38,
                      border: 'none',
                      cursor: 'pointer',
                      background: '#f5f5f5',
                      fontSize: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleAdd}
                animate={justAdded ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 0.28 }}
                style={{
                  width: '100%',
                  padding: '15px 24px',
                  background: justAdded ? '#22c55e' : primary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: 'inherit',
                  marginBottom: 12,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'background 0.22s ease',
                }}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span
                      key="added"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <ShoppingBag size={16} />
                      Agregado al carrito
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <ShoppingBag size={16} />
                      Agregar al carrito
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <button
                type="button"
                onClick={() => { handleAdd(); navigate(`${base}/checkout`); }}
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  background: 'transparent',
                  color: primary,
                  border: `2px solid ${primary}`,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: 'inherit',
                  marginBottom: 20,
                }}
              >
                Comprar ahora
              </button>
            </>
          ) : null}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {tenantMeta?.siteConfig?.whatsappNumber ? (
              <a
                href={`https://wa.me/${tenantMeta.siteConfig.whatsappNumber.replace(/\D/g, '')}?text=Hola! Me interesa: ${encodeURIComponent(product.nombre)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#25D366',
                  textDecoration: 'none',
                  fontWeight: 600,
                  padding: '8px 0',
                }}
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                color: '#71717a',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: '8px 0',
                fontWeight: 600,
              }}
            >
              <Share2 size={16} />
              Compartir
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section style={{ marginTop: 72 }}>
          <p
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: primary,
              marginBottom: 8,
            }}
          >
            Relacionados
          </p>
          <h2
            style={{
              fontSize: 'clamp(22px,3vw,30px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0a0a0a',
              marginBottom: 24,
            }}
          >
            También te puede interesar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
            {relatedProducts.map((rp) => {
              const rpPricing = getProductOfferPrice(rp, offers);
              return (
                <Link
                  key={rp.id}
                  to={`${base}/products/${rp.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(15,15,19,0.08)',
                      transition: 'box-shadow 0.18s ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                  >
                    {rp.imagenes?.[0] ? (
                      <img
                        src={rp.imagenes[0]}
                        alt={rp.nombre}
                        style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f4f4f5',
                          color: '#d4d4d8',
                        }}
                      >
                        <Package size={32} strokeWidth={1} />
                      </div>
                    )}
                    <div style={{ padding: '12px 12px 14px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.35, marginBottom: 6 }}>
                        {rp.nombre}
                      </p>
                      {rpPricing.hasOffer ? (
                        <div>
                          <p style={{ fontSize: 11, textDecoration: 'line-through', color: '#a1a1aa' }}>
                            {formatCurrency(rpPricing.originalPrice)}
                          </p>
                          <p style={{ fontSize: 16, fontWeight: 900, color: primary }}>
                            {formatCurrency(rpPricing.finalPrice)}
                          </p>
                        </div>
                      ) : (
                        <p style={{ fontSize: 16, fontWeight: 900, color: primary }}>
                          {formatCurrency(Number(rp.precio || 0))}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
