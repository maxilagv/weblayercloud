# Plan 03 — A/B testing real con tracking server-side

> Prioridad: **MEDIA-ALTA**
> El framework de A/B ya existe en `src/lib/abTest.ts` pero es ciego: asigna variantes pero nunca mide cuál convierte.

---

## El problema actual

`src/lib/abTest.ts` tiene 3 tests activos:
- `demo_bar_cta`: variantes `crear-mi-tienda` vs `probar-7-dias`
- `panel_initial_state`: `closed` vs `open`
- `sticky_delay`: `15s` vs `30s` vs `60s`

La variante se guarda en localStorage. Cuando el lead convierte, el evento de conversión no incluye qué variante vio.
Resultado: **nunca sabes cuál CTA convierte mejor**.

---

## Arquitectura de la solución

```
Visita → getABVariant() asigna variante → trackVisit() envía atribución + variantes al servidor
         ↓
    Conversión → trackEvent('contact_submission') incluye snapshot de variantes activas
         ↓
    Admin panel → tabla de variante × conversiones
```

---

## Paso 1 — Enriquecer atribución con variantes A/B

### Modificar `src/lib/attribution.ts`

Agregar al final del archivo:

```typescript
import { getDemoJourneyABContext } from './abTest';

export function getAttributionContextWithAB(pathOverride?: string) {
  const base = getAttributionContext(pathOverride);
  
  // Solo incluir AB context si window está disponible
  if (typeof window === 'undefined') return base;
  
  const abContext = getDemoJourneyABContext();
  return {
    ...base,
    abVariants: abContext,
  };
}
```

### Modificar `src/lib/tracking.ts`

Cambiar `buildEventPayload` para usar la versión con AB:

```typescript
import { getAttributionContextWithAB } from './attribution';

function buildEventPayload(pathOverride?: string) {
  return {
    attribution: getAttributionContextWithAB(pathOverride),
    identity: getStoredLeadIdentity(),
  };
}
```

---

## Paso 2 — Guardar variantes en Firestore con cada conversión

### Modificar `api/_lib/crmEngine.ts`

En la función `normalizeAttribution` (ya existe), agregar el campo `abVariants`:

```typescript
abVariants: toPlainObject(raw.abVariants) as Record<string, string>,
```

En `AttributionContext` interface (línea 30 aprox.), agregar:

```typescript
abVariants?: Record<string, string>;
```

En la función que persiste `contactSubmissions` y `chatSessions`, incluir `abVariants`:

```typescript
// Al guardar la sesión/submission, incluir:
abVariants: attribution.abVariants ?? {},
```

---

## Paso 3 — Conversión explícita de variante

Cuando el lead envía el formulario de contacto, trackear el evento con las variantes:

### En `src/pages/Contact.tsx` (dentro del submit handler):

```typescript
import { getDemoJourneyABContext } from '../lib/abTest';

// Al momento de la conversión exitosa:
await trackBehaviorEvent({
  eventName: 'contact_conversion',
  payload: {
    abVariants: getDemoJourneyABContext(),
    conversionType: 'contact_form',
  },
});
```

---

## Paso 4 — Nuevo endpoint de análisis A/B

### Crear `api/ab-results.ts`

```typescript
import { assertAdminToken, verifyAuthenticatedRequest } from './_lib/firebaseAdmin';
import { adminDb } from './_lib/firebaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = await verifyAuthenticatedRequest(req);
  assertAdminToken(token);

  // Agrupar conversiones por variante
  const conversions = await adminDb
    .collection('events')
    .where('eventName', '==', 'contact_conversion')
    .orderBy('createdAt', 'desc')
    .limit(5000)
    .get();

  const results: Record<string, Record<string, { views: number; conversions: number }>> = {};

  for (const doc of conversions.docs) {
    const data = doc.data();
    const variants = data.payload?.abVariants ?? {};
    for (const [testId, variant] of Object.entries(variants)) {
      if (!results[testId]) results[testId] = {};
      if (!results[testId][variant as string]) {
        results[testId][variant as string] = { views: 0, conversions: 1 };
      } else {
        results[testId][variant as string].conversions += 1;
      }
    }
  }

  // Obtener views por variante (de track-visit events)
  const visits = await adminDb
    .collection('visitors')
    .orderBy('timestamp', 'desc')
    .limit(10000)
    .get();

  for (const doc of visits.docs) {
    const data = doc.data();
    const variants = data.abVariants ?? {};
    for (const [testId, variant] of Object.entries(variants)) {
      if (!results[testId]) results[testId] = {};
      if (!results[testId][variant as string]) {
        results[testId][variant as string] = { views: 1, conversions: 0 };
      } else {
        results[testId][variant as string].views += 1;
      }
    }
  }

  // Calcular conversion rate
  const enriched = Object.entries(results).map(([testId, variants]) => ({
    testId,
    variants: Object.entries(variants).map(([variant, stats]) => ({
      variant,
      views: stats.views,
      conversions: stats.conversions,
      conversionRate: stats.views > 0 ? (stats.conversions / stats.views * 100).toFixed(2) : '0.00',
    })),
  }));

  return res.status(200).json({ ok: true, results: enriched });
}
```

---

## Paso 5 — Mostrar resultados en Admin

### En `src/pages/Admin.tsx` — agregar sección de A/B results

```tsx
// Nuevo tab "Experimentos" en el admin panel
// Muestra tabla por cada testId:
// | Variante | Visitas | Conversiones | Tasa |
// | crear-mi-tienda | 1.234 | 45 | 3.65% |
// | probar-7-dias   | 1.198 | 61 | 5.09% | ← ganadora
```

---

## Paso 6 — Implementar Thompson Sampling para asignación inteligente

En lugar de 50/50 aleatorio, usar el resultado acumulado para favorecer la variante ganadora:

```typescript
// src/lib/abTest.ts — reemplazar getABVariant con versión bayesiana

export function getABVariantBayesian(testId: string, variants: readonly string[]): string {
  const key = `${STORAGE_PREFIX}${testId}`;
  const stored = readStorage(key);
  if (stored && variants.includes(stored)) return stored;

  // Leer stats guardadas en localStorage (actualizadas desde el servidor)
  const statsKey = `${STORAGE_PREFIX}stats_${testId}`;
  const statsRaw = readStorage(statsKey);
  
  let picked: string;
  
  if (statsRaw) {
    try {
      const stats = JSON.parse(statsRaw) as Record<string, { alpha: number; beta: number }>;
      // Thompson sampling: samplear de distribución Beta para cada variante
      const samples = variants.map((v) => {
        const s = stats[v] ?? { alpha: 1, beta: 1 };
        return { variant: v, sample: sampleBeta(s.alpha, s.beta) };
      });
      picked = samples.sort((a, b) => b.sample - a.sample)[0]?.variant ?? variants[0];
    } catch {
      picked = variants[Math.floor(Math.random() * variants.length)] ?? variants[0];
    }
  } else {
    picked = variants[Math.floor(Math.random() * variants.length)] ?? variants[0];
  }
  
  writeStorage(key, picked);
  return picked;
}

// Aproximación de muestreo Beta (Johnk's method)
function sampleBeta(alpha: number, beta: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const x = Math.pow(u, 1 / alpha);
  const y = Math.pow(v, 1 / beta);
  return x / (x + y);
}
```

---

## Checklist

- [ ] Modificar `src/lib/attribution.ts` para incluir AB variants
- [ ] Modificar `src/lib/tracking.ts` para usar `getAttributionContextWithAB`
- [ ] Agregar `abVariants` a `AttributionContext` interface en `api/_lib/crmEngine.ts`
- [ ] Persistir `abVariants` en contactSubmissions y chatSessions
- [ ] Agregar evento `contact_conversion` en `src/pages/Contact.tsx`
- [ ] Crear `api/ab-results.ts`
- [ ] Agregar sección de experimentos en `src/pages/Admin.tsx`
- [ ] (Fase 2) Implementar Thompson Sampling en `src/lib/abTest.ts`

---

## Impacto esperado

- Sabrás exactamente qué CTA, timing y copy convierte mejor
- Decisiones basadas en datos reales vs. intuición
- Con Thompson Sampling, el tráfico se redistribuye automáticamente hacia la variante ganadora
