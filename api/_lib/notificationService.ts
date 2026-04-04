import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';
import { sanitizeText } from './http';

interface FollowUpJobData {
  leadData: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    topPain?: string;
  };
  strategy: {
    priorityLevel: string;
    intentScore: number;
    urgencyScore: number;
    fitScore: number;
    readinessScore: number;
    painSummary: string;
    offerToShowNow: string;
    whatToSayNow: string;
    followUpWhatsApp: string;
    followUpEmailSubject: string;
    followUpEmailBody: string;
    buyerMotivation: string;
  };
  sourceType: string;
  submissionId: string;
}

// ── Email al lead (confirmación personalizada) ──────────────────────────────

export async function sendLeadConfirmationEmail(data: FollowUpJobData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !data.leadData.email) return;

  const name = sanitizeText(data.leadData.name)?.split(' ')[0] ?? 'hola';
  const company = sanitizeText(data.leadData.company) || 'tu empresa';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL ?? 'LayerCloud <hola@weblayercloud.com>',
      to: [data.leadData.email],
      subject: data.strategy.followUpEmailSubject || `Tu diagnóstico de ${company}`,
      text: data.strategy.followUpEmailBody ||
        `Hola ${name},\n\nRecibimos tu solicitud y ya estamos analizando el mejor camino para ${company}.\n\nTe contactamos pronto con el siguiente paso.\n\n— El equipo de LayerCloud`,
      headers: {
        'X-Entity-Ref-ID': data.submissionId,
      },
    }),
  });
}

// ── Notificación interna al equipo ──────────────────────────────────────────

export async function notifyTeamSlack(data: FollowUpJobData): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const message = buildTeamMessage(data);

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}

export async function notifyTeamTelegram(data: FollowUpJobData): Promise<void> {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!webhookUrl || !chatId) return;

  const message = buildTeamMessage(data);

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

function buildTeamMessage(data: FollowUpJobData): string {
  const { leadData, strategy } = data;
  const priorityEmoji = strategy.priorityLevel === 'hot' ? '🔥' : strategy.priorityLevel === 'warm' ? '🟡' : '🔵';
  const scores = `R${strategy.readinessScore} | I${strategy.intentScore} | U${strategy.urgencyScore} | F${strategy.fitScore}`;

  return [
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
}

// ── Procesador de jobs ───────────────────────────────────────────────────────

export async function processFollowUpJob(jobId: string): Promise<void> {
  const jobRef = adminDb.collection('followUpJobs').doc(jobId);
  const snapshot = await jobRef.get();
  if (!snapshot.exists) return;

  const jobData = snapshot.data()!;
  if (jobData.status !== 'pending') return;

  const now = Timestamp.now();
  await jobRef.update({
    status: 'processing',
    attempts: (jobData.attempts || 0) + 1,
    updatedAt: now,
  });

  const channels: string[] = jobData.channels ?? [];
  const channelsSent: string[] = [...(jobData.channelsSent ?? [])];
  const channelsFailed: string[] = [];

  for (const channel of channels) {
    if (channelsSent.includes(channel)) continue;

    try {
      if (channel === 'email_lead') {
        await sendLeadConfirmationEmail(jobData as FollowUpJobData);
      } else if (channel === 'slack') {
        await notifyTeamSlack(jobData as FollowUpJobData);
      } else if (channel === 'telegram') {
        await notifyTeamTelegram(jobData as FollowUpJobData);
      }
      channelsSent.push(channel);
    } catch (err) {
      console.error(`[notificationService] Channel ${channel} failed for job ${jobId}`, err);
      channelsFailed.push(channel);
    }
  }

  const allSent = channelsSent.length >= channels.length;
  const finalStatus = allSent ? 'sent' : (jobData.attempts || 0) + 1 >= (jobData.maxAttempts || 3) ? 'failed' : 'pending';

  await jobRef.update({
    status: finalStatus,
    channelsSent,
    channelsFailed,
    lastProcessedAt: now,
    updatedAt: now,
  });

  // Update leadThread follow-up status
  const leadThreadId = sanitizeText(jobData.leadThreadId);
  if (leadThreadId) {
    await adminDb.collection('leadThreads').doc(leadThreadId).set(
      {
        followUpStatus: finalStatus,
        followUpChannelsSent: channelsSent,
        followUpLastSentAt: allSent ? now : undefined,
        updatedAt: now,
      },
      { merge: true },
    );
  }
}
