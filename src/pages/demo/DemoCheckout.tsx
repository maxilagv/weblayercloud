import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useCart } from '../../context/DemoCartContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';
import { useTenantOrders } from '../../hooks/useTenantOrders';
import { formatCurrency } from './admin/adminHelpers';

export default function DemoCheckout() {
  const { tenantId, tenantMeta } = useTenant();
  const { items, total, updateQty, removeFromCart, clearCart } = useCart();
  const { createOrder } = useTenantOrders(tenantId);
  const { customerUser, ensureCustomerProfile, updateCustomerProfile } = useDemoCustomerAuth(tenantId);

  const base = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';

  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    if (!customerUser) return;
    setForm({
      nombre: customerUser.nombre || '',
      apellido: customerUser.apellido || '',
      email: customerUser.email || customerUser.authEmail || '',
      telefono: customerUser.telefono || '',
      direccion: customerUser.direccion || '',
    });
  }, [customerUser]);

  const canCheckoutAsCustomer = Boolean(customerUser);
  const checkoutMode = canCheckoutAsCustomer ? 'customer' : guestMode ? 'guest' : 'gate';

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product.id,
        nombre: item.product.nombre,
        cantidad: item.quantity,
        precioUnitario: item.product.precio,
      })),
    [items],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      if (customerUser) {
        await updateCustomerProfile({
          telefono: form.telefono,
          direccion: form.direccion,
        });
      } else {
        await ensureCustomerProfile(form);
      }

      const orderRef = await createOrder({
        customerId: customerUser?.uid,
        customerSnapshot: form,
        items: summaryItems,
        status: 'pendiente',
        total,
        source: customerUser ? 'web' : 'web_guest',
      });

      setOrderId(orderRef.id);
      setSuccess(true);
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <ShoppingBag size={44} color={primary} />
          <h2 style={{ marginTop: 16, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Tu carrito esta vacio
          </h2>
          <p style={{ marginTop: 10, color: '#666', lineHeight: 1.7 }}>
            Explora el catalogo y agrega productos para continuar con la compra.
          </p>
          <Link
            to={`${base}/products`}
            style={{
              display: 'inline-flex',
              marginTop: 22,
              background: primary,
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
              padding: '14px 24px',
            }}
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div style={{ width: 'min(520px, 100%)', textAlign: 'center' }}>
          <CheckCircle2 size={54} color={primary} />
          <h2 style={{ marginTop: 18, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Pedido confirmado
          </h2>
          <p style={{ marginTop: 12, color: '#666', lineHeight: 1.7 }}>
            Recibimos tu solicitud. Te contactaremos para coordinar entrega, pago y disponibilidad.
          </p>
          <p style={{ marginTop: 14, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#71717a' }}>
            Referencia #{orderId.slice(-8).toUpperCase()}
          </p>
          {tenantMeta?.siteConfig?.whatsappNumber ? (
            <a
              href={`https://wa.me/${tenantMeta.siteConfig.whatsappNumber.replace(/\D/g, '')}?text=Hola! Hice un pedido con referencia ${orderId.slice(-8).toUpperCase()}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 20,
                background: '#25D366',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                padding: '14px 24px',
              }}
            >
              <MessageCircle size={18} />
              Confirmar por WhatsApp
            </a>
          ) : null}
          <div style={{ marginTop: 16 }}>
            <Link to={base} style={{ color: primary, textDecoration: 'none', fontWeight: 700 }}>
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(28px, 5vw, 48px) 20px 56px' }}>
      <div className="demo-admin-page-header">
        <div>
          <p className="demo-admin-page-eyebrow">Checkout</p>
          <h1 className="demo-admin-page-title" style={{ color: '#0a0a0a' }}>
            Finalizar compra
          </h1>
          <p className="demo-admin-page-desc" style={{ color: '#52525b' }}>
            Completa tus datos para reservar el pedido. Si tienes cuenta, el formulario se autocompleta.
          </p>
        </div>
      </div>

      {checkoutMode === 'gate' ? (
        <div className="demo-admin-grid columns-2" style={{ marginBottom: 22 }}>
          <section className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
            <p className="demo-admin-page-eyebrow" style={{ color: '#71717a' }}>Con cuenta</p>
            <h2 className="demo-admin-page-title" style={{ color: '#0a0a0a', fontSize: 24, marginBottom: 12 }}>
              Ingresar o registrarse
            </h2>
            <p style={{ color: '#52525b', lineHeight: 1.7, marginBottom: 18 }}>
              Guarda tu historial y agiliza futuras compras.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to={`${base}/login?redirect=checkout`} className="demo-admin-button" style={{ textDecoration: 'none' }}>
                Ingresar
              </Link>
              <Link to={`${base}/registro?redirect=checkout`} className="demo-admin-button-ghost" style={{ textDecoration: 'none' }}>
                Crear cuenta
              </Link>
            </div>
          </section>
          <section className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
            <p className="demo-admin-page-eyebrow" style={{ color: '#71717a' }}>Compra rapida</p>
            <h2 className="demo-admin-page-title" style={{ color: '#0a0a0a', fontSize: 24, marginBottom: 12 }}>
              Continuar como invitado
            </h2>
            <p style={{ color: '#52525b', lineHeight: 1.7, marginBottom: 18 }}>
              Solo pediremos nombre, email, telefono y direccion para completar el pedido.
            </p>
            <button className="demo-admin-button" onClick={() => setGuestMode(true)}>
              Seguir como invitado
            </button>
          </section>
        </div>
      ) : null}

      {checkoutMode !== 'gate' ? (
        <div className="demo-admin-grid columns-sidebar">
          <section className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
            <form onSubmit={handleSubmit} className="demo-admin-grid">
              <div className="demo-admin-inline-grid">
                <label className="demo-admin-field">
                  <span className="demo-admin-label" style={{ color: '#71717a' }}>Nombre</span>
                  <input
                    className="demo-admin-input"
                    value={form.nombre}
                    onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                    required
                    autoComplete="given-name"
                    style={{ color: '#0a0a0a', background: '#fff' }}
                  />
                </label>
                <label className="demo-admin-field">
                  <span className="demo-admin-label" style={{ color: '#71717a' }}>Apellido</span>
                  <input
                    className="demo-admin-input"
                    value={form.apellido}
                    onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))}
                    required
                    autoComplete="family-name"
                    style={{ color: '#0a0a0a', background: '#fff' }}
                  />
                </label>
              </div>
              <label className="demo-admin-field">
                <span className="demo-admin-label" style={{ color: '#71717a' }}>Email</span>
                <input
                  className="demo-admin-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                  autoComplete="email"
                  style={{ color: '#0a0a0a', background: '#fff' }}
                />
              </label>
              <label className="demo-admin-field">
                <span className="demo-admin-label" style={{ color: '#71717a' }}>Telefono</span>
                <input
                  className="demo-admin-input"
                  value={form.telefono}
                  onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
                  required
                  autoComplete="tel"
                  style={{ color: '#0a0a0a', background: '#fff' }}
                />
              </label>
              <label className="demo-admin-field">
                <span className="demo-admin-label" style={{ color: '#71717a' }}>Direccion</span>
                <input
                  className="demo-admin-input"
                  value={form.direccion}
                  onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
                  required
                  autoComplete="street-address"
                  style={{ color: '#0a0a0a', background: '#fff' }}
                />
              </label>
              <button className="demo-admin-button" type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </form>
          </section>

          <aside className="demo-admin-surface pad-md" style={{ background: '#fff', color: '#0a0a0a' }}>
            <h2 className="demo-admin-page-title" style={{ color: '#0a0a0a', fontSize: 24, marginBottom: 16 }}>
              Tu pedido
            </h2>
            <div className="demo-admin-list">
              {items.map((item) => (
                <div key={item.product.id} className="demo-admin-list-item" style={{ color: '#0a0a0a' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{item.product.nombre}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: '#71717a' }}>
                      {formatCurrency(Number(item.product.precio || 0))}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="demo-admin-button-ghost" onClick={() => updateQty(item.product.id, item.quantity - 1)}>
                        -
                      </button>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item.quantity}</span>
                      <button className="demo-admin-button-ghost" onClick={() => updateQty(item.product.id, item.quantity + 1)}>
                        +
                      </button>
                      <button className="demo-admin-button-ghost" onClick={() => removeFromCart(item.product.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: primary }}>
                    {formatCurrency(Number(item.product.precio || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="demo-admin-list" style={{ marginTop: 18 }}>
              <div className="demo-admin-list-item" style={{ color: '#0a0a0a' }}>
                <span>Subtotal</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className="demo-admin-list-item" style={{ color: '#0a0a0a' }}>
                <span>Envio</span>
                <strong>A coordinar</strong>
              </div>
              <div className="demo-admin-list-item" style={{ color: '#0a0a0a' }}>
                <span>Total</span>
                <strong style={{ color: primary }}>{formatCurrency(total)}</strong>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
