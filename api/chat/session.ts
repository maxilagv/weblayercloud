import { randomUUID } from 'node:crypto';
import type { ChatSessionOptions } from '../../src/lib/crmTypes';
import { resolveLeadContext, syncLegacyChatSession } from '../_lib/crmEngine';
import { readJsonBody, sanitizeText, toPlainObject } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = readJsonBody<Record<string, unknown>>(req, {});
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
  } catch (error) {
    console.error('[chat/session]', error);
    return res.status(500).json({ ok: false, error: 'Could not persist chat session.' });
  }
}
