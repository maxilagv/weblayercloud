import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Package } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useTenantProducts, type TenantProduct } from '../../hooks/useTenantProducts';
import { useTenantCategories } from '../../hooks/useTenantCategories';
import { useTenantOffers } from '../../hooks/useTenantOffers';
import { useCart } from '../../context/DemoCartContext';
import { useDemoToast } from '../../context/DemoToastContext';
import { getProductOfferPrice } from '../../utils/tenantOfferPrice';
import { formatCurrency } from './admin/adminHelpers';

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(15,15,19,0.08)', overflow: 'hidden' }}>
      <div className="demo-products-skeleton" style={{ height: 200 }} />
      <div style={{ padding: '14px 14px 16px' }}>
        <div className="demo-products-skeleton" style={{ height: 10, width: '40%', marginBottom: 10 }} />
        <div className="demo-products-skeleton" style={{ height: 14, marginBottom: 6 }} />
        <div className="demo-products-skeleton" style={{ height: 14, width: '70%', marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="demo-products-skeleton" style={{ height: 22, width: '35%' }} />
          <div className="demo-products-skeleton" style={{ height: 36, width: '38%' }} />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  base,
  primary,
  offers,
  onAdd,
}: {
  product: TenantProduct;
  base: string;
  primary: string;
  offers: ReturnType<typeof useTenantOffers>['offers'];
  onAdd: (product: TenantProduct) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);
  const pricing = getProductOfferPrice(product, offers);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(15,15,19,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.18s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      <Link to={`${base}/products/${product.id}`} style={{ textDecoration: 'none', overflow: 'hidden', display: 'block', position: 'relative' }}>
        {product.imagenes?.[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f4f4f5',
            color: '#a1a1aa',
          }}>
            <Package size={40} strokeWidth={1} />
          </div>
        )}
        {pricing.hasOffer ? (
          <span style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: primary,
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.1em',
            padding: '3px 8px',
            textTransform: 'uppercase',
          }}>
            -{pricing.discountPct}%
          </span>
        ) : null}
      </Link>

      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.marca ? (
          <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: 4 }}>
            {product.marca}
          </p>
        ) : null}

        <Link to={`${base}/products/${product.id}`} style={{ textDecoration: 'none', color: '#0a0a0a' }}>
          <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.35, marginBottom: 6 }}>{product.nombre}</p>
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          {pricing.hasOffer ? (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 12, textDecoration: 'line-through', color: '#a1a1aa', lineHeight: 1 }}>
                {formatCurrency(pricing.originalPrice)}
              </p>
              <p style={{ fontSize: 18, fontWeight: 900, color: primary, lineHeight: 1, marginTop: 2 }}>
                {formatCurrency(pricing.finalPrice)}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 18, fontWeight: 900, color: primary, marginBottom: 10 }}>
              {formatCurrency(Number(product.precio || 0))}
            </p>
          )}

          {product.stockActual > 0 ? (
            <motion.button
              type="button"
              onClick={handleAdd}
              animate={justAdded ? { scale: [1, 1.06, 1] } : {}}
              transition={{ duration: 0.28 }}
              style={{
                width: '100%',
                minHeight: 40,
                border: 'none',
                cursor: 'pointer',
                background: justAdded ? '#22c55e' : primary,
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.08em',
                fontFamily: 'inherit',
                transition: 'background 0.2s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block' }}
                  >
                    ✓ Agregado
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: 'block' }}
                  >
                    + Agregar
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717a', fontSize: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              Sin stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DemoProducts() {
  const { tenantId, tenantMeta } = useTenant();
  const { products, loading } = useTenantProducts(tenantId);
  const { categories } = useTenantCategories(tenantId);
  const { offers } = useTenantOffers(tenantId);
  const { addToCart } = useCart();
  const { showToast } = useDemoToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const selectedCategory = searchParams.get('categoria') ?? 'all';

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((product) => {
      if (!product.activo) return false;
      if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) return false;
      if (q && !product.nombre.toLowerCase().includes(q) && !product.marca?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, selectedCategory, search]);

  const handleAdd = (product: TenantProduct) => {
    addToCart(product);
    showToast({
      title: `${product.nombre} agregado al carrito`,
      action: { label: 'Ver carrito', to: `${base}/checkout` },
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)' }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: primary, marginBottom: 8 }}>
          Catálogo
        </p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0a0a0a' }}>
          Todos los productos
        </h1>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 380,
            padding: '10px 14px',
            border: '1px solid #ddd',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
            background: '#fff',
            transition: 'border-color 0.14s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = primary; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#ddd'; }}
        />
      </div>

      {categories.filter((c) => c.activo).length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            style={{
              padding: '7px 16px',
              border: '1px solid',
              borderColor: selectedCategory === 'all' ? primary : 'rgba(15,15,19,0.12)',
              background: selectedCategory === 'all' ? primary : '#fff',
              color: selectedCategory === 'all' ? '#fff' : '#52525b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.14s ease',
            }}
          >
            Todos
          </button>
          {categories
            .filter((c) => c.activo)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSearchParams({ categoria: cat.slug })}
                style={{
                  padding: '7px 16px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.slug ? primary : 'rgba(15,15,19,0.12)',
                  background: selectedCategory === cat.slug ? primary : '#fff',
                  color: selectedCategory === cat.slug ? '#fff' : '#52525b',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.14s ease',
                }}
              >
                {cat.nombre}
              </button>
            ))}
        </div>
      ) : null}

      <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 20, fontFamily: 'monospace' }}>
        {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: '#a1a1aa' }}>
          <Package size={48} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', color: '#d4d4d8' }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#52525b', marginBottom: 8 }}>
            No se encontraron productos
          </p>
          <p style={{ fontSize: 13 }}>
            Probá con otro término o{' '}
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchParams({}); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: primary, fontWeight: 600, fontSize: 13 }}
            >
              ver todos
            </button>
            .
          </p>
        </div>
      ) : (
        <motion.div
          layout
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              base={base}
              primary={primary}
              offers={offers}
              onAdd={handleAdd}
            />
          ))}
        </motion.div>
      )}

      <style>{`
        .demo-products-skeleton {
          background: rgba(15,15,19,0.06);
          position: relative;
          overflow: hidden;
        }
        .demo-products-skeleton::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: products-shimmer 1.3s infinite;
        }
        @keyframes products-shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
