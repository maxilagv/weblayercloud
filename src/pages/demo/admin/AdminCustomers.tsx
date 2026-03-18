import { useMemo, useState, type FormEvent } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTenantCustomers, type TenantCustomer } from '../../../hooks/useTenantCustomers';
import { useTenantOrders } from '../../../hooks/useTenantOrders';
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
} from './AdminUi';
import { formatDate } from './adminHelpers';

const EMPTY_FORM: Omit<TenantCustomer, 'id'> = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  tipo: 'manual',
};

export default function AdminCustomers({ tenantId }: { tenantId: string }) {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useTenantCustomers(tenantId);
  const { orders } = useTenantOrders(tenantId);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantCustomer | null>(null);
  const [form, setForm] = useState<Omit<TenantCustomer, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();
    const source = customerFilter
      ? customers.filter((customer) => customer.id === customerFilter)
      : customers;

    if (!term) return source;

    return source.filter((customer) => {
      const text = `${customer.nombre} ${customer.apellido} ${customer.email} ${customer.telefono}`.toLowerCase();
      return text.includes(term);
    });
  }, [customerFilter, customers, query]);

  const orderCountByCustomer = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders) {
      if (!order.customerId) continue;
      counts.set(order.customerId, (counts.get(order.customerId) ?? 0) + 1);
    }
    return counts;
  }, [orders]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (customer: TenantCustomer) => {
    setEditing(customer);
    setForm({ ...customer });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, form);
      } else {
        await addCustomer(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await deleteCustomer(customerId);
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Administra clientes manuales y web, edita datos clave y filtra la operacion por comprador."
        actions={
          <>
            <AdminField label="Buscar">
              <AdminInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre, email o telefono"
              />
            </AdminField>
            <AdminButton onClick={openNew}>
              <Plus size={14} style={{ marginRight: 8 }} />
              Nuevo cliente
            </AdminButton>
          </>
        }
      />

      {customerFilter ? (
        <div style={{ marginBottom: 16 }}>
          <AdminButton variant="ghost" onClick={() => setCustomerFilter(null)}>
            Mostrar todos los clientes
          </AdminButton>
        </div>
      ) : null}

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Direccion</th>
                <th>Tipo</th>
                <th>Pedidos</th>
                <th>Alta</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <AdminLoadingState>Cargando clientes...</AdminLoadingState>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState>No hay clientes para mostrar.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {customer.nombre} {customer.apellido}
                      </p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        DNI {customer.dni || 'no informado'}
                      </p>
                    </td>
                    <td>
                      <p>{customer.email || 'Sin email'}</p>
                      <p style={{ marginTop: 4, color: 'rgba(255,255,255,0.45)' }}>
                        {customer.telefono || 'Sin telefono'}
                      </p>
                    </td>
                    <td>{customer.direccion || 'Sin direccion'}</td>
                    <td>{customer.tipo || 'manual'}</td>
                    <td>{orderCountByCustomer.get(customer.id) ?? 0}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <AdminIconButton onClick={() => setCustomerFilter(customer.id)} aria-label="Ver pedidos de cliente">
                          <Eye size={14} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => openEdit(customer)} aria-label="Editar cliente">
                          <Pencil size={14} />
                        </AdminIconButton>
                        <AdminIconButton onClick={() => handleDelete(customer.id)} aria-label="Eliminar cliente">
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
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        eyebrow="CRM"
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
            <AdminField label="Apellido">
              <AdminInput
                value={form.apellido}
                onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="DNI">
              <AdminInput
                value={form.dni}
                onChange={(event) => setForm((current) => ({ ...current, dni: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Telefono">
              <AdminInput
                value={form.telefono}
                onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
              />
            </AdminField>
          </div>
          <div style={{ marginTop: 14 }} className="demo-admin-inline-grid">
            <AdminField label="Email">
              <AdminInput
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Direccion">
              <AdminInput
                value={form.direccion}
                onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
              />
            </AdminField>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear cliente'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
