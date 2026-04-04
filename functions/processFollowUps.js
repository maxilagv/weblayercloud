'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

/**
 * Scheduled Cloud Function that runs every 2 minutes.
 * Picks up pending follow-up jobs and processes them (send emails, Slack, Telegram).
 */
exports.handler = onSchedule('every 2 minutes', async () => {
  const db = getFirestore();
  const now = Timestamp.now();

  // Find pending jobs, oldest first, limit to 10 per run
  const snapshot = await db
    .collection('followUpJobs')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'asc')
    .limit(10)
    .get();

  if (snapshot.empty) {
    return;
  }

  console.log(`[processFollowUps] Found ${snapshot.size} pending jobs`);

  for (const doc of snapshot.docs) {
    const jobData = doc.data();
    const jobId = doc.id;

    try {
      // Mark as processing
      await doc.ref.update({
        status: 'processing',
        attempts: (jobData.attempts || 0) + 1,
        updatedAt: now,
      });

      const channels = jobData.channels || [];
      const channelsSent = [...(jobData.channelsSent || [])];
      const channelsFailed = [];

      for (const channel of channels) {
        if (channelsSent.includes(channel)) continue;

        try {
          if (channel === 'email_lead') {
            await sendEmail(jobData);
          } else if (channel === 'slack') {
            await sendSlack(jobData);
          } else if (channel === 'telegram') {
            await sendTelegram(jobData);
          }
          channelsSent.push(channel);
        } catch (err) {
          console.error(`[processFollowUps] Channel ${channel} failed for job ${jobId}`, err);
          channelsFailed.push(channel);
        }
      }

      const allSent = channelsSent.length >= channels.length;
      const attempts = (jobData.attempts || 0) + 1;
      const maxAttempts = jobData.maxAttempts || 3;
      const finalStatus = allSent ? 'sent' : attempts >= maxAttempts ? 'failed' : 'pending';

      await doc.ref.update({
        status: finalStatus,
        channelsSent,
        channelsFailed,
        lastProcessedAt: now,
        updatedAt: now,
      });

      // Update lead thread
      const leadThreadId = jobData.leadThreadId;
      if (leadThreadId) {
        const updateData = {
          followUpStatus: finalStatus,
          followUpChannelsSent: channelsSent,
          updatedAt: now,
        };
        if (allSent) {
          updateData.followUpLastSentAt = now;
        }
        await db.collection('leadThreads').doc(leadThreadId).set(updateData, { merge: true });
      }

      console.log(`[processFollowUps] Job ${jobId} → ${finalStatus}`);
    } catch (err) {
      console.error(`[processFollowUps] Failed to process job ${jobId}`, err);
      await doc.ref.update({
        status: 'failed',
        error: err.message || 'Unknown error',
        updatedAt: now,
      });
    }
  }
});

// ── Channel implementations ──

async function sendEmail(jobData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[processFollowUps] RESEND_API_KEY not set, skipping email');
    return;
  }

  const email = jobData.leadData?.email;
  if (!email) return;

  const name = (jobData.leadData?.name || '').split(' ')[0] || 'hola';
  const company = jobData.leadData?.company || 'tu empresa';
  const strategy = jobData.strategy || {};

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'LayerCloud <hola@weblayercloud.com>',
      to: [email],
      subject: strategy.followUpEmailSubject || `Tu diagnóstico de ${company}`,
      text: strategy.followUpEmailBody ||
        `Hola ${name},\n\nRecibimos tu solicitud y ya estamos analizando el mejor camino para ${company}.\n\nTe contactamos pronto con el siguiente paso.\n\n— El equipo de LayerCloud`,
      headers: {
        'X-Entity-Ref-ID': jobData.submissionId || '',
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

async function sendSlack(jobData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const message = buildTeamMessage(jobData);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook error ${res.status}`);
  }
}

async function sendTelegram(jobData) {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!webhookUrl || !chatId) return;

  const message = buildTeamMessage(jobData);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    throw new Error(`Telegram bot error ${res.status}`);
  }
}

function buildTeamMessage(jobData) {
  const ld = jobData.leadData || {};
  const st = jobData.strategy || {};
  const emoji = st.priorityLevel === 'hot' ? '🔥' : st.priorityLevel === 'warm' ? '🟡' : '🔵';
  const scores = `R${st.readinessScore || 0} | I${st.intentScore || 0} | U${st.urgencyScore || 0} | F${st.fitScore || 0}`;

  return [
    `${emoji} *Nuevo lead ${(st.priorityLevel || '-').toUpperCase()}* — ${ld.company || 'sin empresa'}`,
    `👤 ${ld.name || '-'} (${ld.role || '-'})`,
    `📧 ${ld.email || '-'} | 📱 ${ld.phone || '-'}`,
    `🎯 Oferta: *${st.offerToShowNow || '-'}*`,
    `💡 Pain: ${st.painSummary || '-'}`,
    `📊 Scores: ${scores}`,
    `📝 Decir ahora: ${st.whatToSayNow || '-'}`,
    `💬 WhatsApp: ${st.followUpWhatsApp || '-'}`,
    `🔗 ${process.env.ADMIN_URL || 'https://weblayercloud.com/admin'}`,
  ].join('\n');
}
