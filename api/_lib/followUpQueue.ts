import { Timestamp } from 'firebase-admin/firestore';
import type { ChatLeadData } from '../../src/lib/crmTypes';
import type { LeadIntelligence } from '../../src/lib/leadStrategy';
import type { LeadIdentity } from '../../src/lib/identity';
import { adminDb } from './firebaseAdmin';
import { sanitizeText } from './http';

type FollowUpStatus = 'pending' | 'processing' | 'sent' | 'failed';

interface EnqueueInput {
  leadData: Partial<ChatLeadData>;
  strategy: LeadIntelligence;
  sourceType: 'chatbot' | 'contact_form';
  submissionId: string;
  leadThreadId: string;
  identity: LeadIdentity;
}

/**
 * Check if a follow-up job already exists for this leadThread
 * and was created recently (within the last 4 hours).
 */
async function hasRecentFollowUp(leadThreadId: string): Promise<boolean> {
  const safeId = sanitizeText(leadThreadId);
  if (!safeId) return false;

  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const snapshot = await adminDb
    .collection('followUpJobs')
    .where('leadThreadId', '==', safeId)
    .where('createdAt', '>=', Timestamp.fromDate(cutoff))
    .limit(1)
    .get();

  return !snapshot.empty;
}

/**
 * Enqueue a follow-up job in Firestore. The job will be picked up
 * by a scheduled Cloud Function (or processed inline if no worker exists).
 *
 * Deduplication: skips if a job for the same leadThreadId was created
 * within the last 4 hours.
 */
export async function enqueueFollowUp(input: EnqueueInput): Promise<string | null> {
  const leadThreadId = sanitizeText(input.leadThreadId);
  if (!leadThreadId) return null;

  // Deduplication check
  const exists = await hasRecentFollowUp(leadThreadId);
  if (exists) {
    console.info(`[followUpQueue] Skipping duplicate job for leadThread ${leadThreadId}`);
    return null;
  }

  const now = Timestamp.now();
  const channels: string[] = [];

  // Determine which channels to attempt
  if (input.leadData.email && input.strategy.priorityLevel !== 'cold') {
    channels.push('email_lead');
  }
  if (process.env.SLACK_WEBHOOK_URL) {
    channels.push('slack');
  }
  if (process.env.TELEGRAM_WEBHOOK_URL) {
    channels.push('telegram');
  }

  if (channels.length === 0) {
    console.info('[followUpQueue] No channels configured, skipping job');
    return null;
  }

  const jobRef = adminDb.collection('followUpJobs').doc();
  await jobRef.set({
    status: 'pending' as FollowUpStatus,
    attempts: 0,
    maxAttempts: 3,
    leadThreadId,
    sourceType: input.sourceType,
    submissionId: sanitizeText(input.submissionId),
    channels,
    channelsSent: [],
    channelsFailed: [],
    leadData: {
      name: sanitizeText(input.leadData.name),
      email: sanitizeText(input.leadData.email),
      phone: sanitizeText(input.leadData.phone),
      company: sanitizeText(input.leadData.company),
      role: sanitizeText(input.leadData.role),
      topPain: sanitizeText(input.leadData.topPain),
    },
    strategy: {
      priorityLevel: input.strategy.priorityLevel,
      intentScore: input.strategy.intentScore,
      urgencyScore: input.strategy.urgencyScore,
      fitScore: input.strategy.fitScore,
      readinessScore: input.strategy.readinessScore,
      painSummary: input.strategy.painSummary,
      offerToShowNow: input.strategy.offerToShowNow,
      whatToSayNow: input.strategy.whatToSayNow,
      followUpWhatsApp: input.strategy.followUpWhatsApp,
      followUpEmailSubject: input.strategy.followUpEmailSubject,
      followUpEmailBody: input.strategy.followUpEmailBody,
      buyerMotivation: input.strategy.buyerMotivation,
    },
    identity: {
      personId: sanitizeText(input.identity.personId),
      organizationId: sanitizeText(input.identity.organizationId),
      leadThreadId,
    },
    createdAt: now,
    updatedAt: now,
  });

  // Also update the leadThread with follow-up status
  await adminDb.collection('leadThreads').doc(leadThreadId).set(
    {
      followUpStatus: 'pending',
      followUpJobId: jobRef.id,
      followUpEnqueuedAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  return jobRef.id;
}
