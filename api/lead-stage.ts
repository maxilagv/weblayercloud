import type { LeadCollectionName, LeadStage } from '../src/lib/crmTypes';
import { assertAdminToken, verifyAuthenticatedRequest } from './_lib/firebaseAdmin';
import { readJsonBody, sanitizeText } from './_lib/http';
import { updateLeadStageForCollection } from './_lib/crmEngine';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    assertAdminToken(await verifyAuthenticatedRequest(req));

    const body = readJsonBody<Record<string, unknown>>(req, {});
    const collectionName =
      body.collectionName === 'contactSubmissions' ? 'contactSubmissions' : 'chatSessions';
    const documentId = sanitizeText(typeof body.documentId === 'string' ? body.documentId : '');
    const stage = sanitizeText(typeof body.stage === 'string' ? body.stage : 'new') as LeadStage;

    if (!documentId) {
      return res.status(400).json({ ok: false, error: 'Missing document id.' });
    }

    await updateLeadStageForCollection(collectionName as LeadCollectionName, documentId, stage);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[lead-stage]', error);
    return res.status(401).json({ ok: false, error: 'Could not update lead stage.' });
  }
}
