import { useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { useTenantOrders } from '../../hooks/useTenantOrders';
import AdminCategories from './admin/AdminCategories';
import AdminConfig from './admin/AdminConfig';
import AdminCustomers from './admin/AdminCustomers';
import AdminDashboard from './admin/AdminDashboard';
import AdminExpenses from './admin/AdminExpenses';
import AdminFinance from './admin/AdminFinance';
import AdminLanding from './admin/AdminLanding';
import AdminOffers from './admin/AdminOffers';
import AdminOrders from './admin/AdminOrders';
import AdminPricing from './admin/AdminPricing';
import AdminProducts from './admin/AdminProducts';
import AdminStaff from './admin/AdminStaff';
import AdminSuppliers from './admin/AdminSuppliers';
import { AdminButton } from './admin/AdminUi';
import { ADMIN_NAV_ITEMS, ADMIN_SECONDARY_LINKS } from './admin/adminModules';
import { getPendingOrdersCount } from './admin/adminHelpers';

function AccessState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        background: '#0f0f13',
      }}
    >
      <div
        style={{
          width: 'min(460px, 100%)',
          background: '#1a1a24',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: '3px solid var(--tk-primary, #FF3B00)',
          padding: 28,
          color: '#fff',
        }}
      >
        <p className="demo-admin-page-eyebrow" style={{ marginBottom: 8 }}>
          Admin demo
        </p>
        <h1 className="demo-admin-page-title" style={{ fontSize: 28 }}>
          {title}
        </h1>
        <p className="demo-admin-page-desc">{description}</p>
        <div style={{ marginTop: 18 }}>
          <Link to={actionTo} style={{ textDecoration: 'none' }}>
            <AdminButton>{actionLabel}</AdminButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DemoAdminShell() {
  const { tenantId, tenantMeta } = useTenant();
  const { user, loading, logout } = useTenantAuth();
  const { orders } = useTenantOrders(tenantId);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSuperAdmin = user?.role === 'layercloud_superadmin';
  const isTenantAdmin = user?.role === 'tenant_admin' && user?.tenantId === tenantId;
  const isTenantEmployee = user?.role === 'tenant_employee' && user?.tenantId === tenantId;
  const employeeModules = new Set<string>(['dashboard', ...(user?.modules ?? [])]);

  const visibleNavItems = useMemo(
    () =>
      ADMIN_NAV_ITEMS.filter((item) =>
        isSuperAdmin || isTenantAdmin ? true : employeeModules.has(item.id),
      ),
    [employeeModules, isSuperAdmin, isTenantAdmin],
  );

  const defaultRoute = visibleNavItems[0]?.path ?? '';
  const activeItem = visibleNavItems.find((item) =>
    item.path === ''
      ? location.pathname.endsWith('/admin')
      : location.pathname.includes(`/admin/${item.path}`),
  );

  const pendingOrders = getPendingOrdersCount(orders);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <AccessState
        title="Verificando acceso"
        description="Estamos validando tus permisos sobre este tenant."
        actionLabel="Esperar"
        actionTo={`/demo/${tenantId}`}
      />
    );
  }

  if (!user) {
    return (
      <AccessState
        title="Acceso requerido"
        description="Debes iniciar sesion con un usuario del tenant para administrar esta demo."
        actionLabel="Iniciar sesion"
        actionTo="/login"
      />
    );
  }

  if (!(isSuperAdmin || isTenantAdmin || isTenantEmployee)) {
    return (
      <AccessState
        title="Sin acceso"
        description="Tu usuario no pertenece a este tenant o no tiene permisos para abrir el panel."
        actionLabel="Volver a la tienda"
        actionTo={`/demo/${tenantId}`}
      />
    );
  }

  return (
    <div className="demo-admin-shell">
      {mobileOpen ? <button className="demo-admin-overlay" onClick={() => setMobileOpen(false)} /> : null}

      <aside
        className={`demo-admin-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}
      >
        <div className="demo-admin-brand">
          {!collapsed ? (
            <>
              <div className="demo-admin-brand-name" style={{ color: 'var(--tk-primary)' }}>
                {tenantMeta?.businessName ?? 'LayerCloud Demo'}
              </div>
              <div className="demo-admin-brand-eyebrow">Panel administracion</div>
            </>
          ) : (
            <div className="demo-admin-brand-name" style={{ color: 'var(--tk-primary)' }}>
              LC
            </div>
          )}
        </div>

        <nav className="demo-admin-nav">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const target = item.path ? `/demo/${tenantId}/admin/${item.path}` : `/demo/${tenantId}/admin`;
            const badge = item.showPendingBadge ? pendingOrders : 0;
            return (
              <NavLink
                key={item.id}
                to={target}
                end={item.path === ''}
                className={({ isActive }) =>
                  `demo-admin-nav-link ${isActive ? 'is-active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} />
                {!collapsed ? <span className="demo-admin-nav-label">{item.label}</span> : null}
                {!collapsed && badge > 0 ? (
                  <span className="demo-admin-pending-pill">{badge}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="demo-admin-sidebar-footer">
          <Link className="demo-admin-side-action" to={`/demo/${tenantId}`} target="_blank">
            <ADMIN_SECONDARY_LINKS.storefront.icon size={16} />
            {!collapsed ? <span className="demo-admin-nav-label">{ADMIN_SECONDARY_LINKS.storefront.label}</span> : null}
          </Link>
          <button className="demo-admin-side-action" onClick={handleLogout}>
            <ADMIN_SECONDARY_LINKS.logout.icon size={16} />
            {!collapsed ? <span className="demo-admin-nav-label">{ADMIN_SECONDARY_LINKS.logout.label}</span> : null}
          </button>
        </div>
      </aside>

      <main className="demo-admin-main">
        <header className="demo-admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="demo-admin-icon-button demo-admin-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir sidebar"
            >
              <Menu size={16} />
            </button>
            <button
              className="demo-admin-icon-button"
              onClick={() => setCollapsed((current) => !current)}
              aria-label="Colapsar sidebar"
            >
              {collapsed ? '>' : '<'}
            </button>
            <div>
              <div className="demo-admin-topbar-breadcrumb">
                {tenantMeta?.businessName ?? 'Tenant'} / Admin / {activeItem?.label ?? 'Dashboard'}
              </div>
              <div className="demo-admin-topbar-title">{activeItem?.label ?? 'Dashboard'}</div>
            </div>
          </div>
          <div className="demo-admin-topbar-user">
            <div style={{ textAlign: 'right' }}>
              <div className="demo-admin-topbar-title">
                {isSuperAdmin ? 'Super admin' : isTenantAdmin ? 'Administrador' : 'Empleado'}
              </div>
              <div className="demo-admin-topbar-breadcrumb">{user.email}</div>
            </div>
            <div className="demo-admin-avatar">
              {(user.email ?? 'LC').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="demo-admin-content">
          <Routes>
            <Route index element={<AdminDashboard tenantId={tenantId} />} />
            {visibleNavItems.some((item) => item.id === 'productos') ? (
              <Route path="productos" element={<AdminProducts tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'categorias') ? (
              <Route path="categorias" element={<AdminCategories tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'pedidos') ? (
              <Route path="pedidos" element={<AdminOrders tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'clientes') ? (
              <Route path="clientes" element={<AdminCustomers tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'finanzas') ? (
              <Route path="finanzas" element={<AdminFinance tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'ofertas') ? (
              <Route path="ofertas" element={<AdminOffers tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'precios') ? (
              <Route path="precios" element={<AdminPricing tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'proveedores') ? (
              <Route path="proveedores" element={<AdminSuppliers tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'gastos') ? (
              <Route path="gastos" element={<AdminExpenses tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'empleados') ? (
              <Route path="empleados" element={<AdminStaff tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'landing') ? (
              <Route path="landing" element={<AdminLanding tenantId={tenantId} />} />
            ) : null}
            {visibleNavItems.some((item) => item.id === 'configuracion') ? (
              <Route path="configuracion" element={<AdminConfig tenantId={tenantId} />} />
            ) : null}
            <Route
              path="*"
              element={<Navigate to={defaultRoute ? `/demo/${tenantId}/admin/${defaultRoute}` : `/demo/${tenantId}/admin`} replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
