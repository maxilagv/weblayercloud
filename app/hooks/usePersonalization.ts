import { useMemo } from 'react';
import { getAttributionContext } from '../lib/attribution';

export interface PersonalizationContext {
  heroHeadline: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  urgencySignal: boolean;
  barText: string;
  channel: string;
  industryFocus: string | null;
}

const DEFAULT: PersonalizationContext = {
  heroHeadline: 'MotorCloud\norquesta\nmicroservicios\ny escala.',
  heroSub:
    'SaaS moderno en Java para operaciones que necesitan catálogo, órdenes, pagos, integraciones y observabilidad dentro de una misma plataforma.',
  primaryCta: 'Ver plataforma',
  secondaryCta: 'Solicitar diagnóstico',
  urgencySignal: false,
  barText: 'MotorCloud · SaaS Java · más de 10 microservicios coordinados',
  channel: 'direct',
  industryFocus: null,
};

type Rule = {
  match: (ctx: ReturnType<typeof getAttributionContext>) => boolean;
  result: Partial<PersonalizationContext>;
};

const RULES: Rule[] = [
  {
    match: (ctx) =>
      /linkedin/i.test([ctx.utmSource, ctx.referrer, ctx.firstReferrer].join(' ')),
    result: {
      heroSub:
        'Arquitectura B2B para equipos que ya no pueden operar con sistemas desconectados, procesos manuales y visibilidad parcial.',
      primaryCta: 'Ver arquitectura B2B',
      barText: 'MotorCloud para compañías que necesitan estructura operativa y crecimiento controlado',
      channel: 'linkedin',
    },
  },
  {
    match: (ctx) =>
      /google/i.test(ctx.utmSource ?? '') && /cpc|paid/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub:
        'Microservicios, integraciones empresariales y una base Java lista para operaciones complejas sin deuda de arquitectura.',
      primaryCta: 'Evaluar arquitectura',
      urgencySignal: true,
      barText: 'Evaluación técnica inicial disponible para equipos con operación compleja',
      channel: 'google_ads',
    },
  },
  {
    match: (ctx) =>
      /email|newsletter/i.test([ctx.utmMedium, ctx.utmSource].join(' ')),
    result: {
      primaryCta: 'Retomar la arquitectura',
      barText: 'MotorCloud sigue construyendo la base técnica del producto',
      channel: 'email',
    },
  },
  {
    match: (ctx) =>
      ctx.attributionChannel === 'referral' &&
      !/google|linkedin|facebook|instagram/i.test(ctx.referrer ?? ''),
    result: {
      heroSub:
        'Si llegaste por referencia, acá vas a encontrar la capa técnica completa: dominios, integraciones, observabilidad y evolución del sistema.',
      primaryCta: 'Ver qué estamos construyendo',
      channel: 'referral',
    },
  },
  {
    match: (ctx) =>
      /instagram|facebook|meta/i.test(ctx.utmSource ?? '') ||
      /social/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub:
        'Mostramos producto y arquitectura al mismo tiempo: una plataforma hecha para operar, no una landing que promete de más.',
      primaryCta: 'Explorar plataforma',
      channel: 'social',
    },
  },
];

const INDUSTRY_RULES: Rule[] = [
  {
    match: (ctx) =>
      /(distribucion|mayorista|catalogo|precios)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' '),
      ),
    result: { industryFocus: 'distribucion' },
  },
  {
    match: (ctx) =>
      /(logistica|reparto|flota|transporte|delivery)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' '),
      ),
    result: { industryFocus: 'logistica' },
  },
  {
    match: (ctx) =>
      /(retail|tienda|stock|inventario)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' '),
      ),
    result: { industryFocus: 'retail' },
  },
];

function applyRules(
  rules: Rule[],
  ctx: ReturnType<typeof getAttributionContext>,
): Partial<PersonalizationContext> {
  for (const rule of rules) {
    if (rule.match(ctx)) return rule.result;
  }
  return {};
}

export function usePersonalization(): PersonalizationContext {
  return useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT;
    const ctx = getAttributionContext();
    return {
      ...DEFAULT,
      ...applyRules(RULES, ctx),
      ...applyRules(INDUSTRY_RULES, ctx),
    };
  }, []);
}
