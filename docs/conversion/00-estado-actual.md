# Estado actual del sistema — Análisis técnico completo

> Documento base. Todos los demás planes parten de aquí.
> Fecha de análisis: 2026-04-04

---

## 1. Arquitectura general

| Capa | Tecnología | Ubicación |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | `src/` |
| Routing | React Router v6 | `src/App.tsx` |
| API | Vercel Serverless Functions (TypeScript) | `api/` |
| Base de datos | Firebase Firestore | colecciones detalladas abajo |
| Auth | Firebase Auth (email/password) | clientes y admin |
| IA | Gemini 2.0 Flash con fallback heurístico | `api/_lib/leadStrategyService.ts` |
| Animación | GSAP + ScrollTrigger + Framer Motion + Lenis | `src/` |
| Smooth scroll | Lenis | `src/App.tsx:60` |
| Deploy | Vercel | `vercel.json` |

---

## 2. Colecciones Firestore identificadas

| Colección | Propósito |
|---|---|
| `visitors` | Visitas de página con atribución completa |
| `events` | Eventos de comportamiento (scroll, tiempo, clics) |
| `chatSessions` | Sesiones del chatbot con datos del lead |
| `contactSubmissions` | Envíos del formulario de contacto |
| `persons` | Identidades unificadas de leads |
| `organizations` | Empresas identificadas |
| `leadThreads` | Historial cross-sesión de un lead |
| `tenants` | Clientes del SaaS (multi-tenant) |

---

## 3. Endpoints de API y su estado de seguridad

| Endpoint | Auth | Rate limit | Llama Gemini | Riesgo |
|---|---|---|---|---|
| `POST /api/track-visit` | ❌ | ❌ | No | Medio |
| `POST /api/track-event` | ❌ | ❌ | No | Medio |
| `POST /api/lead-strategy` | ❌ | ❌ | **Sí** | **CRÍTICO** |
| `POST /api/chat/session` | ❌ | ❌ | No | Medio |
| `POST /api/chat/message` | ❌ | ❌ | **Sí (milestone)** | **CRÍTICO** |
| `POST /api/intake/contact` | ❌ | ❌ | **Sí** | **CRÍTICO** |
| `POST /api/lead-stage` | Auth parcial | ❌ | No | Alto |

---

## 4. Sistema de scoring de leads (lo que YA funciona)

### 4.1 Scoring heurístico (`src/lib/leadStrategy.ts`)
Completamente funcional. Calcula:
- `intentScore` — campos completados + keywords de intención (`quiero`, `demo`, `cotización`)
- `urgencyScore` — keywords de urgencia (`urgente`, `esta semana`, `ya`)
- `fitScore` — señales de industria + volumen + herramientas actuales
- `readinessScore` — combinación ponderada (40% intent, 25% urgency, 35% fit)
- `priorityLevel` — hot / warm / cold
- `buyerMotivation` — 6 arquetipos detectados
- `recommendedOffer` — 4 ofertas posibles
- `whatToSayNow`, `followUpWhatsApp`, `followUpEmailBody` — generados pero **nunca auto-enviados**

### 4.2 Scoring de comportamiento (`api/_lib/crmEngine.ts`)
Calcula en cada evento:
- `behaviorIntentScore`
- `engagementScore`
- `channelQualityScore`
- `formLikelihoodScore`
- `returnVisitorScore`
- `maxScrollDepth`
- `maxTimeBucketSeconds`

### 4.3 Integración IA (`api/_lib/leadStrategyService.ts`)
- Modelo: `gemini-2.0-flash` (configurable por env `AI_ANALYST_MODEL`)
- Fallback automático al heurístico si no hay `GEMINI_API_KEY` o falla
- Prompt en español, temperatura 0.2, max 900 tokens
- Se dispara en 2 momentos: milestone del chat + envío de formulario de contacto

---

## 5. Sistema de atribución (`src/lib/attribution.ts`)

Completamente implementado:
- `visitorId` — persistente en localStorage (`layercloud_visitor_id`)
- `visitorSessionId` — por sesión en sessionStorage
- First-touch completo: UTM source/medium/campaign/content/term, referrer, path, URL, timestamp
- Last-touch: mismo conjunto para touch actual
- `attributionChannel` — inferido de UTMs o referrer

---

## 6. Sistema A/B testing (`src/lib/abTest.ts`)

Existe pero es **solo client-side**:
- 3 tests activos: `demo_bar_cta`, `panel_initial_state`, `sticky_delay`
- Variantes asignadas por localStorage
- **Problema crítico**: las conversiones nunca se trackean contra la variante → no hay datos de qué funciona

---

## 7. Sistema de identidad (`src/lib/identity.ts`)

Funcional:
- `personId` — enlace al documento en `persons`
- `organizationId` — enlace al documento en `organizations`
- `leadThreadId` — hilo cross-sesión
- Persistido en localStorage, mergeado en cada evento

---

## 8. Chatbot (`src/components/Chatbot.tsx`)

Progressive profiling de 16 pasos:
```
name → company → role → email → phone → location → industry →
website → monthlyOrders → teamSize → currentTools → salesChannels →
topPain → urgency → budget → extraContext
```
- Validación inline (email, teléfono, skip pattern)
- Estado persistido en localStorage (`layercloud_chatbot_state_v5`)
- Análisis de IA se dispara cuando ≥8 campos + email + company completos
- `whatToSayNow` y follow-ups se calculan pero no se muestran al visitante ni al equipo en tiempo real

---

## 9. Panel de admin (`src/pages/Admin.tsx`)

Muestra en tiempo real vía Firestore `onSnapshot`:
- Últimos 100 visitantes con atribución
- Últimos 80 chat leads con scores de IA
- Últimos 80 contact submissions
- Permite cambiar `pipelineStage` manualmente
- **No tiene**: alertas de hot leads, métricas de conversión, costo de IA, recomendaciones

---

## 10. Multi-tenant SaaS (ya construido)

Rutas activas:
- `/registro` — TenantRegister
- `/login` — TenantLogin
- `/dashboard/*` — TenantDashboard (protegido)
- `/demo/:tenantId/*` — DemoStoreRouter
- `/layercloud-admin/*` — SuperAdminShell (protegido con RequireSuperAdmin)

El SaaS demo ya tiene: productos, categorías, órdenes, clientes, finanzas, ofertas, precios, proveedores, gastos, staff, landing heroes, config.

---

## 11. Adaptive experience (`src/hooks/useAdaptiveExperience.ts`)

Detecta y adapta según:
- `prefersReducedMotion` — desactiva animaciones pesadas
- `prefersReducedData` (2G, saveData) — desactiva backgrounds
- `isLowMemoryDevice` (≤4GB RAM)
- `isLowCpuDevice` (≤4 cores)
- `isSmallViewport` (≤960px)
- `isCoarsePointer` (móvil/táctil)

---

## 12. Brechas críticas resumidas

1. **Seguridad**: 0 de 6 endpoints públicos tiene rate limiting
2. **Seguridad**: `assertAdminToken` es fail-open si `ADMIN_EMAILS` está vacío
3. **Conversión**: `whatToSayNow` y follow-ups se calculan pero nunca se envían
4. **Datos**: A/B tests no tienen tracking server-side → decisiones a ciegas
5. **UX**: Hero no se personaliza según UTM/canal aunque el scoring ya existe
6. **Compliance**: Sin banner de consentimiento, sin retención de datos, sin DSR
7. **Observabilidad**: Sin métricas de costo de Gemini, sin alertas de hot leads
