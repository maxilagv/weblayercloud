import {
  Package,
  Palette,
  Phone,
  QrCode,
  ShoppingBag,
  Store,
  Tag,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import type { TenantMeta } from '../context/TenantContext';

export interface DemoActivationLiveData {
  hasProducts: boolean;
  hasCategories: boolean;
  hasOffers: boolean;
  hasOrders: boolean;
  hasShared: boolean;
}

export interface DemoJourneyStepDefinition {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  benefit: string;
  icon: LucideIcon;
  adminPath: string | null;
  getCompleted: (meta: TenantMeta | null, liveData: DemoActivationLiveData) => boolean;
}

export interface DashboardActivationStepDefinition {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  actionPath: string | null;
  getCompleted: (meta: TenantMeta | null, liveData: DemoActivationLiveData) => boolean;
}

const DEFAULT_PRIMARY_COLORS = new Set(['#FF3B00', '#3B82F6']);

export function isBrandingCustomized(meta: TenantMeta | null): boolean {
  if (!meta) return false;

  if (meta.siteConfig?.logoUrl) {
    return true;
  }

  const currentColor = meta.theme?.primaryColor?.toUpperCase();
  return !!currentColor && !DEFAULT_PRIMARY_COLORS.has(currentColor);
}

export function getDemoShareKey(tenantId: string): string {
  return `lc_demo_shared_${tenantId}`;
}

export function readDemoShareCompleted(tenantId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage.getItem(getDemoShareKey(tenantId));
  } catch {
    return false;
  }
}

export function persistDemoShareCompleted(tenantId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getDemoShareKey(tenantId), '1');
  } catch {
    // noop
  }
}

export const DEMO_JOURNEY_STEPS: readonly DemoJourneyStepDefinition[] = [
  {
    id: 'branding',
    eyebrow: '01 · Identidad',
    title: 'Marca y diseño',
    description: 'Logo, colores y tipografía que te representan.',
    benefit: 'Tu marca visible desde el primer segundo genera confianza y reconocimiento.',
    icon: Palette,
    adminPath: 'admin/configuracion?tab=identidad',
    getCompleted: (meta) => isBrandingCustomized(meta),
  },
  {
    id: 'catalog',
    eyebrow: '02 · Productos',
    title: 'Catálogo de productos',
    description: 'Cargá tus productos con fotos, precios y stock.',
    benefit: 'Un catálogo completo aumenta el tiempo en sitio y la probabilidad de compra.',
    icon: Package,
    adminPath: 'admin/productos',
    getCompleted: (_meta, liveData) => liveData.hasProducts,
  },
  {
    id: 'contact',
    eyebrow: '03 · Contacto',
    title: 'WhatsApp y contacto',
    description: 'Agregá tu WhatsApp, dirección y horario de atención.',
    benefit: 'Los clientes necesitan saber cómo contactarte antes de comprar.',
    icon: Phone,
    adminPath: 'admin/configuracion?tab=contacto',
    getCompleted: (meta) => !!meta?.siteConfig?.whatsappNumber?.trim(),
  },
  {
    id: 'promo',
    eyebrow: '04 · Promociones',
    title: 'Promos y descuentos',
    description: 'Activá un banner de envío gratis o una oferta destacada.',
    benefit: 'Las promociones activas mejoran la intención de compra y elevan la conversión.',
    icon: Tag,
    adminPath: 'admin/ofertas',
    getCompleted: (meta, liveData) => !!meta?.siteConfig?.bannerText?.trim() || liveData.hasOffers,
  },
  {
    id: 'payments',
    eyebrow: '05 · Pagos',
    title: 'Métodos de pago',
    description: 'Elegí qué métodos de pago aceptás en tu tienda.',
    benefit: 'Más opciones de pago reducen el abandono del carrito.',
    icon: WalletCards,
    adminPath: 'admin/configuracion?tab=seo',
    getCompleted: (meta) => (meta?.siteConfig?.paymentMethods?.length ?? 0) > 0,
  },
  {
    id: 'integrations',
    eyebrow: '06 · Integraciones',
    title: 'Redes e integraciones',
    description: 'Conectá tus redes sociales y activá el botón de WhatsApp.',
    benefit: 'Más canales de contacto generan más oportunidades de venta.',
    icon: Phone,
    adminPath: 'admin/configuracion?tab=contacto',
    getCompleted: (meta) =>
      !!meta?.siteConfig?.instagramUrl?.trim() || !!meta?.siteConfig?.facebookUrl?.trim(),
  },
  {
    id: 'publish',
    eyebrow: '07 · Publicación',
    title: 'Publicá tu tienda',
    description: 'Compartí el link y empezá a recibir visitas reales.',
    benefit: 'Una tienda compartida es una tienda que ya puede vender.',
    icon: Store,
    adminPath: null,
    getCompleted: (_meta, liveData) => liveData.hasOrders || liveData.hasShared,
  },
] as const;

export const DASHBOARD_ACTIVATION_STEPS: readonly DashboardActivationStepDefinition[] = [
  {
    id: 'logo',
    title: 'Subí tu logo',
    description: 'Tu marca visible desde el primer segundo.',
    actionLabel: 'Subir logo',
    icon: Palette,
    actionPath: 'admin/configuracion?tab=identidad',
    getCompleted: (meta) => !!meta?.siteConfig?.logoUrl,
  },
  {
    id: 'color',
    title: 'Elegí tu color de marca',
    description: 'Un solo cambio transforma toda la tienda.',
    actionLabel: 'Cambiar color',
    icon: Palette,
    actionPath: 'admin/configuracion?tab=identidad',
    getCompleted: (meta) => isBrandingCustomized(meta),
  },
  {
    id: 'product',
    title: 'Cargá tu primer producto',
    description: 'Con foto, precio y descripción.',
    actionLabel: 'Agregar producto',
    icon: Package,
    actionPath: 'admin/productos',
    getCompleted: (_meta, liveData) => liveData.hasProducts,
  },
  {
    id: 'whatsapp',
    title: 'Configurá tu WhatsApp',
    description: 'Tus clientes podrán escribirte directo desde la tienda.',
    actionLabel: 'Configurar',
    icon: Phone,
    actionPath: 'admin/configuracion?tab=contacto',
    getCompleted: (meta) => !!meta?.siteConfig?.whatsappNumber?.trim(),
  },
  {
    id: 'share',
    title: 'Compartí tu tienda',
    description: 'Enviásela a alguien para probarla o escanearla.',
    actionLabel: 'Copiar link',
    icon: QrCode,
    actionPath: null,
    getCompleted: (_meta, liveData) => liveData.hasShared,
  },
  {
    id: 'order',
    title: 'Recibí tu primer pedido',
    description: 'El momento en el que la demo se convierte en una prueba real.',
    actionLabel: 'Ver pedidos',
    icon: ShoppingBag,
    actionPath: 'admin/pedidos',
    getCompleted: (_meta, liveData) => liveData.hasOrders,
  },
] as const;

export function getCompletionMap<T extends { id: string; getCompleted: (meta: TenantMeta | null, liveData: DemoActivationLiveData) => boolean }>(
  steps: readonly T[],
  meta: TenantMeta | null,
  liveData: DemoActivationLiveData,
): Record<string, boolean> {
  return Object.fromEntries(steps.map((step) => [step.id, step.getCompleted(meta, liveData)]));
}

export function getCompletedCount(completionMap: Record<string, boolean>): number {
  return Object.values(completionMap).filter(Boolean).length;
}

export function getNextIncompleteStepId(steps: readonly { id: string }[], completionMap: Record<string, boolean>): string | null {
  return steps.find((step) => !completionMap[step.id])?.id ?? null;
}

export function getTenantDemoAdminUrl(tenantId: string, relativePath: string): string {
  return `/demo/${tenantId}/${relativePath}`;
}

export function getTenantStoreUrl(tenantId: string): string {
  return `/demo/${tenantId}`;
}
