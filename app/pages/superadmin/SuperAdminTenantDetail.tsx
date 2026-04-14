import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, limit, Timestamp, setDoc } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from '../../lib/firebase';
import app from '../../lib/firebase';
import { getCountFromServer } from 'firebase/firestore';
import type { TenantMeta } from '../../context/TenantContext';

const functions = getFunctions(app, 'us-central1');

interface Session {
  id:        string;
  event:     string;
  path:      string;
  timestamp: Timestamp;
  userAgent: string | null;
}

type DateLike = { toDate(): Date } | null;

function fmtDatetime(ts: DateLike): string {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString('es-AR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function fmtDate(ts: DateLike): string {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year: 'numeric' });
}

const EVENT_COLOR: Record<string, string> = {
  login:              '#F59E0B',
  page_view:          'rgba(255,255,255,0.25)',
  product_edit:       '#3B82F6',
  product_create:     '#22C55E',
  order_view:         '#8B5CF6',
  order_status_change:'#EC4899',
  stock_edit:         '#14B8A6',
  config_save:        '#F97316',
  finance_view:       '#6366F1',
};

function EventBadge({ event }: { event: string }) {
  const color = EVENT_COLOR[event] ?? 'rgba(255,255,255,0.3)';
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.08em',
      textTransform: 'uppercase', border: `1px solid ${color}`,
      padding: '2px 7px', color,
    }}>
      {event.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuperAdminTenantDetail() {
  const { tenantId }   = useParams<{ tenantId: string }>();
  const navigate       = useNavigate();
  const [meta, setMeta]         = useState<TenantMeta | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [counts, setCounts]     = useState({ products: 0, orders: 0, categories: 0 });
  const [loading, setLoading]   = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [extraDays, setExtraDays] = useState(7);

  useEffect(() => {
    if (!tenantId) return;

    // Meta doc
    const unsubMeta = onSnapshot(doc(db, 'tenants', tenantId), snap => {
      setMeta(snap.exists() ? snap.data() as TenantMeta : null);
      setLoading(false);
    });

    // Sessions (últimas 50)
    const q = query(
      collection(db, 'layercloud_sessions'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubSessions = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session)));
    });

    // Counts
    Promise.all([
      getCountFromServer(collection(db, 'tenants', tenantId, 'products')),
      getCountFromServer(collection(db, 'tenants', tenantId, 'orders')),
      getCountFromServer(collection(db, 'tenants', tenantId, 'categories')),
    ]).then(([p, o, c]) => setCounts({
      products: p.data().count, orders: o.data().count, categories: c.data().count,
    })).catch(() => {});

    return () => { unsubMeta(); unsubSessions(); };
  }, [tenantId]);

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 5000); };

  const doExtend = async () => {
    try {
      await httpsCallable(functions, 'extendTrial')({ tenantId, extraDays });
      flash(`✓ Trial extendido +${extraDays} días`);
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const doRevoke = async () => {
    if (!confirm('¿Revocar acceso inmediato?')) return;
    try {
      await httpsCallable(functions, 'revokeTrial')({ tenantId });
      flash('✓ Acceso revocado');
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const doConvert = async () => {
    try {
      await httpsCallable(functions, 'markConverted')({ tenantId });
      flash('✓ Marcado como convertido a pago');
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const toggleBranding = async () => {
    try {
      const next = !meta?.hideDemoBranding;
      await setDoc(doc(db, 'tenants', tenantId!), { hideDemoBranding: next }, { merge: true });
      flash(next ? '✓ Branding oculto para este tenant' : '✓ Branding visible activado');
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  // Top páginas visitadas
  const pageCounts: Record<string, number> = {};
  sessions.filter(s => s.event === 'page_view').forEach(s => {
    pageCounts[s.path] = (pageCounts[s.path] ?? 0) + 1;
  });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (loading) return (
    <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '48px 0' }}>
      Cargando...
    </div>
  );

  if (!meta) return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Tenant no encontrado</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 16, fontFamily: 'monospace', fontSize: 11, background: 'none', border: '1px solid #2A2A2A', color: 'rgba(255,255,255,0.4)', padding: '8px 16px', cursor: 'pointer' }}>
        ← Volver
      </button>
    </div>
  );

  const daysLeft = Math.max(0, Math.ceil(
    (meta.trialEndsAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const cardStyle: React.CSSProperties = { background: '#111', border: '1px solid #1E1E1E', padding: '20px 24px' };
  const labelStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 };

  return (
    <div>
      {/* Breadcrumb */}
      <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: 20 }}>
        <a href="/layercloud-admin/tenants" style={{ color: '#FF3B00', textDecoration: 'none' }}>Tenants</a>
        {' / '}{tenantId}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', lineHeight: 1, marginBottom: 4 }}>
            {meta.businessName}
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
            {meta.ownerName} · {meta.ownerEmail} · {meta.businessType.toUpperCase()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <a href="https://motor.cloud/dashboard" target="_blank" rel="noreferrer"
            style={{ fontFamily: 'monospace', fontSize: 11, color: '#3B82F6', textDecoration: 'none', border: '1px solid #1d3a6b', padding: '8px 14px', whiteSpace: 'nowrap' }}>
            Abrir dashboard ↗
          </a>
          <a href="https://motor.cloud/login" target="_blank" rel="noreferrer"
            style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', border: '1px solid #2A2A2A', padding: '8px 14px', whiteSpace: 'nowrap' }}>
            Abrir login ↗
          </a>
        </div>
      </div>

      {/* Flash */}
      {actionMsg && (
        <div style={{ background: '#111', border: '1px solid #333', padding: '10px 18px', marginBottom: 20, fontFamily: 'monospace', fontSize: 11, color: '#FAFAFA' }}>
          {actionMsg}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Plan',       value: meta.plan.toUpperCase(), color: meta.trialActive ? '#22C55E' : '#EF4444' },
          { label: 'Días rest.',  value: meta.trialActive ? `${daysLeft}d` : '—', color: daysLeft <= 1 ? '#EF4444' : '#FAFAFA' },
          { label: 'Productos',  value: counts.products  },
          { label: 'Pedidos',    value: counts.orders    },
          { label: 'Categorías', value: counts.categories },
          { label: 'Page views', value: sessions.filter(s => s.event === 'page_view').length, color: '#22C55E' },
          { label: 'Logins',     value: sessions.filter(s => s.event === 'login').length, color: '#F59E0B' },
        ].map(({ label, value, color = '#FAFAFA' }) => (
          <div key={label} style={cardStyle}>
            <p style={labelStyle}>{label}</p>
            <p style={{ fontFamily: 'sans-serif', fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Info + Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Info */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Info del negocio</p>
          {[
            ['Tenant ID',      tenantId],
            ['Registrado',     fmtDate(meta.trialEndsAt)],
            ['Trial vence',    fmtDate(meta.trialEndsAt)],
            ['Teléfono',       meta.phone ?? '—'],
            ['Convertido',     meta.plan === 'paid' ? 'Sí' : 'No'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid #1A1A1A', paddingBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>{k}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#FAFAFA' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 16 }}>Acciones</p>
          <div style={{ marginBottom: 16 }}>
            <p style={labelStyle}>Extender trial</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number" min={1} max={90} value={extraDays}
                onChange={e => setExtraDays(Number(e.target.value))}
                style={{ width: 70, background: '#0A0A0A', border: '1px solid #2A2A2A', color: '#FAFAFA', fontFamily: 'monospace', fontSize: 13, padding: '7px 10px', outline: 'none' }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>días</span>
              <button onClick={doExtend}
                style={{ fontFamily: 'monospace', fontSize: 11, background: 'none', border: '1px solid #1a3a1a', color: '#22C55E', padding: '8px 16px', cursor: 'pointer' }}>
                Extender +{extraDays}d
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {meta.plan !== 'paid' && (
              <button onClick={doConvert}
                style={{ fontFamily: 'monospace', fontSize: 11, background: 'none', border: '1px solid #1d3a6b', color: '#3B82F6', padding: '9px 16px', cursor: 'pointer' }}>
                Marcar convertido →
              </button>
            )}
            {meta.trialActive && (
              <button onClick={doRevoke}
                style={{ fontFamily: 'monospace', fontSize: 11, background: 'none', border: '1px solid #3a1a1a', color: '#EF4444', padding: '9px 16px', cursor: 'pointer' }}>
                Revocar acceso ✕
              </button>
            )}
            <button onClick={toggleBranding}
              style={{ fontFamily: 'monospace', fontSize: 11, background: 'none', border: `1px solid ${meta.hideDemoBranding ? '#2a2a00' : '#1a2a1a'}`, color: meta.hideDemoBranding ? '#EAB308' : '#22C55E', padding: '9px 16px', cursor: 'pointer' }}>
              {meta.hideDemoBranding ? 'Mostrar branding ↺' : 'Ocultar branding ✓'}
            </button>
          </div>
        </div>

      </div>

      {/* Bottom: Páginas + Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

        {/* Top páginas */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 14 }}>Páginas más visitadas</p>
          {topPages.length === 0 && (
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Sin visitas registradas</p>
          )}
          {topPages.map(([path, count]) => (
            <div key={path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }} title={path}>
                {path}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#FF3B00', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline de sesiones */}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 14 }}>
            Actividad reciente
            <span style={{ color: 'rgba(255,255,255,0.15)', marginLeft: 8 }}>últimas {sessions.length}</span>
          </p>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {sessions.length === 0 && (
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Sin actividad registrada</p>
            )}
            {sessions.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #141414' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', minWidth: 80 }}>
                  {fmtDatetime(s.timestamp)}
                </span>
                <EventBadge event={s.event} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.path}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
