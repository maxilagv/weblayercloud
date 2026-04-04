import type { ChatLeadData, ContactLeadInput } from '../../src/lib/crmTypes';
import { analyzeLeadStrategy } from '../_lib/leadStrategyService';
import { persistLeadAnalysis, recordEvent, resolveLeadContext, syncLegacyContactSubmission } from '../_lib/crmEngine';
import { assertBodySize, readJsonBody, sanitizeText, toPlainObject } from '../_lib/http';
import { checkRateLimit, getClientKey } from '../_lib/rateLimit';
import { enqueueFollowUp } from '../_lib/followUpQueue';

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

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip en dev cuando no hay secret configurada

  if (!token) return false;

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await response.json()) as { success: boolean };
  return data.success;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertBodySize(req, 8192);

    const body = readJsonBody<Record<string, unknown>>(req, {});

    // ── Rate limit ──
    const clientKey = getClientKey(req, body);
    const allowed = await checkRateLimit({
      key: clientKey,
      bucket: 'intake-contact',
      maxRequests: 3,
      windowSeconds: 300,
    });
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many requests.' });
    }

    // ── Turnstile verification ──
    const turnstileToken = sanitizeText(typeof body.turnstileToken === 'string' ? body.turnstileToken : '');
    const turnstileOk = await verifyTurnstile(turnstileToken, clientKey);
    if (!turnstileOk) {
      return res.status(400).json({ ok: false, error: 'Verificación fallida.' });
    }

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

    // ── Follow-up: always enqueue for contact form submissions ──
    if (resolved.identity.leadThreadId) {
      try {
        await enqueueFollowUp({
          leadData: resolved.leadData,
          strategy,
          sourceType: 'contact_form',
          submissionId,
          leadThreadId: resolved.identity.leadThreadId,
          identity: resolved.identity,
        });
      } catch (err) {
        console.error('[intake/contact] followup enqueue failed', err);
      }
    }

    return res.status(200).json({
      ok: true,
      submissionId,
      identity: resolved.identity,
      strategy,
    });
  } catch (error: any) {
    console.error('[intake/contact]', error);
    if (error?.statusCode === 413) {
      return res.status(413).json({ ok: false, error: 'Request body too large.' });
    }
    return res.status(500).json({ ok: false, error: 'Could not persist contact submission.' });
  }
}
