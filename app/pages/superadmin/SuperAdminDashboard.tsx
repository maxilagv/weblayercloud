import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface TenantEntry {
  tenantId:        string;
  businessName:    string;
  businessType:    string;
  ownerEmail:      string;
  trialActive:     boolean;
  convertedToPaid: boolean;
  createdAt:       Timestamp;
  lastActiveAt:    Timestamp | null;
  pageViewsCount:  number;
  loginCount:      number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function TimelineChart({ tenants }: { tenants: TenantEntry[] }) {
  const days = 21;
  const buckets: Record<string, number> = {};

  // Init all days to 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets[isoDate(startOfDay(d))] = 0;
  }

  tenants.forEach(t => {
    if (!t.createdAt?.toDate) return;
    const key = isoDate(startOfDay(t.createdAt.toDate()));
    if (key in buckets) buckets[key]++;
  });

  const entries   = Object.entries(buckets);
  const maxVal    = Math.max(...Object.values(buckets), 1);
  const chartH    = 80;
  const barW      = 10;
  const barGap    = 4;
  const totalW    = entries.length * (barW + barGap);

  return (
    <div>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
        Registros últimos {days} días
      </p>
      <svg width={totalW} height={chartH + 24} style={{ display: 'block', overflow: 'visible' }}>
        {entries.map(([date, count], i) => {
          const barH  = Math.max(count > 0 ? 4 : 0, Math.round((count / maxVal) * chartH));
          const x     = i * (barW + barGap);
          const y     = chartH - barH;
          const isToday = date === isoDate(startOfDay(new Date()));
          return (
            <g key={date}>
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={isToday ? '#FF3B00' : count > 0 ? '#FF3B0066' : '#1E1E1E'}
                rx={2}
              />
              {(i % 7 === 0 || isToday) && (
                <text
                  x={x + barW / 2} y={chartH + 16}
                  textAnchor="middle"
                  fontSize={8} fill="rgba(255,255,255,0.2)"
                  fontFamily="monospace"
                >
                  {date.slice(5)}
                </text>
              )}
              {count > 0 && (
                <text
                  x={x + barW / 2} y={y - 4}
                  textAnchor="middle"
                  fontSize={8} fill="rgba(255,255,255,0.5)"
                  fontFamily="monospace"
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────

function KPI({ label, value, color = '#FAFAFA', sub }: { label: string; value: number | string; color?: string; sub?: string }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '20px 24px' }}>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'sans-serif', fontSize: 38, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, letterSpacing: '0.08em' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<TenantEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'layercloud_tenants_index'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setTenants(snap.docs.map(d => d.data() as TenantEntry));
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);

  const countSince = (since: Date) =>
    tenants.filter(t => t.createdAt?.toDate?.() >= since).length;

  const active    = tenants.filter(t => t.trialActive && !t.convertedToPaid).length;
  const expired   = tenants.filter(t => !t.trialActive && !t.convertedToPaid).length;
  const converted = tenants.filter(t => t.convertedToPaid).length;
  const convRate  = tenants.length > 0 ? Math.round((converted / tenants.length) * 100) : 0;

  // Top rubros
  const rubros: Record<string, number> = {};
  tenants.forEach(t => { rubros[t.businessType] = (rubros[t.businessType] ?? 0) + 1; });
  const topRubros = Object.entries(rubros).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Más activos (por pageViews)
  const mostActive = [...tenants].sort((a, b) => (b.pageViewsCount ?? 0) - (a.pageViewsCount ?? 0)).slice(0, 5);

  const dash = loading ? '—' : '';

  return (
    <div>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: 6 }}>
        // Overview
      </p>
      <h1 style={{ fontFamily: 'sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', marginBottom: 28, lineHeight: 1 }}>
        Dashboard
      </h1>

      {/* KPIs principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <KPI label="Total tenants"    value={loading ? '—' : tenants.length} />
        <KPI label="Trials activos"   value={loading ? '—' : active}    color="#22C55E" />
        <KPI label="Vencidos sin conv" value={loading ? '—' : expired}  color="#EF4444" />
        <KPI label="Convertidos"      value={loading ? '—' : converted} color="#3B82F6" />
        <KPI label="Tasa conversión"  value={loading ? '—' : `${convRate}%`} color="#F59E0B" />
        <KPI label="Hoy"   value={loading ? '—' : countSince(startOfToday)} sub="registros hoy" />
        <KPI label="7 días" value={loading ? '—' : countSince(startOfWeek)}  sub="registros esta semana" />
        <KPI label="30 días" value={loading ? '—' : countSince(startOfMonth)} sub="registros este mes" />
      </div>

      {/* Timeline chart */}
      <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px', marginBottom: 28 }}>
        {loading ? (
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Cargando...</p>
        ) : (
          <TimelineChart tenants={tenants} />
        )}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Top rubros */}
        <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Top rubros
          </p>
          {topRubros.map(([rubro, count]) => (
            <div key={rubro} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)' }}>
                {rubro}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 80, height: 3, background: '#1E1E1E', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / (topRubros[0]?.[1] ?? 1)) * 100}%`, background: '#FF3B00' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#FF3B00', minWidth: 16, textAlign: 'right' }}>{count}</span>
              </div>
            </div>
          ))}
          {topRubros.length === 0 && <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Sin datos</p>}
        </div>

        {/* Más activos */}
        <div style={{ background: '#111', border: '1px solid #1E1E1E', padding: '24px 28px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Más activos (page views)
          </p>
          {mostActive.map(t => (
            <div key={t.tenantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <a href={`/layercloud-admin/tenants/${t.tenantId}`} style={{ fontFamily: 'sans-serif', fontSize: 12, fontWeight: 600, color: '#FAFAFA', textDecoration: 'none' }}>
                  {t.businessName}
                </a>
                <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t.businessType}
                </p>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#22C55E' }}>
                {t.pageViewsCount ?? 0}
              </span>
            </div>
          ))}
          {mostActive.length === 0 && <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>Sin datos</p>}
        </div>

      </div>
    </div>
  );
}
