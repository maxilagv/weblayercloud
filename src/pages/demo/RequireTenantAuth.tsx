import { Navigate } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import type { ReactNode } from 'react';

export function RequireTenantAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useTenantAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em',
        color: '#999', textTransform: 'uppercase',
      }}>
        Verificando sesión...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.tenantId) return <Navigate to="/registro" replace />;

  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useTenantAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em',
        color: '#999', textTransform: 'uppercase',
      }}>
        Verificando permisos...
      </div>
    );
  }

  if (!user || user.role !== 'layercloud_superadmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
