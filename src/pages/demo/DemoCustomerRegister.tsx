import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AuthNotice,
  AuthPasswordField,
  AuthScaffold,
  AuthTextField,
  PasswordChecklist,
} from '../../components/auth/AuthScaffold';
import {
  getCustomerRegistrationErrors,
  getPasswordPolicyState,
  getPasswordStrength,
  mapCustomerAuthError,
  type CustomerRegisterFormState,
} from '../../lib/auth';
import { useTenant } from '../../context/TenantContext';
import { useDemoCustomerAuth } from '../../hooks/useDemoCustomerAuth';

export default function DemoCustomerRegister() {
  const { tenantId, tenantMeta } = useTenant();
  const { registerCustomer } = useDemoCustomerAuth(tenantId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CustomerRegisterFormState, string>>
  >({});
  const [form, setForm] = useState<CustomerRegisterFormState>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });

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

  const passwordPolicy = useMemo(() => getPasswordPolicyState(form.password), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(passwordPolicy), [passwordPolicy]);

  const updateField = <K extends keyof CustomerRegisterFormState>(
    key: K,
    value: CustomerRegisterFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = getCustomerRegistrationErrors(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await registerCustomer({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        password: form.password,
      });

      navigate(redirectTo);
    } catch (submitError) {
      setError(mapCustomerAuthError(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      accentColor={primary}
      brandEyebrow="Cuenta cliente"
      brandTitle={`Crea tu acceso en ${tenantMeta?.businessName ?? 'esta tienda'}`}
      brandDescription="El alta crea tu cuenta y tu perfil del store con datos normalizados. Asi puedes volver, comprar mas rapido y consultar pedidos sin friccion."
      features={[
        {
          title: 'Perfil persistente',
          description: 'Guardas direccion, telefono y datos clave para futuras compras.',
        },
        {
          title: 'Recuperacion disponible',
          description: 'Si ya tienes cuenta, puedes iniciar sesion o restablecer la contrasena.',
        },
        {
          title: 'Checkout mas rapido',
          description: 'Tu siguiente compra reutiliza los datos guardados y el historial.',
        },
      ]}
      headerEyebrow="Alta de cliente"
      headerTitle="Crear cuenta"
      headerDescription="Completa tu perfil una sola vez. Si ya tienes una cuenta global con este email, inicia sesion para usarla en esta tienda."
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p>
            Ya tienes cuenta?{' '}
            <Link
              to={`/demo/${tenantId}/login${redirect ? `?redirect=${redirect}` : ''}`}
              style={{ color: primary, fontWeight: 700, textDecoration: 'none' }}
            >
              Iniciar sesion
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <AuthTextField
            label="Nombre"
            value={form.nombre}
            onChange={(event) => updateField('nombre', event.target.value)}
            autoComplete="given-name"
            placeholder="Tu nombre"
            error={fieldErrors.nombre}
          />
          <AuthTextField
            label="Apellido"
            value={form.apellido}
            onChange={(event) => updateField('apellido', event.target.value)}
            autoComplete="family-name"
            placeholder="Tu apellido"
            error={fieldErrors.apellido}
          />
        </div>

        <AuthTextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          autoComplete="email"
          placeholder="tu@email.com"
          error={fieldErrors.email}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <AuthTextField
            label="Telefono"
            value={form.telefono}
            onChange={(event) => updateField('telefono', event.target.value)}
            autoComplete="tel"
            placeholder="+54 9 ..."
            error={fieldErrors.telefono}
          />
          <AuthTextField
            label="Direccion"
            value={form.direccion}
            onChange={(event) => updateField('direccion', event.target.value)}
            autoComplete="street-address"
            placeholder="Direccion de entrega"
            error={fieldErrors.direccion}
          />
        </div>

        <AuthPasswordField
          label="Contrasena"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          autoComplete="new-password"
          placeholder="Crea una contrasena fuerte"
          error={fieldErrors.password}
          hint={
            passwordStrength >= 3
              ? 'La contrasena ya cubre la mayor parte de la politica.'
              : 'Usa una contrasena larga y dificil de reutilizar.'
          }
        />

        <PasswordChecklist password={form.password} />

        <AuthPasswordField
          label="Confirmar contrasena"
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          autoComplete="new-password"
          placeholder="Repite tu contrasena"
          error={fieldErrors.confirmPassword}
        />

        {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <button
            className="btn-primary-accent"
            type="submit"
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
          </button>
        </div>
      </form>
    </AuthScaffold>
  );
}
