import { useMemo, useState, type FormEvent } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTenantExpenses } from '../../../hooks/useTenantExpenses';
import { useTenantFinance } from '../../../hooks/useTenantFinance';
import { useTenantOrders } from '../../../hooks/useTenantOrders';
import {
  computeTenantFinanceMetrics,
  formatCurrencyArs,
  type FinancePeriod,
} from '../../../utils/tenantFinanceMetrics';
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminSelect,
  AdminSurface,
} from './AdminUi';

const PERIODS: Array<{ value: FinancePeriod; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' },
];

const PIE_COLORS = ['var(--tk-primary)', '#4ade80', '#60a5fa', '#f59e0b', '#f87171'];

export default function AdminFinance({ tenantId }: { tenantId: string }) {
  const { orders } = useTenantOrders(tenantId);
  const { entries, addEntry } = useTenantFinance(tenantId);
  const { expenses } = useTenantExpenses(tenantId);
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [form, setForm] = useState({
    tipo: 'egreso' as 'ingreso' | 'egreso',
    monto: '',
    detalle: '',
  });
  const [saving, setSaving] = useState(false);

  const metrics = useMemo(
    () => computeTenantFinanceMetrics({ orders, entries, expenses, period }),
    [entries, expenses, orders, period],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await addEntry({
        tipo: form.tipo,
        monto: Number(form.monto || 0),
        detalle: form.detalle,
      });
      setForm({ tipo: 'egreso', monto: '', detalle: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Finanzas"
        title="Flujo financiero"
        description="KPIs, tendencia comercial, flujo de caja y registro manual de movimientos integrados por tenant."
      />

      <div className="demo-admin-pill-group" style={{ marginBottom: 16 }}>
        {PERIODS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`demo-admin-pill ${period === option.value ? 'is-active' : ''}`}
            onClick={() => setPeriod(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="demo-admin-grid kpis" style={{ marginBottom: 18 }}>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{formatCurrencyArs(metrics.kpis.grossSales)}</div>
          <div className="demo-admin-kpi-label">Ventas brutas</div>
        </AdminSurface>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{formatCurrencyArs(metrics.kpis.expenses)}</div>
          <div className="demo-admin-kpi-label">Egresos</div>
        </AdminSurface>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{formatCurrencyArs(metrics.kpis.netProfit)}</div>
          <div className="demo-admin-kpi-label">Ganancia neta</div>
        </AdminSurface>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{metrics.kpis.marginPct.toFixed(1)}%</div>
          <div className="demo-admin-kpi-label">Margen</div>
        </AdminSurface>
        <AdminSurface className="demo-admin-kpi" padding="pad-md">
          <div className="demo-admin-kpi-value">{formatCurrencyArs(metrics.kpis.averageTicket)}</div>
          <div className="demo-admin-kpi-label">Ticket promedio</div>
        </AdminSurface>
      </div>

      <div className="demo-admin-grid columns-sidebar">
        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Analitica</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            Ventas vs egresos
          </h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
                <YAxis stroke="rgba(255,255,255,0.35)" />
                <Tooltip
                  contentStyle={{
                    background: '#0f0f13',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatCurrencyArs(Number(value || 0))}
                />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" fill="var(--tk-primary)" />
                <Bar dataKey="egresos" name="Egresos" fill="rgba(248,113,113,0.8)" />
                <Area
                  type="monotone"
                  dataKey="ganancia"
                  name="Ganancia"
                  stroke="#4ade80"
                  fill="rgba(74,222,128,0.14)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Caja</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            Registrar movimiento
          </h2>
          <form onSubmit={handleSubmit} className="demo-admin-grid">
            <AdminField label="Tipo">
              <AdminSelect
                value={form.tipo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tipo: event.target.value as 'ingreso' | 'egreso',
                  }))
                }
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Monto">
              <AdminInput
                type="number"
                min={0}
                value={form.monto}
                onChange={(event) => setForm((current) => ({ ...current, monto: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="Detalle">
              <AdminInput
                value={form.detalle}
                onChange={(event) => setForm((current) => ({ ...current, detalle: event.target.value }))}
                placeholder="Ej. Flete, servicio tecnico, cobro adicional"
              />
            </AdminField>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar movimiento'}
            </AdminButton>
          </form>
        </AdminSurface>

        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Acumulado</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            Flujo de caja
          </h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.cashFlowData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" />
                <YAxis stroke="rgba(255,255,255,0.35)" />
                <Tooltip
                  contentStyle={{
                    background: '#0f0f13',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  formatter={(value: number) => formatCurrencyArs(Number(value || 0))}
                />
                <Area
                  type="monotone"
                  dataKey="ingresosAcumulados"
                  name="Ingresos acumulados"
                  stroke="var(--tk-primary)"
                  fill="rgba(var(--tk-primary-rgb),0.18)"
                />
                <Area
                  type="monotone"
                  dataKey="egresosAcumulados"
                  name="Egresos acumulados"
                  stroke="#f87171"
                  fill="rgba(248,113,113,0.12)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Operacion</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 12 }}>
            Estados de pedidos
          </h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={88}
                >
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f0f13',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>
      </div>

      <div style={{ marginTop: 18 }}>
        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Ranking</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
            Top productos por facturacion
          </h2>
          <div className="demo-admin-list">
            {metrics.topProducts.map((product) => (
              <div key={product.productId} className="demo-admin-list-item">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    {product.unidades} unidades
                  </p>
                  <div className="demo-admin-progress" style={{ marginTop: 10 }}>
                    <span
                      style={{
                        width: `${metrics.topProducts[0] ? (product.revenue / metrics.topProducts[0].revenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                  {formatCurrencyArs(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>
    </div>
  );
}
