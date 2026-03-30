import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthNotice, AuthPasswordField, AuthScaffold, AuthTextField } from '../../components/auth/AuthScaffold';
import { isValidEmail, mapTenantAuthError, normalizeEmail } from '../../lib/auth';
import { useTenantAuth } from '../../hooks/useTenantAuth';

export default function TenantLogin() {
  const navigate = useNavigate();
  const { login, sendPasswordResetLink } = useTenantAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await login(email, password);
      const token = await user.getIdTokenResult(true);

      if (token.claims.role === 'layercloud_superadmin') {
        navigate('/layercloud-admin');
        return;
      }

      navigate('/dashboard');
    } catch (submitError) {
      setError(mapTenantAuthError(submitError));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!isValidEmail(email)) {
      setError('Ingresa tu email para enviarte el enlace de recuperacion.');
      return;
    }

    setError('');
    setResetState('sending');

    try {
      await sendPasswordResetLink(normalizeEmail(email));
    } catch {
      // Evitamos enumerar cuentas: mostramos el mismo estado de exito.
    } finally {
      setResetState('sent');
    }
  };

  return (
    <AuthScaffold
      brandEyebrow="LayerCloud access"
      brandTitle="Accede al panel con un flujo mas limpio y seguro."
      brandDescription="Centralizamos el alta en backend, controlamos duplicados reales y dejamos la experiencia de acceso al nivel del resto del producto."
      features={[
        {
          title: 'Provision segura',
          description: 'La cuenta se crea completa o se revierte. No quedan tenants a medias.',
        },
        {
          title: 'Recuperacion integrada',
          description: 'Puedes reenviar acceso y resetear contrasena sin salir del flujo.',
        },
        {
          title: 'Claims reparables',
          description: 'Si habia cuentas viejas con claims rotos, el login intenta recuperarlas.',
        },
      ]}
      headerEyebrow="Acceso tenant"
      headerTitle="Bienvenido de vuelta"
      headerDescription="Ingresa con tu cuenta de administrador para abrir tu dashboard, tu demo o el panel de superadmin segun los permisos del usuario."
      footer={
        <p>
          Aun no tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none' }}>
            Crear demo
          </Link>
        </p>
      }
      backTo="/"
      backLabel="Volver a LayerCloud"
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <AuthTextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="fundador@negocio.com"
          disabled={loading}
        />

        <AuthPasswordField
          label="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Tu contrasena"
          disabled={loading}
        />

        {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
        {resetState === 'sent' ? (
          <AuthNotice tone="success">
            Si el email existe, te enviamos un enlace para restablecer la contrasena.
          </AuthNotice>
        ) : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <button
            type="submit"
            className="btn-primary-accent"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Validando acceso...' : 'Ingresar al panel'}
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={handleReset}
            disabled={loading || resetState === 'sending'}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {resetState === 'sending' ? 'Enviando enlace...' : 'Olvide mi contrasena'}
          </button>
        </div>
      </form>
    </AuthScaffold>
  );
}
