import { analyzeLeadStrategy } from '../_lib/leadStrategyService';
import {
  appendLegacyChatMessage,
  getPendingChatMilestone,
  loadRecentChatTranscript,
  normalizeLeadData,
  persistLeadAnalysis,
} from '../_lib/crmEngine';
import { adminDb } from '../_lib/firebaseAdmin';
import { assertBodySize, readJsonBody, sanitizeText, toPlainObject } from '../_lib/http';
import { checkRateLimit, getClientKey } from '../_lib/rateLimit';
import { enqueueFollowUp } from '../_lib/followUpQueue';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 16384);

    const body = readJsonBody<Record<string, unknown>>(req, {});

    const allowed = await checkRateLimit({
      key: getClientKey(req, body),
      bucket: 'chat-message',
      maxRequests: 30,
      windowSeconds: 60,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    const sessionId = sanitizeText(typeof body.sessionId === 'string' ? body.sessionId : '');
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: 'Missing session id.' });
    }

    const messageInput = toPlainObject(body.message);
    const role = messageInput.role === 'assistant' ? 'assistant' : messageInput.role === 'user' ? 'user' : '';
    const content = sanitizeText(typeof messageInput.content === 'string' ? messageInput.content : '').slice(0, 2000);
    if (!role || !content) {
      return res.status(400).json({ ok: false, error: 'Invalid chat message.' });
    }

    const sessionRef = adminDb.collection('chatSessions').doc(sessionId);
    const sessionSnapshot = await sessionRef.get();
    if (!sessionSnapshot.exists) {
      return res.status(404).json({ ok: false, error: 'Chat session not found.' });
    }

    await appendLegacyChatMessage(sessionId, {
      role,
      content,
      kind: sanitizeText(typeof messageInput.kind === 'string' ? messageInput.kind : 'message'),
      stepKey: sanitizeText(typeof messageInput.stepKey === 'string' ? messageInput.stepKey : ''),
    });

    const sessionData = sessionSnapshot.data() || {};
    const leadData = normalizeLeadData(sessionData);
    const identity = {
      personId: sanitizeText(typeof sessionData.personId === 'string' ? sessionData.personId : ''),
      organizationId: sanitizeText(typeof sessionData.organizationId === 'string' ? sessionData.organizationId : ''),
      leadThreadId: sanitizeText(typeof sessionData.leadThreadId === 'string' ? sessionData.leadThreadId : ''),
    };

    let strategy = null;
    const milestone = role === 'user' ? getPendingChatMilestone(leadData, sessionData) : null;

    if (role === 'user' && milestone !== null) {
      const transcript = await loadRecentChatTranscript(sessionId);
      strategy = await analyzeLeadStrategy({
        sourceType: 'chatbot',
        leadData,
        transcript,
      });

      await persistLeadAnalysis({
        sourceType: 'chatbot',
        sourceCollection: 'chatSessions',
        sourceDocumentId: sessionId,
        leadData,
        identity,
        strategy,
        transcript,
        milestone,
      });

      // ── Follow-up: solo encolar si warm/hot y no hay job previo ──
      if (
        strategy &&
        identity.leadThreadId &&
        (strategy.priorityLevel === 'warm' || strategy.priorityLevel === 'hot')
      ) {
        try {
          await enqueueFollowUp({
            leadData,
            strategy,
            sourceType: 'chatbot',
            submissionId: sessionId,
            leadThreadId: identity.leadThreadId,
            identity,
          });
        } catch (err) {
          console.error('[chat/message] followup enqueue failed', err);
        }
      }
    }

    return res.status(200).json({
      ok: true,
      identity,
      strategy,
    });
  } catch (error: any) {
    console.error('[chat/message]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not persist chat message.' });
  }
}
