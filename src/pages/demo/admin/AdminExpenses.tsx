import { useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useTenantExpenses, type TenantExpense } from '../../../hooks/useTenantExpenses';
import { useTenantSuppliers } from '../../../hooks/useTenantSuppliers';
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
  AdminSurface,
} from './AdminUi';
import { formatCurrency, formatDate } from './adminHelpers';

const EMPTY_FORM = {
  concepto: '',
  monto: '',
  categoria: 'otros' as TenantExpense['categoria'],
  fecha: new Date().toISOString().slice(0, 10),
  proveedor: '',
};

export default function AdminExpenses({ tenantId }: { tenantId: string }) {
  const { expenses, loading, addExpense, deleteExpense } = useTenantExpenses(tenantId);
  const { suppliers } = useTenantSuppliers(tenantId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredExpenses = useMemo(
    () => (categoryFilter ? expenses.filter((expense) => expense.categoria === categoryFilter) : expenses),
    [categoryFilter, expenses],
  );

  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const date = expense.fecha?.toDate?.() ?? null;
        return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
  }, [expenses]);

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => {
      totals.set(expense.categoria, (totals.get(expense.categoria) ?? 0) + Number(expense.monto || 0));
    });
    return [...totals.entries()];
  }, [expenses]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await addExpense({
        concepto: form.concepto,
        monto: Number(form.monto || 0),
        categoria: form.categoria,
        fecha: Timestamp.fromDate(new Date(form.fecha)),
        proveedor: form.proveedor || undefined,
      });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Costos"
        title="Gastos"
        description="Registro simple de egresos operativos para integrar el costo mensual dentro del modulo financiero."
        actions={
          <>
            <AdminField label="Filtrar categoria">
              <AdminSelect value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="">Todas</option>
                <option value="alquiler">Alquiler</option>
                <option value="servicios">Servicios</option>
                <option value="salarios">Salarios</option>
                <option value="mercaderia">Mercaderia</option>
                <option value="otros">Otros</option>
              </AdminSelect>
            </AdminField>
            <AdminButton onClick={() => setModalOpen(true)}>
              <Plus size={14} style={{ marginRight: 8 }} />
              Nuevo gasto
            </AdminButton>
          </>
        }
      />

      <div className="demo-admin-grid columns-2" style={{ marginBottom: 18 }}>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{formatCurrency(currentMonthTotal)}</div>
          <div className="demo-admin-kpi-label">Total del mes en curso</div>
        </AdminSurface>
        <AdminSurface padding="pad-md">
          <div className="demo-admin-list">
            {byCategory.map(([category, total]) => (
              <div key={category} className="demo-admin-list-item">
                <span style={{ textTransform: 'capitalize' }}>{category}</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoria</th>
                <th>Proveedor</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <AdminLoadingState>Cargando gastos...</AdminLoadingState>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState>No hay gastos registrados.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.concepto}</td>
                    <td style={{ textTransform: 'capitalize' }}>{expense.categoria}</td>
                    <td>{expense.proveedor || 'Sin proveedor'}</td>
                    <td style={{ color: 'var(--tk-primary)', fontWeight: 800 }}>
                      {formatCurrency(Number(expense.monto || 0))}
                    </td>
                    <td>{formatDate(expense.fecha || expense.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <AdminIconButton onClick={() => deleteExpense(expense.id)} aria-label="Eliminar gasto">
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

      <AdminModal open={modalOpen} title="Nuevo gasto" eyebrow="Costos" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="demo-admin-grid">
            <AdminField label="Concepto">
              <AdminInput
                value={form.concepto}
                onChange={(event) => setForm((current) => ({ ...current, concepto: event.target.value }))}
                required
              />
            </AdminField>
            <div className="demo-admin-inline-grid">
              <AdminField label="Monto">
                <AdminInput
                  type="number"
                  min={0}
                  value={form.monto}
                  onChange={(event) => setForm((current) => ({ ...current, monto: event.target.value }))}
                  required
                />
              </AdminField>
              <AdminField label="Fecha">
                <AdminInput
                  type="date"
                  value={form.fecha}
                  onChange={(event) => setForm((current) => ({ ...current, fecha: event.target.value }))}
                  required
                />
              </AdminField>
              <AdminField label="Categoria">
                <AdminSelect
                  value={form.categoria}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoria: event.target.value as TenantExpense['categoria'],
                    }))
                  }
                >
                  <option value="alquiler">Alquiler</option>
                  <option value="servicios">Servicios</option>
                  <option value="salarios">Salarios</option>
                  <option value="mercaderia">Mercaderia</option>
                  <option value="otros">Otros</option>
                </AdminSelect>
              </AdminField>
            </div>
            <AdminField label="Proveedor">
              <AdminSelect
                value={form.proveedor}
                onChange={(event) => setForm((current) => ({ ...current, proveedor: event.target.value }))}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.nombre}>
                    {supplier.nombre}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar gasto'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
