import { normalizeAttribution, recordPageVisit } from './_lib/crmEngine';
import { assertBodySize, readJsonBody, sanitizeText } from './_lib/http';
import { checkRateLimit, getClientKey } from './_lib/rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 8192);

    const body = readJsonBody<Record<string, unknown>>(req, {});

    const allowed = await checkRateLimit({
      key: getClientKey(req, body),
      bucket: 'track-visit',
      maxRequests: 60,
      windowSeconds: 60,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    const path = sanitizeText(typeof body.path === 'string' ? body.path : '');
    const attribution = normalizeAttribution(body.attribution, path);
    await recordPageVisit({
      attribution,
      identity: body.identity,
      path: attribution.currentPath,
    });

    return res.status(200).json({
      ok: true,
      visitorId: attribution.visitorId,
    });
  } catch (error: any) {
    console.error('[track-visit]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not track visit.' });
  }
}
