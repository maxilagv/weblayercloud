# Plan 06 — Compliance, consentimiento y retención de datos

> Prioridad: **MEDIA** (obligatorio para operar en Argentina + con clientes empresariales)
> Ley 25.326 de Protección de Datos Personales (Argentina) + lineamientos de buenas prácticas internacionales.

---

## Por qué importa (más allá de lo legal)

1. Los clientes empresariales B2B exigen compliance antes de firmar
2. Sin consentimiento explícito, los emails de follow-up son spam legal
3. Si un lead pide "eliminá mis datos" y no podés hacerlo, es riesgo reputacional
4. Firebase guarda datos indefinidamente sin política de retención → costos crecientes + riesgo

---

## Fix 1 — Banner de consentimiento

### Crear `src/components/ConsentBanner.tsx`

```tsx
import { useEffect, useState } from 'react';

type ConsentState = 'pending' | 'accepted' | 'declined';

const CONSENT_KEY = 'lc_consent_v1';
const CONSENT_TIMESTAMP_KEY = 'lc_consent_ts_v1';

export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return 'pending';
  return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? 'pending';
}

export function hasAnalyticsConsent(): boolean {
  return getConsentState() === 'accepted';
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsentState() === 'pending') {
      // Mostrar después de 2s para no interrumpir la carga inicial
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferencias de privacidad"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        right: 24,
        maxWidth: 480,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '16px 20px',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      }}
    >
      <p style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
        Usamos cookies de análisis para entender cómo usás el sitio y mejorar
        la experiencia. No vendemos tu información.{' '}
        <a href="/privacidad" style={{ textDecoration: 'underline' }}>
          Ver política
        </a>
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={accept}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '6px 14px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Aceptar
        </button>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            color: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            padding: '6px 14px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Solo esenciales
        </button>
      </div>
    </div>
  );
}
```

### Integrar en `src/App.tsx`

```tsx
import ConsentBanner from './components/ConsentBanner';

// Dentro de PublicShell, al final del return:
<ConsentBanner />
```

### Condicionar tracking al consentimiento

En `src/hooks/useVisitorTracking.ts` (existe pero no lo leímos):

```typescript
import { hasAnalyticsConsent } from '../components/ConsentBanner';

// Al inicio de useVisitorTracking:
if (!hasAnalyticsConsent()) return; // no trackear si no hay consentimiento
```

---

## Fix 2 — Endpoint DSR (Data Subject Rights)

Crear `api/dsr/delete.ts` y `api/dsr/export.ts`.

### `api/dsr/delete.ts` — Derecho al olvido

```typescript
import { adminDb } from '../_lib/firebaseAdmin';
import { readJsonBody, sanitizeText } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = readJsonBody<Record<string, unknown>>(req, {});
  const email = sanitizeText(typeof body.email === 'string' ? body.email : '').toLowerCase();

  if (!email || !/.+@.+\..+/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Email inválido.' });
  }

  // Verificar token de confirmación (enviado por email)
  const token = sanitizeText(typeof body.token === 'string' ? body.token : '');
  const tokenValid = await verifyDSRToken(email, token);
  if (!tokenValid) {
    return res.status(403).json({ ok: false, error: 'Token inválido o expirado.' });
  }

  const batch = adminDb.batch();
  const collections = ['chatSessions', 'contactSubmissions', 'persons'];
  
  for (const col of collections) {
    const snap = await adminDb.collection(col).where('email', '==', email).get();
    for (const doc of snap.docs) {
      if (col === 'persons') {
        // Anonimizar en lugar de eliminar (mantener estadísticas)
        batch.update(doc.ref, {
          email: '[eliminado]',
          name: '[eliminado]',
          phone: '[eliminado]',
          deletedAt: new Date().toISOString(),
        });
      } else {
        batch.delete(doc.ref);
      }
    }
  }

  await batch.commit();

  // Registrar la solicitud
  await adminDb.collection('_dsrRequests').add({
    email,
    type: 'delete',
    processedAt: new Date().toISOString(),
  });

  return res.status(200).json({ ok: true, message: 'Datos eliminados.' });
}
```

### `api/dsr/export.ts` — Derecho de acceso

```typescript
// Recolectar todos los datos de un email y devolver como JSON
// Similar estructura al delete pero devuelve los documentos en lugar de eliminarlos
```

---

## Fix 3 — Política de retención automática

### Firebase Cloud Function — `functions/src/dataRetention.ts`

```typescript
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Se ejecuta una vez por semana (domingo a las 3am UTC)
export const enforceDataRetention = functions.scheduler.onSchedule(
  'every sunday 03:00',
  async () => {
    const db = admin.firestore();
    const retentionDays = 90;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    // Eliminar eventos viejos (no son PII pero ocupan espacio)
    const oldEvents = await db
      .collection('events')
      .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(cutoff))
      .limit(500) // procesar en batches
      .get();
    
    const batch = db.batch();
    oldEvents.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    
    // Anonimizar visitors viejos (mantener agregados, eliminar PII)
    const oldVisitors = await db
      .collection('visitors')
      .where('timestamp', '<=', admin.firestore.Timestamp.fromDate(cutoff))
      .limit(500)
      .get();
    
    const visitorBatch = db.batch();
    oldVisitors.docs.forEach((doc) => {
      visitorBatch.update(doc.ref, {
        userAgent: '[anonimizado]',
        // Mantener: atribución, scores de comportamiento (no son PII)
      });
    });
    await visitorBatch.commit();
    
    console.log(`[retention] Procesados ${oldEvents.size} eventos y ${oldVisitors.size} visitors.`);
  }
);
```

---

## Fix 4 — Página de privacidad

Crear `src/pages/Privacidad.tsx` con:
- Qué datos se recolectan y por qué
- Con quién se comparten (Firebase/Google, Gemini/Google, Resend)
- Tiempo de retención (90 días para eventos, hasta pedido de baja para leads)
- Cómo ejercer derechos (formulario de DSR)
- Contacto del responsable del tratamiento
- Fecha de última actualización

Agregar ruta en `src/App.tsx`:
```tsx
<Route path="/privacidad" element={<Privacidad />} />
```

---

## Fix 5 — Consentimiento explícito en el formulario de contacto

En `src/pages/Contact.tsx`, antes del botón de envío:

```tsx
<label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12 }}>
  <input
    type="checkbox"
    required
    checked={consentChecked}
    onChange={(e) => setConsentChecked(e.target.checked)}
  />
  <span>
    Acepto que LayerCloud procese mis datos para contactarme.{' '}
    <a href="/privacidad">Ver política de privacidad.</a>
  </span>
</label>
```

Enviar `consentGiven: true` al servidor y persistir en Firestore con timestamp.

---

## Checklist

- [ ] Crear `src/components/ConsentBanner.tsx`
- [ ] Integrar `ConsentBanner` en `src/App.tsx`
- [ ] Condicionar `useVisitorTracking` al consentimiento
- [ ] Crear `api/dsr/delete.ts`
- [ ] Crear `api/dsr/export.ts`
- [ ] Crear Cloud Function `enforceDataRetention`
- [ ] Crear `src/pages/Privacidad.tsx`
- [ ] Agregar ruta `/privacidad`
- [ ] Agregar checkbox de consentimiento en formulario de contacto
- [ ] Persistir `consentGiven + consentAt` en Firestore

---

## Nota sobre Gemini y privacidad

El prompt actual en `api/_lib/leadStrategyService.ts:73` incluye:
```
${JSON.stringify(body.leadData, null, 2)}
```

`leadData` puede contener email y teléfono. Esto se envía a Google/Gemini.

**Mitigación**: antes de construir el prompt, anonimizar PII:
```typescript
function sanitizeLeadDataForAI(leadData: Partial<ChatLeadData>): Partial<ChatLeadData> {
  return {
    ...leadData,
    email: leadData.email ? '[email presente]' : undefined,
    phone: leadData.phone ? '[teléfono presente]' : undefined,
    name: leadData.name ? '[nombre presente]' : undefined,
  };
}

// En buildPrompt():
Lead:
${JSON.stringify(sanitizeLeadDataForAI(body.leadData), null, 2)}
```

Esto no afecta la calidad del análisis (Gemini necesita empresa, industria, pain, urgency — no el email).
