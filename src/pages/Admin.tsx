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
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  Users,
  Globe,
  Monitor,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  LogOut,
  MessageSquare,
  BrainCircuit,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/LogoMark';
import { updateLeadStage, type LeadStage } from '../lib/crm';
import { auth, db } from '../lib/firebase';

type LeadCollectionName = 'chatSessions' | 'contactSubmissions';

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
  aiOfferReason?: string;
  aiExecutiveSummary?: string;
  aiNextBestAction?: string;
  aiWhatToSayNow?: string;
  aiFollowUpWhatsApp?: string;
  aiFollowUpEmailSubject?: string;
}

interface CombinedLead extends LeadDoc {
  collectionName: LeadCollectionName;
  sourceLabel: string;
}

const monoStyle = { fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em' };
const labelStyle = {
  ...monoStyle,
  color: 'var(--color-primary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontSize: '10px',
};

const STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

function parseDevice(ua: string): string {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function parseBrowser(ua: string): string {
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/edge/i.test(ua)) return 'Edge';
  return 'Other';
}

function formatTime(ts?: Timestamp | null): string {
  if (!ts) return '-';
  const date = ts.toDate();
  return `${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function shorten(value?: string, max = 100) {
  if (!value) return '-';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function getLeadDate(lead: LeadDoc) {
  return lead.updatedAt ?? lead.createdAt ?? null;
}

function formatLeadScores(lead: LeadDoc) {
  return `R${lead.aiReadinessScore ?? 0} | I${lead.aiIntentScore ?? 0} | U${lead.aiUrgencyScore ?? 0} | F${lead.aiFitScore ?? 0}`;
}

function getStageLabel(stage?: LeadStage) {
  switch (stage) {
    case 'contacted':
      return 'Contactado';
    case 'qualified':
      return 'Calificado';
    case 'proposal':
      return 'Propuesta';
    case 'won':
      return 'Ganado';
    case 'lost':
      return 'Perdido';
    case 'new':
    default:
      return 'Nuevo';
  }
}

function getPriorityColor(priority?: 'cold' | 'warm' | 'hot') {
  if (priority === 'hot') return 'var(--color-accent)';
  if (priority === 'warm') return '#f59e0b';
  return 'var(--color-ink)';
}

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
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) {
      setVisitors([]);
      setChatLeads([]);
      setContactLeads([]);
      setVisitorsLoading(false);
      setLeadsLoading(false);
      return;
    }

    setDataError('');
    setVisitorsLoading(true);
    setLeadsLoading(true);

    const visitorsQuery = query(collection(db, 'visitors'), orderBy('timestamp', 'desc'), limit(100));
    const chatQuery = query(collection(db, 'chatSessions'), orderBy('updatedAt', 'desc'), limit(80));
    const contactQuery = query(collection(db, 'contactSubmissions'), orderBy('createdAt', 'desc'), limit(80));

    const unsubVisitors = onSnapshot(
      visitorsQuery,
      (snapshot) => {
        setVisitors(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Visitor)));
        setVisitorsLoading(false);
        setLastRefresh(new Date());
      },
      (error) => {
        console.error('[Admin visitors]', error);
        setDataError('No hay permisos para leer Firestore. Revisa reglas y el usuario admin.');
        setVisitorsLoading(false);
      },
    );

    const unsubChats = onSnapshot(
      chatQuery,
      (snapshot) => {
        setChatLeads(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as LeadDoc)));
        setLeadsLoading(false);
        setLastRefresh(new Date());
      },
      (error) => {
        console.error('[Admin chatSessions]', error);
        setDataError('No hay permisos para leer Firestore. Revisa reglas y el usuario admin.');
        setLeadsLoading(false);
      },
    );

    const unsubContacts = onSnapshot(
      contactQuery,
      (snapshot) => {
        setContactLeads(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as LeadDoc)));
        setLeadsLoading(false);
        setLastRefresh(new Date());
      },
      (error) => {
        console.error('[Admin contactSubmissions]', error);
        setDataError('No hay permisos para leer Firestore. Revisa reglas y el usuario admin.');
        setLeadsLoading(false);
      },
    );

    return () => {
      unsubVisitors();
      unsubChats();
      unsubContacts();
    };
  }, [authUser]);

  const allLeads = useMemo<CombinedLead[]>(() => {
    const combined = [
      ...chatLeads.map((lead) => ({
        ...lead,
        source: 'chatbot' as const,
        collectionName: 'chatSessions' as const,
        sourceLabel: 'Chatbot',
      })),
      ...contactLeads.map((lead) => ({
        ...lead,
        source: 'contact_form' as const,
        collectionName: 'contactSubmissions' as const,
        sourceLabel: 'Formulario',
      })),
    ];

    return combined.sort((left, right) => {
      const leftDate = getLeadDate(left)?.toMillis() ?? 0;
      const rightDate = getLeadDate(right)?.toMillis() ?? 0;
      return rightDate - leftDate;
    });
  }, [chatLeads, contactLeads]);

  const topActionLeads = useMemo(
    () =>
      [...allLeads]
        .filter((lead) => Boolean(lead.aiOfferToShowNow || lead.aiRecommendedOffer))
        .sort((left, right) => (right.aiReadinessScore ?? 0) - (left.aiReadinessScore ?? 0))
        .slice(0, 4),
    [allLeads],
  );

  const attributionMetrics = useMemo(() => {
    const metrics = new Map<string, { channel: string; campaign: string; leads: number; won: number; hot: number }>();

    allLeads.forEach((lead) => {
      const channel = lead.firstAttributionChannel || lead.attributionChannel || lead.sourceLabel;
      const campaign = lead.firstUtmCampaign || lead.utmCampaign || '-';
      const key = `${channel}__${campaign}`;
      const existing = metrics.get(key) ?? { channel, campaign, leads: 0, won: 0, hot: 0 };

      existing.leads += 1;
      if (lead.pipelineStage === 'won') existing.won += 1;
      if (lead.aiPriorityLevel === 'hot') existing.hot += 1;

      metrics.set(key, existing);
    });

    return [...metrics.values()]
      .sort((left, right) => {
        if (right.won !== left.won) return right.won - left.won;
        return right.leads - left.leads;
      })
      .slice(0, 8);
  }, [allLeads]);

  const pathCounts: Record<string, number> = {};
  visitors.forEach((visitor) => {
    pathCounts[visitor.path] = (pathCounts[visitor.path] || 0) + 1;
  });
  const topPaths = Object.entries(pathCounts).sort((left, right) => right[1] - left[1]).slice(0, 5);

  const totalVisits = visitors.length;
  const totalLeads = allLeads.length;
  const uniquePaths = new Set(visitors.map((visitor) => visitor.path)).size;
  const analyzedLeads = allLeads.filter((lead) => Boolean(lead.aiOfferToShowNow || lead.aiRecommendedOffer)).length;
  const hotLeads = allLeads.filter((lead) => lead.aiPriorityLevel === 'hot').length;
  const wonLeads = allLeads.filter((lead) => lead.pipelineStage === 'won').length;
  const mobileCount = visitors.filter((visitor) => parseDevice(visitor.userAgent) === 'Mobile').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const activeCampaigns = new Set(allLeads.map((lead) => lead.firstUtmCampaign || lead.utmCampaign).filter(Boolean)).size;

  const statCards = [
    { icon: <Users size={18} color="var(--color-primary)" />, label: 'Visitas', value: totalVisits },
    { icon: <MessageSquare size={18} color="var(--color-warn)" />, label: 'Leads', value: totalLeads },
    { icon: <BrainCircuit size={18} color="var(--color-primary)" />, label: 'Leads con IA', value: analyzedLeads },
    { icon: <ShieldCheck size={18} color="var(--color-accent)" />, label: 'Hot leads', value: hotLeads },
    { icon: <Target size={18} color="var(--color-accent)" />, label: 'Ganados', value: wonLeads },
    { icon: <TrendingUp size={18} color="var(--color-primary)" />, label: 'Win rate', value: `${conversionRate}%` },
    { icon: <Globe size={18} color="var(--color-accent)" />, label: 'Campanas', value: activeCampaigns || 0 },
    { icon: <Monitor size={18} color="var(--color-warn)" />, label: 'Mobile', value: mobileCount },
  ];

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setIsSigningIn(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password);
    } catch (error) {
      console.error('[Admin auth]', error);
      setAuthError('No pude iniciar sesion. Revisa email, password y reglas.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleStageChange = async (lead: CombinedLead, stage: LeadStage) => {
    const savingKey = `${lead.collectionName}_${lead.id}`;
    setSavingStageKey(savingKey);

    try {
      await updateLeadStage(lead.collectionName, lead.id, stage);
    } catch (error) {
      console.error('[Lead stage update]', error);
      setDataError('No pude actualizar la etapa del lead.');
    } finally {
      setSavingStageKey('');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-dark-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
        Comprobando acceso...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-dark-bg)', color: 'var(--color-text)', padding: '48px 7vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '480px', background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <LogoMark size={20} variant="full" />
              <p style={{ ...labelStyle, marginTop: '18px' }}>Panel admin</p>
              <p style={{ ...monoStyle, color: 'var(--color-ink)', marginTop: '8px' }}>Ruta: /admin</p>
            </div>
            <Link to="/" style={{ ...monoStyle, color: 'var(--color-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Sitio
            </Link>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input type="email" required placeholder=" " value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} />
              <label>Email admin</label>
            </div>
            <div className="input-group">
              <input type="password" required placeholder=" " value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
              <label>Password</label>
            </div>
            {authError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#fca5a5', marginBottom: '16px' }}>{authError}</p>}
            <button type="submit" className="btn-primary" disabled={isSigningIn} style={{ width: '100%', opacity: isSigningIn ? 0.7 : 1 }}>
              {isSigningIn ? 'Entrando...' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-dark-bg)', color: 'var(--color-text)', padding: '0', position: 'relative', zIndex: 1 }}>
      <header style={{ padding: '20px 7vw', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <LogoMark size={20} variant="full" />
          <div>
            <p style={labelStyle}>Panel de administracion</p>
            <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px' }}>Ruta publica del panel: /admin</p>
            <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px', marginTop: '4px' }}>Ultima actualizacion: {lastRefresh.toLocaleTimeString('es-AR')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', animation: 'blink 1.4s infinite' }} />
            <span style={{ ...monoStyle, color: 'var(--color-accent)', fontSize: '10px' }}>FIREBASE LIVE</span>
          </div>
          <span style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px' }}>{authUser.email}</span>
          <button onClick={() => void handleLogout()} style={{ ...monoStyle, background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-ink)', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={14} /> Salir
          </button>
          <Link to="/" style={{ ...monoStyle, color: 'var(--color-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
            <ArrowLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </header>

      <div style={{ padding: '48px 7vw' }}>
        {dataError && <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', color: '#fdba74', padding: '16px 20px', marginBottom: '32px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>{dataError}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2px', marginBottom: '48px' }}>
          {statCards.map((stat) => (
            <div key={stat.label} className="prop-card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                {stat.icon}
                <span style={labelStyle}>// stat</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, color: 'var(--color-white-brand)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {(visitorsLoading && stat.label === 'Visitas') || (leadsLoading && stat.label !== 'Visitas') ? '-' : stat.value}
              </p>
              <p style={{ ...monoStyle, color: 'var(--color-ink)', marginTop: '6px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <p style={labelStyle}>// Canales que traen negocio</p>
            <div style={{ overflowX: 'auto', marginTop: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Canal', 'Campana', 'Leads', 'Hot', 'Won', 'Win rate'].map((header) => (
                      <th key={header} style={{ ...labelStyle, textAlign: 'left', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingRight: '16px' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadsLoading ? (
                    <tr><td colSpan={6} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Calculando atribucion...</td></tr>
                  ) : attributionMetrics.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Todavia no hay leads suficientes con atribucion.</td></tr>
                  ) : attributionMetrics.map((item) => (
                    <tr key={`${item.channel}-${item.campaign}`} style={{ borderBottom: '1px solid rgba(30,42,56,0.5)' }}>
                      <td style={{ ...monoStyle, color: 'var(--color-text)', padding: '10px 16px 10px 0' }}>{shorten(item.channel, 24)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{shorten(item.campaign, 24)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{item.leads}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-accent)', padding: '10px 16px 10px 0' }}>{item.hot}</td>
                      <td style={{ ...monoStyle, color: '#fbbf24', padding: '10px 16px 10px 0' }}>{item.won}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-text)', padding: '10px 0 10px 0' }}>{item.leads > 0 ? Math.round((item.won / item.leads) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <p style={labelStyle}>// Paginas mas visitadas</p>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {visitorsLoading ? (
                <p style={{ ...monoStyle, color: 'var(--color-ink)' }}>Cargando visitas...</p>
              ) : topPaths.length === 0 ? (
                <p style={{ ...monoStyle, color: 'var(--color-ink)' }}>Sin datos todavia</p>
              ) : topPaths.map(([path, count]) => (
                <div key={path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...monoStyle, color: 'var(--color-text)' }}>{path || '/'}</span>
                  <span style={{ ...monoStyle, color: 'var(--color-accent)', fontWeight: 500 }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '28px' }}>
              <p style={labelStyle}>// Paginas unicas</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--color-white-brand)', fontWeight: 800, marginTop: '10px' }}>{uniquePaths}</p>
            </div>
          </div>

          <div style={{ background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={labelStyle}>// Radar comercial</p>
              <RefreshCw size={14} color="var(--color-ink)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leadsLoading ? (
                <p style={{ ...monoStyle, color: 'var(--color-ink)' }}>Analizando leads...</p>
              ) : topActionLeads.length === 0 ? (
                <p style={{ ...monoStyle, color: 'var(--color-ink)' }}>Todavia no hay leads listos para accion.</p>
              ) : topActionLeads.map((lead) => (
                <div key={`radar-${lead.collectionName}-${lead.id}`} style={{ border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white-brand)', fontWeight: 700 }}>{lead.company || lead.name || 'Lead'}</p>
                    <span style={{ ...monoStyle, color: getPriorityColor(lead.aiPriorityLevel), fontSize: '10px' }}>
                      {lead.aiPriorityLevel?.toUpperCase() || '-'} | {lead.aiReadinessScore ?? lead.aiIntentScore ?? 0}
                    </span>
                  </div>
                  <p style={{ ...monoStyle, color: 'var(--color-primary)', fontSize: '10px', marginBottom: '8px' }}>
                    MOSTRAR PRIMERO: {lead.aiOfferToShowNow || lead.aiRecommendedOffer || '-'}
                  </p>
                  <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px', marginBottom: '8px' }}>
                    INTENCION {lead.aiIntentScore ?? 0} | URGENCIA {lead.aiUrgencyScore ?? 0} | FIT {lead.aiFitScore ?? 0}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.65, color: 'var(--color-text)', marginBottom: '10px' }}>
                    {lead.aiWhatToSayNow || lead.aiExecutiveSummary || '-'}
                  </p>
                  <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px', marginBottom: '6px' }}>WHATSAPP LISTO</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.65, color: 'var(--color-ink)' }}>
                    {lead.aiFollowUpWhatsApp || '-'}
                  </p>
                  <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px', marginTop: '10px', marginBottom: '6px' }}>EMAIL LISTO</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.65, color: 'var(--color-ink)' }}>
                    {lead.aiFollowUpEmailSubject || '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <p style={labelStyle}>// Leads unificados</p>
            <div style={{ overflowX: 'auto', marginTop: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Fecha', 'Fuente', 'Lead', 'Etapa', 'Canal', 'Campana', 'Scores', 'Oferta', 'Decir ahora'].map((header) => (
                      <th key={header} style={{ ...labelStyle, textAlign: 'left', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingRight: '16px' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadsLoading ? (
                    <tr><td colSpan={9} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Cargando leads...</td></tr>
                  ) : allLeads.length === 0 ? (
                    <tr><td colSpan={9} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Todavia no hay leads guardados.</td></tr>
                  ) : allLeads.map((lead) => {
                    const savingKey = `${lead.collectionName}_${lead.id}`;
                    return (
                      <tr key={`${lead.collectionName}-${lead.id}`} style={{ borderBottom: '1px solid rgba(30,42,56,0.5)' }}>
                        <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0', whiteSpace: 'nowrap', fontSize: '10px' }}>{formatTime(getLeadDate(lead))}</td>
                        <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{lead.sourceLabel}</td>
                        <td style={{ padding: '10px 16px 10px 0' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-white-brand)', fontWeight: 700 }}>{lead.company || lead.name || 'Lead'}</p>
                          <p style={{ ...monoStyle, color: 'var(--color-ink)', fontSize: '10px', marginTop: '4px' }}>{shorten(`${lead.name || '-'} | ${lead.email || lead.phone || '-'}`, 42)}</p>
                        </td>
                        <td style={{ padding: '10px 16px 10px 0' }}>
                          <select
                            value={lead.pipelineStage || 'new'}
                            onChange={(event) => { void handleStageChange(lead, event.target.value as LeadStage); }}
                            disabled={savingStageKey === savingKey}
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                          >
                            {STAGES.map((stage) => (
                              <option key={stage} value={stage}>{getStageLabel(stage)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{shorten(lead.firstAttributionChannel || lead.attributionChannel || '-', 22)}</td>
                        <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{shorten(lead.firstUtmCampaign || lead.utmCampaign || '-', 20)}</td>
                        <td style={{ ...monoStyle, color: 'var(--color-primary)', padding: '10px 16px 10px 0', whiteSpace: 'nowrap' }}>{formatLeadScores(lead)}</td>
                        <td style={{ ...monoStyle, color: 'var(--color-text)', padding: '10px 16px 10px 0', maxWidth: '160px' }}>{shorten(lead.aiOfferToShowNow || lead.aiRecommendedOffer || '-', 30)}</td>
                        <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 0 10px 0', maxWidth: '320px' }}>{shorten(lead.aiWhatToSayNow || lead.aiNextBestAction || lead.aiExecutiveSummary || '-', 110)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'var(--color-dark-surface)', border: '1px solid var(--color-border)', padding: '32px' }}>
            <p style={labelStyle}>// Visitantes recientes</p>
            <div style={{ overflowX: 'auto', marginTop: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hora', 'Pagina', 'Dispositivo', 'Navegador', 'Canal', 'Campana'].map((header) => (
                      <th key={header} style={{ ...labelStyle, textAlign: 'left', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingRight: '16px' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visitorsLoading ? (
                    <tr><td colSpan={6} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Conectando con Firebase...</td></tr>
                  ) : visitors.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...monoStyle, color: 'var(--color-ink)', paddingTop: '16px' }}>Sin visitas registradas todavia.</td></tr>
                  ) : visitors.slice(0, 20).map((visitor) => (
                    <tr key={visitor.id} style={{ borderBottom: '1px solid rgba(30,42,56,0.5)' }}>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0', whiteSpace: 'nowrap', fontSize: '10px' }}>{formatTime(visitor.timestamp)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-text)', padding: '10px 16px 10px 0' }}>{visitor.path || '/'}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{parseDevice(visitor.userAgent)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{parseBrowser(visitor.userAgent)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 16px 10px 0' }}>{shorten(visitor.firstAttributionChannel || visitor.attributionChannel || visitor.referrer, 22)}</td>
                      <td style={{ ...monoStyle, color: 'var(--color-ink)', padding: '10px 0 10px 0' }}>{shorten(visitor.firstUtmCampaign || '-', 20)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
