# LayerCloud — Arquitectura SaaS Multi-Tenant
## Documento de referencia técnica completo

> **Estado**: Diseño aprobado. Listo para implementar.
> **Última actualización**: 2026-03-17
> **Stack**: React 19 + TypeScript + Firebase (Auth, Firestore, Storage, Functions, Hosting)

---

## Índice

1. [Visión general](#1-visión-general)
2. [Modelo de datos Firestore](#2-modelo-de-datos-firestore)
3. [Firebase Authentication](#3-firebase-authentication)
4. [Firestore Security Rules](#4-firestore-security-rules)
5. [URL routing](#5-url-routing)
6. [Cloud Functions](#6-cloud-functions)
7. [Demo data seeding por rubro](#7-demo-data-seeding-por-rubro)
8. [Firebase Storage](#8-firebase-storage)
9. [Colores dinámicos por tenant](#9-colores-dinámicos-por-tenant)
10. [Trial enforcement](#10-trial-enforcement)
11. [Analytics de uso](#11-analytics-de-uso)
12. [Panel super admin LayerCloud](#12-panel-super-admin-layercloud)
13. [Emails de bienvenida y expiración](#13-emails-de-bienvenida-y-expiración)
14. [Firebase Hosting](#14-firebase-hosting)
15. [Orden de implementación](#15-orden-de-implementación)
16. [Límites y costos Firebase](#16-límites-y-costos-firebase)

---

## 1. Visión general

```
layercloud.com.ar
│
├── /                        ← Landing page LayerCloud (ya existe)
├── /solucion                ← Página de producto (ya existe)
├── /contacto                ← Formulario de contacto (ya existe)
│
├── /registro                ← Wizard de registro del cliente (PyME)
├── /login                   ← Login del cliente
├── /dashboard               ← Panel personal del cliente (trial countdown, personalización)
│
├── /demo/{tenantId}         ← Tienda pública de la demo del cliente
├── /demo/{tenantId}/admin   ← Panel admin de la demo del cliente
│
└── /layercloud-admin        ← Super admin LayerCloud (ver todos los tenants)
```

**Un solo dominio. Un solo proyecto Firebase. Un solo deploy.**

---

## 2. Modelo de datos Firestore

### Estructura completa de colecciones

```
firestore/
│
├── tenants/
│   └── {tenantId}/
│       │
│       ├── [documento raíz — "meta"]     ← TenantMeta
│       │
│       ├── products/          ← Catálogo de productos
│       ├── categories/        ← Categorías del catálogo
│       ├── orders/            ← Pedidos recibidos
│       ├── customers/         ← Base de clientes del tenant
│       ├── offers/            ← Ofertas y promociones
│       ├── suppliers/         ← Proveedores
│       ├── purchase_costs/    ← Costos de compra (ARS/USD)
│       ├── stock_movements/   ← Movimientos de stock
│       ├── finance_entries/   ← Ingresos/egresos manuales
│       ├── remitos/           ← Remitos generados
│       ├── price_batches/     ← Historial de cambios de precio
│       ├── landing_heroes/    ← Slides del hero de la tienda
│       ├── business_config/   ← Configuración del negocio
│       └── users/             ← Empleados del tenant
│
├── layercloud_sessions/       ← Analytics de uso por tenant
│
└── layercloud_tenants_index/  ← Índice para el panel super admin
```

---

### Documento raíz del tenant: `tenants/{tenantId}`

```typescript
interface TenantMeta {
  tenantId:     string;           // ej: "muebleria-gomez-xk92"
  ownerUid:     string;           // Firebase Auth UID del propietario
  ownerEmail:   string;
  ownerName:    string;
  businessName: string;           // "Mueblería Gómez"
  businessType: BusinessType;     // ver enum abajo

  // Trial
  trialStartsAt: Timestamp;
  trialEndsAt:   Timestamp;       // = trialStartsAt + 7 días
  trialActive:   boolean;         // la Cloud Function lo pone en false al vencer
  plan:          'trial' | 'paid' | 'suspended';

  // Personalización visual (editable desde /dashboard)
  theme: {
    primaryColor:   string;       // hex ej: "#FF3B00"
    primaryHover:   string;       // hex calculado (10% más oscuro)
    fontDisplay:    string;       // "Space Grotesk"
    mode:           'light' | 'dark';
  };

  // Configuración del negocio (editable desde /dashboard)
  siteConfig: {
    heroTitle:       string;
    heroSubtitle:    string;
    whatsappNumber:  string;      // formato internacional sin + ej: "5491112345678"
    address:         string;
    email:           string;
    logoUrl?:        string;      // Firebase Storage URL
    instagramUrl?:   string;
    facebookUrl?:    string;
  };

  createdAt:  Timestamp;
  updatedAt?: Timestamp;
}

type BusinessType =
  | 'muebleria'
  | 'indumentaria'
  | 'electronica'
  | 'ferreteria'
  | 'libreria'
  | 'veterinaria'
  | 'farmacia'
  | 'gastronomia'
  | 'servicios'
  | 'otro';
```

---

### Sub-colecciones del tenant

Todas las sub-colecciones replican el esquema de tech_king exactamente.
Ver `docs/tenant-data-schemas.md` para el detalle campo por campo de cada colección.

---

### `layercloud_tenants_index/{tenantId}`

```typescript
interface TenantIndexEntry {
  tenantId:         string;
  ownerEmail:       string;
  ownerName:        string;
  businessType:     BusinessType;
  businessName:     string;
  trialStartsAt:    Timestamp;
  trialEndsAt:      Timestamp;
  trialActive:      boolean;
  lastActiveAt:     Timestamp;    // última actividad registrada
  pageViewsCount:   number;       // total de page_view events
  loginCount:       number;       // total de logins
  createdAt:        Timestamp;
  convertedToPaid:  boolean;
}
```

---

### `layercloud_sessions/{sessionId}`

```typescript
interface SessionEvent {
  tenantId:  string;
  userId:    string;         // Firebase Auth UID
  path:      string;         // ruta visitada
  event:     SessionEventType;
  timestamp: Timestamp;
  userAgent?: string;
}

type SessionEventType =
  | 'login'
  | 'page_view'
  | 'product_view'
  | 'product_edit'
  | 'product_create'
  | 'order_view'
  | 'order_status_change'
  | 'customer_view'
  | 'stock_edit'
  | 'finance_view'
  | 'config_save'
  | 'trial_expired_shown';
```

---

## 3. Firebase Authentication

### Custom Claims por rol

| Rol | Claims |
|---|---|
| Propietario del tenant | `{ tenantId: "...", role: "tenant_admin", trialActive: true }` |
| Empleado del tenant | `{ tenantId: "...", role: "tenant_employee", modules: ["productos","pedidos"] }` |
| Super admin LayerCloud | `{ role: "layercloud_superadmin", admin: true }` |

### Cómo se asignan los claims

Los custom claims **solo se pueden asignar desde el servidor** con Firebase Admin SDK.
Nunca desde el cliente.

```javascript
// En la Cloud Function onTenantRegistration
await admin.auth().setCustomUserClaims(uid, {
  tenantId:    tenantId,
  role:        'tenant_admin',
  trialActive: true,
});
```

### Importante: refresco de token

Después de asignar claims, el cliente debe refrescar el ID token
para que los nuevos claims queden disponibles en `request.auth.token`:

```javascript
// En el cliente, después de que la CF confirme éxito
await auth.currentUser.getIdToken(true); // forceRefresh = true
```

---

## 4. Firestore Security Rules

El archivo completo y listo para deploy está en:
```
docs/firestore.rules
```

Para desplegarlo:
```bash
firebase deploy --only firestore:rules
```

### Principios de las reglas

1. **Aislamiento total entre tenants** — un tenant nunca puede leer datos de otro.
2. **Trial enforcement en servidor** — aunque el cliente esté manipulado, Firestore bloquea si el trial venció.
3. **Lectura pública de catálogo** — products, categories, offers, landing_heroes, business_config son legibles por cualquiera (sin auth) mientras el trial esté activo. Esto permite que los clientes finales de la demo naveguen sin login.
4. **Super admin bypassa todo** — con `role: "layercloud_superadmin"` se puede leer/escribir cualquier tenant.
5. **La función `trialIsActive()`** lee el documento meta del tenant, lo que consume 1 read de Firestore por evaluación. Usar con criterio.

---

## 5. URL routing

### Estructura de rutas en React Router

```
/                              → LayerCloud Home (ya existe)
/solucion                      → LayerCloud Product
/contacto                      → LayerCloud Contact

/registro                      → TenantRegister (wizard 3 pasos)
/login                         → TenantLogin
/dashboard                     → TenantDashboard (requiere auth)
/dashboard/personalizar        → Editor de tema y siteConfig

/demo/:tenantId                → DemoHome (tienda pública)
/demo/:tenantId/products       → DemoProducts
/demo/:tenantId/products/:id   → DemoProductDetail
/demo/:tenantId/checkout       → DemoCheckout
/demo/:tenantId/about          → DemoAbout
/demo/:tenantId/contact        → DemoContact (de la tienda)
/demo/:tenantId/admin          → DemoAdminHome (panel del cliente)
/demo/:tenantId/admin/productos
/demo/:tenantId/admin/categorias
/demo/:tenantId/admin/ofertas
/demo/:tenantId/admin/landing
/demo/:tenantId/admin/pedidos
/demo/:tenantId/admin/clientes
/demo/:tenantId/admin/stock
/demo/:tenantId/admin/precios
/demo/:tenantId/admin/costos
/demo/:tenantId/admin/proveedores
/demo/:tenantId/admin/finanzas
/demo/:tenantId/admin/remitos
/demo/:tenantId/admin/qr
/demo/:tenantId/admin/usuarios

/layercloud-admin              → SuperAdmin Dashboard
/layercloud-admin/tenants      → Lista de todos los tenants
/layercloud-admin/tenants/:id  → Detalle de un tenant
/layercloud-admin/config       → Configuración de la plataforma
```

### Generación del tenantId

```javascript
// Cloud Function: generateTenantId
function generateTenantId(businessType, ownerLastName) {
  const slug = slugify(ownerLastName.toLowerCase());          // "gomez"
  const suffix = Math.random().toString(36).substring(2, 6); // "xk92"
  return `${businessType}-${slug}-${suffix}`;                // "muebleria-gomez-xk92"
}
```

---

## 6. Cloud Functions

### Estructura del directorio functions/

```
functions/
├── package.json
├── index.js                    ← Exporta todas las funciones
│
├── tenant/
│   ├── onTenantRegistration.js ← PRINCIPAL: crea tenant, seeds, claims
│   ├── checkExpiredTrials.js   ← Scheduler cada hora
│   ├── extendTrial.js          ← Super admin extiende N días
│   └── revokeTrial.js          ← Super admin revoca acceso
│
├── email/
│   ├── sendWelcomeEmail.js     ← Email al registrarse
│   └── sendExpirationWarning.js← Email 24h antes de vencer
│
├── seeds/
│   ├── index.js                ← Dispatcher por rubro
│   ├── muebleria.js
│   ├── indumentaria.js
│   ├── electronica.js
│   ├── ferreteria.js
│   ├── libreria.js
│   ├── veterinaria.js
│   └── gastronomia.js
│
└── utils/
    ├── generateTenantId.js
    └── slugify.js
```

### onTenantRegistration (función principal)

```javascript
// functions/tenant/onTenantRegistration.js

exports.onTenantRegistration = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Requiere auth');

  const { ownerName, businessName, businessType, phone } = data;
  const uid   = context.auth.uid;
  const email = context.auth.token.email;

  // 1. Generar tenantId único
  const lastName = ownerName.split(' ').pop();
  const tenantId = generateTenantId(businessType, lastName);

  // 2. Calcular fechas del trial
  const trialStartsAt = new Date();
  const trialEndsAt   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 3. Asignar custom claims al usuario
  await admin.auth().setCustomUserClaims(uid, {
    tenantId,
    role:        'tenant_admin',
    trialActive: true,
  });

  const db = admin.firestore();

  // 4. Crear documento meta del tenant
  await db.collection('tenants').doc(tenantId).set({
    tenantId,
    ownerUid:   uid,
    ownerEmail: email,
    ownerName,
    businessName,
    businessType,
    phone,
    trialStartsAt: admin.firestore.FieldValue.serverTimestamp(),
    trialEndsAt:   admin.firestore.Timestamp.fromDate(trialEndsAt),
    trialActive:   true,
    plan:          'trial',
    theme: {
      primaryColor: '#3B82F6',
      primaryHover: '#2563EB',
      fontDisplay:  'Space Grotesk',
      mode:         'light',
    },
    siteConfig: {
      heroTitle:      `Bienvenidos a ${businessName}`,
      heroSubtitle:   '¡Explorá nuestros productos!',
      whatsappNumber: phone.replace(/\D/g, ''),
      address:        '',
      email:          email,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 5. Sembrar datos de demo según rubro
  await seedDemoData(tenantId, businessType);

  // 6. Crear entrada en el índice del super admin
  await db.collection('layercloud_tenants_index').doc(tenantId).set({
    tenantId,
    ownerEmail:      email,
    ownerName,
    businessType,
    businessName,
    trialStartsAt:   admin.firestore.Timestamp.fromDate(trialStartsAt),
    trialEndsAt:     admin.firestore.Timestamp.fromDate(trialEndsAt),
    trialActive:     true,
    lastActiveAt:    admin.firestore.FieldValue.serverTimestamp(),
    pageViewsCount:  0,
    loginCount:      0,
    convertedToPaid: false,
    createdAt:       admin.firestore.FieldValue.serverTimestamp(),
  });

  // 7. Enviar email de bienvenida (best-effort)
  try {
    await sendWelcomeEmail({ email, ownerName, businessName, tenantId, trialEndsAt });
  } catch (e) {
    console.error('[LayerCloud] Welcome email failed:', e);
  }

  return { success: true, tenantId };
});
```

### checkExpiredTrials (scheduler)

```javascript
// functions/tenant/checkExpiredTrials.js
// Corre cada hora — revisa trials vencidos y los desactiva

exports.checkExpiredTrials = functions.pubsub
  .schedule('every 60 minutes')
  .timeZone('America/Argentina/Buenos_Aires')
  .onRun(async () => {
    const db  = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    const snap = await db.collection('layercloud_tenants_index')
      .where('trialActive', '==', true)
      .where('trialEndsAt', '<', now)
      .get();

    if (snap.empty) return null;

    const batch = db.batch();

    for (const doc of snap.docs) {
      const { tenantId } = doc.data();

      // Marcar vencido en índice
      batch.update(doc.ref, { trialActive: false });

      // Marcar vencido en meta del tenant
      batch.update(db.collection('tenants').doc(tenantId), {
        trialActive: false,
        plan:        'suspended',
      });

      // Revocar custom claims (forzar re-autenticación)
      const ownerUid = (await db.collection('tenants').doc(tenantId).get())
        .data()?.ownerUid;
      if (ownerUid) {
        await admin.auth().setCustomUserClaims(ownerUid, {
          tenantId,
          role:        'tenant_admin',
          trialActive: false,   // ← el claim cambia
        });
      }
    }

    await batch.commit();
    console.log(`[LayerCloud] ${snap.size} trials desactivados`);
    return null;
  });
```

### extendTrial (callable por super admin)

```javascript
// functions/tenant/extendTrial.js

exports.extendTrial = functions.https.onCall(async (data, context) => {
  if (context.auth?.token.role !== 'layercloud_superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'Solo super admin');
  }

  const { tenantId, extraDays } = data;
  const db = admin.firestore();

  const metaRef  = db.collection('tenants').doc(tenantId);
  const indexRef = db.collection('layercloud_tenants_index').doc(tenantId);

  const meta = (await metaRef.get()).data();
  const base = meta.trialEndsAt.toDate();
  const newEnd = new Date(base.getTime() + extraDays * 24 * 60 * 60 * 1000);
  const newEndTs = admin.firestore.Timestamp.fromDate(newEnd);

  const batch = db.batch();
  batch.update(metaRef,  { trialEndsAt: newEndTs, trialActive: true, plan: 'trial' });
  batch.update(indexRef, { trialEndsAt: newEndTs, trialActive: true });
  await batch.commit();

  // Restaurar claims si estaban revocados
  await admin.auth().setCustomUserClaims(meta.ownerUid, {
    tenantId,
    role:        'tenant_admin',
    trialActive: true,
  });

  return { success: true, newTrialEndsAt: newEnd.toISOString() };
});
```

---

## 7. Demo data seeding por rubro

Al registrarse, la Cloud Function siembra datos realistas para que
el cliente vea su panel con contenido, no vacío.

### Rubros implementados (v1)

| businessType | Productos ejemplo | Categorías |
|---|---|---|
| `muebleria` | Sillón 3 cuerpos, Mesa ratona, Escritorio L, Placard 3 puertas | Living, Dormitorio, Cocina, Oficina |
| `indumentaria` | Remera básica, Pantalón chino, Campera impermeable | Mujer, Hombre, Accesorios |
| `electronica` | Auriculares BT, Cargador USB-C, Powerbank 20000mAh | Audio, Carga, Accesorios |
| `ferreteria` | Taladro percutor, Set destornilladores, Pintura látex blanca | Herramientas, Pinturas, Electricidad |
| `libreria` | Cuaderno tapa dura, Lapicera azul x10, Resma A4 | Útiles, Papelería, Arte |
| `veterinaria` | Alimento perro adulto 3kg, Antiparasitario, Juguete masticable | Perros, Gatos, Accesorios |
| `gastronomia` | Combo hamburguesa, Pizza muzzarella, Empanadas x12 | Hamburguesas, Pizzas, Empanadas |

Cada seed incluye:
- 3-5 categorías con imágenes placeholder (Unsplash CDN)
- 8-12 productos con precios, stock, imágenes
- 2 landing heroes con título y subtítulo del rubro
- 1 configuración de negocio base

---

## 8. Firebase Storage

### Estructura de carpetas por tenant

```
storage/
└── tenants/
    └── {tenantId}/
        ├── logo.png              ← Logo del negocio (max 512KB)
        ├── products/
        │   └── {productId}_{n}.jpg
        ├── categories/
        │   └── {categoryId}.jpg
        └── heroes/
            ├── desktop_{n}.jpg
            └── mobile_{n}.jpg
```

### Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Archivos del tenant: lectura pública, escritura solo del propietario
    match /tenants/{tenantId}/{allPaths=**} {
      allow read:  if true;  // imágenes son públicas (CDN)
      allow write: if request.auth != null
                && request.auth.token.tenantId == tenantId
                && request.resource.size < 5 * 1024 * 1024; // max 5MB
    }

    // Denegar todo lo demás
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 9. Colores dinámicos por tenant

Cada tenant elige su color primario al personalizar su tienda.
Se inyectan como CSS variables en el `<html>` al montar el `TenantProvider`.

```typescript
// En TenantProvider, al cargar tenantMeta

useEffect(() => {
  if (!tenantMeta?.theme) return;
  const root = document.documentElement;
  root.style.setProperty('--tk-primary',       tenantMeta.theme.primaryColor);
  root.style.setProperty('--tk-primary-hover',  tenantMeta.theme.primaryHover);
  root.style.setProperty('--tk-primary-subtle', hexToRgba(tenantMeta.theme.primaryColor, 0.08));

  // Restaurar al salir del contexto del tenant
  return () => {
    root.style.removeProperty('--tk-primary');
    root.style.removeProperty('--tk-primary-hover');
    root.style.removeProperty('--tk-primary-subtle');
  };
}, [tenantMeta]);
```

---

## 10. Trial enforcement

El trial se bloquea en **tres capas independientes**:

| Capa | Mecanismo | Qué bloquea |
|---|---|---|
| **Firestore Rules** | `trialIsActive()` en cada regla | Reads/writes al servidor |
| **TenantContext** | `trialExpired` state | Renderizado del frontend |
| **TrialGuard** | Overlay fullscreen | UX — impide navegar |

### TrialGuard (overlay de expiración)

```tsx
// El overlay cubre toda la pantalla cuando el trial vence.
// Solo muestra el link de contacto a LayerCloud.

function TrialGuard({ children }) {
  const { trialExpired, tenantMeta, loading } = useTenant();

  if (loading) return <FullPageSpinner />;

  if (trialExpired) return (
    <>
      {/* Overlay encima de todo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.92)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', padding: '48px', maxWidth: 480, textAlign: 'center' }}>
          <h2>Tu período de prueba terminó</h2>
          <p>Esta demo estuvo activa por 7 días.</p>
          <p>Para activar el sistema completo, hablá con LayerCloud.</p>
          <a href="https://layercloud.com.ar/contacto" className="btn-primary-accent">
            Activar sistema completo →
          </a>
        </div>
      </div>
      {/* El contenido sigue montado debajo pero inaccesible */}
      {children}
    </>
  );

  return children;
}
```

### Trial countdown en el dashboard del cliente

```
┌─────────────────────────────────────────────┐
│  ⏱  Te quedan 5 días de prueba              │
│                                             │
│  Tu demo vence el Lunes 23 de marzo         │
│                                             │
│  [████████████░░░░░░] 70% usado             │
│                                             │
│  ¿Querés activar el sistema completo?       │
│  → Hablar con LayerCloud                    │
└─────────────────────────────────────────────┘
```

---

## 11. Analytics de uso

### Qué se trackea

Cada acción relevante dentro de `/demo/:tenantId/*` genera un documento
en `layercloud_sessions` y actualiza contadores en `layercloud_tenants_index`.

```typescript
// utils/trackTenantEvent.ts

export async function trackTenantEvent(
  tenantId: string,
  event: SessionEventType,
  path: string,
) {
  if (!tenantId) return;
  try {
    await addDoc(collection(db, 'layercloud_sessions'), {
      tenantId,
      userId:    auth.currentUser?.uid ?? 'anonymous',
      event,
      path,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (e) {
    // Silencioso — nunca bloquear la UX por analytics
  }
}
```

### Eventos que se trackean

| Evento | Cuándo |
|---|---|
| `login` | Al hacer signIn exitoso |
| `page_view` | Cada cambio de ruta en la demo |
| `product_create` | Al guardar un producto nuevo |
| `product_edit` | Al editar un producto existente |
| `order_view` | Al abrir un pedido |
| `order_status_change` | Al cambiar estado de un pedido |
| `customer_view` | Al abrir la sección clientes |
| `stock_edit` | Al modificar stock |
| `finance_view` | Al abrir finanzas |
| `config_save` | Al guardar cambios en siteConfig |
| `trial_expired_shown` | Cuando se muestra el overlay de expiración |

---

## 12. Panel super admin LayerCloud

**Ruta**: `/layercloud-admin`
**Acceso**: requiere `role: "layercloud_superadmin"` en custom claims

### Módulos del super admin

```
/layercloud-admin
├── Dashboard
│   ├── Registros hoy / esta semana / este mes
│   ├── Trials activos ahora
│   ├── Trials vencidos sin convertir
│   ├── Tasa de conversión (trial → pago)
│   └── Gráfico timeline de registros por rubro
│
├── Tenants
│   ├── Tabla con: nombre, email, rubro, trial ends, estado, última actividad
│   ├── Filtros: rubro / estado / fecha
│   ├── Exportar CSV
│   └── Por cada tenant:
│       ├── Ver tienda (nueva pestaña: /demo/{tenantId})
│       ├── Ver admin (nueva pestaña: /demo/{tenantId}/admin)
│       ├── Extender trial (+N días)
│       ├── Revocar acceso inmediato
│       └── Marcar como "convertido a pago"
│
└── Detalle tenant {tenantId}
    ├── Info del negocio
    ├── Timeline de actividad (últimas sesiones de layercloud_sessions)
    ├── Páginas más visitadas
    ├── Conteo de productos/pedidos/clientes cargados
    └── Historial de acciones del super admin sobre este tenant
```

---

## 13. Emails de bienvenida y expiración

### Opción A: Firebase Extension "Trigger Email"
- Instalar desde Firebase Console → Extensions
- Apunta a una colección `mail/` donde la CF deposita los docs
- Envía via SendGrid o Mailgun (configurar en la extension)

### Opción B: Cloud Function con Nodemailer

```javascript
// functions/email/sendWelcomeEmail.js

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendWelcomeEmail = async ({ email, ownerName, businessName, tenantId, trialEndsAt }) => {
  const demoUrl  = `https://layercloud.com.ar/demo/${tenantId}`;
  const adminUrl = `https://layercloud.com.ar/demo/${tenantId}/admin`;
  const dashUrl  = `https://layercloud.com.ar/dashboard`;

  await transporter.sendMail({
    from:    '"LayerCloud" <hola@layercloud.com.ar>',
    to:      email,
    subject: `Tu demo de ${businessName} está lista 🚀`,
    html: `
      <h2>Hola ${ownerName},</h2>
      <p>Tu demo de LayerCloud está activa. Tenés 7 días para explorar todo.</p>
      <p>
        🛍️ <a href="${demoUrl}">Tu tienda</a><br>
        ⚙️ <a href="${adminUrl}">Tu panel admin</a><br>
        📊 <a href="${dashUrl}">Tu dashboard</a>
      </p>
      <p>La prueba vence el ${trialEndsAt.toLocaleDateString('es-AR')}.</p>
      <p>¿Querés seguir? Escribinos a <a href="mailto:hola@layercloud.com.ar">hola@layercloud.com.ar</a></p>
      <hr>
      <small>Equipo LayerCloud — Buenos Aires · Software de escala</small>
    `,
  });
};
```

---

## 14. Firebase Hosting

### `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2|woff|ttf)",
        "headers": [
          { "key": "Cache-Control", "value": "max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options",  "value": "nosniff" },
          { "key": "X-Frame-Options",          "value": "SAMEORIGIN" },
          { "key": "X-XSS-Protection",         "value": "1; mode=block" }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "docs/firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions"
  }
}
```

### `.firebaserc`

```json
{
  "projects": {
    "default": "<firebase-project-id>"
  }
}
```

### Scripts de deploy

```bash
# Deploy completo
firebase deploy

# Solo rules
firebase deploy --only firestore:rules

# Solo funciones
firebase deploy --only functions

# Solo hosting
firebase deploy --only hosting
```

---

## 15. Orden de implementación

```
SEMANA 1 — Firebase + Cloud Functions base
  □ Crear/configurar proyecto Firebase (Auth, Firestore, Storage, Functions, Hosting)
  □ Escribir reglas Firestore y Storage
  □ Implementar onTenantRegistration (sin seed aún)
  □ Implementar checkExpiredTrials (scheduler)
  □ Implementar extendTrial + revokeTrial
  □ Seed básico (1 rubro: electronica — reusa tech_king)

SEMANA 2 — Auth + Registro en LayerCloud
  □ Página /registro — wizard 3 pasos (datos personales → datos negocio → rubro)
  □ Página /login
  □ Hook useTenantAuth
  □ Guards RequireTenantAuth y RequireSuperAdmin
  □ TenantContext con trialExpired state
  □ TrialGuard con overlay
  □ Redirect logic post-login según role

SEMANA 3 — Demo store pública
  □ TenantProvider y todos los hooks tenant-aware (useProducts, useCategories, etc.)
  □ DemoHome (hero dinámico + featured products + categorías)
  □ DemoProducts (catálogo con filtros)
  □ DemoProductDetail
  □ DemoCheckout + CartContext
  □ DemoAbout + DemoContact
  □ Navbar dinámica (logo + nombre del negocio)
  □ Colores dinámicos (inyección de CSS variables)

SEMANA 4 — Demo admin panel
  □ Port completo del admin de tech_king bajo /demo/:tenantId/admin/*
  □ Todos los módulos: Productos, Categorías, Ofertas, Landing, QR,
    Pedidos, Clientes, Remitos, Proveedores, Costos, Precios, Stock,
    Finanzas, Usuarios
  □ Banner de trial activo con countdown en el admin
  □ trackTenantEvent en cada módulo

SEMANA 5 — Dashboard cliente + Super admin
  □ /dashboard con overview, countdown, links y QR
  □ Editor de siteConfig y theme desde el dashboard
  □ Upload de logo a Firebase Storage
  □ /layercloud-admin con lista de tenants, métricas, acciones
  □ Detalle de tenant con timeline de actividad

SEMANA 6 — Seeds restantes + testing + polish
  □ Seeds para los 6 rubros restantes
  □ Email de bienvenida
  □ Email de aviso 24h antes de vencer
  □ Testing E2E de flujo completo (registro → demo → admin → expire)
  □ Optimización de reads de Firestore
  □ Deploy final a producción
```

---

## 16. Límites y costos Firebase

### Plan Spark (gratuito) — límites mensuales

| Recurso | Límite gratuito | Estimado con 30 tenants activos |
|---|---|---|
| Firestore reads | 50.000/día | ~15.000/día |
| Firestore writes | 20.000/día | ~3.000/día |
| Firestore deletes | 20.000/día | ~500/día |
| Storage | 5 GB total | ~1 GB |
| Functions invocaciones | 2M/mes | ~10.000/mes |
| Auth users | 10.000/mes | ~200/mes |
| Hosting | 10 GB/mes | ~2 GB/mes |

**Conclusión**: El plan Spark es suficiente en fase beta (hasta ~30 tenants).

### Plan Blaze (pay-as-you-go) — recomendado para producción

Mantiene los mismos límites gratuitos + cobra el exceso.
Con 50-100 tenants activos, el costo estimado es **< $10 USD/mes**.

**Migrar a Blaze antes de salir a producción** para evitar que el servicio se corte si se supera el free tier.

---

## Notas finales

- **Nunca usar el Admin SDK desde el frontend**. Todo lo que necesita privilegios (asignar claims, crear tenant) va por Cloud Functions callable.
- **La función `trialIsActive()` en security rules hace una lectura extra**. Para optimizar, considerar mover el `trialActive` a los custom claims del token (se actualiza al vencer via el scheduler).
- **Los seeds usan imágenes de Unsplash** con URLs directas. No consumen Storage propio hasta que el cliente suba sus propias fotos.
- **El `tenantId` es la clave de todo**. Debe ser único, URL-safe y legible. El formato `{rubro}-{apellido}-{4chars}` cumple todas las condiciones.
