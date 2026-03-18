import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTenantSuppliers, type TenantSupplier } from '../../../hooks/useTenantSuppliers';
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminIconButton,
  AdminInput,
  AdminLoadingState,
  AdminModal,
  AdminPageHeader,
  AdminSurface,
  AdminTextarea,
} from './AdminUi';

const EMPTY_FORM: Omit<TenantSupplier, 'id'> = {
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  cuit: '',
  notas: '',
};

export default function AdminSuppliers({ tenantId }: { tenantId: string }) {
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useTenantSuppliers(tenantId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantSupplier | null>(null);
  const [form, setForm] = useState<Omit<TenantSupplier, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (supplier: TenantSupplier) => {
    setEditing(supplier);
    setForm({ ...supplier });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(editing.id, form);
      } else {
        await addSupplier(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Abastecimiento"
        title="Proveedores"
        description="Agenda de proveedores por tenant con datos de contacto, CUIT y notas operativas."
        actions={<AdminButton onClick={openNew}><Plus size={14} style={{ marginRight: 8 }} />Nuevo proveedor</AdminButton>}
      />

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>CUIT</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <AdminLoadingState>Cargando proveedores...</AdminLoadingState>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState>No hay proveedores cargados.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{supplier.nombre}</p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {supplier.notas || 'Sin notas'}
                      </p>
                    </td>
                    <td>
                      {supplier.contacto || 'Sin contacto'}
                      <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.45)' }}>
                        {supplier.telefono || 'Sin telefono'}
                      </div>
                    </td>
                    <td>{supplier.email || 'Sin email'}</td>
                    <td>{supplier.cuit || 'Sin CUIT'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <AdminIconButton onClick={() => openEdit(supplier)} aria-label="Editar proveedor">
                          <Pencil size={14} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => deleteSupplier(supplier.id)} aria-label="Eliminar proveedor">
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
        title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
        eyebrow="Abastecimiento"
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
            <AdminField label="Contacto">
              <AdminInput
                value={form.contacto}
                onChange={(event) => setForm((current) => ({ ...current, contacto: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Telefono">
              <AdminInput
                value={form.telefono}
                onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Email">
              <AdminInput
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </AdminField>
            <AdminField label="CUIT">
              <AdminInput
                value={form.cuit}
                onChange={(event) => setForm((current) => ({ ...current, cuit: event.target.value }))}
              />
            </AdminField>
          </div>
          <div style={{ marginTop: 14 }}>
            <AdminField label="Notas">
              <AdminTextarea
                value={form.notas}
                onChange={(event) => setForm((current) => ({ ...current, notas: event.target.value }))}
              />
            </AdminField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear proveedor'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
