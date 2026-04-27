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
  heroHeadline: 'Tu empresa,\norganizada.\nTu software,\ntuyo.',
  heroSub:
    'Construimos software a medida que automatiza tus procesos, ordena tu operación y hace crecer tu negocio. Sin soluciones genéricas. Sin compromisos a largo plazo.',
  primaryCta: 'Hablar con nosotros',
  secondaryCta: 'Ver casos de éxito',
  urgencySignal: false,
  barText: 'LayerCloud · Software a Medida · Automatización Empresarial',
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
        'Software personalizado para empresas que ya no pueden operar con sistemas desconectados, procesos manuales y sin visibilidad real.',
      primaryCta: 'Solicitar diagnóstico',
      barText: 'LayerCloud · Software a medida para empresas que quieren crecer',
      channel: 'linkedin',
    },
  },
  {
    match: (ctx) =>
      /google/i.test(ctx.utmSource ?? '') && /cpc|paid/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub:
        'Automatizamos tus procesos y construimos el sistema que tu empresa necesita para operar sin fricciones y escalar sin límites.',
      primaryCta: 'Hablar con un ingeniero',
      urgencySignal: true,
      barText: 'Diagnóstico gratuito disponible — hablá con nuestro equipo hoy',
      channel: 'google_ads',
    },
  },
  {
    match: (ctx) =>
      /email|newsletter/i.test([ctx.utmMedium, ctx.utmSource].join(' ')),
    result: {
      primaryCta: 'Ver novedades',
      barText: 'LayerCloud · Nuevas automatizaciones y casos de éxito disponibles',
      channel: 'email',
    },
  },
  {
    match: (ctx) =>
      ctx.attributionChannel === 'referral' &&
      !/google|linkedin|facebook|instagram/i.test(ctx.referrer ?? ''),
    result: {
      heroSub:
        'Si llegaste por recomendación, ya sabés lo que hacemos. Contanos tu desafío y te mostramos cómo lo resolvemos.',
      primaryCta: 'Contarnos el desafío',
      channel: 'referral',
    },
  },
  {
    match: (ctx) =>
      /instagram|facebook|meta/i.test(ctx.utmSource ?? '') ||
      /social/i.test(ctx.utmMedium ?? ''),
    result: {
      heroSub:
        'Lo que ves en redes es real: construimos sistemas que automatizan, ordenan y hacen crecer negocios como el tuyo.',
      primaryCta: 'Ver casos de éxito',
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
