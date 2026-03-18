import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useTenantAuth } from '../../hooks/useTenantAuth';
import { useTenantBusinessConfig } from '../../hooks/useTenantBusinessConfig';
import { useTenantStats } from '../../hooks/useTenantStats';
import type { TenantMeta } from '../../context/TenantContext';

// ─── Sección colapsable ───────────────────────────────────────────────────────

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      marginBottom: 16,
    }}>
      <div style={{ padding: '24px 28px 20px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6,
        }}>
          {eyebrow}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: 20,
        }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TenantDashboard() {
  const navigate                        = useNavigate();
  const { user, logout, tenantId }      = useTenantAuth();
  const { config, saveConfig }          = useTenantBusinessConfig(tenantId ?? '');
  const { stats }                       = useTenantStats(tenantId ?? '');
  const [tenantMeta, setMeta]           = useState<TenantMeta | null>(null);

  // Estado de personalización
  const [form, setForm] = useState({
    businessName: '', heroTitle: '', whatsappNumber: '', address: '',
  });
  const [primaryColor, setPrimaryColor] = useState('#FF3B00');
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  // Estado de logo
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl]             = useState<string | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // Sincronizar con Firestore en tiempo real
  useEffect(() => {
    if (!tenantId) return;
    const unsub = onSnapshot(doc(db, 'tenants', tenantId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as TenantMeta;
        setMeta(data);
        setPrimaryColor(data.theme?.primaryColor ?? '#FF3B00');
      }
    });
    return unsub;
  }, [tenantId]);

  // Sincronizar form con config del negocio
  useEffect(() => {
    if (!config) return;
    setForm({
      businessName:   config.businessName    ?? tenantMeta?.businessName ?? '',
      heroTitle:      '',
      whatsappNumber: config.whatsappNumber  ?? tenantMeta?.phone ?? '',
      address:        config.businessAddress ?? '',
    });
    setLogoUrl(config.logoUrl ?? null);
  }, [config]);

  // Sincronizar heroTitle con siteConfig
  useEffect(() => {
    if (!tenantMeta?.siteConfig) return;
    setForm(f => ({ ...f, heroTitle: tenantMeta!.siteConfig.heroTitle ?? '' }));
  }, [tenantMeta?.siteConfig]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Días restantes del trial
  const daysLeft = tenantMeta
    ? Math.max(0, Math.ceil(
        (tenantMeta.trialEndsAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;
  const progressPct = daysLeft !== null ? Math.round(((7 - daysLeft) / 7) * 100) : 0;

  const storeUrl = `${window.location.origin}/demo/${tenantId}`;
  const storePath = `/demo/${tenantId}`;
  const adminPath = `/demo/${tenantId}/admin`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=0A0A0A&color=FAFAFA&data=${encodeURIComponent(storeUrl)}`;

  // ── Guardar personalización ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      // 1. Guardar config del negocio
      await saveConfig({
        businessName:    form.businessName,
        whatsappNumber:  form.whatsappNumber,
        businessAddress: form.address,
        ...(logoUrl ? { logoUrl } : {}),
      });
      // 2. Actualizar siteConfig + theme en el doc meta del tenant
      await setDoc(
        doc(db, 'tenants', tenantId),
        {
          businessName: form.businessName,
          theme: { primaryColor, primaryHover: primaryColor, mode: 'light' },
          siteConfig: {
            ...(tenantMeta?.siteConfig ?? {}),
            heroTitle:      form.heroTitle,
            whatsappNumber: form.whatsappNumber,
            address:        form.address,
            ...(logoUrl ? { logoUrl } : {}),
          },
        },
        { merge: true }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // ── Subir logo ────────────────────────────────────────────────────────────

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    setLogoUploading(true);
    try {
      const storageRef = ref(storage, `tenants/${tenantId}/logo.png`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
    } finally {
      setLogoUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
    fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--color-muted)', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)', padding: 'clamp(20px, 5vw, 56px)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 40,
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20,
              letterSpacing: '-0.04em', color: 'var(--color-text)',
            }}>
              Layer<span style={{ color: 'var(--color-accent)' }}>Cloud</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)',
              letterSpacing: '0.06em',
            }}>
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-muted)',
                background: 'none', border: '1px solid var(--color-border)',
                cursor: 'pointer', padding: '6px 14px',
              }}
            >
              Salir
            </button>
          </div>
        </div>

        {/* ── Greeting ───────────────────────────────────────────────────── */}
        <p className="eyebrow">// Tu panel de demo</p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)',
          marginBottom: 32, lineHeight: 1.1,
        }}>
          Hola, {tenantMeta?.ownerName?.split(' ')[0] ?? 'bienvenido'}
        </h1>

        {/* ── Trial countdown ────────────────────────────────────────────── */}
        {daysLeft !== null && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderLeft: `4px solid ${daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)'}`,
            padding: '24px 28px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)',
                  marginBottom: 4,
                }}>
                  {daysLeft <= 1 ? '⚠ Prueba por vencer' : '⏱ Período de prueba gratuito'}
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
                  letterSpacing: '-0.03em', color: 'var(--color-text)',
                }}>
                  {daysLeft === 0
                    ? 'Vence hoy'
                    : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Link
                to="/contacto"
                className="btn-primary-accent"
                style={{ fontSize: 13, padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                Activar sistema →
              </Link>
            </div>
            <div style={{ height: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: daysLeft <= 1 ? '#EF4444' : 'var(--color-accent)',
                transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              }} />
            </div>
          </div>
        )}

        {/* ── Links + QR ────────────────────────────────────────────────── */}
        <Section eyebrow="01 / Tu tienda" title="Accesos rápidos">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 16, alignItems: 'start' }}>

            {/* Tienda pública */}
            <a href={storePath} style={{
              background: 'var(--color-bg)', border: '1px solid var(--color-border)',
              padding: '20px', textDecoration: 'none', display: 'block',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6,
              }}>
                Tienda pública
              </p>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4,
              }}>
                {tenantMeta?.businessName ?? '—'}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-muted)' }}>
                Ver tienda →
              </p>
            </a>

            {/* Admin */}
            <a href={adminPath} style={{
              background: '#0A0A0A', border: '1px solid #222',
              padding: '20px', textDecoration: 'none', display: 'block',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#FF3B00', marginBottom: 6,
              }}>
                Panel admin
              </p>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                color: '#FAFAFA', letterSpacing: '-0.02em', marginBottom: 4,
              }}>
                Gestionar tienda
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                Productos, pedidos →
              </p>
            </a>

            {/* QR */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <img
                src={qrUrl}
                alt="QR de tu tienda"
                width={160} height={160}
                style={{ display: 'block', border: '1px solid var(--color-border)' }}
              />
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-muted)', textAlign: 'center',
              }}>
                QR tu tienda
              </p>
            </div>

          </div>
        </Section>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <Section eyebrow="02 / Contenido" title="Tu tienda en números">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Productos',   value: stats.productCount  },
              { label: 'Pedidos',     value: stats.orderCount    },
              { label: 'Categorías',  value: stats.categoryCount },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                padding: '20px 24px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
                  letterSpacing: '-0.04em', color: 'var(--color-text)', lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--color-muted)',
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Personalizar tienda ───────────────────────────────────────── */}
        <Section eyebrow="03 / Personalización" title="Personalizar tu tienda">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Nombre del negocio */}
            <div>
              <label style={labelStyle}>Nombre del negocio</label>
              <input
                style={inputStyle}
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                placeholder="Tu negocio S.A."
              />
            </div>

            {/* Slogan / hero title */}
            <div>
              <label style={labelStyle}>Slogan / título principal</label>
              <input
                style={inputStyle}
                value={form.heroTitle}
                onChange={e => setForm(f => ({ ...f, heroTitle: e.target.value }))}
                placeholder="La mejor tienda del barrio"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={labelStyle}>WhatsApp del negocio</label>
              <input
                style={inputStyle}
                value={form.whatsappNumber}
                onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            {/* Dirección */}
            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                style={inputStyle}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Av. Corrientes 1234, CABA"
              />
            </div>

          </div>

          {/* Color + Logo en la misma fila */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* Color primario */}
            <div>
              <label style={labelStyle}>Color primario de la tienda</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{
                    width: 48, height: 48, padding: 4,
                    background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 18, color: primaryColor, letterSpacing: '-0.02em',
                  }}>
                    {primaryColor.toUpperCase()}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-muted)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2,
                  }}>
                    Se aplica a botones y acentos
                  </p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <label style={labelStyle}>Logo del negocio</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="logo"
                    style={{ width: 48, height: 48, objectFit: 'contain', border: '1px solid var(--color-border)' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading}
                    style={{
                      width: '100%', padding: '11px', textAlign: 'center',
                      background: 'var(--color-bg)', border: '1px dashed var(--color-border)',
                      fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-muted)',
                      cursor: logoUploading ? 'default' : 'pointer',
                    }}
                  >
                    {logoUploading ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo (PNG/JPG)'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Botón guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary-accent"
            style={{ justifyContent: 'center', minWidth: 180, opacity: saving ? 0.7 : 1 }}
          >
            {saved ? '✓ Cambios guardados' : saving ? 'Guardando...' : 'Guardar cambios →'}
          </button>

        </Section>

        {/* ── CTA Contratar ─────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-accent)',
          padding: '28px 32px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 6,
            }}>
              ¿Te convenciste?
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.03em', color: 'var(--color-text)', lineHeight: 1.2,
            }}>
              Activá el sistema completo<br />
              <span style={{ color: 'var(--color-muted)', fontWeight: 400, fontSize: 16 }}>
                Sin perder los datos que cargaste.
              </span>
            </p>
          </div>
          <Link
            to="/contacto"
            className="btn-primary-accent"
            style={{ fontSize: 15, padding: '14px 28px', whiteSpace: 'nowrap' }}
          >
            Quiero contratar →
          </Link>
        </div>

        {/* ── Badges rubro / ID ─────────────────────────────────────────── */}
        {tenantMeta && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-muted)', letterSpacing: '0.1em',
          }}>
            <span style={{
              border: '1px solid var(--color-border)', padding: '4px 10px',
              background: 'var(--color-surface)', textTransform: 'uppercase',
            }}>
              RUBRO: {tenantMeta.businessType}
            </span>
            <span style={{
              border: '1px solid var(--color-border)', padding: '4px 10px',
              background: 'var(--color-surface)',
            }}>
              ID: {tenantId}
            </span>
            <span style={{
              border: '1px solid var(--color-border)', padding: '4px 10px',
              background: 'var(--color-surface)',
            }}>
              PLAN: {tenantMeta.plan?.toUpperCase()}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
