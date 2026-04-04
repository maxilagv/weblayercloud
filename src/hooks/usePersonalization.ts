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
  heroHeadline: 'Construimos\nsistemas que\nhacen crecer\nnegocios.',
  heroSub: 'Arquitectura de software para empresas argentinas que quieren operar, vender y escalar sin fricción.',
  primaryCta: 'Probar demo interactiva',
  secondaryCta: 'Contanos tu negocio',
  urgencySignal: false,
  barText: 'Tomamos 3 proyectos nuevos por mes · Solo 1 lugar disponible en abril',
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
      heroSub: 'Sistemas que integran ventas, stock y operación. Sin apps separadas, sin planillas rotas.',
      primaryCta: 'Ver caso real',
      barText: 'Trabajamos con empresas B2B que quieren operar sin fricciones',
      channel: 'linkedin',
    },
  },
  {
    match: (ctx) =>
      /google/i.test(ctx.utmSource ?? '') && /cpc|paid/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub: 'ERP y e-commerce desarrollado a medida. Sin plantillas genéricas, sin soporte offshore.',
      primaryCta: 'Pedir diagnóstico gratuito',
      urgencySignal: true,
      barText: 'Diagnóstico gratuito disponible esta semana · Solo para empresas calificadas',
      channel: 'google_ads',
    },
  },
  {
    match: (ctx) =>
      /email|newsletter/i.test([ctx.utmMedium, ctx.utmSource].join(' ')),
    result: {
      primaryCta: 'Agendar una llamada',
      barText: 'Seguimos construyendo — mirá lo nuevo que tenemos para mostrarte',
      channel: 'email',
    },
  },
  {
    match: (ctx) =>
      ctx.attributionChannel === 'referral' &&
      !/google|linkedin|facebook|instagram/i.test(ctx.referrer ?? ''),
    result: {
      heroSub: 'Nos recomendaron bien. Esto es lo que construimos para empresas que quieren operar mejor.',
      primaryCta: 'Ver qué construimos',
      channel: 'referral',
    },
  },
  {
    match: (ctx) =>
      /instagram|facebook|meta/i.test(ctx.utmSource ?? '') ||
      /social/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub: 'Automatizá tu operación y vendé más con un sistema hecho específicamente para tu negocio.',
      primaryCta: 'Quiero saber más',
      channel: 'social',
    },
  },
];

const INDUSTRY_RULES: Rule[] = [
  {
    match: (ctx) =>
      /(gomeria|neumatico|llanta|taller)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' '),
      ),
    result: { industryFocus: 'gomeria' },
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
