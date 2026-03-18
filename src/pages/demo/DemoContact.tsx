import { useState, type FormEvent } from 'react';
import { useTenant } from '../../context/TenantContext';

export default function DemoContact() {
  const { tenantMeta } = useTenant();

  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const config  = tenantMeta?.siteConfig;

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (config?.whatsappNumber) {
      const msg = `Hola ${tenantMeta?.businessName}! Soy ${form.nombre} (${form.email}). ${form.mensaje}`;
      window.open(
        `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
        '_blank',
      );
    }
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        background: '#0A0A0A', color: '#fff',
        padding: 'clamp(80px,12vw,120px) clamp(20px,6vw,80px)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: primary, marginBottom: 16,
        }}>
          Contacto
        </p>
        <h1 style={{ fontSize: 'clamp(32px,6vw,60px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
          ¿Cómo podemos ayudarte?
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
          Respondemos todos los mensajes.
        </p>
      </section>

      {/* ── Content ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,6vw,80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 56 }}>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#0A0A0A' }}>
              Envianos un mensaje
            </h2>

            {[
              { key: 'nombre', label: 'Tu nombre', type: 'text' },
              { key: 'email',  label: 'Tu email',  type: 'email' },
            ].map(({ key, label, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
                <input
                  type={type} required
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = primary)}
                  onBlur={e  => (e.currentTarget.style.borderColor = '#DDD')}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 5 }}>Mensaje</label>
              <textarea
                required rows={4}
                value={form.mensaje}
                onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                onFocus={e => (e.currentTarget.style.borderColor = primary)}
                onBlur={e  => (e.currentTarget.style.borderColor = '#DDD')}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '13px 24px',
                background: sent ? '#22C55E' : config?.whatsappNumber ? '#25D366' : primary,
                color: '#fff', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
                transition: 'background 0.3s',
              }}
            >
              {sent
                ? '✓ Mensaje enviado'
                : config?.whatsappNumber
                  ? '💬 Enviar por WhatsApp'
                  : 'Enviar mensaje →'}
            </button>
          </form>

          {/* Info */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#0A0A0A' }}>
              Información de contacto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {config?.whatsappNumber && (
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8F8F8', padding: 18, textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 26 }}>💬</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0A0A0A', marginBottom: 2 }}>WhatsApp</p>
                    <p style={{ fontSize: 13, color: '#25D366' }}>{config.whatsappNumber}</p>
                  </div>
                </a>
              )}
              {config?.email && (
                <a
                  href={`mailto:${config.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8F8F8', padding: 18, textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 26 }}>✉️</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0A0A0A', marginBottom: 2 }}>Email</p>
                    <p style={{ fontSize: 13, color: '#555' }}>{config.email}</p>
                  </div>
                </a>
              )}
              {config?.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8F8F8', padding: 18 }}>
                  <span style={{ fontSize: 26 }}>📍</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0A0A0A', marginBottom: 2 }}>Dirección</p>
                    <p style={{ fontSize: 13, color: '#555' }}>{config.address}</p>
                  </div>
                </div>
              )}
              {config?.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#F8F8F8', padding: 18, textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 26 }}>📸</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0A0A0A', marginBottom: 2 }}>Instagram</p>
                    <p style={{ fontSize: 13, color: '#555' }}>Ver perfil →</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
