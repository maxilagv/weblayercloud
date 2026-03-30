import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AuthNotice,
  AuthPasswordField,
  AuthScaffold,
  AuthTextField,
} from '../../components/auth/AuthScaffold';
import {
  isValidEmail,
  mapCustomerAuthError,
  normalizeEmail,
} from '../../lib/auth';
import { useTenant } from '../../context/TenantContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';

export default function DemoCustomerLogin() {
  const { tenantId, tenantMeta } = useTenant();
  const { loginCustomer, sendPasswordResetLink } = useDemoCustomerAuth(tenantId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const redirect = searchParams.get('redirect');
  const redirectTo =
    redirect === 'checkout'
      ? `/demo/${tenantId}/checkout`
      : `/demo/${tenantId}/mi-cuenta`;
  const primaryButtonStyle = {
    width: '100%',
    justifyContent: 'center',
    ['--btn-primary-bg' as any]: primary,
    ['--btn-primary-hover' as any]: primary,
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginCustomer(email, password);
      navigate(redirectTo);
    } catch (submitError) {
      setError(mapCustomerAuthError(submitError));
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
      // Evitamos enumerar usuarios.
    } finally {
      setResetState('sent');
    }
  };

  return (
    <AuthScaffold
      accentColor={primary}
      brandEyebrow={tenantMeta?.businessName ?? 'Area de clientes'}
      brandTitle={`Accede a tu cuenta en ${tenantMeta?.businessName ?? 'la tienda'}`}
      brandDescription="Guarda tus datos, revisa pedidos y reutiliza tu cuenta web en cada nueva compra dentro de esta demo."
      features={[
        {
          title: 'Pedidos accesibles',
          description: 'Consulta tu historial y tus datos desde cualquier dispositivo.',
        },
        {
          title: 'Registro consistente',
          description: 'Tu perfil del store se crea con validaciones y flujo de alta controlado.',
        },
        {
          title: 'Recuperacion incluida',
          description: 'Si olvidas tu contrasena, puedes reiniciar acceso desde esta misma pantalla.',
        },
      ]}
      headerEyebrow="Area de clientes"
      headerTitle="Inicia sesion"
      headerDescription="Usa tu cuenta de cliente para ver tu perfil, agilizar el checkout y mantener tus datos sincronizados con la tienda."
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p>
            No tienes cuenta?{' '}
            <Link
              to={`/demo/${tenantId}/registro${redirect ? `?redirect=${redirect}` : ''}`}
              style={{ color: primary, fontWeight: 700, textDecoration: 'none' }}
            >
              Crear cuenta
            </Link>
          </p>
          <Link
            to={`/demo/${tenantId}`}
            style={{ color: '#71717a', textDecoration: 'none', fontWeight: 600 }}
          >
            Volver a la tienda
          </Link>
        </div>
      }
      backTo={`/demo/${tenantId}`}
      backLabel="Volver a la tienda"
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <AuthTextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="tu@email.com"
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
            Si la cuenta existe, te enviamos un enlace para restablecer la contrasena.
          </AuthNotice>
        ) : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <button
            type="submit"
            className="btn-primary-accent"
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading ? 'Verificando acceso...' : 'Ingresar a mi cuenta'}
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
