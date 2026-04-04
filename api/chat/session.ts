import { randomUUID } from 'node:crypto';
import type { ChatSessionOptions } from '../../src/lib/crmTypes';
import { resolveLeadContext, syncLegacyChatSession } from '../_lib/crmEngine';
import { assertBodySize, readJsonBody, sanitizeText, toPlainObject } from '../_lib/http';
import { checkRateLimit, getClientKey } from '../_lib/rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 8192);

    const body = readJsonBody<Record<string, unknown>>(req, {});

    const allowed = await checkRateLimit({
      key: getClientKey(req, body),
      bucket: 'chat-session',
      maxRequests: 10,
      windowSeconds: 60,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    const sessionId = sanitizeText(typeof body.sessionId === 'string' ? body.sessionId : '') || `chat_${randomUUID()}`;
    const resolved = await resolveLeadContext({
      sourceType: 'chatbot',
      leadData: body.leadData,
      attribution: body.attribution,
      identity: body.identity,
    });

    await syncLegacyChatSession({
      sessionId,
      leadData: resolved.leadData,
      attribution: resolved.attribution,
      identity: resolved.identity,
      options: toPlainObject(body.options) as ChatSessionOptions,
    });

    return res.status(200).json({
      ok: true,
      sessionId,
      identity: resolved.identity,
    });
  } catch (error: any) {
    console.error('[chat/session]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not persist chat session.' });
  }
}
