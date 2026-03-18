import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTenantCategories, type TenantCategory } from '../../../hooks/useTenantCategories';
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminIconButton,
  AdminInput,
  AdminLoadingState,
  AdminModal,
  AdminPageHeader,
  AdminTextarea,
  AdminSurface,
} from './AdminUi';
import { buildCategorySlug, sortCategoriesByOrder } from './adminHelpers';

const EMPTY_FORM: Omit<TenantCategory, 'id'> = {
  nombre: '',
  slug: '',
  descripcion: '',
  imagen: '',
  orden: 0,
  activo: true,
};

export default function AdminCategories({ tenantId }: { tenantId: string }) {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useTenantCategories(tenantId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantCategory | null>(null);
  const [form, setForm] = useState<Omit<TenantCategory, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const sortedCategories = useMemo(() => sortCategoriesByOrder(categories), [categories]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (category: TenantCategory) => {
    setEditing(category);
    setForm({ ...category });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || buildCategorySlug(form.nombre),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await addCategory(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('¿Eliminar esta categoria?')) return;
    await deleteCategory(categoryId);
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogo"
        title="Categorias"
        description="Ordena la navegacion comercial de la tienda y agrupa productos por rubro."
        actions={<AdminButton onClick={openNew}><Plus size={14} style={{ marginRight: 8 }} />Nueva categoria</AdminButton>}
      />

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Slug</th>
                <th>Orden</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <AdminLoadingState>Cargando categorias...</AdminLoadingState>
                  </td>
                </tr>
              ) : sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState>No hay categorias creadas.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                sortedCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {category.imagen ? (
                          <img
                            src={category.imagen}
                            alt={category.nombre}
                            style={{ width: 48, height: 48, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(255,255,255,0.05)',
                            }}
                          >
                            {category.nombre.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{category.nombre}</p>
                          <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.44)' }}>
                            {category.descripcion || 'Sin descripcion'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{category.slug}</td>
                    <td>{category.orden}</td>
                    <td>{category.activo ? 'Activa' : 'Oculta'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <AdminIconButton onClick={() => openEdit(category)} aria-label="Editar categoria">
                          <Pencil size={14} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => handleDelete(category.id)} aria-label="Eliminar categoria">
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
        title={editing ? 'Editar categoria' : 'Nueva categoria'}
        eyebrow="Catalogo"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="demo-admin-inline-grid">
            <AdminField label="Nombre">
              <AdminInput
                value={form.nombre}
                onChange={(event) => {
                  const nombre = event.target.value;
                  setForm((current) => ({
                    ...current,
                    nombre,
                    slug: editing ? current.slug : buildCategorySlug(nombre),
                  }));
                }}
                required
              />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="Orden">
              <AdminInput
                type="number"
                min={0}
                value={form.orden}
                onChange={(event) => setForm((current) => ({ ...current, orden: Number(event.target.value) }))}
              />
            </AdminField>
            <label className="demo-admin-list-item" style={{ alignItems: 'center' }}>
              <span>Activa</span>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              />
            </label>
          </div>

          <div style={{ marginTop: 14 }}>
            <AdminField label="Imagen">
              <AdminInput
                value={form.imagen}
                onChange={(event) => setForm((current) => ({ ...current, imagen: event.target.value }))}
                placeholder="URL de imagen"
              />
            </AdminField>
          </div>

          <div style={{ marginTop: 14 }}>
            <AdminField label="Descripcion">
              <AdminTextarea
                value={form.descripcion}
                onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              />
            </AdminField>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear categoria'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
