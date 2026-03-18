import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';

export default function DemoAbout() {
  const { tenantId, tenantMeta } = useTenant();

  const base    = `/demo/${tenantId}`;
  const primary = tenantMeta?.theme?.primaryColor ?? '#FF3B00';
  const config  = tenantMeta?.siteConfig;

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        background: '#0A0A0A', color: '#fff',
        padding: 'clamp(80px,12vw,120px) clamp(20px,6vw,80px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${primary}22 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />
        <p style={{
          fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: primary, marginBottom: 16, position: 'relative',
        }}>
          Quiénes somos
        </p>
        <h1 style={{
          fontSize: 'clamp(32px,6vw,60px)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20,
          position: 'relative',
        }}>
          {tenantMeta?.businessName}
        </h1>
        {config?.heroSubtitle && (
          <p style={{
            fontSize: 'clamp(15px,2.5vw,20px)', color: 'rgba(255,255,255,0.6)',
            maxWidth: 540, margin: '0 auto', lineHeight: 1.65, position: 'relative',
          }}>
            {config.heroSubtitle}
          </p>
        )}
      </section>

      {/* ── Content ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,6vw,80px)' }}>

        {/* Intro */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#0A0A0A', marginBottom: 16 }}>
            Nuestra empresa
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555' }}>
            Somos <strong>{tenantMeta?.businessName}</strong>, una empresa dedicada a ofrecer los mejores
            productos a nuestros clientes. Trabajamos con pasión y compromiso para brindar
            una experiencia de compra excepcional en cada interacción.
          </p>
        </div>

        {/* Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 20, marginBottom: 56 }}>
          {[
            { icon: '🎯', title: 'Misión',  text: 'Brindar productos de calidad con el mejor servicio.' },
            { icon: '✨', title: 'Visión',  text: 'Ser la referencia en nuestro rubro en la región.' },
            { icon: '💎', title: 'Valores', text: 'Honestidad, compromiso y excelencia en cada operación.' },
          ].map(item => (
            <div key={item.title} style={{ background: '#F8F8F8', padding: 28 }}>
              <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#0A0A0A' }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Contact info */}
        {(config?.address || config?.email || config?.whatsappNumber) && (
          <div style={{ background: '#0A0A0A', color: '#fff', padding: '32px 36px', marginBottom: 48 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Contactanos
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {config.address && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>📍 {config.address}</p>
              )}
              {config.email && (
                <a href={`mailto:${config.email}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                  ✉️ {config.email}
                </a>
              )}
              {config.whatsappNumber && (
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  style={{ fontSize: 14, color: '#25D366', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  💬 {config.whatsappNumber}
                </a>
              )}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link
            to={`${base}/products`}
            style={{
              background: primary, color: '#fff',
              fontWeight: 700, fontSize: 15, padding: '13px 28px', textDecoration: 'none',
            }}
          >
            Ver productos →
          </Link>
          <Link
            to={`${base}/contact`}
            style={{
              background: 'transparent', color: primary,
              fontWeight: 700, fontSize: 15, padding: '13px 28px',
              textDecoration: 'none', border: `2px solid ${primary}`,
            }}
          >
            Contacto
          </Link>
        </div>
      </section>
    </div>
  );
}
