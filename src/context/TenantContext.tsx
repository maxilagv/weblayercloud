import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantTheme {
  primaryColor: string;
  primaryHover: string;
  accentColor?: string;
  mode: 'light' | 'dark';
}

export interface TenantSiteConfig {
  logoUrl?: string | null;
  fontFamily?: 'inter' | 'playfair' | 'outfit' | 'syne' | 'dm-sans';
  heroTitle: string;
  heroSubtitle: string;
  heroCTALabel?: string;
  heroSecondaryCTALabel?: string;
  whatsappNumber: string;
  address: string;
  email: string;
  scheduleText?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappBubbleColor?: 'green' | 'primary' | 'dark';
  bannerText?: string;
  aboutTitle?: string;
  aboutText?: string;
  productsSectionTitle?: string;
  productsSectionSubtitle?: string;
  footerTagline?: string;
  seoTitle?: string;
  seoDescription?: string;
  paymentMethods?: string[];
}

const FONT_STACK: Record<string, string> = {
  inter: 'Inter, system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  outfit: 'Outfit, system-ui, sans-serif',
  syne: 'Syne, system-ui, sans-serif',
  'dm-sans': '"DM Sans", system-ui, sans-serif',
};

const GOOGLE_FONT_URL: Record<string, string> = {
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  playfair: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
  outfit: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap',
  syne: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap',
  'dm-sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap',
};

export interface TenantMeta {
  tenantId: string;
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  phone?: string;
  trialActive: boolean;
  trialEndsAt: { toDate(): Date };
  plan: 'trial' | 'paid' | 'suspended';
  hideDemoBranding?: boolean;
  isPublicDemo?: boolean;
  theme: TenantTheme;
  siteConfig: TenantSiteConfig;
}

interface TenantContextValue {
  tenantId: string;
  tenantMeta: TenantMeta | null;
  trialExpired: boolean;
  loading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const [tenantMeta, setTenantMeta] = useState<TenantMeta | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantMeta?.theme) return;

    const root = document.documentElement;
    const accent = tenantMeta.theme.accentColor ?? tenantMeta.theme.primaryColor;

    root.style.setProperty('--tk-primary', tenantMeta.theme.primaryColor);
    root.style.setProperty('--tk-primary-rgb', hexToRgb(tenantMeta.theme.primaryColor));
    root.style.setProperty('--tk-primary-hover', tenantMeta.theme.primaryHover);
    root.style.setProperty('--tk-primary-subtle', hexToRgba(tenantMeta.theme.primaryColor, 0.08));
    root.style.setProperty('--tk-primary-border', hexToRgba(tenantMeta.theme.primaryColor, 0.22));
    root.style.setProperty('--tk-accent', accent);

    return () => {
      root.style.removeProperty('--tk-primary');
      root.style.removeProperty('--tk-primary-rgb');
      root.style.removeProperty('--tk-primary-hover');
      root.style.removeProperty('--tk-primary-subtle');
      root.style.removeProperty('--tk-primary-border');
      root.style.removeProperty('--tk-accent');
    };
  }, [tenantMeta?.theme]);

  useEffect(() => {
    const fontFamily = tenantMeta?.siteConfig?.fontFamily ?? 'inter';
    const stack = FONT_STACK[fontFamily] ?? FONT_STACK.inter;
    const fontUrl = GOOGLE_FONT_URL[fontFamily];
    const existing = document.getElementById('tk-google-font');

    document.documentElement.style.setProperty('--tk-font-family', stack);

    if (existing) {
      existing.remove();
    }

    let linkEl: HTMLLinkElement | null = null;
    if (fontUrl && fontFamily !== 'inter') {
      linkEl = document.createElement('link');
      linkEl.id = 'tk-google-font';
      linkEl.rel = 'stylesheet';
      linkEl.href = fontUrl;
      document.head.appendChild(linkEl);
    }

    return () => {
      document.documentElement.style.removeProperty('--tk-font-family');
      if (linkEl) {
        linkEl.remove();
      }
    };
  }, [tenantMeta?.siteConfig?.fontFamily]);

  useEffect(() => {
    if (!tenantId) return;

    const unsub = onSnapshot(
      doc(db, 'tenants', tenantId),
      (snap) => {
        if (!snap.exists()) {
          setTenantMeta(null);
          setLoading(false);
          return;
        }

        const data = snap.data() as TenantMeta;
        const expired = !data.isPublicDemo && (!data.trialActive || data.trialEndsAt.toDate() < new Date());

        setTrialExpired(expired);
        setTenantMeta(data);
        setLoading(false);
      },
      (error) => {
        console.error('[TenantContext] onSnapshot error:', error);
        setLoading(false);
      },
    );

    return unsub;
  }, [tenantId]);

  return (
    <TenantContext.Provider value={{ tenantId, tenantMeta, trialExpired, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant debe usarse dentro de <TenantProvider>');
  }
  return ctx;
}

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
