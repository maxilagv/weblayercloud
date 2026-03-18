import type { LeadStrategyRequest } from '../src/lib/leadStrategy';
import { analyzeLeadStrategy } from './_lib/leadStrategyService';
import { readJsonBody } from './_lib/http';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = readJsonBody<LeadStrategyRequest>(req, {
    sourceType: 'chatbot',
    leadData: {},
    transcript: [],
  });

  const safeBody: LeadStrategyRequest = {
    sourceType: body?.sourceType === 'contact_form' ? 'contact_form' : 'chatbot',
    leadData: body?.leadData ?? {},
    transcript: Array.isArray(body?.transcript) ? body.transcript : [],
  };

  const strategy = await analyzeLeadStrategy(safeBody);
  return res.status(200).json({
    ok: true,
    strategy,
  });
}
