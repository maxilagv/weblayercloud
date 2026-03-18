import { normalizeAttribution, recordPageVisit } from './_lib/crmEngine';
import { readJsonBody, sanitizeText } from './_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = readJsonBody<Record<string, unknown>>(req, {});
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
  } catch (error) {
    console.error('[track-visit]', error);
    return res.status(500).json({ ok: false, error: 'Could not track visit.' });
  }
}
