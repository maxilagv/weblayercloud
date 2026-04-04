import { getAttributionContextWithAB } from './attribution';
import { getDemoJourneyABContext } from './abTest';
import { postJson } from './apiClient';
import { getStoredLeadIdentity, mergeStoredLeadIdentity, type LeadIdentity } from './identity';

export interface TrackEventInput {
  eventName: string;
  path?: string;
  payload?: Record<string, unknown>;
}

export interface TrackIdentityPayload {
  sessionId?: string | null;
  identity?: LeadIdentity;
}

function buildEventPayload(pathOverride?: string) {
  const abVariants = typeof window !== 'undefined'
    ? (getDemoJourneyABContext() as unknown as Record<string, string>)
    : undefined;
  return {
    attribution: getAttributionContextWithAB(pathOverride, abVariants),
    identity: getStoredLeadIdentity(),
  };
}

export async function trackVisit(path: string) {
  return postJson<{ ok: boolean; visitorId?: string }>('/api/track-visit', {
    path,
    ...buildEventPayload(path),
  });
}

export async function trackBehaviorEvent(input: TrackEventInput) {
  return postJson<{ ok: boolean; eventId?: string }>(
    '/api/track-event',
    {
      ...buildEventPayload(input.path),
      eventName: input.eventName,
      path: input.path,
      payload: input.payload ?? {},
    },
    { keepalive: true },
  );
}

export function storeLeadIdentity(identity: LeadIdentity) {
  return mergeStoredLeadIdentity(identity);
}
