# Plan 04 — Personalización dinámica de hero y CTAs

> Prioridad: **MEDIA**
> El scoring ya existe. La atribución por UTM ya existe. Solo falta conectarlos con la UI.

---

## Qué hay que conectar

El sistema ya sabe:
- Desde dónde vino el visitante (UTM source/medium/campaign, referrer) — `src/lib/attribution.ts`
- Cuánto tiempo lleva en la página y qué tan comprometido está — eventos de comportamiento
- Qué industria/dolor tiene si ya completó el chatbot — `leadStrategy.ts`

Pero el hero (`src/components/Hero.tsx`) y los CTAs (`src/pages/Home.tsx`) son estáticos.
Nadie ve contenido diferente según su canal de entrada.

---

## Arquitectura

```
Visita llega con UTM → getAttributionContext() → inferPersonalizationContext()
         ↓
    Reglas de personalización (deterministas, sin IA)
         ↓
    usePersonalization() hook → Hero, CTA, Testimonials adaptativos
```

Sin llamadas a API extra. Sin latencia. Todo client-side y determinista.

---

## Paso 1 — Hook de personalización

### Crear `src/hooks/usePersonalization.ts`

```typescript
import { useMemo } from 'react';
import { getAttributionContext } from '../lib/attribution';

export interface PersonalizationContext {
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  industryFocus: string | null;
  urgencySignal: boolean;
  testimonialFilter: string | null;
  channel: string;
}

const DEFAULT: PersonalizationContext = {
  heroHeadline: 'El sistema que ordena tu operación y conecta tus ventas',
  heroSubheadline: 'ERP + e-commerce para empresas que necesitan más que una planilla.',
  primaryCta: 'Ver demo en vivo',
  secondaryCta: 'Contactar',
  industryFocus: null,
  urgencySignal: false,
  testimonialFilter: null,
  channel: 'direct',
};

type ChannelRule = {
  match: (ctx: ReturnType<typeof getAttributionContext>) => boolean;
  result: Partial<PersonalizationContext>;
};

const CHANNEL_RULES: ChannelRule[] = [
  // LinkedIn / B2B
  {
    match: (ctx) =>
      /linkedin/i.test(ctx.utmSource ?? '') ||
      /linkedin/i.test(ctx.referrer ?? '') ||
      /linkedin/i.test(ctx.firstReferrer ?? ''),
    result: {
      heroHeadline: 'Tu empresa, sin los cuellos de botella operativos',
      heroSubheadline: 'Sistemas que integran ventas, stock y operación. Sin apps separadas.',
      primaryCta: 'Ver caso real',
      channel: 'linkedin',
    },
  },
  // Google Ads / Búsqueda
  {
    match: (ctx) =>
      /google/i.test(ctx.utmSource ?? '') && /cpc|paid/i.test(ctx.utmMedium ?? ''),
    result: {
      heroHeadline: 'Del caos operativo al control total — en semanas',
      heroSubheadline: 'ERP y e-commerce desarrollado a medida para tu industria.',
      primaryCta: 'Pedir diagnóstico gratuito',
      urgencySignal: true,
      channel: 'google_ads',
    },
  },
  // Email / Newsletter
  {
    match: (ctx) =>
      /email|newsletter/i.test(ctx.utmMedium ?? '') ||
      /email|newsletter/i.test(ctx.utmSource ?? ''),
    result: {
      heroHeadline: 'Bienvenido de vuelta — esto es lo que podemos construir',
      heroSubheadline: 'El sistema que ya conocés, listo para tu operación.',
      primaryCta: 'Agendar una llamada',
      channel: 'email',
    },
  },
  // Referral / Boca en boca
  {
    match: (ctx) =>
      ctx.attributionChannel === 'referral' &&
      !/google|linkedin|facebook|instagram/i.test(ctx.referrer ?? ''),
    result: {
      heroHeadline: 'Te recomendaron bien — esto es lo que hacemos',
      heroSubheadline: 'Sistemas operativos y e-commerce para empresas que quieren crecer con orden.',
      primaryCta: 'Ver qué construimos',
      channel: 'referral',
    },
  },
  // Instagram / Facebook Ads
  {
    match: (ctx) =>
      /instagram|facebook|meta/i.test(ctx.utmSource ?? '') ||
      /social/i.test(ctx.utmMedium ?? ''),
    result: {
      heroHeadline: 'De la planilla al sistema — sin volver atrás',
      heroSubheadline: 'Automatizá tu operación y vendé más con un sistema hecho para vos.',
      primaryCta: 'Quiero saber más',
      channel: 'social',
    },
  },
];

// Reglas de industria basadas en UTM campaign o keyword
const INDUSTRY_RULES: ChannelRule[] = [
  {
    match: (ctx) =>
      /(gomeria|neumatico|llanta|taller)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' ')
      ),
    result: {
      industryFocus: 'gomeria',
      testimonialFilter: 'gomeria',
      heroHeadline: 'El sistema para gomería que ya están usando 4 talleres en Argentina',
    },
  },
  {
    match: (ctx) =>
      /(logistica|reparto|flota|transporte|delivery)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' ')
      ),
    result: {
      industryFocus: 'logistica',
      testimonialFilter: 'logistica',
    },
  },
  {
    match: (ctx) =>
      /(retail|tienda|stock|inventario|ecommerce)/i.test(
        [ctx.utmCampaign, ctx.utmTerm, ctx.firstUtmCampaign].join(' ')
      ),
    result: {
      industryFocus: 'retail',
      testimonialFilter: 'retail',
    },
  },
];

function applyRules(
  rules: ChannelRule[],
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
    const channelOverride = applyRules(CHANNEL_RULES, ctx);
    const industryOverride = applyRules(INDUSTRY_RULES, ctx);

    return {
      ...DEFAULT,
      ...channelOverride,
      ...industryOverride,
    };
  }, []);
}
```

---

## Paso 2 — Aplicar en el Hero

### Modificar `src/components/Hero.tsx`

```tsx
import { usePersonalization } from '../hooks/usePersonalization';

export default function Hero() {
  const p = usePersonalization();

  return (
    <section ...>
      <h1>{p.heroHeadline}</h1>
      <p>{p.heroSubheadline}</p>
      <div className="hero-ctas">
        <Link to="/contacto">{p.primaryCta}</Link>
        <Link to="/solucion">{p.secondaryCta}</Link>
      </div>
      {p.urgencySignal && (
        <p className="urgency-badge">Solo 1 lugar disponible este mes</p>
      )}
    </section>
  );
}
```

---

## Paso 3 — Testimonials filtrados por industria

### En `src/pages/Home.tsx`

Los testimonials actuales (línea 50-80 aprox.) son estáticos. Enriquecerlos con un tag de industria y filtrar:

```typescript
const testimonials = [
  {
    name: 'Marcos Silveira',
    industry: 'gomeria',  // ← agregar este campo
    // ... resto igual
  },
  // ...
];

// En el componente:
const { testimonialFilter } = usePersonalization();
const visibleTestimonials = testimonialFilter
  ? testimonials.filter((t) => t.industry === testimonialFilter || !t.industry)
  : testimonials;
```

---

## Paso 4 — CTA del announcement bar personalizado

### En `src/App.tsx:164-172`

El texto del bar es hardcoded: `"Tomamos 3 proyectos nuevos por mes · Solo 1 lugar disponible en abril"`.
Hacerlo dinámico:

```tsx
import { usePersonalization } from './hooks/usePersonalization';

function PublicShell() {
  const { channel, urgencySignal } = usePersonalization();
  
  const barText = channel === 'google_ads' || urgencySignal
    ? 'Diagnóstico gratuito disponible esta semana · Solo para empresas calificadas'
    : channel === 'linkedin'
    ? 'Trabajamos con empresas B2B que quieren operar sin fricciones'
    : 'Tomamos 3 proyectos nuevos por mes · Solo 1 lugar disponible en abril';
  
  // ...
}
```

---

## Paso 5 — Trackear personalización como evento

Para saber si personalizar impacta en conversión, trackear qué contexto vio cada visitante:

```typescript
// En usePersonalization.ts — al final del useMemo:
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  trackBehaviorEvent({
    eventName: 'personalization_applied',
    payload: {
      channel: result.channel,
      industryFocus: result.industryFocus,
      urgencySignal: result.urgencySignal,
    },
  }).catch(() => {});
}, []); // solo una vez por sesión
```

---

## Fase 2 — Personalización post-chat (más sofisticada)

Una vez que el lead completó el chatbot y tenemos `LeadIntelligence`, personalizar la página en tiempo real:

```typescript
// En src/hooks/useAdaptiveExperience.ts — extender para incluir AI context

// Cuando el chatbot dispara analyzeLeadStrategy y obtenemos strategy:
// 1. Almacenar en localStorage: 'lc_lead_strategy_v1'
// 2. En usePersonalization(), leer ese cache y sobreescribir reglas

const storedStrategy = localStorage.getItem('lc_lead_strategy_v1');
if (storedStrategy) {
  const strategy = JSON.parse(storedStrategy) as LeadIntelligence;
  // Hero muestra la oferta recomendada específicamente para este lead
  // CTA cambia a "Ver demo de [oferta recomendada]"
}
```

---

## Checklist

- [ ] Crear `src/hooks/usePersonalization.ts`
- [ ] Integrar `usePersonalization` en `src/components/Hero.tsx`
- [ ] Agregar tag `industry` a testimonials en `src/pages/Home.tsx`
- [ ] Filtrar testimonials con `testimonialFilter`
- [ ] Personalizar announcement bar en `src/App.tsx`
- [ ] Agregar tracking de `personalization_applied`
- [ ] (Fase 2) Leer `LeadIntelligence` del localStorage post-chat para personalización avanzada

---

## Impacto esperado

- Los leads de LinkedIn ven copy B2B → mayor resonancia
- Los leads de Google Ads ven urgencia + diagnóstico gratuito → CTA más directo
- Los leads de gomería ven el caso de Marcos Silveira → prueba social relevante
- Sin latencia extra (todo determinista en cliente)
