import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';

function mapAuthError(errorCode?: string) {
  if (errorCode === 'auth/user-not-found') return 'No encontramos un usuario con ese email.';
  if (errorCode === 'auth/wrong-password') return 'La contraseña es incorrecta.';
  if (errorCode === 'auth/invalid-credential') return 'Email o contraseña incorrectos.';
  return 'No fue posible iniciar sesion. Intenta nuevamente.';
}

export default function DemoCustomerLogin() {
  const { tenantId, tenantMeta } = useTenant();
  const { loginCustomer } = useDemoCustomerAuth(tenantId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const redirect = searchParams.get('redirect');
  const redirectTo = redirect === 'checkout' ? `/demo/${tenantId}/checkout` : `/demo/${tenantId}/mi-cuenta`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginCustomer(email, password);
      navigate(redirectTo);
    } catch (submitError: any) {
      setError(mapAuthError(submitError?.code));
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
          width: 'min(460px, 100%)',
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
          Ingresar a {tenantMeta?.businessName}
        </h1>
        <p className="demo-admin-page-desc" style={{ marginBottom: 24 }}>
          Accede a tu cuenta para ver pedidos, autocompletar checkout y guardar tus datos.
        </p>

        <form onSubmit={handleSubmit} className="demo-admin-grid">
          <label className="demo-admin-field">
            <span className="demo-admin-label">Email</span>
            <input
              className="demo-admin-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="demo-admin-field">
            <span className="demo-admin-label">Contraseña</span>
            <input
              className="demo-admin-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <div className="demo-admin-message error">{error}</div>
          ) : null}
          <button className="demo-admin-button" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <Link to={`/demo/${tenantId}`} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none' }}>
            Volver a la tienda
          </Link>
          <Link
            to={`/demo/${tenantId}/registro${redirect ? `?redirect=${redirect}` : ''}`}
            style={{ color: primary, textDecoration: 'none', fontWeight: 700 }}
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
