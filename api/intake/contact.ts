import type { ChatLeadData, ContactLeadInput } from '../../src/lib/crmTypes';
import { analyzeLeadStrategy } from '../_lib/leadStrategyService';
import { persistLeadAnalysis, recordEvent, resolveLeadContext, syncLegacyContactSubmission } from '../_lib/crmEngine';
import { readJsonBody, sanitizeText, toPlainObject } from '../_lib/http';

function buildLeadDataFromInput(input: Partial<ContactLeadInput>) {
  return {
    name: sanitizeText(typeof input.name === 'string' ? input.name : ''),
    email: sanitizeText(typeof input.email === 'string' ? input.email : ''),
    phone: sanitizeText(typeof input.phone === 'string' ? input.phone : ''),
    company: sanitizeText(typeof input.company === 'string' ? input.company : ''),
    topPain: sanitizeText(typeof input.message === 'string' ? input.message : ''),
    extraContext: sanitizeText(typeof input.message === 'string' ? input.message : ''),
  } satisfies Partial<ChatLeadData>;
}

function normalizeContactInput(input: Record<string, unknown>) {
  return {
    name: sanitizeText(typeof input.name === 'string' ? input.name : ''),
    email: sanitizeText(typeof input.email === 'string' ? input.email : ''),
    phone: sanitizeText(typeof input.phone === 'string' ? input.phone : ''),
    company: sanitizeText(typeof input.company === 'string' ? input.company : ''),
    message: sanitizeText(typeof input.message === 'string' ? input.message : ''),
  } satisfies Partial<ContactLeadInput>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = readJsonBody<Record<string, unknown>>(req, {});
    const contactInput = normalizeContactInput(toPlainObject(body.input));
    const resolved = await resolveLeadContext({
      sourceType: 'contact_form',
      leadData: Object.keys(toPlainObject(body.leadData)).length > 0 ? body.leadData : buildLeadDataFromInput(contactInput),
      attribution: body.attribution,
      identity: body.identity,
    });

    const submissionId = await syncLegacyContactSubmission({
      leadData: resolved.leadData,
      contactInput,
      attribution: resolved.attribution,
      identity: resolved.identity,
    });

    const strategy = await analyzeLeadStrategy({
      sourceType: 'contact_form',
      leadData: resolved.leadData,
      transcript: [],
    });

    await persistLeadAnalysis({
      sourceType: 'contact_form',
      sourceCollection: 'contactSubmissions',
      sourceDocumentId: submissionId,
      leadData: resolved.leadData,
      identity: resolved.identity,
      strategy,
    });

    await recordEvent({
      eventName: 'contact_submission',
      attribution: resolved.attribution,
      identity: resolved.identity,
      path: resolved.attribution.currentPath,
      payload: {
        submissionId,
        sourceType: 'contact_form',
      },
    });

    return res.status(200).json({
      ok: true,
      submissionId,
      identity: resolved.identity,
      strategy,
    });
  } catch (error) {
    console.error('[intake/contact]', error);
    return res.status(500).json({ ok: false, error: 'Could not persist contact submission.' });
  }
}
