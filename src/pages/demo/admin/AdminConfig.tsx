import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useTenant } from '../../../context/TenantContext';
import { useTenantBusinessConfig } from '../../../hooks/useTenantBusinessConfig';
import { db, storage } from '../../../lib/firebase';
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminMessage,
  AdminPageHeader,
  AdminSelect,
  AdminSurface,
  AdminTextarea,
} from './AdminUi';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'identidad', label: 'Identidad'   },
  { id: 'hero',      label: 'Hero'        },
  { id: 'secciones', label: 'Secciones'   },
  { id: 'contacto',  label: 'Contacto'    },
  { id: 'seo',       label: 'SEO & Pagos' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  'Efectivo',
  'Transferencia bancaria',
  'MercadoPago',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'Rapipago',
  'PagoFácil',
];

const FONT_OPTIONS = [
  { value: 'inter',    label: 'Inter — moderna y limpia'         },
  { value: 'playfair', label: 'Playfair Display — elegante'      },
  { value: 'outfit',   label: 'Outfit — amigable y redondeada'   },
  { value: 'syne',     label: 'Syne — impactante y geométrica'   },
  { value: 'dm-sans',  label: 'DM Sans — profesional y legible'  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminConfig({ tenantId }: { tenantId: string }) {
  const { tenantMeta } = useTenant();
  const { config, saveConfig } = useTenantBusinessConfig(tenantId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('identidad');
  const [saving, setSaving]       = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [savedMsg, setSavedMsg]   = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return;
    const targetTab = TABS.find((tab) => tab.id === tabParam)?.id;
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tabId);
    setSearchParams(nextParams, { replace: true });
  };

  const [form, setForm] = useState({
    // Identidad
    businessName:          '',
    logoUrl:               '',
    primaryColor:          '#FF3B00',
    accentColor:           '#FF3B00',
    fontFamily:            'inter',
    // Hero
    heroTitle:             '',
    heroSubtitle:          '',
    heroCTALabel:          '',
    heroSecondaryCTALabel: '',
    // Secciones
    bannerText:            '',
    aboutTitle:            '',
    aboutText:             '',
    productsSectionTitle:  '',
    productsSectionSubtitle: '',
    footerTagline:         '',
    // Contacto
    whatsappNumber:        '',
    email:                 '',
    address:               '',
    scheduleText:          '',
    instagramUrl:          '',
    facebookUrl:           '',
    whatsappBubbleColor:   'green',
    // SEO & Pagos
    seoTitle:              '',
    seoDescription:        '',
    paymentMethods:        [] as string[],
  });

  useEffect(() => {
    const sc = tenantMeta?.siteConfig;
    const th = tenantMeta?.theme;
    setForm({
      businessName:          config?.businessName          || tenantMeta?.businessName   || '',
      logoUrl:               config?.logoUrl               || sc?.logoUrl                || '',
      primaryColor:          th?.primaryColor              || '#FF3B00',
      accentColor:           th?.accentColor               || th?.primaryColor           || '#FF3B00',
      fontFamily:            sc?.fontFamily                || 'inter',
      heroTitle:             sc?.heroTitle                 || '',
      heroSubtitle:          sc?.heroSubtitle              || '',
      heroCTALabel:          sc?.heroCTALabel              || '',
      heroSecondaryCTALabel: sc?.heroSecondaryCTALabel     || '',
      bannerText:            sc?.bannerText                || '',
      aboutTitle:            sc?.aboutTitle                || '',
      aboutText:             sc?.aboutText                 || '',
      productsSectionTitle:  sc?.productsSectionTitle      || '',
      productsSectionSubtitle: sc?.productsSectionSubtitle || '',
      footerTagline:         sc?.footerTagline             || '',
      whatsappNumber:        config?.whatsappNumber        || sc?.whatsappNumber         || '',
      email:                 config?.businessEmail         || sc?.email                  || '',
      address:               config?.businessAddress       || sc?.address                || '',
      scheduleText:          sc?.scheduleText              || '',
      instagramUrl:          config?.instagramUrl          || sc?.instagramUrl           || '',
      facebookUrl:           config?.facebookUrl           || sc?.facebookUrl            || '',
      whatsappBubbleColor:   sc?.whatsappBubbleColor       || 'green',
      seoTitle:              sc?.seoTitle                  || '',
      seoDescription:        sc?.seoDescription            || '',
      paymentMethods:        sc?.paymentMethods            || [],
    });
  }, [config, tenantMeta]);

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value } as typeof form));

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const storageRef = ref(storage, `tenants/${tenantId}/logo-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      set('logoUrl', url);
    } finally {
      setLogoUploading(false);
    }
  };

  const togglePayment = (method: string) => {
    setForm((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(method)
        ? f.paymentMethods.filter((m) => m !== method)
        : [...f.paymentMethods, method],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      await saveConfig({
        businessName:    form.businessName,
        businessEmail:   form.email,
        businessAddress: form.address,
        whatsappNumber:  form.whatsappNumber,
        logoUrl:         form.logoUrl,
        instagramUrl:    form.instagramUrl,
        facebookUrl:     form.facebookUrl,
      });

      await setDoc(
        doc(db, 'tenants', tenantId),
        {
          businessName: form.businessName,
          theme: {
            primaryColor: form.primaryColor,
            primaryHover: form.primaryColor,
            accentColor:  form.accentColor,
            mode: 'light',
          },
          siteConfig: {
            ...(tenantMeta?.siteConfig || {}),
            logoUrl:               form.logoUrl,
            fontFamily:            form.fontFamily,
            heroTitle:             form.heroTitle,
            heroSubtitle:          form.heroSubtitle,
            heroCTALabel:          form.heroCTALabel,
            heroSecondaryCTALabel: form.heroSecondaryCTALabel,
            bannerText:            form.bannerText,
            aboutTitle:            form.aboutTitle,
            aboutText:             form.aboutText,
            productsSectionTitle:  form.productsSectionTitle,
            productsSectionSubtitle: form.productsSectionSubtitle,
            footerTagline:         form.footerTagline,
            whatsappNumber:        form.whatsappNumber,
            address:               form.address,
            email:                 form.email,
            scheduleText:          form.scheduleText,
            instagramUrl:          form.instagramUrl,
            facebookUrl:           form.facebookUrl,
            whatsappBubbleColor:   form.whatsappBubbleColor,
            seoTitle:              form.seoTitle,
            seoDescription:        form.seoDescription,
            paymentMethods:        form.paymentMethods,
          },
        },
        { merge: true },
      );

      setSavedMsg('Cambios guardados correctamente');
      setTimeout(() => setSavedMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const tabBtn = (id: TabId): CSSProperties => ({
    padding: '11px 20px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.38)',
    borderBottom: activeTab === id
      ? '2px solid var(--tk-primary, #FF3B00)'
      : '2px solid transparent',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Tienda"
        title="Configuración"
        description="Personaliza la identidad, textos, colores y todos los detalles de tu tienda."
        actions={
          <AdminButton onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </AdminButton>
        }
      />

      {savedMsg ? <AdminMessage kind="success">{savedMsg}</AdminMessage> : null}

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 24,
        overflowX: 'auto',
      }}>
        {TABS.map((tab) => (
          <button key={tab.id} style={tabBtn(tab.id)} onClick={() => handleTabChange(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Identidad ─────────────────────────────────────── */}
      {activeTab === 'identidad' && (
        <div className="demo-admin-grid columns-sidebar">
          <AdminSurface padding="pad-md">
            <div className="demo-admin-grid">
              <AdminField label="Nombre del negocio">
                <AdminInput
                  value={form.businessName}
                  onChange={(e) => set('businessName', e.target.value)}
                  placeholder="Ej: Tienda Moda Norte"
                />
              </AdminField>

              <div className="demo-admin-inline-grid">
                <AdminField label="Color primario (botones, links)">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => set('primaryColor', e.target.value)}
                      style={{ width: 48, height: 38, border: '1px solid rgba(255,255,255,0.12)', background: 'none', cursor: 'pointer', padding: 2, borderRadius: 0 }}
                    />
                    <AdminInput
                      value={form.primaryColor}
                      onChange={(e) => set('primaryColor', e.target.value)}
                      maxLength={7}
                      placeholder="#FF3B00"
                    />
                  </div>
                </AdminField>
                <AdminField label="Color de acento (badges, etiquetas)">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) => set('accentColor', e.target.value)}
                      style={{ width: 48, height: 38, border: '1px solid rgba(255,255,255,0.12)', background: 'none', cursor: 'pointer', padding: 2, borderRadius: 0 }}
                    />
                    <AdminInput
                      value={form.accentColor}
                      onChange={(e) => set('accentColor', e.target.value)}
                      maxLength={7}
                      placeholder="#22C55E"
                    />
                  </div>
                </AdminField>
              </div>

              <AdminField label="Tipografia de la tienda">
                <AdminSelect
                  value={form.fontFamily}
                  onChange={(e) => set('fontFamily', e.target.value)}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </AdminSelect>
              </AdminField>

              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                La tipografia se aplica a toda la tienda publica en tiempo real al guardar.
              </p>
            </div>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow">Logo</p>
            <h2 className="demo-admin-page-title" style={{ fontSize: 20, marginBottom: 16 }}>
              Imagen de marca
            </h2>
            {form.logoUrl ? (
              <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={form.logoUrl} alt="Logo preview" style={{ maxHeight: 80, objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{
                marginBottom: 16, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.28)', fontSize: 12, fontFamily: 'monospace',
              }}>
                Sin logo
              </div>
            )}
            <AdminField label="URL del logo">
              <AdminInput
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://..."
              />
            </AdminField>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <AdminButton variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}>
                {logoUploading ? 'Subiendo...' : 'Subir archivo'}
              </AdminButton>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
            </div>
          </AdminSurface>
        </div>
      )}

      {/* ─── Tab: Hero ──────────────────────────────────────────── */}
      {activeTab === 'hero' && (
        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow" style={{ marginBottom: 16 }}>Sección principal</p>
          <div className="demo-admin-grid">
            <AdminField label="Título principal">
              <AdminInput
                value={form.heroTitle}
                onChange={(e) => set('heroTitle', e.target.value)}
                placeholder="Ej: Moda para cada ocasion"
              />
            </AdminField>

            <AdminField label="Subtítulo / descripción breve">
              <AdminTextarea
                value={form.heroSubtitle}
                onChange={(e) => set('heroSubtitle', e.target.value)}
                rows={3}
                placeholder="Ej: Encontrá lo que buscás con envío a todo el país"
              />
            </AdminField>

            <div className="demo-admin-inline-grid">
              <AdminField label="Texto del botón principal">
                <AdminInput
                  value={form.heroCTALabel}
                  onChange={(e) => set('heroCTALabel', e.target.value)}
                  placeholder="Ej: Ver colección"
                />
              </AdminField>
              <AdminField label="Texto del botón secundario">
                <AdminInput
                  value={form.heroSecondaryCTALabel}
                  onChange={(e) => set('heroSecondaryCTALabel', e.target.value)}
                  placeholder="Ej: Consultar por WhatsApp"
                />
              </AdminField>
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Las imágenes del slider hero se configuran desde{' '}
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Landing</strong> en el menú lateral.
            </div>
          </div>
        </AdminSurface>
      )}

      {/* ─── Tab: Secciones ─────────────────────────────────────── */}
      {activeTab === 'secciones' && (
        <div className="demo-admin-grid">
          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow" style={{ marginBottom: 14 }}>Barra de anuncio</p>
            <AdminField label="Texto del banner superior (dejar vacío para ocultar)">
              <AdminInput
                value={form.bannerText}
                onChange={(e) => set('bannerText', e.target.value)}
                placeholder="Ej: Envío gratis en compras mayores a $50.000"
              />
            </AdminField>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow" style={{ marginBottom: 14 }}>Sección Nosotros</p>
            <div className="demo-admin-grid">
              <AdminField label="Título">
                <AdminInput
                  value={form.aboutTitle}
                  onChange={(e) => set('aboutTitle', e.target.value)}
                  placeholder="Ej: Quiénes somos"
                />
              </AdminField>
              <AdminField label="Texto descriptivo">
                <AdminTextarea
                  value={form.aboutText}
                  onChange={(e) => set('aboutText', e.target.value)}
                  rows={4}
                  placeholder="Contanos la historia de tu negocio..."
                />
              </AdminField>
            </div>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow" style={{ marginBottom: 14 }}>Grilla de productos</p>
            <div className="demo-admin-inline-grid">
              <AdminField label="Título de la sección">
                <AdminInput
                  value={form.productsSectionTitle}
                  onChange={(e) => set('productsSectionTitle', e.target.value)}
                  placeholder="Ej: Nuestros productos"
                />
              </AdminField>
              <AdminField label="Subtítulo">
                <AdminInput
                  value={form.productsSectionSubtitle}
                  onChange={(e) => set('productsSectionSubtitle', e.target.value)}
                  placeholder="Ej: Los más vendidos de la semana"
                />
              </AdminField>
            </div>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow" style={{ marginBottom: 14 }}>Footer</p>
            <AdminField label="Tagline / frase del negocio">
              <AdminInput
                value={form.footerTagline}
                onChange={(e) => set('footerTagline', e.target.value)}
                placeholder="Ej: Tu estilo, a tu manera."
              />
            </AdminField>
          </AdminSurface>
        </div>
      )}

      {/* ─── Tab: Contacto ──────────────────────────────────────── */}
      {activeTab === 'contacto' && (
        <div className="demo-admin-grid columns-sidebar">
          <AdminSurface padding="pad-md">
            <div className="demo-admin-grid">
              <div className="demo-admin-inline-grid">
                <AdminField label="WhatsApp (con código país)">
                  <AdminInput
                    value={form.whatsappNumber}
                    onChange={(e) => set('whatsappNumber', e.target.value)}
                    placeholder="Ej: 5491112345678"
                  />
                </AdminField>
                <AdminField label="Email de contacto">
                  <AdminInput
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="contacto@mitienda.com"
                  />
                </AdminField>
              </div>
              <AdminField label="Dirección física">
                <AdminInput
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
                />
              </AdminField>
              <AdminField label="Horario de atención">
                <AdminInput
                  value={form.scheduleText}
                  onChange={(e) => set('scheduleText', e.target.value)}
                  placeholder="Ej: Lun a Vie 9 - 18hs / Sab 10 - 14hs"
                />
              </AdminField>
              <AdminField label="Color del botón de WhatsApp">
                <AdminSelect
                  value={form.whatsappBubbleColor}
                  onChange={(e) => set('whatsappBubbleColor', e.target.value)}
                >
                  <option value="green">Verde WhatsApp (#25D366)</option>
                  <option value="primary">Color primario de la tienda</option>
                  <option value="dark">Negro</option>
                </AdminSelect>
              </AdminField>
            </div>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow">Redes sociales</p>
            <h2 className="demo-admin-page-title" style={{ fontSize: 20, marginBottom: 16 }}>
              Links sociales
            </h2>
            <div className="demo-admin-grid">
              <AdminField label="Instagram (URL completa)">
                <AdminInput
                  value={form.instagramUrl}
                  onChange={(e) => set('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/mitienda"
                />
              </AdminField>
              <AdminField label="Facebook (URL completa)">
                <AdminInput
                  value={form.facebookUrl}
                  onChange={(e) => set('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/mitienda"
                />
              </AdminField>
            </div>
          </AdminSurface>
        </div>
      )}

      {/* ─── Tab: SEO & Pagos ───────────────────────────────────── */}
      {activeTab === 'seo' && (
        <div className="demo-admin-grid columns-sidebar">
          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow" style={{ marginBottom: 14 }}>SEO</p>
            <div className="demo-admin-grid">
              <AdminField label="Título de página (meta title)">
                <AdminInput
                  value={form.seoTitle}
                  onChange={(e) => set('seoTitle', e.target.value)}
                  placeholder="Ej: Tienda Moda Norte | Ropa y accesorios"
                  maxLength={70}
                />
              </AdminField>
              <AdminField label="Descripción para Google (meta description)">
                <AdminTextarea
                  value={form.seoDescription}
                  onChange={(e) => set('seoDescription', e.target.value)}
                  rows={3}
                  maxLength={160}
                  placeholder="Breve descripción de tu negocio para motores de búsqueda..."
                />
              </AdminField>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                {form.seoDescription.length}/160 caracteres
              </p>
            </div>
          </AdminSurface>

          <AdminSurface padding="pad-md">
            <p className="demo-admin-page-eyebrow">Pagos</p>
            <h2 className="demo-admin-page-title" style={{ fontSize: 20, marginBottom: 16 }}>
              Métodos aceptados
            </h2>
            <div className="demo-admin-grid">
              {PAYMENT_OPTIONS.map((method) => (
                <label
                  key={method}
                  className="demo-admin-list-item"
                  style={{ alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 13 }}>{method}</span>
                  <input
                    type="checkbox"
                    checked={form.paymentMethods.includes(method)}
                    onChange={() => togglePayment(method)}
                  />
                </label>
              ))}
            </div>
          </AdminSurface>
        </div>
      )}
    </div>
  );
}
