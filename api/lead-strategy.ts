import type { LeadStrategyRequest, LeadTranscriptMessage } from '../src/lib/leadStrategy';
import { analyzeLeadStrategy } from './_lib/leadStrategyService';
import { assertBodySize, parseAllowedOrigin, readJsonBody, sanitizeText, sanitizeTranscript } from './_lib/http';
import { checkRateLimit, getClientKey } from './_lib/rateLimit';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 16384);

    const body = readJsonBody<Record<string, unknown>>(req, {});

    // ── Rate limit ──
    const allowed = await checkRateLimit({
      key: getClientKey(req, body),
      bucket: 'lead-strategy',
      maxRequests: 5,
      windowSeconds: 60,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    // ── Origin check estricto (solo producción) ──
    if (process.env.NODE_ENV === 'production') {
      const requestOrigin = parseAllowedOrigin(req.headers['origin'] ?? '');
      const requestRefererOrigin = parseAllowedOrigin(req.headers['referer'] ?? '');

      const allowedOrigins = [
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
        process.env.ALLOWED_ORIGIN ?? 'https://weblayercloud.com',
      ]
        .filter(Boolean)
        .map((o) => {
          try {
            return new URL(o).origin;
          } catch {
            return '';
          }
        })
        .filter(Boolean);

      const isAllowed =
        (requestOrigin && allowedOrigins.includes(requestOrigin)) ||
        (requestRefererOrigin && allowedOrigins.includes(requestRefererOrigin));

      if (!isAllowed) {
        return res.status(403).json({ ok: false, error: 'Forbidden.' });
      }
    }

    const safeBody: LeadStrategyRequest = {
      sourceType: (body as any)?.sourceType === 'contact_form' ? 'contact_form' : 'chatbot',
      leadData: (body as any)?.leadData ?? {},
      transcript: sanitizeTranscript((body as any)?.transcript, 16, 2000) as LeadTranscriptMessage[],
    };

    const strategy = await analyzeLeadStrategy(safeBody);
    return res.status(200).json({
      ok: true,
      strategy,
    });
  } catch (error: any) {
    console.error('[lead-strategy]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not analyze lead strategy.' });
  }
}
