import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';

export default function TenantLogin() {
  const navigate = useNavigate();
  const { login } = useTenantAuth();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user: loggedUser } = await login(email, password);
      const token = await loggedUser.getIdTokenResult(true);
      if (token.claims.role === 'layercloud_superadmin') {
        navigate('/layercloud-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Email o contraseña incorrectos.'
        : 'Error al iniciar sesión. Intentá de nuevo.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100svh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(24px, 6vw, 64px)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20,
            letterSpacing: '-0.04em', color: 'var(--color-text)',
          }}>
            Layer<span style={{ color: 'var(--color-accent)' }}>Cloud</span>
          </span>
        </Link>

        <p className="eyebrow">// Acceso a tu demo</p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)',
          marginBottom: 32, lineHeight: 1.1,
        }}>
          Bienvenido de vuelta
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email" required placeholder=" "
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>
          <div className="input-group">
            <input
              type="password" required placeholder=" "
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <label>Contraseña</label>
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-accent"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Ingresando...' : 'Ingresar →'}
          </button>
        </form>

        <p style={{
          marginTop: 24, textAlign: 'center',
          fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-muted)',
        }}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
            Crear demo gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
