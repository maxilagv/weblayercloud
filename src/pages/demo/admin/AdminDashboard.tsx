import { useMemo } from 'react';
import { Activity, Box, Package, ShoppingBag, Users } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { useTenantCategories } from '../../../hooks/useTenantCategories';
import { useTenantCustomers } from '../../../hooks/useTenantCustomers';
import { useTenantOrders } from '../../../hooks/useTenantOrders';
import { useTenantProducts } from '../../../hooks/useTenantProducts';
import { AdminLoadingState, AdminPageHeader, AdminStatusBadge, AdminSurface } from './AdminUi';
import { formatCurrency, formatDate } from './adminHelpers';

const KPI_META = [
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'categories', label: 'Categorias', icon: Box },
  { key: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { key: 'customers', label: 'Clientes', icon: Users },
  { key: 'today', label: 'Ventas hoy', icon: Activity },
] as const;

export default function AdminDashboard({ tenantId }: { tenantId: string }) {
  const { tenantMeta } = useTenant();
  const { products, loading: loadingProducts } = useTenantProducts(tenantId);
  const { categories, loading: loadingCategories } = useTenantCategories(tenantId);
  const { orders, loading: loadingOrders } = useTenantOrders(tenantId);
  const { customers, loading: loadingCustomers } = useTenantCustomers(tenantId);

  const loading = loadingProducts || loadingCategories || loadingOrders || loadingCustomers;

  const stats = useMemo(() => {
    const todayKey = new Date().toDateString();
    const todaySales = orders
      .filter((order) => {
        const date = order.createdAt?.toDate?.() ?? null;
        return date?.toDateString() === todayKey;
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      products: products.length,
      categories: categories.length,
      orders: orders.length,
      customers: customers.length,
      today: todaySales,
    };
  }, [categories.length, customers.length, orders, products.length]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title={tenantMeta?.businessName ?? 'Panel admin'}
        description="Vista ejecutiva del tenant con actividad comercial, volumen de catalogo y ultimos pedidos."
      />

      <div className="demo-admin-grid kpis" style={{ marginBottom: 18 }}>
        {KPI_META.map((item) => {
          const Icon = item.icon;
          const value = item.key === 'today' ? formatCurrency(stats.today) : stats[item.key].toString();
          return (
            <AdminSurface key={item.key} className="demo-admin-kpi" padding="pad-md">
              <Icon size={18} color="var(--tk-primary)" />
              <div className="demo-admin-kpi-value">{value}</div>
              <div className="demo-admin-kpi-label">{item.label}</div>
            </AdminSurface>
          );
        })}
      </div>

      <div className="demo-admin-grid columns-2">
        <AdminSurface padding="pad-md">
          <div style={{ marginBottom: 16 }}>
            <p className="demo-admin-page-eyebrow">Pipeline</p>
            <h2 className="demo-admin-page-title" style={{ fontSize: 24 }}>
              Pedidos recientes
            </h2>
          </div>
          {loading ? (
            <AdminLoadingState>Cargando actividad reciente...</AdminLoadingState>
          ) : recentOrders.length === 0 ? (
            <AdminLoadingState>Aun no hay pedidos en esta demo.</AdminLoadingState>
          ) : (
            <div className="demo-admin-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="demo-admin-list-item">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {order.customerSnapshot.nombre} {order.customerSnapshot.apellido}
                    </p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.46)' }}>
                      #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                      {formatCurrency(Number(order.total || 0))}
                    </p>
                    <div style={{ marginTop: 8 }}>
                      <AdminStatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminSurface>

        <AdminSurface padding="pad-md">
          <div style={{ marginBottom: 16 }}>
            <p className="demo-admin-page-eyebrow">Snapshot</p>
            <h2 className="demo-admin-page-title" style={{ fontSize: 24 }}>
              Resumen de la demo
            </h2>
          </div>
          <div className="demo-admin-list">
            <div className="demo-admin-list-item">
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)' }}>Color primario</p>
                <p style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {tenantMeta?.theme?.primaryColor ?? '#FF3B00'}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: tenantMeta?.theme?.primaryColor ?? '#FF3B00',
                }}
              />
            </div>
            <div className="demo-admin-list-item">
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)' }}>WhatsApp</p>
                <p style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {tenantMeta?.siteConfig?.whatsappNumber || 'No configurado'}
                </p>
              </div>
            </div>
            <div className="demo-admin-list-item">
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)' }}>Direccion</p>
                <p style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {tenantMeta?.siteConfig?.address || 'No configurada'}
                </p>
              </div>
            </div>
          </div>
        </AdminSurface>
      </div>
    </div>
  );
}
