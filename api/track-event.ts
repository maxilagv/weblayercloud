import { normalizeAttribution, recordEvent } from './_lib/crmEngine';
import { assertBodySize, readJsonBody, sanitizeEventName, sanitizeText, toPlainObject } from './_lib/http';
import { checkRateLimit, getClientKey } from './_lib/rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 8192);

    const body = readJsonBody<Record<string, unknown>>(req, {});
    const eventName = sanitizeEventName(body.eventName);
    if (!eventName) {
      return res.status(400).json({ ok: false, error: 'Invalid event name.' });
    }

    const allowed = await checkRateLimit({
      key: getClientKey(req, body),
      bucket: 'track-event',
      maxRequests: 120,
      windowSeconds: 60,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    const path = sanitizeText(typeof body.path === 'string' ? body.path : '');
    const attribution = normalizeAttribution(body.attribution, path);

    // Limit free-form payload to prevent abuse
    const rawPayload = toPlainObject(body.payload);
    const payloadStr = JSON.stringify(rawPayload);
    const payload = payloadStr.length > 4096 ? {} : rawPayload;

    const eventId = await recordEvent({
      eventName,
      attribution,
      identity: body.identity,
      path: attribution.currentPath,
      payload,
    });

    return res.status(200).json({
      ok: true,
      eventId,
    });
  } catch (error: any) {
    console.error('[track-event]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not track event.' });
  }
}
