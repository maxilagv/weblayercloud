import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';

function mapRegisterError(errorCode?: string) {
  if (errorCode === 'auth/email-already-in-use') return 'Ese email ya esta registrado.';
  if (errorCode === 'auth/weak-password') return 'La contraseña debe tener al menos 6 caracteres.';
  return 'No pudimos crear la cuenta. Intenta nuevamente.';
}

export default function DemoCustomerRegister() {
  const { tenantId, tenantMeta } = useTenant();
  const { registerCustomer } = useDemoCustomerAuth(tenantId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
  });

  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const redirect = searchParams.get('redirect');
  const redirectTo = redirect === 'checkout' ? `/demo/${tenantId}/checkout` : `/demo/${tenantId}/mi-cuenta`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerCustomer(form);
      navigate(redirectTo);
    } catch (submitError: any) {
      setError(mapRegisterError(submitError?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 6vw, 48px)',
        background: '#0f0f13',
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          background: '#17171f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: `3px solid ${primary}`,
          padding: '28px',
          color: '#fff',
        }}
      >
        <p className="demo-admin-page-eyebrow" style={{ marginBottom: 10 }}>
          Cliente web
        </p>
        <h1 className="demo-admin-page-title" style={{ fontSize: 30 }}>
          Crear cuenta en {tenantMeta?.businessName}
        </h1>
        <p className="demo-admin-page-desc" style={{ marginBottom: 24 }}>
          Registrate para guardar tu perfil y consultar tus pedidos desde cualquier dispositivo.
        </p>

        <form onSubmit={handleSubmit} className="demo-admin-grid">
          <div className="demo-admin-inline-grid">
            <label className="demo-admin-field">
              <span className="demo-admin-label">Nombre</span>
              <input
                className="demo-admin-input"
                value={form.nombre}
                onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                autoComplete="given-name"
                required
              />
            </label>
            <label className="demo-admin-field">
              <span className="demo-admin-label">Apellido</span>
              <input
                className="demo-admin-input"
                value={form.apellido}
                onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))}
                autoComplete="family-name"
                required
              />
            </label>
          </div>
          <div className="demo-admin-inline-grid">
            <label className="demo-admin-field">
              <span className="demo-admin-label">Email</span>
              <input
                className="demo-admin-input"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                required
              />
            </label>
            <label className="demo-admin-field">
              <span className="demo-admin-label">Telefono</span>
              <input
                className="demo-admin-input"
                value={form.telefono}
                onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
                autoComplete="tel"
                required
              />
            </label>
          </div>
          <label className="demo-admin-field">
            <span className="demo-admin-label">Direccion</span>
            <input
              className="demo-admin-input"
              value={form.direccion}
              onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
              autoComplete="street-address"
              required
            />
          </label>
          <label className="demo-admin-field">
            <span className="demo-admin-label">Contraseña</span>
            <input
              className="demo-admin-input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          {error ? <div className="demo-admin-message error">{error}</div> : null}
          <button className="demo-admin-button" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <Link
            to={`/demo/${tenantId}/login${redirect ? `?redirect=${redirect}` : ''}`}
            style={{ color: primary, textDecoration: 'none', fontWeight: 700 }}
          >
            Ya tengo cuenta
          </Link>
          <Link to={`/demo/${tenantId}`} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none' }}>
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
