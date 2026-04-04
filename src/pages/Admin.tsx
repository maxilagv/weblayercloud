import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import {
  browserSessionPersistence,
  getIdToken,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  ArrowLeft,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  FlaskConical,
  Globe,
  LayoutDashboard,
  LogOut,
  Monitor,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/LogoMark';
import { updateLeadStage, type LeadStage } from '../lib/crm';
import { auth, db } from '../lib/firebase';

// ── Types ────────────────────────────────────────────────────────────────────

type LeadCollectionName = 'chatSessions' | 'contactSubmissions';
type Tab = 'dashboard' | 'leads' | 'visitors' | 'experiments';
type PriorityFilter = 'all' | 'hot' | 'warm' | 'cold';

interface Visitor {
  id: string;
  path: string;
  timestamp?: Timestamp | null;
  userAgent: string;
  referrer: string;
  screen: string;
  attributionChannel?: string;
  firstAttributionChannel?: string;
  firstUtmCampaign?: string;
}

interface LeadDoc {
  id: string;
  source?: 'chatbot' | 'contact_form';
  pipelineStage?: LeadStage;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  topPain?: string;
  salesAngle?: string;
  leadScore?: number;
  attributionChannel?: string;
  firstAttributionChannel?: string;
  utmCampaign?: string;
  firstUtmCampaign?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  aiPriorityLevel?: 'cold' | 'warm' | 'hot';
  aiIntentScore?: number;
  aiUrgencyScore?: number;
  aiFitScore?: number;
  aiReadinessScore?: number;
  aiBuyerMotivation?: string;
  aiRecommendedOffer?: string;
  aiOfferToShowNow?: string;
  aiExecutiveSummary?: string;
  aiNextBestAction?: string;
  aiWhatToSayNow?: string;
  aiFollowUpWhatsApp?: string;
  aiFollowUpEmailSubject?: string;
  aiFollowUpEmailBody?: string;
  aiObjections?: string[];
  aiPainSummary?: string;
}

interface CombinedLead extends LeadDoc {
  collectionName: LeadCollectionName;
  sourceLabel: string;
}

interface ABVariantStat {
  variant: string;
  views: number;
  conversions: number;
  conversionRate: number;
}
interface ABTestResult {
  testId: string;
  variants: ABVariantStat[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

function parseDevice(ua: string) {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}
function parseBrowser(ua: string) {
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/edge/i.test(ua)) return 'Edge';
  return 'Other';
}
function fmtTime(ts?: Timestamp | null) {
  if (!ts) return '—';
  const d = ts.toDate();
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
function shorten(v?: string, max = 60) {
  if (!v) return '—';
  return v.length > max ? v.slice(0, max) + '…' : v;
}
function getLeadDate(l: LeadDoc) {
  return l.updatedAt ?? l.createdAt ?? null;
}
function getStageLabel(s?: LeadStage) {
  const map: Record<LeadStage, string> = {
    new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado',
    proposal: 'Propuesta', won: 'Ganado', lost: 'Perdido',
  };
  return s ? (map[s] ?? 'Nuevo') : 'Nuevo';
}
function priorityColor(p?: string) {
  if (p === 'hot') return '#FF3B00';
  if (p === 'warm') return '#F59E0B';
  return '#6B7280';
}
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => undefined);
}

// ── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#0A0A0A',
    color: '#FAFAFA',
    fontFamily: 'var(--font-sans)',
  } as React.CSSProperties,
  header: {
    padding: '16px 32px',
    borderBottom: '1px solid #1E1E1E',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    position: 'sticky' as const,
    top: 0,
    background: '#0A0A0A',
    zIndex: 40,
  } as React.CSSProperties,
  mono: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.06em',
  } as React.CSSProperties,
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#6B7280',
  } as React.CSSProperties,
  card: {
    background: '#111111',
    border: '1px solid #1E1E1E',
    borderRadius: '8px',
    padding: '20px 24px',
  } as React.CSSProperties,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {icon}
        <span style={S.label}>{label}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, lineHeight: 1, color: '#FAFAFA', letterSpacing: '-0.03em' }}>
        {value}
      </p>
      {sub && <p style={{ ...S.mono, color: '#6B7280', marginTop: '2px' }}>{sub}</p>}
    </div>
  );
}

function PriorityBadge({ level }: { level?: string }) {
  const label = level ? level.toUpperCase() : 'N/A';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.1em',
      fontWeight: 700,
      background: level === 'hot' ? 'rgba(255,59,0,0.15)' : level === 'warm' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
      color: priorityColor(level),
      border: `1px solid ${priorityColor(level)}33`,
    }}>
      {label}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={handleCopy}
      title={`Copiar ${label}`}
      style={{
        background: copied ? 'rgba(255,59,0,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${copied ? '#FF3B0044' : '#1E1E1E'}`,
        color: copied ? '#FF3B00' : '#6B7280',
        borderRadius: '4px',
        padding: '4px 10px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      <ClipboardCopy size={12} />
      {copied ? 'Copiado' : label}
    </button>
  );
}

function LeadCard({
  lead,
  savingKey,
  onStageChange,
}: {
  lead: CombinedLead;
  savingKey: string;
  onStageChange: (lead: CombinedLead, stage: LeadStage) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const key = `${lead.collectionName}_${lead.id}`;

  return (
    <div style={{
      ...S.card,
      padding: 0,
      overflow: 'hidden',
      borderColor: lead.aiPriorityLevel === 'hot' ? '#FF3B0033' : '#1E1E1E',
      transition: 'border-color 0.2s',
    }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          textAlign: 'left',
        }}
      >
        {/* Priority dot */}
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: priorityColor(lead.aiPriorityLevel),
          flexShrink: 0,
          boxShadow: lead.aiPriorityLevel === 'hot' ? '0 0 6px #FF3B00' : 'none',
        }} />

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#FAFAFA' }}>
              {lead.company || lead.name || 'Lead sin nombre'}
            </span>
            <PriorityBadge level={lead.aiPriorityLevel} />
            <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{lead.sourceLabel}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{lead.name || '—'}</span>
            {lead.email && <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{lead.email}</span>}
            {lead.phone && <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{lead.phone}</span>}
          </div>
        </div>

        {/* Scores */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'R', value: lead.aiReadinessScore, color: '#FF3B00' },
            { label: 'I', value: lead.aiIntentScore, color: '#F59E0B' },
            { label: 'U', value: lead.aiUrgencyScore, color: '#6B7280' },
          ].map(({ label, value, color }) => (
            <span key={label} style={{
              ...S.mono,
              fontSize: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1E1E1E',
              borderRadius: '4px',
              padding: '2px 6px',
              color,
            }}>
              {label}{value ?? '—'}
            </span>
          ))}
        </div>

        {/* Date + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px', whiteSpace: 'nowrap' }}>
            {fmtTime(getLeadDate(lead))}
          </span>
          {expanded
            ? <ChevronUp size={14} color="#6B7280" />
            : <ChevronDown size={14} color="#6B7280" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1E1E1E', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Stage + offer */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={S.label}>Etapa</p>
              <select
                value={lead.pipelineStage || 'new'}
                onChange={(e) => onStageChange(lead, e.target.value as LeadStage)}
                disabled={savingKey === key}
                style={{
                  marginTop: '6px',
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  color: '#FAFAFA',
                  padding: '6px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {STAGES.map((s) => <option key={s} value={s}>{getStageLabel(s)}</option>)}
              </select>
            </div>
            {lead.aiOfferToShowNow && (
              <div style={{ flex: 2, minWidth: 200 }}>
                <p style={S.label}>Oferta recomendada</p>
                <p style={{ marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#FF3B00', fontWeight: 600 }}>
                  {lead.aiOfferToShowNow}
                </p>
              </div>
            )}
            {lead.aiBuyerMotivation && (
              <div style={{ flex: 2, minWidth: 200 }}>
                <p style={S.label}>Motivación</p>
                <p style={{ marginTop: '6px', ...S.mono, color: '#FAFAFA' }}>{lead.aiBuyerMotivation}</p>
              </div>
            )}
          </div>

          {/* Pain summary */}
          {lead.aiPainSummary && (
            <div>
              <p style={S.label}>Dolor principal</p>
              <p style={{ marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.6, color: '#D1D5DB' }}>
                {lead.aiPainSummary}
              </p>
            </div>
          )}

          {/* What to say now */}
          {lead.aiWhatToSayNow && (
            <div style={{ background: 'rgba(255,59,0,0.05)', border: '1px solid rgba(255,59,0,0.15)', borderRadius: '6px', padding: '14px 16px' }}>
              <p style={{ ...S.label, color: '#FF3B00', marginBottom: '6px' }}>Qué decirle ahora</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.65, color: '#FAFAFA' }}>
                {lead.aiWhatToSayNow}
              </p>
            </div>
          )}

          {/* Follow-up assets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {lead.aiFollowUpWhatsApp && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={S.label}>WhatsApp listo</p>
                  <CopyButton text={lead.aiFollowUpWhatsApp} label="Copiar" />
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.6, color: '#9CA3AF' }}>
                  {shorten(lead.aiFollowUpWhatsApp, 200)}
                </p>
              </div>
            )}
            {lead.aiFollowUpEmailSubject && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1E1E1E', borderRadius: '6px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={S.label}>Email listo</p>
                  <CopyButton text={`${lead.aiFollowUpEmailSubject}\n\n${lead.aiFollowUpEmailBody ?? ''}`} label="Copiar" />
                </div>
                <p style={{ ...S.mono, color: '#FAFAFA', marginBottom: '4px' }}>{lead.aiFollowUpEmailSubject}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.6, color: '#9CA3AF' }}>
                  {shorten(lead.aiFollowUpEmailBody, 160)}
                </p>
              </div>
            )}
          </div>

          {/* Next action + objections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {lead.aiNextBestAction && (
              <div>
                <p style={S.label}>Siguiente acción</p>
                <p style={{ marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#D1D5DB', lineHeight: 1.5 }}>
                  {lead.aiNextBestAction}
                </p>
              </div>
            )}
            {lead.aiObjections && lead.aiObjections.length > 0 && (
              <div>
                <p style={S.label}>Objeciones detectadas</p>
                <ul style={{ marginTop: '6px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {lead.aiObjections.map((obj, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5 }}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Attribution */}
          {(lead.firstAttributionChannel || lead.attributionChannel) && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={S.label}>Canal</p>
                <p style={{ marginTop: '4px', ...S.mono, color: '#9CA3AF' }}>
                  {lead.firstAttributionChannel || lead.attributionChannel}
                </p>
              </div>
              {(lead.firstUtmCampaign || lead.utmCampaign) && (
                <div>
                  <p style={S.label}>Campaña</p>
                  <p style={{ marginTop: '4px', ...S.mono, color: '#9CA3AF' }}>
                    {lead.firstUtmCampaign || lead.utmCampaign}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard tab ─────────────────────────────────────────────────────────────

function DashboardTab({
  visitors,
  allLeads,
  visitorsLoading,
  leadsLoading,
}: {
  visitors: Visitor[];
  allLeads: CombinedLead[];
  visitorsLoading: boolean;
  leadsLoading: boolean;
}) {
  const hotLeads = allLeads.filter((l) => l.aiPriorityLevel === 'hot').length;
  const warmLeads = allLeads.filter((l) => l.aiPriorityLevel === 'warm').length;
  const wonLeads = allLeads.filter((l) => l.pipelineStage === 'won').length;
  const analyzedLeads = allLeads.filter((l) => l.aiOfferToShowNow || l.aiRecommendedOffer).length;
  const conversionRate = allLeads.length > 0 ? Math.round((wonLeads / allLeads.length) * 100) : 0;

  const channels = useMemo(() => {
    const map = new Map<string, { leads: number; hot: number; won: number }>();
    allLeads.forEach((l) => {
      const ch = l.firstAttributionChannel || l.attributionChannel || '—';
      const existing = map.get(ch) ?? { leads: 0, hot: 0, won: 0 };
      existing.leads += 1;
      if (l.aiPriorityLevel === 'hot') existing.hot += 1;
      if (l.pipelineStage === 'won') existing.won += 1;
      map.set(ch, existing);
    });
    return [...map.entries()]
      .sort((a, b) => b[1].leads - a[1].leads)
      .slice(0, 8);
  }, [allLeads]);

  const pathCounts: Record<string, number> = {};
  visitors.forEach((v) => { pathCounts[v.path] = (pathCounts[v.path] || 0) + 1; });
  const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const loading = visitorsLoading || leadsLoading;
  const dash = loading ? '—' : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <StatCard icon={<Users size={16} color="#6B7280" />} label="Visitas" value={dash ?? visitors.length} />
        <StatCard icon={<Zap size={16} color="#F59E0B" />} label="Leads" value={dash ?? allLeads.length} sub={`${analyzedLeads} con IA`} />
        <StatCard icon={<BrainCircuit size={16} color="#FF3B00" />} label="Hot leads" value={dash ?? hotLeads} sub={`${warmLeads} warm`} />
        <StatCard icon={<Target size={16} color="#FF3B00" />} label="Ganados" value={dash ?? wonLeads} />
        <StatCard icon={<TrendingUp size={16} color="#6B7280" />} label="Win rate" value={dash ?? `${conversionRate}%`} />
        <StatCard icon={<Globe size={16} color="#6B7280" />} label="Campañas" value={dash ?? new Set(allLeads.map((l) => l.firstUtmCampaign || l.utmCampaign).filter(Boolean)).size} />
        <StatCard icon={<Monitor size={16} color="#6B7280" />} label="Mobile" value={dash ?? visitors.filter((v) => parseDevice(v.userAgent) === 'Mobile').length} />
        <StatCard icon={<ShieldCheck size={16} color="#6B7280" />} label="Páginas únicas" value={dash ?? new Set(visitors.map((v) => v.path)).size} />
      </div>

      {/* Channels + top paths */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Channel ROI */}
        <div style={S.card}>
          <p style={{ ...S.label, marginBottom: '16px' }}>Canales que traen negocio</p>
          {leadsLoading ? (
            <p style={{ ...S.mono, color: '#6B7280' }}>Calculando…</p>
          ) : channels.length === 0 ? (
            <p style={{ ...S.mono, color: '#6B7280' }}>Sin leads con atribución aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {channels.map(([channel, stats]) => (
                <div key={channel} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...S.mono, color: '#FAFAFA', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {channel}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{stats.leads} leads</span>
                    {stats.hot > 0 && <span style={{ ...S.mono, color: '#FF3B00', fontSize: '10px' }}>{stats.hot} hot</span>}
                    {stats.won > 0 && <span style={{ ...S.mono, color: '#F59E0B', fontSize: '10px' }}>{stats.won} won</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div style={S.card}>
          <p style={{ ...S.label, marginBottom: '16px' }}>Páginas más visitadas</p>
          {visitorsLoading ? (
            <p style={{ ...S.mono, color: '#6B7280' }}>Cargando…</p>
          ) : topPaths.length === 0 ? (
            <p style={{ ...S.mono, color: '#6B7280' }}>Sin datos aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topPaths.map(([path, count]) => {
                const max = topPaths[0]?.[1] ?? 1;
                return (
                  <div key={path}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ ...S.mono, color: '#D1D5DB', fontSize: '11px' }}>{path || '/'}</span>
                      <span style={{ ...S.mono, color: '#FF3B00', fontSize: '11px' }}>{count}</span>
                    </div>
                    <div style={{ height: '2px', background: '#1E1E1E', borderRadius: '1px' }}>
                      <div style={{ height: '2px', background: '#FF3B00', borderRadius: '1px', width: `${(count / max) * 100}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Radar comercial — top hot leads */}
      {!leadsLoading && allLeads.filter((l) => l.aiPriorityLevel === 'hot').length > 0 && (
        <div style={S.card}>
          <p style={{ ...S.label, marginBottom: '16px', color: '#FF3B00' }}>🔥 Hot leads para actuar ahora</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {allLeads
              .filter((l) => l.aiPriorityLevel === 'hot')
              .slice(0, 4)
              .map((lead) => (
                <div key={lead.id} style={{ background: 'rgba(255,59,0,0.05)', border: '1px solid rgba(255,59,0,0.2)', borderRadius: '6px', padding: '14px 16px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#FAFAFA', marginBottom: '4px' }}>
                    {lead.company || lead.name || 'Lead'}
                  </p>
                  <p style={{ ...S.mono, color: '#FF3B00', fontSize: '10px', marginBottom: '8px' }}>
                    {lead.aiOfferToShowNow || '—'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.55, color: '#9CA3AF' }}>
                    {shorten(lead.aiWhatToSayNow || lead.aiPainSummary || '—', 100)}
                  </p>
                  {lead.aiFollowUpWhatsApp && (
                    <div style={{ marginTop: '10px' }}>
                      <CopyButton text={lead.aiFollowUpWhatsApp} label="Copiar WhatsApp" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Leads tab ─────────────────────────────────────────────────────────────────

function LeadsTab({
  allLeads,
  leadsLoading,
  savingStageKey,
  onStageChange,
}: {
  allLeads: CombinedLead[];
  leadsLoading: boolean;
  savingStageKey: string;
  onStageChange: (lead: CombinedLead, stage: LeadStage) => void;
}) {
  const [filter, setFilter] = useState<PriorityFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = allLeads;
    if (filter !== 'all') result = result.filter((l) => l.aiPriorityLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.company?.toLowerCase().includes(q) ||
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allLeads, filter, search]);

  const filterBtn = (label: string, value: PriorityFilter, color?: string) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      style={{
        background: filter === value ? (color ? `${color}22` : 'rgba(255,255,255,0.08)') : 'transparent',
        border: `1px solid ${filter === value ? (color ?? '#FAFAFA') + '44' : '#1E1E1E'}`,
        color: filter === value ? (color ?? '#FAFAFA') : '#6B7280',
        borderRadius: '6px',
        padding: '5px 12px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {filterBtn('Todos', 'all')}
        {filterBtn('🔥 Hot', 'hot', '#FF3B00')}
        {filterBtn('🟡 Warm', 'warm', '#F59E0B')}
        {filterBtn('Cold', 'cold')}
        <input
          type="text"
          placeholder="Buscar empresa, nombre, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto',
            background: '#111',
            border: '1px solid #1E1E1E',
            color: '#FAFAFA',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            width: 220,
          }}
        />
      </div>

      {/* Lead count */}
      <p style={{ ...S.mono, color: '#6B7280' }}>
        {leadsLoading ? 'Cargando…' : `${filtered.length} lead${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {/* Lead cards */}
      {leadsLoading ? (
        <div style={{ ...S.card, color: '#6B7280', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Cargando leads…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, color: '#6B7280', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Sin leads que coincidan.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((lead) => (
            <LeadCard
              key={`${lead.collectionName}-${lead.id}`}
              lead={lead}
              savingKey={savingStageKey}
              onStageChange={onStageChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Visitors tab ──────────────────────────────────────────────────────────────

function VisitorsTab({ visitors, loading }: { visitors: Visitor[]; loading: boolean }) {
  return (
    <div style={S.card}>
      <p style={{ ...S.label, marginBottom: '16px' }}>Visitantes recientes</p>
      {loading ? (
        <p style={{ ...S.mono, color: '#6B7280' }}>Cargando…</p>
      ) : visitors.length === 0 ? (
        <p style={{ ...S.mono, color: '#6B7280' }}>Sin visitas registradas.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr>
                {['Hora', 'Página', 'Dispositivo', 'Navegador', 'Canal', 'Campaña'].map((h) => (
                  <th key={h} style={{ ...S.label, textAlign: 'left', paddingBottom: '10px', paddingRight: '16px', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 40).map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #131313' }}>
                  <td style={{ padding: '8px 16px 8px 0', color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtTime(v.timestamp)}</td>
                  <td style={{ padding: '8px 16px 8px 0', color: '#D1D5DB' }}>{v.path || '/'}</td>
                  <td style={{ padding: '8px 16px 8px 0', color: '#6B7280' }}>{parseDevice(v.userAgent)}</td>
                  <td style={{ padding: '8px 16px 8px 0', color: '#6B7280' }}>{parseBrowser(v.userAgent)}</td>
                  <td style={{ padding: '8px 16px 8px 0', color: '#9CA3AF' }}>{shorten(v.firstAttributionChannel || v.attributionChannel || v.referrer, 24)}</td>
                  <td style={{ padding: '8px 0', color: '#6B7280' }}>{shorten(v.firstUtmCampaign, 22)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Experiments tab ───────────────────────────────────────────────────────────

function ExperimentsTab({ token }: { token: string }) {
  const [results, setResults] = useState<ABTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/ab-results', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setResults(data.results ?? []);
        else setError(data.error ?? 'Error al cargar');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ ...S.card, ...S.mono, color: '#6B7280' }}>Calculando resultados…</div>;
  if (error) return <div style={{ ...S.card, ...S.mono, color: '#F59E0B' }}>{error}</div>;
  if (results.length === 0) return (
    <div style={S.card}>
      <p style={{ ...S.label, marginBottom: '8px' }}>Sin datos de experimentos aún</p>
      <p style={{ ...S.mono, color: '#6B7280', fontSize: '11px' }}>
        Los datos aparecerán cuando haya visitas con A/B variants y al menos una conversión.
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {results.map((test) => {
        const winner = test.variants[0];
        return (
          <div key={test.testId} style={S.card}>
            <p style={{ ...S.label, marginBottom: '16px' }}>Test: {test.testId}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {test.variants.map((v, i) => {
                const isWinner = i === 0 && v.conversions > 0;
                const rate = typeof v.conversionRate === 'number' ? v.conversionRate : parseFloat(String(v.conversionRate));
                return (
                  <div key={v.variant} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: isWinner ? 'rgba(255,59,0,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isWinner ? 'rgba(255,59,0,0.2)' : '#1E1E1E'}`,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <span style={{ ...S.mono, color: isWinner ? '#FF3B00' : '#D1D5DB', fontSize: '12px' }}>
                        {isWinner && '🏆 '}{v.variant}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ ...S.label, marginBottom: '2px' }}>Visitas</p>
                        <p style={{ ...S.mono, color: '#D1D5DB' }}>{v.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p style={{ ...S.label, marginBottom: '2px' }}>Conversiones</p>
                        <p style={{ ...S.mono, color: '#D1D5DB' }}>{v.conversions}</p>
                      </div>
                      <div>
                        <p style={{ ...S.label, marginBottom: '2px' }}>Tasa</p>
                        <p style={{ ...S.mono, color: isWinner ? '#FF3B00' : '#D1D5DB', fontWeight: isWinner ? 700 : 400 }}>
                          {rate.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    {/* Bar */}
                    <div style={{ width: '100%', height: '2px', background: '#1E1E1E', borderRadius: '1px', marginTop: '4px' }}>
                      <div style={{
                        height: '2px',
                        background: isWinner ? '#FF3B00' : '#6B7280',
                        borderRadius: '1px',
                        width: `${Math.min(rate * 10, 100)}%`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {winner && winner.conversions > 0 && (
              <p style={{ ...S.mono, color: '#6B7280', fontSize: '10px', marginTop: '12px' }}>
                Variante ganadora: <span style={{ color: '#FF3B00' }}>{winner.variant}</span> —  {winner.conversionRate}% de conversión
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Admin() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [dataError, setDataError] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [chatLeads, setChatLeads] = useState<LeadDoc[]>([]);
  const [contactLeads, setContactLeads] = useState<LeadDoc[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [savingStageKey, setSavingStageKey] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [idToken, setIdToken] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) getIdToken(user).then(setIdToken).catch(() => undefined);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authUser) {
      setVisitors([]); setChatLeads([]); setContactLeads([]);
      setVisitorsLoading(false); setLeadsLoading(false);
      return;
    }
    setDataError('');
    setVisitorsLoading(true);
    setLeadsLoading(true);

    const q1 = query(collection(db, 'visitors'), orderBy('timestamp', 'desc'), limit(100));
    const q2 = query(collection(db, 'chatSessions'), orderBy('updatedAt', 'desc'), limit(100));
    const q3 = query(collection(db, 'contactSubmissions'), orderBy('createdAt', 'desc'), limit(100));

    const u1 = onSnapshot(q1, (s) => { setVisitors(s.docs.map((d) => ({ id: d.id, ...d.data() } as Visitor))); setVisitorsLoading(false); },
      () => { setDataError('Sin permisos para leer Firestore.'); setVisitorsLoading(false); });
    const u2 = onSnapshot(q2, (s) => { setChatLeads(s.docs.map((d) => ({ id: d.id, ...d.data() } as LeadDoc))); setLeadsLoading(false); },
      () => { setDataError('Sin permisos para leer Firestore.'); setLeadsLoading(false); });
    const u3 = onSnapshot(q3, (s) => { setContactLeads(s.docs.map((d) => ({ id: d.id, ...d.data() } as LeadDoc))); },
      () => undefined);

    return () => { u1(); u2(); u3(); };
  }, [authUser]);

  const allLeads = useMemo<CombinedLead[]>(() => [
    ...chatLeads.map((l) => ({ ...l, source: 'chatbot' as const, collectionName: 'chatSessions' as const, sourceLabel: 'Chatbot' })),
    ...contactLeads.map((l) => ({ ...l, source: 'contact_form' as const, collectionName: 'contactSubmissions' as const, sourceLabel: 'Formulario' })),
  ].sort((a, b) => (getLeadDate(b)?.toMillis() ?? 0) - (getLeadDate(a)?.toMillis() ?? 0)), [chatLeads, contactLeads]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSigningIn(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
    } catch {
      setAuthError('Email o contraseña incorrectos.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleStageChange = async (lead: CombinedLead, stage: LeadStage) => {
    const k = `${lead.collectionName}_${lead.id}`;
    setSavingStageKey(k);
    try { await updateLeadStage(lead.collectionName, lead.id, stage); }
    catch { setDataError('No pude actualizar la etapa.'); }
    finally { setSavingStageKey(''); }
  };

  // ── Loading screen ──
  if (authLoading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ ...S.mono, color: '#6B7280' }}>Verificando acceso…</p>
      </div>
    );
  }

  // ── Login screen ──
  if (!authUser) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <LogoMark size={20} variant="full" />
              <p style={{ ...S.mono, color: '#6B7280', marginTop: '12px' }}>Panel de administración</p>
            </div>
            <Link to="/" style={{ ...S.mono, color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={13} /> Volver
            </Link>
          </div>
          <div style={{ ...S.card }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <input type="email" required placeholder=" " value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} />
                <label>Email admin</label>
              </div>
              <div className="input-group">
                <input type="password" required placeholder=" " value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
                <label>Contraseña</label>
              </div>
              {authError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#fca5a5' }}>{authError}</p>}
              <button type="submit" className="btn-primary" disabled={isSigningIn}
                style={{ width: '100%', opacity: isSigningIn ? 0.7 : 1 }}>
                {isSigningIn ? 'Entrando…' : 'Entrar al panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Tabs config ──
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { id: 'leads', label: `Leads (${allLeads.length})`, icon: <Zap size={14} /> },
    { id: 'visitors', label: 'Visitantes', icon: <Users size={14} /> },
    { id: 'experiments', label: 'Experimentos', icon: <FlaskConical size={14} /> },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <LogoMark size={18} variant="full" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ ...S.mono, color: '#22C55E', fontSize: '10px' }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ ...S.mono, color: '#6B7280', fontSize: '10px' }}>{authUser.email}</span>
          <Link to="/" style={{ ...S.mono, color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={13} /> Sitio
          </Link>
          <button onClick={() => void signOut(auth)}
            style={{ ...S.mono, background: 'transparent', border: '1px solid #1E1E1E', color: '#6B7280', padding: '6px 12px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ padding: '0 32px', borderBottom: '1px solid #1E1E1E', display: 'flex', gap: '0', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #FF3B00' : '2px solid transparent',
            color: activeTab === tab.id ? '#FAFAFA' : '#6B7280',
            padding: '14px 18px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s',
          }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px', maxWidth: '1400px', marginInline: 'auto', width: '100%' }}>
        {dataError && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', padding: '12px 16px', marginBottom: '20px', borderRadius: '6px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            {dataError}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab visitors={visitors} allLeads={allLeads} visitorsLoading={visitorsLoading} leadsLoading={leadsLoading} />
        )}
        {activeTab === 'leads' && (
          <LeadsTab allLeads={allLeads} leadsLoading={leadsLoading} savingStageKey={savingStageKey} onStageChange={handleStageChange} />
        )}
        {activeTab === 'visitors' && (
          <VisitorsTab visitors={visitors} loading={visitorsLoading} />
        )}
        {activeTab === 'experiments' && (
          <ExperimentsTab token={idToken} />
        )}
      </div>
    </div>
  );
}
