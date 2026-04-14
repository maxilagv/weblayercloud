import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from '../../lib/firebase';
import app from '../../lib/firebase';

const functions = getFunctions(app, 'us-central1');

interface TenantEntry {
  tenantId:        string;
  businessName:    string;
  businessType:    string;
  ownerEmail:      string;
  ownerName:       string;
  trialActive:     boolean;
  convertedToPaid: boolean;
  createdAt:       Timestamp;
  trialEndsAt:     Timestamp;
  lastActiveAt:    Timestamp | null;
  pageViewsCount:  number;
  loginCount:      number;
}

const STATUS_COLOR: Record<string, string> = {
  active:    '#22C55E',
  expired:   '#EF4444',
  converted: '#3B82F6',
};

function getStatus(t: TenantEntry) {
  if (t.convertedToPaid) return 'converted';
  if (t.trialActive)     return 'active';
  return 'expired';
}

function fmtDate(ts: Timestamp | null): string {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function fmtRelative(ts: Timestamp | null): string {
  if (!ts?.toDate) return '—';
  const diff = Date.now() - ts.toDate().getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 60)   return `hace ${min}m`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24)   return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: TenantEntry[]) {
  const header = ['tenantId','businessName','businessType','ownerName','ownerEmail','status','createdAt','trialEndsAt','lastActiveAt','pageViews','logins'];
  const lines  = rows.map(t => [
    t.tenantId, t.businessName, t.businessType, t.ownerName, t.ownerEmail,
    getStatus(t),
    fmtDate(t.createdAt), fmtDate(t.trialEndsAt), fmtDate(t.lastActiveAt),
    t.pageViewsCount ?? 0, t.loginCount ?? 0,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const blob = new Blob([header.join(',') + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `layercloud-tenants-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

const RUBROS = ['muebleria','indumentaria','electronica','ferreteria','libreria','veterinaria','farmacia','gastronomia','servicios','otro'];

export default function SuperAdminTenants() {
  const [tenants, setTenants]       = useState<TenantEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionMsg, setActionMsg]   = useState('');
  const [sortBy, setSortBy]         = useState<'createdAt' | 'lastActiveAt' | 'pageViewsCount'>('createdAt');

  // Filters
  const [filterRubro,  setFilterRubro]  = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'layercloud_tenants_index'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setTenants(snap.docs.map(d => d.data() as TenantEntry));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let rows = [...tenants];
    if (filterRubro)  rows = rows.filter(t => t.businessType === filterRubro);
    if (filterStatus) rows = rows.filter(t => getStatus(t) === filterStatus);
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      rows = rows.filter(t =>
        t.businessName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        t.tenantId.toLowerCase().includes(q)
      );
    }
    return rows.sort((a, b) => {
      if (sortBy === 'pageViewsCount') return (b.pageViewsCount ?? 0) - (a.pageViewsCount ?? 0);
      const ta = (sortBy === 'lastActiveAt' ? a.lastActiveAt : a.createdAt)?.toDate?.()?.getTime() ?? 0;
      const tb = (sortBy === 'lastActiveAt' ? b.lastActiveAt : b.createdAt)?.toDate?.()?.getTime() ?? 0;
      return tb - ta;
    });
  }, [tenants, filterRubro, filterStatus, filterSearch, sortBy]);

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 4000); };

  const doExtend = async (tenantId: string, days: number) => {
    try {
      await httpsCallable(functions, 'extendTrial')({ tenantId, extraDays: days });
      flash(`✓ +${days}d extendido: ${tenantId}`);
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const doRevoke = async (tenantId: string) => {
    if (!confirm(`¿Revocar acceso de ${tenantId}?`)) return;
    try {
      await httpsCallable(functions, 'revokeTrial')({ tenantId });
      flash(`✓ Revocado: ${tenantId}`);
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const doConvert = async (tenantId: string) => {
    try {
      await httpsCallable(functions, 'markConverted')({ tenantId });
      flash(`✓ Marcado como convertido: ${tenantId}`);
    } catch (e: any) { flash(`✗ ${e.message}`); }
  };

  const selStyle: React.CSSProperties = {
    background: '#111', border: '1px solid #2A2A2A', color: 'rgba(255,255,255,0.6)',
    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.06em',
    padding: '7px 12px', cursor: 'pointer',
  };
  const inputStyle: React.CSSProperties = {
    background: '#111', border: '1px solid #2A2A2A', color: '#FAFAFA',
    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.04em',
    padding: '7px 14px', outline: 'none', width: 220,
  };

  return (
    <div>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF3B00', marginBottom: 6 }}>
        // Clientes
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', lineHeight: 1 }}>
          Tenants
          <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.25)', marginLeft: 12 }}>
            {loading ? '' : `${filtered.length} / ${tenants.length}`}
          </span>
        </h1>
        <button
          onClick={() => exportCsv(filtered)}
          style={{ ...selStyle, color: '#22C55E', borderColor: '#1a3a1a', padding: '8px 16px' }}
        >
          ↓ Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          style={inputStyle}
          placeholder="Buscar nombre, email, ID..."
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
        />
        <select style={selStyle} value={filterRubro} onChange={e => setFilterRubro(e.target.value)}>
          <option value="">Todos los rubros</option>
          {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select style={selStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="expired">Vencidos</option>
          <option value="converted">Convertidos</option>
        </select>
        <select style={selStyle} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="createdAt">↓ Más recientes</option>
          <option value="lastActiveAt">↓ Más activos</option>
          <option value="pageViewsCount">↓ Más visitas</option>
        </select>
        {(filterRubro || filterStatus || filterSearch) && (
          <button
            onClick={() => { setFilterRubro(''); setFilterStatus(''); setFilterSearch(''); }}
            style={{ ...selStyle, color: '#EF4444', borderColor: '#3a1a1a' }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Flash */}
      {actionMsg && (
        <div style={{ background: '#111', border: '1px solid #333', padding: '10px 18px', marginBottom: 16, fontFamily: 'monospace', fontSize: 11, color: '#FAFAFA' }}>
          {actionMsg}
        </div>
      )}

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E1E1E' }}>
              {['Negocio','Rubro','Email','Estado','Registrado','Vence','Última act.','Vistas','Acciones'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', fontWeight: 400, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const status = getStatus(t);
              return (
                <tr key={t.tenantId} style={{ borderBottom: '1px solid #141414' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <a href={`/layercloud-admin/tenants/${t.tenantId}`} style={{ color: '#FAFAFA', textDecoration: 'none', fontWeight: 600, fontFamily: 'sans-serif', fontSize: 13 }}>
                      {t.businessName}
                    </a>
                    <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2, letterSpacing: '0.04em' }}>
                      {t.tenantId}
                    </p>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid #2A2A2A', padding: '3px 8px', color: 'rgba(255,255,255,0.4)' }}>
                      {t.businessType}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    {t.ownerEmail}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLOR[status] }}>
                      ● {status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {fmtDate(t.createdAt)}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {fmtDate(t.trialEndsAt)}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {fmtRelative(t.lastActiveAt)}
                  </td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
                    {t.pageViewsCount ?? 0}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <a href="https://motor.cloud/dashboard" target="_blank" rel="noreferrer"
                        style={{ fontFamily: 'monospace', fontSize: 10, color: '#3B82F6', textDecoration: 'none', border: '1px solid #1d3a6b', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        Dashboard
                      </a>
                      <a href={`/layercloud-admin/tenants/${t.tenantId}`}
                        style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', border: '1px solid #2A2A2A', padding: '4px 8px', whiteSpace: 'nowrap' }}>
                        Detalle
                      </a>
                      <button onClick={() => doExtend(t.tenantId, 7)}
                        style={{ fontFamily: 'monospace', fontSize: 10, background: 'none', border: '1px solid #1a3a1a', color: '#22C55E', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        +7d
                      </button>
                      {!t.convertedToPaid && (
                        <button onClick={() => doConvert(t.tenantId)}
                          style={{ fontFamily: 'monospace', fontSize: 10, background: 'none', border: '1px solid #1d3a6b', color: '#3B82F6', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Convertido
                        </button>
                      )}
                      {t.trialActive && (
                        <button onClick={() => doRevoke(t.tenantId)}
                          style={{ fontFamily: 'monospace', fontSize: 10, background: 'none', border: '1px solid #3a1a1a', color: '#EF4444', padding: '4px 8px', cursor: 'pointer' }}>
                          Revocar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '48px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {tenants.length === 0 ? 'Sin tenants registrados aún' : 'Sin resultados para los filtros aplicados'}
          </p>
        )}
      </div>
    </div>
  );
}
