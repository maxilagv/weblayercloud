# Mapa de aplicacion real para fases 01-03

> Objetivo: convertir los planes 01, 02 y 03 en una hoja de ejecucion aplicable al codigo actual, corrigiendo desfasajes entre documentacion y repositorio para evitar implementaciones incompletas o con efectos colaterales.

---

## 1. Base real del proyecto

- El baseline actual compila: `npm run lint` y `npm run build` pasan hoy.
- La app real usa `react@19` y `react-router-dom@7.13.1`, no React 18 / Router v6, aunque la API usada sigue siendo estilo v6.
- La coleccion canonica de personas es `people`, no `persons`.
- El tracking hoy ya persiste en `visitors`, `visitorProfiles` y `events`.
- El endpoint canonico de conversion del formulario ya existe: `api/intake/contact.ts` registra `contact_submission` server-side.
- El proyecto de Firebase Functions actual es CommonJS JavaScript con entrada en `functions/index.js`; no existe `functions/src`.

---

## 2. Correcciones obligatorias al plan original

### Correcciones de documentacion

| Tema | Documento original | Realidad del repo | Decision canonica |
|---|---|---|---|
| Personas | `persons` | `people` | Toda fase 01-03 debe usar `people` |
| Frontend env de Turnstile | `TURNSTILE_SITE_KEY` en frontend | Vite solo expone `VITE_*` | Usar `VITE_TURNSTILE_SITE_KEY` |
| Cloud Functions | `functions/src/*.ts` | `functions/index.js` + modulos JS | Si se usa worker/SLA, implementarlo en `functions/` y exportarlo desde `functions/index.js` |
| Conversion A/B | nuevo `contact_conversion` | ya existe `contact_submission` server-side | Usar `contact_submission` como conversion canonica |
| Timestamp de eventos | ejemplo con `createdAt` | `events` guarda `occurredAt` | Los reportes A/B deben consultar `occurredAt` |

### Ajustes de arquitectura necesarios

- Fase 02 no debe depender de promesas "fire-and-forget" en Vercel. Si se hace `triggerFollowUpPipeline(...).catch(...)` sin `await`, la ejecucion puede cortarse antes de completar los envios.
- Fase 02 no puede disparar follow-up en cada milestone del chat sin deduplicacion. Hoy `api/chat/message.ts` puede analizar en 8, 12, 16 y 100 campos; sin control eso multiplicaria emails y alertas.
- Fase 03 no debe agregar una segunda fuente de conversion si no se define una sola fuente de verdad. Hoy ya conviven `form_submit` cliente y `contact_submission` server-side.
- La verificacion de origen del plan 01 no debe usar `startsWith` sobre strings de URL. Hay que parsear `origin` / `referer` y comparar origenes exactos.

---

## 3. Orden recomendado de ejecucion

### Paso 0: normalizar contratos compartidos

Archivos:

- `api/_lib/http.ts`
- `api/_lib/crmEngine.ts`
- `src/lib/attribution.ts`
- `src/lib/tracking.ts`
- `src/lib/crm.ts`
- `.env.example`

Objetivo:

- Dejar definidos los contratos que van a tocar las tres fases.
- Agregar helpers reutilizables antes de tocar endpoints o UI.

Cambios que conviene hacer primero:

- Agregar en `api/_lib/http.ts`:
  - `assertBodySize(req, maxBytes)`
  - `sanitizeTranscript(value, maxMessages, maxContentLength)`
- Extender `AttributionContext` en `api/_lib/crmEngine.ts` con `abVariants?: Record<string, string>`.
- Agregar una version enriquecida de atribucion con A/B en frontend y reutilizarla desde tracking y CRM, no solo desde una pagina puntual.
- Actualizar `.env.example` con:
  - `ALLOWED_ORIGIN`
  - `TURNSTILE_SECRET_KEY`
  - `VITE_TURNSTILE_SITE_KEY`
  - `RESEND_API_KEY`
  - `FROM_EMAIL`
  - `SLACK_WEBHOOK_URL` / `TELEGRAM_WEBHOOK_URL`
  - `ADMIN_URL`

Resultado esperado:

- Las fases 01-03 comparten la misma forma de leer body, atribucion y contexto A/B.

---

## 4. Fase 01: seguridad critica

### 4.1 Infraestructura comun

Crear:

- `api/_lib/rateLimit.ts`

Actualizar:

- `api/_lib/http.ts`
- `docs/firestore.rules`
- `api/_lib/firebaseAdmin.ts`

Decisiones de implementacion:

- `getClientKey(req)` debe tomar IP real desde `x-forwarded-for` / `x-real-ip`.
- Si no hay IP valida, debe poder caer a un fallback controlado como `visitorId` para no meter todo en la misma llave `unknown`.
- El rate limit debe aplicarse antes del trabajo pesado de cada handler.
- `_rateLimits` debe quedar inaccesible al cliente en `docs/firestore.rules`.
- `assertAdminToken` debe quedar fail-closed si `ADMIN_EMAILS` esta vacio.

### 4.2 Aplicacion endpoint por endpoint

| Endpoint | Archivo | Controles |
|---|---|---|
| `/api/lead-strategy` | `api/lead-strategy.ts` | rate limit, `assertBodySize`, `sanitizeTranscript`, origin check estricto |
| `/api/chat/message` | `api/chat/message.ts` | rate limit, `assertBodySize`, limite de `content`, transcript saneado |
| `/api/chat/session` | `api/chat/session.ts` | rate limit, `assertBodySize` |
| `/api/intake/contact` | `api/intake/contact.ts` | rate limit, `assertBodySize`, Turnstile, saneado fuerte de input |
| `/api/track-visit` | `api/track-visit.ts` | rate limit, `assertBodySize` |
| `/api/track-event` | `api/track-event.ts` | rate limit, `assertBodySize`, limitar payload libre |

### 4.3 Turnstile

Archivos:

- `src/pages/Contact.tsx`
- `src/lib/crm.ts`
- `api/intake/contact.ts`

Regla de integracion:

- No meter la key publica como `TURNSTILE_SITE_KEY` en cliente.
- El submit del contacto necesita transportar `turnstileToken`; eso implica extender el contrato de `submitContactSubmission`, no solo el JSX del formulario.
- El backend debe rechazar token invalido solo en produccion o cuando la secret exista.
- El frontend debe resetear el widget despues de error o submit exitoso.

### 4.4 Criterios de salida de fase 01

- Ningun endpoint publico acepta trafico ilimitado.
- `assertAdminToken` deja de promover usuarios autenticados a admin cuando `ADMIN_EMAILS` esta vacio.
- `lead-strategy` solo acepta origenes permitidos en produccion.
- El contacto no puede enviarse sin Turnstile valido cuando la secret esta configurada.
- `npm run lint` y `npm run build` siguen pasando.

### 4.5 Riesgos a evitar

- No usar comparaciones por prefijo para `origin` / `referer`.
- No dejar el body size check despues del parseo logico del payload.
- No introducir un rate limit comun demasiado agresivo para `track-event` y romper analytics legitimos.

---

## 5. Fase 02: follow-up automatico

### 5.1 Principio rector

No disparar envios directos en background desde handlers serverless sin persistencia intermedia.

Arquitectura recomendada:

1. `api/intake/contact.ts` y `api/chat/message.ts` persisten analisis.
2. Se crea un job durable en Firestore, por ejemplo `followUpJobs`.
3. Un worker procesa los jobs y ejecuta email / Slack / Telegram.
4. El job guarda estado: `pending`, `processing`, `sent`, `failed`.

### 5.2 Ubicacion real de la implementacion

Archivos recomendados:

- `api/_lib/notificationService.ts`
- `api/_lib/followUpQueue.ts`
- `api/intake/contact.ts`
- `api/chat/message.ts`
- `functions/index.js`
- `functions/...` modulo JS nuevo para procesar jobs o SLA

No usar:

- `functions/src/leadSla.ts` tal cual aparece en el documento, porque esa estructura hoy no existe.

### 5.3 Reglas de disparo para no duplicar

- `contact_form`: siempre encola, porque es una conversion explicita.
- `chatbot`: encolar solo si:
  - `priorityLevel` es `warm` o `hot`, y
  - todavia no existe follow-up enviado para ese `leadThreadId`, o
  - se trata del milestone final y se decide reemplazar el contenido previo.

Campos sugeridos de control en `leadThreads` / `contactSubmissions`:

- `followUpStatus`
- `followUpChannelsSent`
- `followUpLastSentAt`
- `followUpLastStrategyHash`

### 5.4 Canales

- Email al lead: Resend.
- Alerta interna: Slack o Telegram.
- WhatsApp: dejar fuera del primer corte salvo que haya proveedor definido y estable.

### 5.5 Criterios de salida de fase 02

- Un contacto enviado genera exactamente un follow-up job.
- Un mismo lead del chat no dispara multiples notificaciones por milestones intermedios sin control.
- Si Resend o Slack fallan, el job queda trazable y reintentable.
- La respuesta al visitante no depende del exito del webhook interno.

### 5.6 Riesgos a evitar

- No hacer `triggerFollowUpPipeline(...); return res.status(200)...` esperando que Vercel termine el trabajo.
- No notificar en frio todos los leads del chat.
- No mezclar el estado de jobs con los datos del lead sin una llave de deduplicacion.

---

## 6. Fase 03: A/B testing real

### 6.1 Fuente unica de verdad para conversion

Usar `contact_submission` como conversion canonica.

Razon:

- Ya se registra server-side en `api/intake/contact.ts`.
- Evita duplicar `form_submit` cliente + `contact_conversion` cliente + `contact_submission` server.
- Permite medir solo conversiones realmente persistidas.

### 6.2 Propagacion de variantes

Archivos:

- `src/lib/attribution.ts`
- `src/lib/tracking.ts`
- `src/lib/crm.ts`
- `api/_lib/crmEngine.ts`

Contrato canonico:

- `attribution.abVariants` viaja desde frontend al backend.
- `buildAttributionFields()` persiste `abVariants` en:
  - `visitors`
  - `events`
  - `chatSessions`
  - `contactSubmissions`
- `normalizeAttribution()` debe sanear `abVariants` con `toPlainObject`.

### 6.3 Decision de integracion en frontend

No depender de un parche solo en `src/pages/Contact.tsx`.

Implementacion preferida:

- enriquecer `getAttributionContext()` o crear `getAttributionContextWithAB()`
- reutilizarlo desde:
  - `src/lib/tracking.ts`
  - `src/lib/crm.ts`

Asi:

- `trackVisit`
- `trackBehaviorEvent`
- `submitContactSubmission`

transportan A/B sin duplicar codigo por pagina.

### 6.4 Endpoint de resultados

Crear:

- `api/ab-results.ts`

Puntos de cuidado:

- Si el endpoint queda en `GET`, el frontend necesita helper autenticado adicional; hoy `src/lib/apiClient.ts` solo resuelve `POST`.
- Alternativa valida: exponer `POST /api/ab-results` y reutilizar `postJson(..., { auth: 'admin' })`.
- La consulta de eventos debe usar `occurredAt`, no `createdAt`.
- El agregador debe tolerar ambas formas si durante la migracion hay documentos viejos sin `abVariants`.

### 6.5 Admin

Archivo:

- `src/pages/Admin.tsx`

Agregar:

- bloque o tab de experimentos
- tabla por test:
  - variante
  - visitas
  - conversiones
  - tasa

No hace falta meter Thompson Sampling en el mismo corte. Eso puede quedar para la siguiente iteracion una vez que el tracking este validado.

### 6.6 Criterios de salida de fase 03

- Cada visita persiste variantes activas.
- Cada `contact_submission` queda atribuida a variantes concretas.
- El admin puede ver visitas y conversiones por variante.
- No existe doble conteo de conversion por eventos redundantes.

### 6.7 Riesgos a evitar

- No cambiar los nombres de tests a mitad de implementacion.
- No asumir que `ab_demo_bar_cta` y `demo_bar_cta` son equivalentes si no se normalizan en el agregador.
- No calcular resultados mezclando `form_submit` con `contact_submission`.

---

## 7. Secuencia sugerida de entrega

### Entrega A

- Fase 01 completa
- sin follow-up
- sin panel A/B

### Entrega B

- cola durable de follow-up
- email + alerta interna
- deduplicacion por `leadThreadId`

### Entrega C

- atribucion A/B completa
- endpoint de resultados
- seccion de experimentos en admin

---

## 8. Matriz de validacion minima

### Automatizable

- `npm run lint`
- `npm run build`

### Manual backend

- spam controlado contra cada endpoint devuelve `429`
- `lead-stage` rechaza usuario autenticado no admin cuando `ADMIN_EMAILS` esta vacio
- `lead-strategy` rechaza origen externo en produccion
- contacto sin Turnstile valido falla
- contacto valido crea lead, analisis y job de follow-up

### Manual datos

- `visitors` guarda `abVariants`
- `events` guarda `abVariants` y `occurredAt`
- `contactSubmissions` y `chatSessions` guardan `abVariants`
- `followUpJobs` refleja estado real del envio

### Manual admin

- cambio de etapa sigue funcionando
- resultados A/B cargan autenticados
- no hay duplicados de conversion para una misma solicitud

---

## 9. Conclusiones operativas

- La fase 01 es aplicable casi linea por linea, con dos ajustes: origin check estricto y env publica de Turnstile con prefijo `VITE_`.
- La fase 02 necesita adaptacion arquitectonica para ser confiable: cola durable y deduplicacion; implementarla "fire-and-forget" seria fragil.
- La fase 03 es viable, pero debe apoyarse en la conversion server-side ya existente y no crear una fuente paralela.
- Con estas correcciones, las tres primeras fases pueden ejecutarse sin romper el flujo actual ni contaminar metricas.
