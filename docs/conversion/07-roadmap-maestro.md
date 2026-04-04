# Roadmap maestro — Transformación a Lead Capture Engine

> Este es el documento de síntesis. Cada tarea referencia el plan detallado correspondiente.
> Fecha de inicio estimada: 2026-04-04

---

## Principio rector

**Primero cerrar lo que puede quemarse, después construir lo que multiplica.**

El sistema ya tiene una base excepcional. Los 3 endpoints que llaman a Gemini sin protección
son el único riesgo real hoy. Todo lo demás es optimización sobre algo que ya funciona.

---

## Vista de 90 días

```
SEMANA 1-2: Fundación de seguridad       [Plan 01]
SEMANA 3:   Follow-up automático         [Plan 02]
SEMANA 4:   A/B testing real             [Plan 03]
SEMANA 5-6: Personalización dinámica     [Plan 04]
SEMANA 7-8: Admin de inteligencia        [Plan 05]
SEMANA 9:   Compliance y consentimiento  [Plan 06]
SEMANA 10+: Iteración sobre datos reales
```

---

## FASE 1 — Fundación de seguridad (Semana 1-2)
### Prioridad: BLOQUEANTE

Nada del resto vale si los endpoints están abiertos.

#### Día 1-2

| Tarea | Archivo a crear/modificar | Plan |
|---|---|---|
| Crear módulo de rate limiting | `api/_lib/rateLimit.ts` (nuevo) | 01 |
| Aplicar rate limit en lead-strategy | `api/lead-strategy.ts` | 01 |
| Aplicar rate limit en chat/message | `api/chat/message.ts` | 01 |
| Aplicar rate limit en intake/contact | `api/intake/contact.ts` | 01 |
| Agregar regla Firestore `_rateLimits` | `docs/firestore.rules` | 01 |

#### Día 3-4

| Tarea | Archivo a crear/modificar | Plan |
|---|---|---|
| Corregir `assertAdminToken` fail-open | `api/_lib/firebaseAdmin.ts:103` | 01 |
| Setear `ADMIN_EMAILS` en Vercel | Vercel Dashboard | 01 |
| Aplicar rate limit en track-visit | `api/track-visit.ts` | 01 |
| Aplicar rate limit en track-event | `api/track-event.ts` | 01 |
| Agregar `assertBodySize` en todos los handlers | `api/_lib/http.ts` + handlers | 01 |

#### Día 5 (deploy y monitoreo)

| Tarea | Archivo a crear/modificar | Plan |
|---|---|---|
| Verificación de origen en lead-strategy | `api/lead-strategy.ts` | 01 |
| Turnstile en formulario de contacto | `src/pages/Contact.tsx` + `api/intake/contact.ts` | 01 |
| Anonimizar PII en prompt de Gemini | `api/_lib/leadStrategyService.ts:73` | 06 |

**Criterio de éxito**: `/api/lead-strategy` devuelve 429 después de 5 requests en 60s desde el mismo IP.

---

## FASE 2 — Follow-up automático (Semana 3)
### Prioridad: ALTA — mayor ROI individual

Este es el cambio que más aumenta conversión con menos código.

| Tarea | Archivo | Plan |
|---|---|---|
| Crear `notificationService.ts` | `api/_lib/notificationService.ts` (nuevo) | 02 |
| Integrar en `intake/contact.ts` | `api/intake/contact.ts:55` | 02 |
| Integrar en `chat/message.ts` | `api/chat/message.ts:63` | 02 |
| Configurar Resend (cuenta + dominio) | Resend Dashboard | 02 |
| Configurar Slack/Telegram webhook | Respectivo | 02 |
| Setear env vars | Vercel Dashboard | 02 |

**Criterio de éxito**: Cuando un lead completa el chatbot, en <30 segundos el equipo recibe un mensaje en Slack/Telegram con el `whatToSayNow` y el lead recibe un email personalizado.

---

## FASE 3 — A/B testing con datos reales (Semana 4)
### Prioridad: MEDIA-ALTA

Muy poco código, impacto en aprendizaje de largo plazo.

| Tarea | Archivo | Plan |
|---|---|---|
| Enriquecer atribución con AB variants | `src/lib/attribution.ts` | 03 |
| Usar nueva atribución en tracking | `src/lib/tracking.ts` | 03 |
| Persistir abVariants en submissions | `api/_lib/crmEngine.ts` | 03 |
| Evento `contact_conversion` en Contact | `src/pages/Contact.tsx` | 03 |
| Crear `api/ab-results.ts` | nuevo | 03 |
| Sección experimentos en Admin | `src/pages/Admin.tsx` | 03 |

**Criterio de éxito**: En el admin, la tabla de experimentos muestra tasa de conversión por variante con datos reales.

---

## FASE 4 — Personalización dinámica (Semana 5-6)
### Prioridad: MEDIA

Impacto en conversión, sin latencia extra, todo determinista.

| Tarea | Archivo | Plan |
|---|---|---|
| Crear `usePersonalization.ts` | `src/hooks/usePersonalization.ts` (nuevo) | 04 |
| Integrar en Hero | `src/components/Hero.tsx` | 04 |
| Filtrar testimonials por industria | `src/pages/Home.tsx` | 04 |
| Personalizar announcement bar | `src/App.tsx:164` | 04 |
| Trackear `personalization_applied` | `src/hooks/usePersonalization.ts` | 04 |

**Criterio de éxito**: Un visitante que llega con `utm_source=linkedin` ve copy diferente al que llega de búsqueda orgánica.

---

## FASE 5 — Admin de inteligencia (Semana 7-8)
### Prioridad: MEDIA

Transforma el admin de lista de leads a centro de comando.

| Tarea | Archivo | Plan |
|---|---|---|
| Refactorizar Admin en tabs | `src/pages/Admin.tsx` | 05 |
| Crear ConversionMetrics component | `src/pages/admin/ConversionMetrics.tsx` (nuevo) | 05 |
| Crear AICostMonitor + circuit breaker | `src/pages/admin/AICostMonitor.tsx` + `api/_lib/leadStrategyService.ts` | 05 |
| HotLeadAlerts con browser notifications | `src/pages/admin/HotLeadAlerts.tsx` (nuevo) | 05 |
| Expandir PlaybookCard | `src/pages/Admin.tsx` | 05 |
| Agregar filtros y búsqueda | `src/pages/Admin.tsx` | 05 |
| GrowthRecommendations | `src/pages/admin/GrowthRecommendations.tsx` (nuevo) | 05 |
| ABTestResults panel | `src/pages/admin/ABTestResults.tsx` (nuevo) | 05 |
| `MAX_DAILY_AI_CALLS` env var | Vercel Dashboard | 05 |

**Criterio de éxito**: El admin muestra funnel de conversión, ROI por canal, y el equipo puede abrir cualquier lead y ver el `whatToSayNow` y copiar el WhatsApp en un clic.

---

## FASE 6 — Compliance (Semana 9)
### Prioridad: MEDIA (obligatorio antes de escalar tráfico pago)

| Tarea | Archivo | Plan |
|---|---|---|
| Crear ConsentBanner | `src/components/ConsentBanner.tsx` (nuevo) | 06 |
| Integrar en App.tsx | `src/App.tsx` | 06 |
| Condicionar tracking al consentimiento | `src/hooks/useVisitorTracking.ts` | 06 |
| Crear `api/dsr/delete.ts` | nuevo | 06 |
| Crear `api/dsr/export.ts` | nuevo | 06 |
| Cloud Function data retention | `functions/src/dataRetention.ts` (nuevo) | 06 |
| Página de privacidad | `src/pages/Privacidad.tsx` (nuevo) | 06 |
| Checkbox consentimiento en Contact | `src/pages/Contact.tsx` | 06 |

**Criterio de éxito**: Un lead puede solicitar eliminación de sus datos. El banner aparece y se recuerda la preferencia.

---

## Métricas de éxito del proyecto completo

| Métrica | Baseline (ahora) | Objetivo (90 días) |
|---|---|---|
| Endpoints con rate limiting | 0/6 | 6/6 |
| Tiempo de respuesta a hot leads | Horas | <5 minutos |
| A/B tests con datos reales | 0 | 3 |
| Variantes de hero según canal | 1 (fijo) | 5 |
| Admin: campos visibles del playbook | Score numérico | Texto completo + copyable |
| Costo Gemini descontrolado | Riesgo real | Circuit breaker activo |
| PII enviada a Gemini | Sí (email, teléfono) | Anonimizada |

---

## Archivos nuevos que se van a crear (resumen)

```
api/_lib/rateLimit.ts                       (Plan 01)
api/_lib/notificationService.ts             (Plan 02)
api/ab-results.ts                           (Plan 03)
api/dsr/delete.ts                           (Plan 06)
api/dsr/export.ts                           (Plan 06)
src/hooks/usePersonalization.ts             (Plan 04)
src/components/ConsentBanner.tsx            (Plan 06)
src/pages/Privacidad.tsx                    (Plan 06)
src/pages/admin/ConversionMetrics.tsx       (Plan 05)
src/pages/admin/AICostMonitor.tsx           (Plan 05)
src/pages/admin/HotLeadAlerts.tsx           (Plan 05)
src/pages/admin/GrowthRecommendations.tsx   (Plan 05)
src/pages/admin/ABTestResults.tsx           (Plan 05)
functions/src/dataRetention.ts              (Plan 06)
```

## Archivos existentes que se van a modificar (resumen)

```
api/_lib/firebaseAdmin.ts       — fix assertAdminToken (Plan 01)
api/_lib/http.ts                — assertBodySize (Plan 01)
api/_lib/leadStrategyService.ts — circuit breaker + anonimizar PII (Plans 01, 05, 06)
api/_lib/crmEngine.ts           — abVariants en atribución (Plan 03)
api/lead-strategy.ts            — rate limit + origin check (Plan 01)
api/chat/message.ts             — rate limit + followup trigger (Plans 01, 02)
api/intake/contact.ts           — rate limit + turnstile + followup trigger (Plans 01, 02)
api/track-visit.ts              — rate limit (Plan 01)
api/track-event.ts              — rate limit (Plan 01)
src/lib/attribution.ts          — AB variants (Plan 03)
src/lib/tracking.ts             — AB-enriched attribution (Plan 03)
src/lib/abTest.ts               — Thompson Sampling (Plan 03, Fase 2)
src/components/Hero.tsx         — personalización dinámica (Plan 04)
src/pages/Home.tsx              — testimonials filtrados (Plan 04)
src/pages/Contact.tsx           — turnstile + consent checkbox + conversion event (Plans 01, 03, 06)
src/pages/Admin.tsx             — refactor + nuevas secciones (Plan 05)
src/App.tsx                     — ConsentBanner + bar personalizado (Plans 04, 06)
src/hooks/useVisitorTracking.ts — consentimiento gate (Plan 06)
docs/firestore.rules            — regla _rateLimits (Plan 01)
```

---

## Variables de entorno finales (Vercel)

```bash
# Ya existentes
GEMINI_API_KEY=xxx
FIREBASE_ADMIN_CREDENTIALS=xxx

# A agregar — Fase 1
ADMIN_EMAILS=tu@email.com
ALLOWED_ORIGIN=https://weblayercloud.com
TURNSTILE_SECRET_KEY=xxx
VITE_TURNSTILE_SITE_KEY=xxx    # para el frontend

# A agregar — Fase 2
RESEND_API_KEY=re_xxx
FROM_EMAIL=LayerCloud <hola@weblayercloud.com>
SLACK_WEBHOOK_URL=https://hooks.slack.com/...  (o TELEGRAM_WEBHOOK_URL)
TELEGRAM_CHAT_ID=xxx
ADMIN_URL=https://weblayercloud.com/admin

# A agregar — Fase 5
MAX_DAILY_AI_CALLS=200
```
