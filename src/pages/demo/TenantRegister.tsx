import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthNotice,
  AuthPasswordField,
  AuthScaffold,
  AuthStepBar,
  AuthTextField,
  PasswordChecklist,
} from '../../components/auth/AuthScaffold';
import {
  getPasswordPolicyState,
  getPasswordStrength,
  getTenantStepErrors,
  mapTenantAuthError,
  normalizePhone,
  type TenantRegisterFormState,
  type TenantRegisterStep,
} from '../../lib/auth';
import { useTenantAuth } from '../../hooks/useTenantAuth';

const BUSINESS_TYPES = [
  { key: 'muebleria', label: 'Muebleria', detail: 'Catalogo, stock y listas de precios.' },
  { key: 'indumentaria', label: 'Indumentaria', detail: 'Variantes, ofertas y venta omnicanal.' },
  { key: 'electronica', label: 'Electronica', detail: 'SKU, lotes y control comercial.' },
  { key: 'ferreteria', label: 'Ferreteria', detail: 'Amplio inventario y reposicion rapida.' },
  { key: 'libreria', label: 'Libreria', detail: 'Listados simples y combos.' },
  { key: 'veterinaria', label: 'Veterinaria', detail: 'Productos, atencion y fidelizacion.' },
  { key: 'farmacia', label: 'Farmacia', detail: 'Venta asistida y contacto por WhatsApp.' },
  { key: 'gastronomia', label: 'Gastronomia', detail: 'Carta online, pedidos y promos.' },
  { key: 'servicios', label: 'Servicios', detail: 'Presencia profesional y captura de leads.' },
  { key: 'otro', label: 'Otro rubro', detail: 'Configuracion flexible para pruebas rapidas.' },
] as const;

const LOADING_STEPS = [
  'Reservando tu identidad de acceso',
  'Creando la estructura del tenant',
  'Sembrando contenido inicial',
  'Asignando permisos y claims',
  'Abriendo tu dashboard',
];

function LoadingState({ businessName, businessType, loadingStep }: { businessName: string; businessType: string; loadingStep: number }) {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(255,59,0,0.18), transparent 28%), linear-gradient(135deg, #09090b 0%, #121218 100%)',
        color: '#fafafa',
        padding: 24,
      }}
    >
      <div style={{ width: 'min(100%, 420px)', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#ff8a66',
            marginBottom: 14,
          }}
        >
          Activando tu cuenta
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 6vw, 48px)',
            letterSpacing: '-0.05em',
            lineHeight: 0.98,
            marginBottom: 14,
          }}
        >
          Preparando tu demo
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.64)', lineHeight: 1.7 }}>
          Estamos creando el entorno inicial para {businessName || 'tu negocio'}.
        </p>

        <div
          style={{
            marginTop: 28,
            height: 6,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #ff3b00, #ff9a6a)',
              transition: 'width 0.35s ease',
            }}
          />
        </div>

        <div style={{ marginTop: 20, display: 'grid', gap: 10, textAlign: 'left' }}>
          {LOADING_STEPS.map((item, index) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: index <= loadingStep ? '#fafafa' : 'rgba(255,255,255,0.38)',
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: index <= loadingStep ? '#ff3b00' : 'rgba(255,255,255,0.18)',
                  boxShadow: index === loadingStep ? '0 0 0 8px rgba(255,59,0,0.12)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
              {item}
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: 22,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.32)',
          }}
        >
          {businessType || 'tenant'} / onboarding seguro
        </p>
      </div>
    </div>
  );
}

export default function TenantRegister() {
  const navigate = useNavigate();
  const { registerTenant } = useTenantAuth();
  const [step, setStep] = useState<TenantRegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TenantRegisterFormState, string>>>({});
  const [form, setForm] = useState<TenantRegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    businessName: '',
    phone: '',
    businessType: '',
    acceptSetup: false,
  });

  const passwordPolicy = useMemo(() => getPasswordPolicyState(form.password), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(passwordPolicy), [passwordPolicy]);

  const updateForm = <K extends keyof TenantRegisterFormState>(key: K, value: TenantRegisterFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = (targetStep: TenantRegisterStep) => {
    const nextErrors = getTenantStepErrors(form, targetStep);
    setFieldErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      return;
    }

    setError('');
    setStep((current) => (current + 1) as TenantRegisterStep);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateStep(3)) {
      return;
    }

    setError('');
    setLoading(true);
    setLoadingStep(0);
    window.setTimeout(() => setLoadingStep(1), 350);
    window.setTimeout(() => setLoadingStep(2), 800);
    window.setTimeout(() => setLoadingStep(3), 1250);

    try {
      await registerTenant(form.email, form.password, {
        ownerName: form.ownerName.trim(),
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        phone: normalizePhone(form.phone),
      });

      setLoadingStep(4);
      window.setTimeout(() => navigate('/dashboard'), 380);
    } catch (submitError) {
      setError(mapTenantAuthError(submitError));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingState
        businessName={form.businessName}
        businessType={form.businessType}
        loadingStep={loadingStep}
      />
    );
  }

  return (
    <AuthScaffold
      brandEyebrow="Alta guiada"
      brandTitle="Crea una cuenta mas clara, validada y sin estados rotos."
      brandDescription="La demo se aprovisiona desde backend con controles de unicidad, rollback y claims consistentes. Tu registro deja de depender de varios pasos sueltos del cliente."
      features={[
        {
          title: 'Paso 1. Identidad segura',
          description: 'Email validado, confirmacion de contrasena y politica minima real.',
        },
        {
          title: 'Paso 2. Datos operativos',
          description: 'Normalizamos nombre, negocio y telefono antes de crear el tenant.',
        },
        {
          title: 'Paso 3. Provision controlada',
          description: 'Solo se activa la cuenta cuando tenant, indices y claims quedan consistentes.',
        },
      ]}
      headerEyebrow={`Registro / paso ${step} de 3`}
      headerTitle="Activa tu demo profesional"
      headerDescription="Configura tu acceso en tres pasos cortos. Si algo falla, el backend revierte la operacion para no dejar cuentas incompletas."
      footer={
        <p>
          Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none' }}>
            Iniciar sesion
          </Link>
        </p>
      }
      backTo="/"
      backLabel="Volver a LayerCloud"
    >
      <AuthStepBar currentStep={step} totalSteps={3} />

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
        {step === 1 ? (
          <>
            <AuthTextField
              label="Email del titular"
              type="email"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              autoComplete="email"
              placeholder="fundador@negocio.com"
              error={fieldErrors.email}
            />

            <AuthPasswordField
              label="Contrasena"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
              autoComplete="new-password"
              placeholder="Crea una contrasena fuerte"
              error={fieldErrors.password}
              hint={
                passwordStrength >= 3
                  ? 'La contrasena ya cumple gran parte de la politica.'
                  : 'Usa una contrasena larga y dificil de reutilizar.'
              }
            />

            <PasswordChecklist password={form.password} />

            <AuthPasswordField
              label="Confirmar contrasena"
              value={form.confirmPassword}
              onChange={(event) => updateForm('confirmPassword', event.target.value)}
              autoComplete="new-password"
              placeholder="Repite tu contrasena"
              error={fieldErrors.confirmPassword}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <AuthTextField
              label="Tu nombre completo"
              value={form.ownerName}
              onChange={(event) => updateForm('ownerName', event.target.value)}
              autoComplete="name"
              placeholder="Nombre y apellido"
              error={fieldErrors.ownerName}
            />

            <AuthTextField
              label="Nombre del negocio"
              value={form.businessName}
              onChange={(event) => updateForm('businessName', event.target.value)}
              autoComplete="organization"
              placeholder="Nombre comercial"
              error={fieldErrors.businessName}
            />

            <AuthTextField
              label="WhatsApp o telefono"
              value={form.phone}
              onChange={(event) => updateForm('phone', event.target.value)}
              autoComplete="tel"
              placeholder="+54 9 ..."
              error={fieldErrors.phone}
              hint="Opcional, pero sirve para personalizar la demo y el contacto."
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div style={{ display: 'grid', gap: 12 }}>
              <span className="lc-auth-field-label">Rubro principal</span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 10,
                }}
              >
                {BUSINESS_TYPES.map((businessType) => {
                  const selected = form.businessType === businessType.key;
                  return (
                    <button
                      key={businessType.key}
                      type="button"
                      onClick={() => updateForm('businessType', businessType.key)}
                      style={{
                        border: `1px solid ${selected ? 'var(--color-accent)' : 'rgba(15,23,42,0.12)'}`,
                        background: selected ? 'rgba(255,59,0,0.06)' : 'rgba(255,255,255,0.85)',
                        padding: '14px 14px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: selected ? 'var(--color-accent)' : '#18181b',
                          marginBottom: 6,
                        }}
                      >
                        {businessType.label}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: '#5b6270' }}>
                        {businessType.detail}
                      </div>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.businessType ? (
                <span className="lc-auth-field-error">{fieldErrors.businessType}</span>
              ) : null}
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginTop: 20,
                fontSize: 13,
                lineHeight: 1.65,
                color: '#4b5563',
              }}
            >
              <input
                type="checkbox"
                checked={form.acceptSetup}
                onChange={(event) => updateForm('acceptSetup', event.target.checked)}
                style={{ marginTop: 3 }}
              />
              Confirmo que quiero crear una demo de 7 dias y recibir el email de acceso en la cuenta indicada.
            </label>
            {fieldErrors.acceptSetup ? (
              <span className="lc-auth-field-error" style={{ display: 'block', marginTop: 8 }}>
                {fieldErrors.acceptSetup}
              </span>
            ) : null}

            <AuthNotice tone="info">
              El sistema crea la cuenta, el tenant, el indice administrativo y los claims en un flujo unico.
            </AuthNotice>
          </>
        ) : null}

        {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          {step < 3 ? (
            <button
              type="button"
              className="btn-primary-accent"
              onClick={handleNextStep}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary-accent"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Crear mi demo segura
            </button>
          )}

          {step > 1 ? (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep((current) => (current - 1) as TenantRegisterStep)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Volver al paso anterior
            </button>
          ) : null}
        </div>
      </form>
    </AuthScaffold>
  );
}
