import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, SlidersHorizontal } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useTenantProducts, type TenantProduct } from '../../hooks/useTenantProducts';
import { useTenantCategories } from '../../hooks/useTenantCategories';
import { useTenantOffers } from '../../hooks/useTenantOffers';
import { useCart } from '../../context/DemoCartContext';
import { useDemoToast } from '../../context/DemoToastContext';
import { getProductOfferPrice } from '../../utils/tenantOfferPrice';
import { formatCurrency } from './admin/adminHelpers';

type SortOrder = 'default' | 'price-asc' | 'price-desc';

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(15,15,19,0.08)', overflow: 'hidden' }}>
      <div className="demo-products-skeleton" style={{ height: 220 }} />
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
          <motion.img
            src={product.imagenes[0]}
            alt={product.nombre}
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f4f4f5',
            color: '#a1a1aa',
          }}>
            <Package size={40} strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {pricing.hasOffer && (
            <span style={{
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
          )}
          {product.destacado && !pricing.hasOffer && (
            <span style={{
              background: '#0f0f13',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              padding: '3px 8px',
              textTransform: 'uppercase',
            }}>
              Destacado
            </span>
          )}
        </div>
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
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [sortOpen, setSortOpen] = useState(false);

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const selectedCategory = searchParams.get('categoria') ?? 'all';
  const activeCategories = categories.filter((c) => c.activo);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = products.filter((product) => {
      if (!product.activo) return false;
      if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) return false;
      if (q && !product.nombre.toLowerCase().includes(q) && !product.marca?.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortOrder === 'price-asc') {
      result = [...result].sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (sortOrder === 'price-desc') {
      result = [...result].sort((a, b) => Number(b.precio) - Number(a.precio));
    }

    return result;
  }, [products, selectedCategory, search, sortOrder]);

  const handleAdd = (product: TenantProduct) => {
    addToCart(product);
    showToast({
      title: `${product.nombre} agregado al carrito`,
      action: { label: 'Ver carrito', to: `${base}/checkout` },
    });
  };

  const SORT_LABELS: Record<SortOrder, string> = {
    default:    'Relevancia',
    'price-asc':  'Menor precio',
    'price-desc': 'Mayor precio',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,48px)' }}>

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: primary, marginBottom: 8 }}>
          Catálogo
        </p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0a0a0a' }}>
          Todos los productos
        </h1>
      </div>

      {/* ── Thumbnails de categorías ────────────────────────────────────────── */}
      {activeCategories.some((c) => c.imagen) && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            marginBottom: 28,
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                selectedCategory === cat.slug
                  ? setSearchParams({})
                  : setSearchParams({ categoria: cat.slug })
              }
              style={{
                flexShrink: 0,
                position: 'relative',
                width: 110,
                height: 80,
                overflow: 'hidden',
                border: selectedCategory === cat.slug ? `3px solid ${primary}` : '3px solid transparent',
                cursor: 'pointer',
                padding: 0,
                background: 'transparent',
                transition: 'border-color 0.15s ease',
              }}
            >
              {cat.imagen ? (
                <img
                  src={cat.imagen}
                  alt={cat.nombre}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: `${primary}22` }} />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: selectedCategory === cat.slug
                    ? `${primary}cc`
                    : 'rgba(10,10,10,0.46)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px',
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fff',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                }}>
                  {cat.nombre}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Barra de búsqueda + sort ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a1a1aa',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              border: '1px solid #ddd',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'inherit',
              background: '#fff',
              transition: 'border-color 0.14s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = primary; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#ddd'; }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 14px',
              border: '1px solid #ddd',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#52525b',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={13} strokeWidth={2} aria-hidden="true" />
            {SORT_LABELS[sortOrder]}
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  right: 0,
                  background: '#fff',
                  border: '1px solid rgba(15,15,19,0.1)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: 160,
                }}
              >
                {(['default', 'price-asc', 'price-desc'] as SortOrder[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setSortOrder(opt); setSortOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      background: sortOrder === opt ? `${primary}12` : 'transparent',
                      color: sortOrder === opt ? primary : '#0a0a0a',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: sortOrder === opt ? 700 : 400,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Pills de categorías (texto) ─────────────────────────────────────── */}
      {activeCategories.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            style={{
              padding: '6px 14px',
              border: '1.5px solid',
              borderRadius: 999,
              borderColor: selectedCategory === 'all' ? primary : 'rgba(15,15,19,0.12)',
              background: selectedCategory === 'all' ? primary : '#fff',
              color: selectedCategory === 'all' ? '#fff' : '#52525b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.14s ease',
            }}
          >
            Todos
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSearchParams({ categoria: cat.slug })}
              style={{
                padding: '6px 14px',
                border: '1.5px solid',
                borderRadius: 999,
                borderColor: selectedCategory === cat.slug ? primary : 'rgba(15,15,19,0.12)',
                background: selectedCategory === cat.slug ? primary : '#fff',
                color: selectedCategory === cat.slug ? '#fff' : '#52525b',
                fontSize: 12,
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

      {/* ── Contador ───────────────────────────────────────────────────────── */}
      <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 20, fontFamily: 'monospace' }}>
        {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* ── Grid de productos ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="demo-products-grid">
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
        <motion.div layout className="demo-products-grid">
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
        .demo-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .demo-products-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
          .demo-products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .demo-products-grid { grid-template-columns: 1fr; }
        }
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
