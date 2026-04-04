# Plan 01 — Seguridad crítica

> Prioridad: **BLOQUEANTE**. Nada más avanza hasta cerrar esto.
> Estimado: 3-5 días de trabajo real.

---

## Por qué es urgente

`/api/lead-strategy`, `/api/chat/message` y `/api/intake/contact` llaman a Gemini sin ningún control.
Un script de 10 líneas puede vaciar toda la cuota de Gemini en minutos o generar cientos de leads falsos.
No es teoría — es un vector trivial de abuso hoy mismo.

---

## Fix 1 — Rate limiting en todos los endpoints públicos

### Dónde implementar
Crear `api/_lib/rateLimit.ts` nuevo. Se importa en cada handler.

### Implementación concreta

```typescript
// api/_lib/rateLimit.ts
import { adminDb } from './firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

interface RateLimitConfig {
  key: string;           // ej: visitorId o IP
  bucket: string;        // ej: 'lead-strategy'
  maxRequests: number;   // máximo de requests
  windowSeconds: number; // ventana de tiempo
}

export async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const windowStart = Date.now() - config.windowSeconds * 1000;
  const docId = `${config.bucket}:${config.key}`;
  const ref = adminDb.collection('_rateLimits').doc(docId);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    const recentRequests: number[] = (data?.timestamps ?? [])
      .filter((ts: number) => ts > windowStart);

    if (recentRequests.length >= config.maxRequests) {
      return false; // bloqueado
    }

    tx.set(ref, {
      timestamps: [...recentRequests, Date.now()],
      updatedAt: Timestamp.now(),
    });
    return true; // permitido
  });
}

export function getClientKey(req: any): string {
  // Vercel provee el IP real en este header
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    ?? req.headers['x-real-ip']
    ?? 'unknown';
  return ip.slice(0, 64);
}
```

### Aplicar en cada endpoint

```typescript
// En api/lead-strategy.ts — agregar antes del análisis:
import { checkRateLimit, getClientKey } from './_lib/rateLimit';

const allowed = await checkRateLimit({
  key: getClientKey(req),
  bucket: 'lead-strategy',
  maxRequests: 5,
  windowSeconds: 60,
});
if (!allowed) {
  return res.status(429).json({ ok: false, error: 'Too many requests.' });
}
```

Límites por endpoint:

| Endpoint | Max requests | Ventana |
|---|---|---|
| `/api/lead-strategy` | 5 | 60s |
| `/api/chat/message` | 30 | 60s |
| `/api/chat/session` | 10 | 60s |
| `/api/intake/contact` | 3 | 300s |
| `/api/track-visit` | 60 | 60s |
| `/api/track-event` | 120 | 60s |

### Regla de Firestore para `_rateLimits`
```
match /_rateLimits/{doc} {
  allow read, write: if false; // solo acceso desde Admin SDK
}
```

---

## Fix 2 — Corregir `assertAdminToken` fail-open

### Archivo: `api/_lib/firebaseAdmin.ts:92-112`

**Problema actual** (línea 103-104):
```typescript
if (adminEmails.length === 0) {
  return decodedToken; // ← cualquier usuario autenticado pasa como admin
}
```

**Fix** — fail-closed:
```typescript
export function assertAdminToken(decodedToken: DecodedIdToken | null) {
  if (!decodedToken) {
    throw new Error('Authentication required.');
  }

  // Custom claim tiene prioridad
  if ((decodedToken as Record<string, unknown>).admin === true) {
    return decodedToken;
  }

  const adminEmails = getAdminEmails();

  // CAMBIO CRÍTICO: si no hay emails configurados, NADIE es admin
  if (adminEmails.length === 0) {
    throw new Error('Admin access not configured. Set ADMIN_EMAILS env var.');
  }

  const email = sanitizeText(decodedToken.email).toLowerCase();
  if (email && adminEmails.includes(email)) {
    return decodedToken;
  }

  throw new Error('Admin privileges required.');
}
```

**Acción requerida**: Setear `ADMIN_EMAILS` en Vercel con tu email antes de hacer el deploy.

---

## Fix 3 — Proteger `/api/lead-strategy` con origen verificado

Este endpoint es llamado desde el frontend propio. Agregar verificación de origen:

```typescript
// api/lead-strategy.ts — agregar al inicio del handler
const origin = req.headers['origin'] ?? '';
const referer = req.headers['referer'] ?? '';
const allowedOrigins = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.ALLOWED_ORIGIN ?? 'https://weblayercloud.com',
].filter(Boolean);

const isAllowedOrigin = allowedOrigins.some(
  (o) => origin.startsWith(o) || referer.startsWith(o)
);

// En producción, rechazar orígenes externos
if (process.env.NODE_ENV === 'production' && !isAllowedOrigin) {
  return res.status(403).json({ ok: false, error: 'Forbidden.' });
}
```

---

## Fix 4 — Turnstile CAPTCHA en formulario de contacto

### Por qué Turnstile y no reCAPTCHA
- Turnstile de Cloudflare es gratuito, no fingerprinting agresivo
- No requiere usuario hacer nada (silencioso en la mayoría de casos)
- API simple

### Implementación

**Backend** — `api/intake/contact.ts`:
```typescript
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip en dev

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

// En el handler, antes de procesar:
const turnstileToken = sanitizeText(typeof body.turnstileToken === 'string' ? body.turnstileToken : '');
const cfIp = getClientKey(req);
const turnstileOk = await verifyTurnstile(turnstileToken, cfIp);
if (!turnstileOk) {
  return res.status(400).json({ ok: false, error: 'Verificación fallida.' });
}
```

**Frontend** — `src/pages/Contact.tsx`:
- Agregar el script de Turnstile: `https://challenges.cloudflare.com/turnstile/v1/api.js`
- Widget invisible `<div class="cf-turnstile" data-sitekey="..." data-callback="onTurnstileSuccess">`
- Capturar el token y enviarlo con el form

---

## Fix 5 — Limitar tamaño y campos del body en todos los endpoints

Agregar a `api/_lib/http.ts`:

```typescript
export function assertBodySize(req: any, maxBytes = 8192): void {
  const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
  if (contentLength > maxBytes) {
    throw new Error('Request body too large.');
  }
}

export function sanitizeTranscript(
  value: unknown,
  maxMessages = 20,
  maxContentLength = 2000,
): Array<{ role: string; content: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxMessages)
    .filter((m) => m && typeof m === 'object')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeText(typeof m.content === 'string' ? m.content : '').slice(0, maxContentLength),
    }));
}
```

---

## Fix 6 — Variables de entorno a configurar

En Vercel → Settings → Environment Variables:

```
ADMIN_EMAILS=tu@email.com,otro@email.com
TURNSTILE_SECRET_KEY=<clave de Cloudflare Turnstile>
TURNSTILE_SITE_KEY=<clave pública de Cloudflare Turnstile>  ← para frontend
ALLOWED_ORIGIN=https://weblayercloud.com
GEMINI_API_KEY=<ya existe>
```

---

## Checklist de implementación

- [ ] Crear `api/_lib/rateLimit.ts`
- [ ] Aplicar rate limit en los 6 endpoints
- [ ] Agregar regla `_rateLimits` en `firestore.rules`
- [ ] Corregir `assertAdminToken` en `api/_lib/firebaseAdmin.ts:103`
- [ ] Setear `ADMIN_EMAILS` en Vercel
- [ ] Implementar `verifyTurnstile` en `api/intake/contact.ts`
- [ ] Agregar widget Turnstile en `src/pages/Contact.tsx`
- [ ] Agregar `assertBodySize` en todos los handlers
- [ ] Agregar verificación de origen en `api/lead-strategy.ts`

---

## Impacto esperado

- **Costo Gemini**: controlado. Sin rate limit, un bot puede gastar $50/hora.
- **Leads falsos**: reducción >95% con Turnstile + rate limit.
- **Admin**: solo accede quien debe.
