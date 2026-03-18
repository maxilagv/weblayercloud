import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { useTenantCategories } from '../../../hooks/useTenantCategories';
import { useTenantProducts, type TenantProduct } from '../../../hooks/useTenantProducts';
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminIconButton,
  AdminInput,
  AdminLoadingState,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  AdminSurface,
} from './AdminUi';
import { formatCurrency, sortCategoriesByOrder } from './adminHelpers';

const EMPTY_FORM: Omit<TenantProduct, 'id'> = {
  nombre: '',
  descripcion: '',
  precio: 0,
  costoActual: 0,
  stockActual: 0,
  marca: '',
  categorySlug: '',
  imagenes: [],
  activo: true,
  destacado: false,
  priceLocked: false,
};

export default function AdminProducts({ tenantId }: { tenantId: string }) {
  const { tenantMeta } = useTenant();
  const { products, loading, addProduct, updateProduct, deleteProduct } = useTenantProducts(tenantId);
  const { categories } = useTenantCategories(tenantId);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<TenantProduct, 'id'>>(EMPTY_FORM);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      const text = `${product.nombre} ${product.marca} ${product.categorySlug}`.toLowerCase();
      return text.includes(term);
    });
  }, [products, query]);

  const sortedCategories = useMemo(() => sortCategoriesByOrder(categories), [categories]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product: TenantProduct) => {
    setEditing(product);
    setForm({ ...product });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await addProduct(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await deleteProduct(productId);
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogo"
        title="Productos"
        description="Administra el catalogo principal, precios, stock y visibilidad comercial."
        actions={
          <>
            <AdminField label="Buscar">
              <AdminInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre, marca o categoria"
              />
            </AdminField>
            <AdminButton onClick={openNew}>
              <Plus size={14} style={{ marginRight: 8 }} />
              Nuevo producto
            </AdminButton>
          </>
        }
      />

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <AdminLoadingState>Cargando productos...</AdminLoadingState>
                  </td>
                </tr>
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState>No hay productos para mostrar.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {product.imagenes?.[0] ? (
                          <img
                            src={product.imagenes[0]}
                            alt={product.nombre}
                            style={{ width: 52, height: 52, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {product.nombre.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                          <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                            {product.marca || tenantMeta?.businessName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{product.categorySlug || 'Sin categoria'}</td>
                    <td style={{ color: 'var(--tk-primary)', fontWeight: 800 }}>
                      {formatCurrency(Number(product.precio || 0))}
                    </td>
                    <td>{product.stockActual}</td>
                    <td>{product.activo ? 'Visible' : 'Oculto'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <AdminIconButton onClick={() => openEdit(product)} aria-label="Editar producto">
                          <Pencil size={14} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => handleDelete(product.id)} aria-label="Eliminar producto">
                          <Trash2 size={14} />
                        </AdminIconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        eyebrow="Catalogo"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="demo-admin-inline-grid">
            <AdminField label="Nombre">
              <AdminInput
                value={form.nombre}
                onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="Marca">
              <AdminInput
                value={form.marca}
                onChange={(event) => setForm((current) => ({ ...current, marca: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Precio">
              <AdminInput
                type="number"
                min={0}
                value={form.precio}
                onChange={(event) => setForm((current) => ({ ...current, precio: Number(event.target.value) }))}
                required
              />
            </AdminField>
            <AdminField label="Costo">
              <AdminInput
                type="number"
                min={0}
                value={form.costoActual}
                onChange={(event) =>
                  setForm((current) => ({ ...current, costoActual: Number(event.target.value) }))
                }
              />
            </AdminField>
            <AdminField label="Stock">
              <AdminInput
                type="number"
                min={0}
                value={form.stockActual}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stockActual: Number(event.target.value) }))
                }
              />
            </AdminField>
            <AdminField label="Categoria">
              <AdminSelect
                value={form.categorySlug}
                onChange={(event) =>
                  setForm((current) => ({ ...current, categorySlug: event.target.value }))
                }
              >
                <option value="">Sin categoria</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.nombre}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          <div style={{ marginTop: 14 }}>
            <AdminField label="Descripcion">
              <AdminTextarea
                value={form.descripcion}
                onChange={(event) =>
                  setForm((current) => ({ ...current, descripcion: event.target.value }))
                }
              />
            </AdminField>
          </div>

          <div style={{ marginTop: 14 }}>
            <AdminField label="Imagenes">
              <AdminTextarea
                value={form.imagenes.join('\n')}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imagenes: event.target.value
                      .split('\n')
                      .map((image) => image.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Una URL por linea"
              />
            </AdminField>
          </div>

          <div className="demo-admin-inline-grid" style={{ marginTop: 14 }}>
            <label className="demo-admin-list-item" style={{ alignItems: 'center' }}>
              <span>Activo</span>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              />
            </label>
            <label className="demo-admin-list-item" style={{ alignItems: 'center' }}>
              <span>Destacado</span>
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(event) =>
                  setForm((current) => ({ ...current, destacado: event.target.checked }))
                }
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear producto'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
