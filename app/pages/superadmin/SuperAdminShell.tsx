import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';

const SuperAdminDashboard    = lazy(() => import('./SuperAdminDashboard'));
const SuperAdminTenants      = lazy(() => import('./SuperAdminTenants'));
const SuperAdminTenantDetail = lazy(() => import('./SuperAdminTenantDetail'));
const SuperAdminConfig       = lazy(() => import('./SuperAdminConfig'));

const NAV = [
  { to: '/layercloud-admin',         label: 'Dashboard', exact: true },
  { to: '/layercloud-admin/tenants', label: 'Tenants',   exact: false },
  { to: '/layercloud-admin/config',  label: 'Config',    exact: false },
];

const S = {
  shell: {
    minHeight: '100svh', background: '#0A0A0A', color: '#FAFAFA',
    display: 'flex', flexDirection: 'column' as const,
  },
  topbar: {
    borderBottom: '1px solid #1E1E1E', padding: '0 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 52, flexShrink: 0,
  },
  brand: {
    fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.08em',
    color: '#FAFAFA', fontWeight: 700, textDecoration: 'none',
  },
  nav: { display: 'flex', alignItems: 'center', gap: 2 },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  email: { fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' },
  logout: {
    background: 'none', border: '1px solid #2A2A2A', color: 'rgba(255,255,255,0.35)',
    fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em',
    padding: '5px 12px', cursor: 'pointer',
  },
  main: { flex: 1, padding: '32px', overflow: 'auto' },
  loader: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '40vh', fontFamily: 'monospace', fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.2)',
  },
};

export default function SuperAdminShell() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { user, logout } = useTenantAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkStyle = (path: string, exact: boolean): React.CSSProperties => {
    const active = exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
    return {
      fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em',
      textTransform: 'uppercase', textDecoration: 'none',
      padding: '6px 14px',
      color: active ? '#FF3B00' : 'rgba(255,255,255,0.35)',
      borderBottom: active ? '2px solid #FF3B00' : '2px solid transparent',
      transition: 'color 0.15s',
    };
  };

  return (
    <div style={S.shell}>
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="/" style={S.brand}>
            Layer<span style={{ color: '#FF3B00' }}>Cloud</span>
            <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 10 }}>/ admin</span>
          </a>
          <nav style={S.nav}>
            {NAV.map(n => (
              <a key={n.to} href={n.to} style={navLinkStyle(n.to, n.exact)}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={S.right}>
          <span style={S.email}>{user?.email}</span>
          <button style={S.logout} onClick={handleLogout}>Salir</button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main style={S.main}>
        <Suspense fallback={<div style={S.loader}>Cargando...</div>}>
          <Routes>
            <Route index                          element={<SuperAdminDashboard />} />
            <Route path="tenants"                 element={<SuperAdminTenants />} />
            <Route path="tenants/:tenantId"       element={<SuperAdminTenantDetail />} />
            <Route path="config"                  element={<SuperAdminConfig />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
