# LayerCloud — Firebase Schema

> Este documento describe todas las colecciones de Firestore usadas por la plataforma.
> Se divide en dos capas independientes que conviven en el mismo proyecto Firebase.

---

## Servicios Firebase a activar

| Servicio | Para qué |
|---|---|
| **Firestore** | Base de datos (modo Native) |
| **Authentication** | Login con email/password para todas las capas |
| **Storage** | Imágenes de tenants (logos, productos, heroes) |
| **Cloud Functions** | Registro de tenants, trial management, emails |
| **Hosting** | Deploy del sitio React |

---

## CAPA A — Landing page LayerCloud (analytics y leads)

Estas colecciones existen desde antes del sistema de demos.
Registran visitantes, leads del chatbot y formularios de contacto.
Solo el admin de LayerCloud (`admin: true` o `role: layercloud_superadmin`) puede leerlas.
Los clientes del sitio escriben en ellas sin autenticación.

---

### `visitors`

Registra cada visita de página.

| Campo | Tipo | Descripción |
|---|---|---|
| `path` | string | Ruta visitada |
| `visitorId` | string | ID anónimo persistente (localStorage) |
| `visitorSessionId` | string | ID de sesión actual |
| `currentUrl` | string | URL completa |
| `pageTitle` | string | Título de la página |
| `timestamp` | Timestamp | Cuándo ocurrió la visita |
| `userAgent` | string | Navegador/dispositivo |
| `referrer` | string | De dónde vino |
| `screen` | map | Resolución de pantalla |
| `language` | string | Idioma del navegador |
| `utmSource` | string | UTM source |
| `utmMedium` | string | UTM medium |
| `utmCampaign` | string | UTM campaign |
| `attributionChannel` | string | Canal de atribución calculado |
| `landingPath` | string | Primera página que pisó |
| `firstTouchAt` | Timestamp | Primera visita del visitante |

---

### `visitorProfiles`

Un documento por `visitorId`. Se actualiza en cada visita acumulando datos.

Mismos campos que `visitors` pero con lógica de first-touch y last-touch.

---

### `events`

Eventos de comportamiento (scroll, clicks, tiempo en página).

---

### `people` / `organizations`

Enriquecimiento de leads via IA. Solo escribe la Cloud Function.

---

### `leadThreads/{threadId}`

Ficha principal del lead que entra por el chatbot.

| Campo | Tipo | Descripción |
|---|---|---|
| `source` | string | `'chatbot'` |
| `status` | string | `'new'` / `'qualified'` / `'won'` / `'lost'` |
| `pipelineStage` | string | Etapa del pipeline de ventas |
| `name` | string | Nombre del lead |
| `company` | string | Empresa |
| `role` | string | Cargo |
| `email` | string | Email |
| `phone` | string | Teléfono |
| `industry` | string | Industria/rubro |
| `topPain` | string | Principal punto de dolor |
| `urgency` | string | Urgencia declarada |
| `budget` | string | Presupuesto aproximado |
| `leadScore` | number | Score 0-100 calculado por IA |
| `aiExecutiveSummary` | string | Resumen ejecutivo del lead |
| `aiNextBestAction` | string | Próximo paso recomendado |
| `aiFollowUpWhatsApp` | string | Mensaje WhatsApp sugerido |
| `createdAt` | Timestamp | — |
| `updatedAt` | Timestamp | — |
| `lastMessageAt` | Timestamp | Último mensaje del chat |

#### Sub-colección: `leadThreads/{threadId}/messages`

| Campo | Tipo |
|---|---|
| `role` | `'user'` / `'assistant'` |
| `content` | string |
| `stepKey` | string |
| `createdAt` | Timestamp |

---

### `contactSubmissions`

Formulario de contacto tradicional (/contacto).

| Campo | Tipo |
|---|---|
| `name` | string |
| `email` | string |
| `phone` | string |
| `company` | string |
| `message` | string |
| `status` | string |
| `pipelineStage` | string |
| UTM fields | string |
| AI analysis fields | varios |
| `createdAt` | Timestamp |

---

### `chatSessions`

Alias / versión simplificada de leadThreads para el chatbot inline.
Misma estructura que `leadThreads`.

---

## CAPA B — Plataforma SaaS multi-tenant (demos de clientes)

---

### `tenants/{tenantId}`  (documento raíz — meta)

Un documento por cliente registrado. Es el núcleo del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `tenantId` | string | `"muebleria-gomez-xk92"` |
| `ownerUid` | string | Firebase Auth UID del propietario |
| `ownerEmail` | string | — |
| `ownerName` | string | Nombre completo |
| `businessName` | string | `"Mueblería Gómez"` |
| `businessType` | string | Ver enum más abajo |
| `phone` | string | Teléfono del propietario |
| `trialStartsAt` | Timestamp | Inicio del trial |
| `trialEndsAt` | Timestamp | Fin del trial (start + 7 días) |
| `trialActive` | boolean | `false` cuando vence o es revocado |
| `plan` | string | `'trial'` / `'paid'` / `'suspended'` |
| `theme.primaryColor` | string | Hex del color principal |
| `theme.primaryHover` | string | Hex del color hover |
| `theme.mode` | string | `'light'` / `'dark'` |
| `siteConfig.heroTitle` | string | Título del hero de la tienda |
| `siteConfig.heroSubtitle` | string | — |
| `siteConfig.whatsappNumber` | string | Sin + ej: `"5491112345678"` |
| `siteConfig.address` | string | — |
| `siteConfig.email` | string | — |
| `siteConfig.logoUrl` | string? | Firebase Storage URL |
| `createdAt` | Timestamp | — |
| `updatedAt` | Timestamp | — |

**Enum businessType**:
`muebleria` / `indumentaria` / `electronica` / `ferreteria` /
`libreria` / `veterinaria` / `farmacia` / `gastronomia` / `servicios` / `otro`

---

### `tenants/{tenantId}/products`

| Campo | Tipo |
|---|---|
| `nombre` | string |
| `descripcion` | string |
| `precio` | number |
| `categorySlug` | string |
| `imagenes` | string[] |
| `stockActual` | number |
| `marca` | string |
| `costoActual` | number |
| `lastPriceBatchId` | string |
| `priceLocked` | boolean |
| `activo` | boolean |
| `destacado` | boolean |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

---

### `tenants/{tenantId}/categories`

| Campo | Tipo |
|---|---|
| `nombre` | string |
| `slug` | string |
| `descripcion` | string |
| `imagen` | string |
| `orden` | number |
| `activo` | boolean |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/orders`

| Campo | Tipo |
|---|---|
| `customerId` | string |
| `customerSnapshot` | map (nombre, email, telefono, direccion) |
| `items` | array (productId, nombre, cantidad, precioUnitario) |
| `status` | `'pendiente'` / `'confirmado'` / `'despachado'` / `'cancelado'` |
| `total` | number |
| `costoTotal` | number |
| `remitoId` | string? |
| `remitoNumero` | number? |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

---

### `tenants/{tenantId}/customers`

| Campo | Tipo |
|---|---|
| `nombre` | string |
| `apellido` | string |
| `dni` | string |
| `direccion` | string |
| `telefono` | string |
| `email` | string |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/offers`

| Campo | Tipo |
|---|---|
| `titulo` | string |
| `tipo` | `'fecha'` / `'volumen'` |
| `activa` | boolean |
| `productIds` | string[] |
| `descuentoPct` | number? |
| `precioOferta` | number? |
| `minUnidades` | number? (volumen) |
| `startsAt` | Timestamp? (fecha) |
| `endsAt` | Timestamp? (fecha) |
| `prioridad` | number |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/suppliers`

| Campo | Tipo |
|---|---|
| `nombre` | string |
| `contacto` | string |
| `telefono` | string |
| `email` | string |
| `direccion` | string |
| `notas` | string |
| `activo` | boolean |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/purchase_costs`

| Campo | Tipo |
|---|---|
| `productId` | string |
| `supplierId` | string |
| `moneda` | `'ARS'` / `'USD'` |
| `costoUnitario` | number |
| `usdRate` | number? |
| `cantidad` | number |
| `nroFactura` | string |
| `notas` | string |
| `fechaCompra` | Timestamp |
| `sumarStock` | boolean |
| `registrarEgreso` | boolean |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/stock_movements`

| Campo | Tipo |
|---|---|
| `productId` | string |
| `tipo` | `'ingreso'` / `'egreso'` |
| `cantidad` | number |
| `motivo` | string |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/finance_entries`

| Campo | Tipo |
|---|---|
| `tipo` | `'ingreso'` / `'egreso'` |
| `monto` | number |
| `detalle` | string |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/remitos`

| Campo | Tipo |
|---|---|
| `numero` | number |
| `orderId` | string |
| `customerId` | string |
| `total` | number |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/price_batches`

| Campo | Tipo |
|---|---|
| `batchId` | string |
| `mode` | `'percent'` / `'delta'` / `'margin'` |
| `status` | `'applied'` / `'rolled_back'` |
| `createdBy` | string (uid) |
| `createdAt` | Timestamp |
| `updatedAt` | Timestamp |

---

### `tenants/{tenantId}/landing_heroes`

| Campo | Tipo |
|---|---|
| `titulo` | string |
| `subtitulo` | string |
| `descripcion` | string |
| `badge` | string |
| `ctaLabel` | string |
| `ctaUrl` | string |
| `imagenDesktop` | string |
| `imagenMobile` | string |
| `orden` | number |
| `activo` | boolean |
| `createdAt` | Timestamp |

---

### `tenants/{tenantId}/business_config`  (doc único: `main`)

| Campo | Tipo |
|---|---|
| `businessName` | string |
| `businessPhone` | string |
| `businessEmail` | string |
| `businessAddress` | string |
| `whatsappNumber` | string |
| `logoUrl` | string? |
| `instagramUrl` | string? |
| `facebookUrl` | string? |

---

### `tenants/{tenantId}/users`

| Campo | Tipo |
|---|---|
| `email` | string |
| `displayName` | string |
| `role` | `'tenant_admin'` / `'tenant_employee'` |
| `modules` | string[] (módulos habilitados) |
| `active` | boolean |
| `lastLogin` | Timestamp? |
| `createdAt` | Timestamp |

---

### `layercloud_tenants_index/{tenantId}`

Índice desnormalizado para el panel super admin.
Solo escribe Cloud Functions. Solo lee el super admin.

| Campo | Tipo |
|---|---|
| `tenantId` | string |
| `ownerEmail` | string |
| `ownerName` | string |
| `businessType` | string |
| `businessName` | string |
| `trialStartsAt` | Timestamp |
| `trialEndsAt` | Timestamp |
| `trialActive` | boolean |
| `lastActiveAt` | Timestamp |
| `pageViewsCount` | number |
| `loginCount` | number |
| `createdAt` | Timestamp |
| `convertedToPaid` | boolean |

---

### `layercloud_sessions/{sessionId}`

Analytics de uso por tenant. Alimenta el detalle en el super admin.

| Campo | Tipo |
|---|---|
| `tenantId` | string |
| `userId` | string |
| `path` | string |
| `event` | string (ver enum en architecture.md) |
| `timestamp` | Timestamp |
| `userAgent` | string? |

---

## Reglas de acceso (resumen)

El archivo completo y desplegable está en: `docs/firestore.rules`

| Colección | Lectura | Escritura |
|---|---|---|
| `visitors`, `events`, `chatSessions`, etc. | Admin LayerCloud | Pública (cualquier visitante) |
| `contactSubmissions` | Admin LayerCloud | Pública |
| `tenants/{id}` (meta) | Super admin, tenant owner | Super admin / CF |
| `tenants/{id}/*` (sub-cols) | Super admin, tenant members + trial activo | Super admin, tenant admin + trial activo |
| `tenants/{id}/products` (read) | **Público** (mientras trial activo) | Tenant admin |
| `layercloud_tenants_index` | Solo super admin | Solo CF / super admin |
| `layercloud_sessions` | Solo super admin | Cualquier usuario autenticado |

---

## Configuración de admin

Para el panel `/admin` de la landing (Capa A):
- Crear usuario en Firebase Auth
- Asignar custom claim: `admin: true`

Para el super admin de la plataforma SaaS (Capa B):
- Crear usuario en Firebase Auth
- Asignar custom claim: `role: "layercloud_superadmin"` y `admin: true`

```bash
# Con Firebase Admin SDK (Node.js):
admin.auth().setCustomUserClaims(uid, {
  admin: true,
  role: 'layercloud_superadmin'
});
```

Ver arquitectura completa en `docs/multi-tenant-architecture.md`.
