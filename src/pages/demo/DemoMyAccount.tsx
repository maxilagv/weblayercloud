import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useTenant } from '../../context/TenantContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';
import { db } from '../../lib/firebase';
import type { TenantOrder } from '../../hooks/useTenantOrders';
import { formatCurrency, formatDate } from './admin/adminHelpers';

export default function DemoMyAccount() {
  const { tenantId } = useTenant();
  const { customerUser, loading, updateCustomerProfile, logoutCustomer } = useDemoCustomerAuth(tenantId);
  const [orders, setOrders] = useState<TenantOrder[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (!customerUser) return;
    setForm({
      telefono: customerUser.telefono || '',
      direccion: customerUser.direccion || '',
    });
  }, [customerUser]);

  useEffect(() => {
    if (!customerUser) return;

    const ordersQuery = query(
      collection(db, 'tenants', tenantId, 'orders'),
      where('customerId', '==', customerUser.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map((order) => ({ id: order.id, ...order.data() } as TenantOrder)));
    });

    return unsubscribe;
  }, [customerUser, tenantId]);

  if (!loading && !customerUser) {
    return <Navigate to={`/demo/${tenantId}/login`} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateCustomerProfile(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px 56px' }}>
      <div className="demo-admin-page-header">
        <div>
          <p className="demo-admin-page-eyebrow">Mi cuenta</p>
          <h1 className="demo-admin-page-title" style={{ color: '#0a0a0a' }}>
            {customerUser?.nombre} {customerUser?.apellido}
          </h1>
          <p className="demo-admin-page-desc" style={{ color: '#52525b' }}>
            Gestiona tus datos personales y revisa el historial de pedidos vinculados a tu cuenta web.
          </p>
        </div>
        <div className="demo-admin-actions">
          <button className="demo-admin-button-ghost" onClick={() => logoutCustomer()}>
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="demo-admin-grid columns-sidebar">
        <section className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
          <h2 className="demo-admin-page-title" style={{ fontSize: 24, color: '#0a0a0a', marginBottom: 16 }}>
            Tus datos
          </h2>
          <form onSubmit={handleSubmit} className="demo-admin-grid">
            <label className="demo-admin-field">
              <span className="demo-admin-label" style={{ color: '#71717a' }}>Telefono</span>
              <input
                className="demo-admin-input"
                value={form.telefono}
                onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
                style={{ color: '#0a0a0a', background: '#fff' }}
              />
            </label>
            <label className="demo-admin-field">
              <span className="demo-admin-label" style={{ color: '#71717a' }}>Direccion</span>
              <input
                className="demo-admin-input"
                value={form.direccion}
                onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
                style={{ color: '#0a0a0a', background: '#fff' }}
              />
            </label>
            <button className="demo-admin-button" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        <section className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
          <h2 className="demo-admin-page-title" style={{ fontSize: 24, color: '#0a0a0a', marginBottom: 16 }}>
            Historial de pedidos
          </h2>
          <div className="demo-admin-list">
            {orders.length === 0 ? (
              <p style={{ color: '#71717a' }}>Aun no tienes pedidos vinculados a esta cuenta.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="demo-admin-list-item" style={{ color: '#0a0a0a' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: '#71717a' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--tk-primary)' }}>
                      {formatCurrency(Number(order.total || 0))}
                    </p>
                    <p style={{ marginTop: 4, fontSize: 12, color: '#71717a' }}>{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
