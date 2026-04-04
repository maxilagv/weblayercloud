import { assertAdminToken, verifyAuthenticatedRequest } from './_lib/firebaseAdmin';
import { adminDb } from './_lib/firebaseAdmin';
import { assertBodySize, readJsonBody } from './_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 2048);

    const token = await verifyAuthenticatedRequest(req);
    assertAdminToken(token);

    // ── Aggregate conversions from contact_submission events ──
    const conversions = await adminDb
      .collection('events')
      .where('eventName', '==', 'contact_submission')
      .orderBy('occurredAt', 'desc')
      .limit(5000)
      .get();

    const results: Record<string, Record<string, { views: number; conversions: number }>> = {};

    for (const doc of conversions.docs) {
      const data = doc.data();
      // abVariants can be at top level (from buildAttributionFields) or in payload
      const variants = data.abVariants ?? data.payload?.abVariants ?? {};
      if (!variants || typeof variants !== 'object') continue;

      for (const [testId, variant] of Object.entries(variants)) {
        if (typeof variant !== 'string' || !variant) continue;
        if (!results[testId]) results[testId] = {};
        if (!results[testId][variant]) {
          results[testId][variant] = { views: 0, conversions: 1 };
        } else {
          results[testId][variant].conversions += 1;
        }
      }
    }

    // ── Aggregate views from visitors collection ──
    const visits = await adminDb
      .collection('visitors')
      .orderBy('timestamp', 'desc')
      .limit(10000)
      .get();

    for (const doc of visits.docs) {
      const data = doc.data();
      const variants = data.abVariants;
      if (!variants || typeof variants !== 'object') continue;

      for (const [testId, variant] of Object.entries(variants)) {
        if (typeof variant !== 'string' || !variant) continue;
        if (!results[testId]) results[testId] = {};
        if (!results[testId][variant]) {
          results[testId][variant] = { views: 1, conversions: 0 };
        } else {
          results[testId][variant].views += 1;
        }
      }
    }

    // ── Calculate conversion rates ──
    const enriched = Object.entries(results).map(([testId, variants]) => ({
      testId,
      variants: Object.entries(variants)
        .map(([variant, stats]) => ({
          variant,
          views: stats.views,
          conversions: stats.conversions,
          conversionRate: stats.views > 0 ? (stats.conversions / stats.views * 100).toFixed(2) : '0.00',
        }))
        .sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate)),
    }));

    return res.status(200).json({ ok: true, results: enriched });
  } catch (error: any) {
    console.error('[ab-results]', error);
    const status = error?.message?.includes('Auth') || error?.message?.includes('Admin') ? 401 : 500;
    return res.status(status).json({ ok: false, error: error?.message || 'Could not fetch A/B results.' });
  }
}
