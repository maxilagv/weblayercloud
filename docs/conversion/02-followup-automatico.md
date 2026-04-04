# Plan 02 — Follow-up automático post-captura

> Prioridad: **ALTA**. Es la mejora de conversión de mayor ROI.
> El sistema ya calcula `whatToSayNow`, `followUpWhatsApp` y `followUpEmailBody` — solo falta **enviarlos**.

---

## El gap actual

`api/intake/contact.ts:49-62` y `api/chat/message.ts:56-72` calculan la estrategia completa del lead
(incluyendo mensajes de WhatsApp y email personalizados) y la **guardan en Firestore**.
Pero nadie la envía. El lead se va y el equipo lo ve horas después cuando ya perdió temperatura.

El dato clave: responder en menos de 5 minutos multiplica la probabilidad de conversión por 9x
frente a responder en 1 hora (MIT Lead Response Study).

---

## Arquitectura del sistema de follow-up

```
Lead capturado (chat milestone / form submit)
        ↓
   analyzeLeadStrategy()  ← ya existe
        ↓
   persistLeadAnalysis()  ← ya existe
        ↓
   [NUEVO] enqueueFollowUp()  ← disparar tarea
        ↓
   Firebase Cloud Function (triggered) o Vercel Cron
        ↓
   sendFollowUpEmail()    ← Resend API
   notifyTeamSlack()      ← Webhook Slack/Telegram
   (opcional) sendWhatsApp()  ← Twilio / WWebJS
```

---

## Implementación: email automático con Resend

### Por qué Resend
- API simple (1 endpoint REST)
- Plan gratuito: 3.000 emails/mes
- Templates React opcionalmente
- Mejor deliverability que SendGrid para cuentas nuevas

### Nuevo archivo: `api/_lib/notificationService.ts`

```typescript
import type { LeadIntelligence } from '../../src/lib/leadStrategy';
import type { ChatLeadData } from '../../src/lib/crmTypes';

interface LeadNotificationPayload {
  leadData: Partial<ChatLeadData>;
  strategy: LeadIntelligence;
  sourceType: 'chatbot' | 'contact_form';
  submissionId: string;
}

// ── Email al lead (confirmación personalizada) ──────────────────────────────

export async function sendLeadConfirmationEmail(payload: LeadNotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !payload.leadData.email) return;

  const { leadData, strategy } = payload;
  const name = leadData.name?.split(' ')[0] ?? 'hola';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL ?? 'LayerCloud <hola@weblayercloud.com>',
      to: [payload.leadData.email],
      subject: strategy.followUpEmailSubject || `Tu diagnóstico de ${leadData.company ?? 'tu empresa'}`,
      text: strategy.followUpEmailBody,
      // headers de anti-spam
      headers: {
        'X-Entity-Ref-ID': payload.submissionId,
      },
    }),
  });
}

// ── Notificación interna al equipo ──────────────────────────────────────────

export async function notifyTeamHotLead(payload: LeadNotificationPayload): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL ?? process.env.TELEGRAM_WEBHOOK_URL;
  if (!webhookUrl) return;

  const { leadData, strategy } = payload;
  const priorityEmoji = strategy.priorityLevel === 'hot' ? '🔥' : strategy.priorityLevel === 'warm' ? '🟡' : '🔵';
  const scores = `R${strategy.readinessScore} | I${strategy.intentScore} | U${strategy.urgencyScore} | F${strategy.fitScore}`;

  const message = [
    `${priorityEmoji} *Nuevo lead ${strategy.priorityLevel.toUpperCase()}* — ${leadData.company ?? 'sin empresa'}`,
    `👤 ${leadData.name ?? '-'} (${leadData.role ?? '-'})`,
    `📧 ${leadData.email ?? '-'} | 📱 ${leadData.phone ?? '-'}`,
    `🎯 Oferta recomendada: *${strategy.offerToShowNow}*`,
    `💡 Pain: ${strategy.painSummary}`,
    `📊 Scores: ${scores}`,
    `📝 Qué decirle ahora: ${strategy.whatToSayNow}`,
    `💬 WhatsApp listo: ${strategy.followUpWhatsApp}`,
    `🔗 Ver lead: ${process.env.ADMIN_URL ?? 'https://weblayercloud.com/admin'}`,
  ].join('\n');

  // Slack format
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return;
  }

  // Telegram format (bot webhook)
  if (process.env.TELEGRAM_WEBHOOK_URL) {
    await fetch(process.env.TELEGRAM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  }
}

// ── Orquestador principal ───────────────────────────────────────────────────

export async function triggerFollowUpPipeline(payload: LeadNotificationPayload): Promise<void> {
  const tasks: Array<Promise<void>> = [];

  // Siempre notificar al equipo
  tasks.push(notifyTeamHotLead(payload).catch((err) => console.error('[followup] team notify failed', err)));

  // Email al lead solo si tiene email Y es warm o hot
  if (payload.leadData.email && payload.strategy.priorityLevel !== 'cold') {
    tasks.push(sendLeadConfirmationEmail(payload).catch((err) => console.error('[followup] lead email failed', err)));
  }

  await Promise.allSettled(tasks);
}
```

### Integrar en `api/intake/contact.ts`

Después de `persistLeadAnalysis(...)` (línea 55), agregar:

```typescript
import { triggerFollowUpPipeline } from '../_lib/notificationService';

// Después de persistLeadAnalysis:
triggerFollowUpPipeline({
  leadData: resolved.leadData,
  strategy,
  sourceType: 'contact_form',
  submissionId,
}).catch((err) => console.error('[intake/contact] followup failed', err));
// No await — no bloqueamos la respuesta al visitante
```

### Integrar en `api/chat/message.ts`

Dentro del `if (role === 'user' && milestone !== null)` (línea 55), después de `persistLeadAnalysis`:

```typescript
import { triggerFollowUpPipeline } from '../_lib/notificationService';

if (strategy && identity.leadThreadId) {
  triggerFollowUpPipeline({
    leadData,
    strategy,
    sourceType: 'chatbot',
    submissionId: sessionId,
  }).catch((err) => console.error('[chat/message] followup failed', err));
}
```

---

## SLA automático (escalado si no responden)

### Firebase Cloud Function — `functions/src/leadSla.ts`

```typescript
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Se ejecuta cada 30 minutos
export const checkLeadSla = functions.scheduler.onSchedule('every 30 minutes', async () => {
  const db = admin.firestore();
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 horas

  const staleLeads = await db
    .collection('chatSessions')
    .where('aiPriorityLevel', 'in', ['hot', 'warm'])
    .where('pipelineStage', '==', 'new')
    .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(cutoff))
    .get();

  for (const doc of staleLeads.docs) {
    const data = doc.data();
    // Escalar notificación
    await notifyTeamEscalation(data);
  }
});
```

---

## Variables de entorno requeridas

```
RESEND_API_KEY=re_xxxx
FROM_EMAIL=LayerCloud <hola@weblayercloud.com>
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx  (opcional)
TELEGRAM_WEBHOOK_URL=https://api.telegram.org/botTOKEN/sendMessage  (opcional)
TELEGRAM_CHAT_ID=xxx  (opcional)
ADMIN_URL=https://weblayercloud.com/admin
```

---

## Checklist

- [ ] Crear `api/_lib/notificationService.ts`
- [ ] Integrar `triggerFollowUpPipeline` en `api/intake/contact.ts`
- [ ] Integrar `triggerFollowUpPipeline` en `api/chat/message.ts`
- [ ] Configurar Resend (crear cuenta, verificar dominio)
- [ ] Configurar Slack/Telegram webhook
- [ ] Setear env vars en Vercel
- [ ] Testear con lead real en staging
- [ ] (Opcional) Implementar SLA function en Firebase Functions

---

## Impacto esperado

- Respuesta a leads hot en <2 minutos vs. horas actuales
- El equipo recibe el `whatToSayNow` exacto calculado por la IA → menos fricción para arrancar la conversación
- El lead recibe confirmación personalizada → percepción de profesionalismo
