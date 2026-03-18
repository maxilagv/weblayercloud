import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';

const BUSINESS_TYPES = [
  { key: 'muebleria',    label: 'Mueblería',              icon: '🪑' },
  { key: 'indumentaria', label: 'Indumentaria / Ropa',    icon: '👕' },
  { key: 'electronica',  label: 'Electrónica',            icon: '📱' },
  { key: 'ferreteria',   label: 'Ferretería',             icon: '🔧' },
  { key: 'libreria',     label: 'Librería / Papelería',   icon: '📚' },
  { key: 'veterinaria',  label: 'Veterinaria / Pet Shop', icon: '🐾' },
  { key: 'farmacia',     label: 'Farmacia / Perfumería',  icon: '💊' },
  { key: 'gastronomia',  label: 'Gastronomía / Delivery', icon: '🍕' },
  { key: 'servicios',    label: 'Servicios Profesionales',icon: '💼' },
  { key: 'otro',         label: 'Otro rubro',             icon: '✨' },
] as const;

// Mensajes del loading screen (se van mostrando en secuencia)
const LOADING_STEPS = [
  'Creando tu cuenta...',
  'Configurando tu tienda...',
  'Sembrando productos de ejemplo...',
  'Activando el panel de administración...',
  'Todo listo. Redirigiendo...',
];

export default function TenantRegister() {
  const navigate = useNavigate();
  const { registerTenant } = useTenantAuth();

  const [step, setStep]         = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading]   = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    email: '', password: '', ownerName: '',
    businessName: '', phone: '', businessType: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // Avanza el mensaje de loading automáticamente
  useEffect(() => {
    if (step !== 4) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, [step]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === 1 || step === 2) {
      setStep((s) => (s + 1) as 2 | 3);
      return;
    }

    // Paso 3 → lanzar registro
    setLoading(true);
    setError('');
    setStep(4);  // pantalla de loading
    setLoadingStep(0);

    try {
      await registerTenant(form.email, form.password, {
        ownerName:    form.ownerName,
        businessName: form.businessName,
        businessType: form.businessType,
        phone:        form.phone,
      });
      // Esperar un momento para que el último mensaje se vea
      await new Promise(r => setTimeout(r, 800));
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?'
          : err.code === 'auth/weak-password'
            ? 'La contraseña es muy corta (mínimo 6 caracteres).'
            : err.message ?? 'Error al registrarse. Intentá de nuevo.';
      setError(msg);
      setLoading(false);
      setStep(1); // volver al inicio si hay error de auth
    }
  };

  // ── Pantalla de loading (paso 4) ─────────────────────────────────────────────
  if (step === 4) {
    return (
      <div style={{
        minHeight: '100svh', background: '#0A0A0A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 40, padding: 40,
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22,
          letterSpacing: '-0.04em', color: '#FAFAFA',
        }}>
          Layer<span style={{ color: '#FF3B00' }}>Cloud</span>
        </span>

        {/* Spinner */}
        <div style={{
          width: 56, height: 56,
          border: '2px solid rgba(255,255,255,0.1)',
          borderTop: '2px solid #FF3B00',
          borderRadius: '50%',
          animation: 'lc-spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes lc-spin { to { transform: rotate(360deg); } }`}</style>

        {/* Mensaje actual */}
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: '#FAFAFA', letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Estamos preparando tu demo
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#FF3B00',
            minHeight: 20,
          }}>
            {LOADING_STEPS[loadingStep]}
          </p>
        </div>

        {/* Barra de progreso */}
        <div style={{ width: 240, height: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
            background: '#FF3B00',
            transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>

        {/* Rubro elegido */}
        {form.businessType && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          }}>
            {form.businessName} · {form.businessType}
          </p>
        )}
      </div>
    );
  }

  // ── Formulario wizard (pasos 1-3) ─────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100svh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(24px, 6vw, 64px)',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20,
            letterSpacing: '-0.04em', color: 'var(--color-text)',
          }}>
            Layer<span style={{ color: 'var(--color-accent)' }}>Cloud</span>
          </span>
        </Link>

        {/* Barra de pasos */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              height: 3, flex: 1, borderRadius: 2,
              background: n <= step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Paso 1: cuenta ──────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <p className="eyebrow">01 / Creá tu cuenta</p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)',
                marginBottom: 32, lineHeight: 1.1,
              }}>
                Empezá tu prueba <br />
                <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>
                  gratis de 7 días
                </em>
              </h1>
              <div className="input-group">
                <input type="email" required placeholder=" "
                  value={form.email} onChange={set('email')} />
                <label>Email</label>
              </div>
              <div className="input-group">
                <input type="password" required minLength={6} placeholder=" "
                  value={form.password} onChange={set('password')} />
                <label>Contraseña (mínimo 6 caracteres)</label>
              </div>
            </>
          )}

          {/* ── Paso 2: negocio ─────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <p className="eyebrow">02 / Tu negocio</p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)',
                marginBottom: 32, lineHeight: 1.1,
              }}>
                Contanos sobre <br />tu negocio
              </h1>
              <div className="input-group">
                <input type="text" required placeholder=" "
                  value={form.ownerName} onChange={set('ownerName')} />
                <label>Tu nombre completo</label>
              </div>
              <div className="input-group">
                <input type="text" required placeholder=" "
                  value={form.businessName} onChange={set('businessName')} />
                <label>Nombre del negocio</label>
              </div>
              <div className="input-group">
                <input type="tel" placeholder=" "
                  value={form.phone} onChange={set('phone')} />
                <label>WhatsApp del negocio (opcional)</label>
              </div>
            </>
          )}

          {/* ── Paso 3: rubro ───────────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <p className="eyebrow">03 / Rubro</p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)',
                fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)',
                marginBottom: 24, lineHeight: 1.1,
              }}>
                ¿A qué se dedica <br />tu negocio?
              </h1>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                gap: 10, marginBottom: 28,
              }}>
                {BUSINESS_TYPES.map(bt => {
                  const selected = form.businessType === bt.key;
                  return (
                    <button
                      key={bt.key} type="button"
                      onClick={() => setForm(f => ({ ...f, businessType: bt.key }))}
                      style={{
                        padding: '14px 12px', textAlign: 'left', cursor: 'pointer',
                        border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: selected ? 'rgba(255,59,0,0.06)' : 'var(--color-surface)',
                        transition: 'border-color 0.15s, background 0.15s',
                        outline: 'none',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{bt.icon}</div>
                      <div style={{
                        fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.3,
                        color: selected ? 'var(--color-accent)' : 'var(--color-text)',
                        fontWeight: selected ? 600 : 400,
                      }}>
                        {bt.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {error && (
            <p style={{
              color: '#EF4444', fontSize: 13, marginBottom: 16,
              fontFamily: 'var(--font-sans)',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (step === 3 && !form.businessType)}
            className="btn-primary-accent"
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {step < 3 ? 'Continuar →' : '🚀 Crear mi demo gratis'}
          </button>

          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              style={{
                marginTop: 12, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13,
                color: 'var(--color-muted)', padding: '8px',
              }}
            >
              ← Atrás
            </button>
          )}
        </form>

        <p style={{
          marginTop: 24, textAlign: 'center',
          fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-muted)',
        }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
