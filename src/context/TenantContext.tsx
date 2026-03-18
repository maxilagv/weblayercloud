import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TenantTheme {
  primaryColor: string;
  primaryHover: string;
  accentColor?: string;
  mode: 'light' | 'dark';
}

export interface TenantSiteConfig {
  // Identidad
  logoUrl?:               string | null;
  fontFamily?:            'inter' | 'playfair' | 'outfit' | 'syne' | 'dm-sans';
  // Hero
  heroTitle:              string;
  heroSubtitle:           string;
  heroCTALabel?:          string;
  heroSecondaryCTALabel?: string;
  // Contacto
  whatsappNumber:          string;
  address:                 string;
  email:                   string;
  scheduleText?:           string;
  instagramUrl?:           string;
  facebookUrl?:            string;
  whatsappBubbleColor?:    'green' | 'primary' | 'dark';
  // Secciones
  bannerText?:            string;
  aboutTitle?:            string;
  aboutText?:             string;
  productsSectionTitle?:  string;
  productsSectionSubtitle?: string;
  footerTagline?:         string;
  // SEO & Pagos
  seoTitle?:              string;
  seoDescription?:        string;
  paymentMethods?:        string[];
}

// ─── Font helpers ─────────────────────────────────────────────────────────────

const FONT_STACK: Record<string, string> = {
  inter:    'Inter, system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  outfit:   'Outfit, system-ui, sans-serif',
  syne:     'Syne, system-ui, sans-serif',
  'dm-sans': '"DM Sans", system-ui, sans-serif',
};

const GOOGLE_FONT_URL: Record<string, string> = {
  inter:    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  playfair: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
  outfit:   'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap',
  syne:     'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap',
};

export interface TenantMeta {
  tenantId:     string;
  ownerUid:     string;
  ownerEmail:   string;
  ownerName:    string;
  businessName: string;
  businessType: string;
  phone?:       string;
  trialActive:  boolean;
  trialEndsAt:  { toDate(): Date };
  plan:              'trial' | 'paid' | 'suspended';
  hideDemoBranding?: boolean;
  theme:             TenantTheme;
  siteConfig:        TenantSiteConfig;
}

interface TenantContextValue {
  tenantId:     string;
  tenantMeta:   TenantMeta | null;
  trialExpired: boolean;
  loading:      boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TenantProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const [tenantMeta, setTenantMeta]     = useState<TenantMeta | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [loading, setLoading]           = useState(true);

  // Inyectar CSS variables del tema del tenant en <html>
  useEffect(() => {
    if (!tenantMeta?.theme) return;

    const root = document.documentElement;
    const accent = tenantMeta.theme.accentColor ?? tenantMeta.theme.primaryColor;
    root.style.setProperty('--tk-primary',        tenantMeta.theme.primaryColor);
    root.style.setProperty('--tk-primary-rgb',    hexToRgb(tenantMeta.theme.primaryColor));
    root.style.setProperty('--tk-primary-hover',   tenantMeta.theme.primaryHover);
    root.style.setProperty('--tk-primary-subtle',  hexToRgba(tenantMeta.theme.primaryColor, 0.08));
    root.style.setProperty('--tk-primary-border',  hexToRgba(tenantMeta.theme.primaryColor, 0.22));
    root.style.setProperty('--tk-accent',          accent);

    return () => {
      root.style.removeProperty('--tk-primary');
      root.style.removeProperty('--tk-primary-rgb');
      root.style.removeProperty('--tk-primary-hover');
      root.style.removeProperty('--tk-primary-subtle');
      root.style.removeProperty('--tk-primary-border');
      root.style.removeProperty('--tk-accent');
    };
  }, [tenantMeta?.theme]);

  // Inyectar fuente tipografica del tenant
  useEffect(() => {
    const fontFamily = tenantMeta?.siteConfig?.fontFamily ?? 'inter';
    const stack = FONT_STACK[fontFamily] ?? FONT_STACK.inter;
    const fontUrl = GOOGLE_FONT_URL[fontFamily];

    document.documentElement.style.setProperty('--tk-font-family', stack);

    let linkEl: HTMLLinkElement | null = null;
    if (fontUrl) {
      linkEl = document.createElement('link');
      linkEl.id   = 'tk-google-font';
      linkEl.rel  = 'stylesheet';
      linkEl.href = fontUrl;
      const existing = document.getElementById('tk-google-font');
      if (existing) existing.remove();
      document.head.appendChild(linkEl);
    }

    return () => {
      document.documentElement.style.removeProperty('--tk-font-family');
      if (linkEl) linkEl.remove();
    };
  }, [tenantMeta?.siteConfig?.fontFamily]);

  // Escuchar en tiempo real el documento meta del tenant
  useEffect(() => {
    if (!tenantId) return;

    const unsub = onSnapshot(
      doc(db, 'tenants', tenantId),
      (snap) => {
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        const data = snap.data() as TenantMeta;
        const expired = !data.trialActive || data.trialEndsAt.toDate() < new Date();
        setTrialExpired(expired);
        setTenantMeta(data);
        setLoading(false);
      },
      (err) => {
        console.error('[TenantContext] onSnapshot error:', err);
        setLoading(false);
      }
    );

    return unsub;
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, tenantMeta, trialExpired, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant debe usarse dentro de <TenantProvider>');
  return ctx;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
