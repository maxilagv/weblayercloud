import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface LayerCloudConfig {
  trialDurationDays: number;
  welcomeMessages:   Record<string, string>;
}

const DEFAULT_MESSAGES: Record<string, string> = {
  muebleria:    'Tu demo de mueblería está lista. Explorá catálogos, pedidos y stock.',
  indumentaria: 'Tu tienda de ropa está activa. Cargá tallas, colores y descuentos.',
  electronica:  'Tu tienda de electrónica está lista. Administrá garantías y stock.',
  ferreteria:   'Tu ferretería digital está activa. Gestioná precios y proveedores.',
  libreria:     'Tu librería/papelería online está lista. Empezá a vender hoy.',
  veterinaria:  'Tu veterinaria/pet shop está activa. Gestioná turnos y productos.',
  farmacia:     'Tu farmacia online está lista. Controlá stock y vencimientos.',
  gastronomia:  'Tu negocio gastronómico está activo. Administrá menú y pedidos.',
  servicios:    'Tu negocio de servicios está listo. Coordiná clientes y agenda.',
  otro:         'Tu demo personalizada está activa. Configurá tu tienda a medida.',
};

const RUBROS = Object.keys(DEFAULT_MESSAGES);

export default function SuperAdminConfig() {
  const [config, setConfig]   = useState<LayerCloudConfig | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [days, setDays]       = useState(7);
  const [messages, setMessages] = useState<Record<string, string>>(DEFAULT_MESSAGES);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'layercloud_config', 'settings'), snap => {
      if (snap.exists()) {
        const data = snap.data() as LayerCloudConfig;
        setConfig(data);
        setDays(data.trialDurationDays ?? 7);
        setMessages({ ...DEFAULT_MESSAGES, ...(data.welcomeMessages ?? {}) });
      }
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'layercloud_config', 'settings'), {
        trialDurationDays: days,
        welcomeMessages:   messages,
        updatedAt:         new Date(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#0A0A0A', border: '1px solid #2A2A2A', color: '#FAFAFA',
    fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.02em',
    padding: '9px 12px', outline: 'none', resize: 'none' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
    marginBottom: 8, display: 'block',
  };

  return (
    <div>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: 6 }}>
        // Configuración
      </p>
      <h1 style={{ fontFamily: 'sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', marginBottom: 28, lineHeight: 1 }}>
        Config LayerCloud
      </h1>

      {/* Duración del trial */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px', marginBottom: 20 }}>
        <p style={{ ...labelStyle, marginBottom: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Trial
        </p>
        <label style={labelStyle}>Duración del trial (días)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="number" min={1} max={365} value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{ ...inputStyle, width: 100 }}
          />
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            días — se aplica a nuevos registros (los existentes no cambian)
          </p>
        </div>
      </div>

      {/* Mensajes de bienvenida por rubro */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px', marginBottom: 24 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          Mensajes de bienvenida por rubro
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {RUBROS.map(rubro => (
            <div key={rubro}>
              <label style={labelStyle}>{rubro}</label>
              <textarea
                rows={2}
                value={messages[rubro] ?? ''}
                onChange={e => setMessages(m => ({ ...m, [rubro]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Admins */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px', marginBottom: 24 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
          Administradores de LayerCloud
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          Para agregar o quitar super admins, asignar el custom claim <code style={{ color: '#FF3B00' }}>role: "layercloud_superadmin"</code> via Firebase Admin SDK o Firebase Console → Authentication → Custom Claims.
        </p>
      </div>

      {/* Guardar */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.08em',
          background: saving ? '#1A1A1A' : '#FF3B00',
          border: 'none', color: '#FAFAFA',
          padding: '12px 28px', cursor: saving ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar configuración →'}
      </button>
    </div>
  );
}
