import { getBusinessTypeByKey } from './businessTypes';

export interface PublicDemoDefinition {
  tenantId: string;
  businessType: string;
  businessName: string;
  headline: string;
  summary: string;
  proof: string;
}

export const PUBLIC_DEMOS: readonly PublicDemoDefinition[] = [
  {
    tenantId: 'layercloud-demo',
    businessType: 'indumentaria',
    businessName: 'Estilo Norte',
    headline: 'Moda lista para vender desde el primer día.',
    summary: 'Catálogo visual, promos activas, checkout simple y branding editable en tiempo real.',
    proof: 'Ideal para marcas de ropa, accesorios y drops estacionales.',
  },
  {
    tenantId: 'layercloud-demo-gastro',
    businessType: 'gastronomia',
    businessName: 'Casa Brasa',
    headline: 'Pedidos online, promociones y contacto directo por WhatsApp.',
    summary: 'Mostrá combos, destacados y llamados a la acción claros para delivery o take away.',
    proof: 'Pensado para restaurantes, cafeterías y marcas con venta rápida.',
  },
  {
    tenantId: 'layercloud-demo-home',
    businessType: 'muebleria',
    businessName: 'Nativo Casa',
    headline: 'Colecciones, ambientación y productos con ticket alto.',
    summary: 'Hero editorial, categorías destacadas y ficha de producto preparada para conversiones largas.',
    proof: 'Sirve para muebles, deco y catálogos con foco visual.',
  },
] as const;

export const DEFAULT_PUBLIC_DEMO = PUBLIC_DEMOS[0];

export function getPublicDemoByBusinessType(businessType: string | null | undefined): PublicDemoDefinition {
  if (!businessType) return DEFAULT_PUBLIC_DEMO;
  return PUBLIC_DEMOS.find((item) => item.businessType === businessType) ?? DEFAULT_PUBLIC_DEMO;
}

export function getPublicDemoByTenantId(tenantId: string | null | undefined): PublicDemoDefinition | null {
  if (!tenantId) return null;
  return PUBLIC_DEMOS.find((item) => item.tenantId === tenantId) ?? null;
}

export function getPublicDemoHref(businessType: string | null | undefined): string {
  const demo = getPublicDemoByBusinessType(businessType);
  return `/demo/${demo.tenantId}?industry=${demo.businessType}`;
}

export function getPublicDemoLabel(businessType: string | null | undefined): string {
  const type = getBusinessTypeByKey(businessType);
  return type?.shortLabel ?? 'demo';
}
