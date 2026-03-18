import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { useTenantCategories } from '../../../hooks/useTenantCategories';
import { useTenantPriceBatches } from '../../../hooks/useTenantPriceBatches';
import { useTenantProducts } from '../../../hooks/useTenantProducts';
import { db } from '../../../lib/firebase';
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSelect,
  AdminSurface,
} from './AdminUi';
import { formatCurrency, formatDateTime, sortCategoriesByOrder } from './adminHelpers';

type PricingMode = 'percent' | 'delta' | 'margin';

function applyPrice(mode: PricingMode, currentPrice: number, cost: number, value: number) {
  if (mode === 'percent') return currentPrice * (1 + value / 100);
  if (mode === 'delta') return currentPrice + value;
  return cost * (1 + value / 100);
}

function roundPrice(value: number) {
  return Math.max(0, Math.round(value / 100) * 100);
}

export default function AdminPricing({ tenantId }: { tenantId: string }) {
  const { products, updateProduct } = useTenantProducts(tenantId);
  const { categories } = useTenantCategories(tenantId);
  const { batches } = useTenantPriceBatches(tenantId);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<PricingMode>('percent');
  const [value, setValue] = useState('15');
  const [categorySlug, setCategorySlug] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const sortedCategories = useMemo(() => sortCategoriesByOrder(categories), [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categorySlug && product.categorySlug !== categorySlug) return false;
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        if (!`${product.nombre} ${product.marca}`.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [categorySlug, products, search]);

  const preview = useMemo(() => {
    const numericValue = Number(value || 0);
    return filteredProducts
      .filter((product) => selectedIds.includes(product.id))
      .map((product) => {
        const nextPrice = roundPrice(
          applyPrice(mode, Number(product.precio || 0), Number(product.costoActual || 0), numericValue),
        );
        return {
          product,
          currentPrice: Number(product.precio || 0),
          nextPrice,
          delta: nextPrice - Number(product.precio || 0),
        };
      });
  }, [filteredProducts, mode, selectedIds, value]);

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const applyBatchChanges = async () => {
    if (preview.length === 0) return;
    setSaving(true);
    try {
      const summary = {
        matchedCount: preview.length,
        changedCount: preview.length,
        totalCurrent: preview.reduce((sum, item) => sum + item.currentPrice, 0),
        totalNext: preview.reduce((sum, item) => sum + item.nextPrice, 0),
        totalDelta: preview.reduce((sum, item) => sum + item.delta, 0),
      };

      const batchRef = await addDoc(collection(db, 'tenants', tenantId, 'price_batches'), {
        label: `Ajuste ${mode}`,
        mode,
        value: Number(value || 0),
        roundingStep: 100,
        roundingMode: 'nearest',
        summary,
        itemIds: preview.map((item) => item.product.id),
        status: 'applied',
        createdAt: serverTimestamp(),
      });

      const batch = writeBatch(db);
      preview.forEach(({ product, nextPrice }) => {
        batch.update(doc(db, 'tenants', tenantId, 'products', product.id), {
          precio: nextPrice,
          lastPriceBatchId: batchRef.id,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();

      setStep(1);
      setSelectedIds([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Pricing"
        title="Precios masivos"
        description="Ajusta precios por porcentaje, delta o margen y deja historial de cada lote aplicado."
      />

      <div className="demo-admin-pill-group" style={{ marginBottom: 18 }}>
        {[1, 2, 3].map((valueStep) => (
          <button
            key={valueStep}
            type="button"
            className={`demo-admin-pill ${step === valueStep ? 'is-active' : ''}`}
            onClick={() => setStep(valueStep)}
          >
            Paso {valueStep}
          </button>
        ))}
      </div>

      <div className="demo-admin-grid columns-sidebar">
        <div className="demo-admin-grid">
          {step === 1 ? (
            <AdminSurface padding="pad-md">
              <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
                Elegir modo
              </h2>
              <div className="demo-admin-grid columns-2">
                {[
                  { id: 'percent', title: 'Porcentaje', text: '+15% a seleccionados' },
                  { id: 'delta', title: 'Delta fijo', text: '+$500 a seleccionados' },
                  { id: 'margin', title: 'Margen', text: '40% sobre costo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`demo-admin-list-item ${mode === item.id ? 'is-active' : ''}`}
                    style={{
                      cursor: 'pointer',
                      borderColor: mode === item.id ? 'var(--tk-primary)' : undefined,
                    }}
                    onClick={() => setMode(item.id as PricingMode)}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.title}</p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item.text}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="demo-admin-inline-grid" style={{ marginTop: 14 }}>
                <AdminField label="Valor">
                  <AdminInput
                    type="number"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  />
                </AdminField>
                <AdminField label="Preview rapido">
                  <AdminInput
                    readOnly
                    value={
                      mode === 'percent'
                        ? `10000 -> ${formatCurrency(roundPrice(applyPrice('percent', 10000, 0, Number(value || 0))))}`
                        : mode === 'delta'
                          ? `10000 -> ${formatCurrency(roundPrice(applyPrice('delta', 10000, 0, Number(value || 0))))}`
                          : `5000 -> ${formatCurrency(roundPrice(applyPrice('margin', 0, 5000, Number(value || 0))))}`
                    }
                  />
                </AdminField>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <AdminButton onClick={() => setStep(2)}>Continuar</AdminButton>
              </div>
            </AdminSurface>
          ) : null}

          {step === 2 ? (
            <AdminSurface padding="pad-md">
              <div className="demo-admin-inline-grid" style={{ marginBottom: 14 }}>
                <AdminField label="Categoria">
                  <AdminSelect value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
                    <option value="">Todas</option>
                    {sortedCategories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.nombre}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
                <AdminField label="Buscar">
                  <AdminInput
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre o marca"
                  />
                </AdminField>
              </div>
              <div className="demo-admin-list" style={{ maxHeight: 420, overflow: 'auto' }}>
                {filteredProducts.map((product) => {
                  const nextPrice = roundPrice(
                    applyPrice(mode, Number(product.precio || 0), Number(product.costoActual || 0), Number(value || 0)),
                  );
                  return (
                    <label key={product.id} className="demo-admin-list-item" style={{ alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                        <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                          {formatCurrency(Number(product.precio || 0))} → {formatCurrency(nextPrice)}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                      />
                    </label>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                <AdminButton variant="ghost" onClick={() => setStep(1)}>
                  Atras
                </AdminButton>
                <AdminButton onClick={() => setStep(3)} disabled={selectedIds.length === 0}>
                  Revisar cambios
                </AdminButton>
              </div>
            </AdminSurface>
          ) : null}

          {step === 3 ? (
            <AdminSurface padding="pad-md">
              <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
                Confirmar lote
              </h2>
              <div className="demo-admin-list">
                {preview.map((item) => (
                  <div key={item.product.id} className="demo-admin-list-item">
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.product.nombre}</p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {formatCurrency(item.currentPrice)} → {formatCurrency(item.nextPrice)}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                      {item.delta >= 0 ? '+' : ''}
                      {formatCurrency(item.delta)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="demo-admin-list" style={{ marginTop: 14 }}>
                <div className="demo-admin-list-item">
                  <span>Productos afectados</span>
                  <strong>{preview.length}</strong>
                </div>
                <div className="demo-admin-list-item">
                  <span>Total actual</span>
                  <strong>{formatCurrency(preview.reduce((sum, item) => sum + item.currentPrice, 0))}</strong>
                </div>
                <div className="demo-admin-list-item">
                  <span>Total nuevo</span>
                  <strong>{formatCurrency(preview.reduce((sum, item) => sum + item.nextPrice, 0))}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                <AdminButton variant="ghost" onClick={() => setStep(2)}>
                  Atras
                </AdminButton>
                <AdminButton onClick={applyBatchChanges} disabled={saving || preview.length === 0}>
                  {saving ? 'Aplicando...' : 'Aplicar cambios'}
                </AdminButton>
              </div>
            </AdminSurface>
          ) : null}
        </div>

        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Historial</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
            Lotes aplicados
          </h2>
          {batches.length === 0 ? (
            <AdminEmptyState>Todavia no se aplicaron lotes de precio.</AdminEmptyState>
          ) : (
            <div className="demo-admin-list">
              {batches.map((batch) => (
                <div key={batch.id} className="demo-admin-list-item">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{batch.label || 'Remarcacion'}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      {batch.mode} · valor {batch.value}
                    </p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {formatDateTime(batch.createdAt)}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                    {batch.summary?.changedCount ?? 0} cambios
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminSurface>
      </div>
    </div>
  );
}
