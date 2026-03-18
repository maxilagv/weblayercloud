import { normalizeAttribution, recordEvent } from './_lib/crmEngine';
import { readJsonBody, sanitizeEventName, sanitizeText, toPlainObject } from './_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = readJsonBody<Record<string, unknown>>(req, {});
    const eventName = sanitizeEventName(body.eventName);
    if (!eventName) {
      return res.status(400).json({ ok: false, error: 'Invalid event name.' });
    }

    const path = sanitizeText(typeof body.path === 'string' ? body.path : '');
    const attribution = normalizeAttribution(body.attribution, path);
    const eventId = await recordEvent({
      eventName,
      attribution,
      identity: body.identity,
      path: attribution.currentPath,
      payload: toPlainObject(body.payload),
    });

    return res.status(200).json({
      ok: true,
      eventId,
    });
  } catch (error) {
    console.error('[track-event]', error);
    return res.status(500).json({ ok: false, error: 'Could not track event.' });
  }
}
