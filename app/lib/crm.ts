import { getAttributionContextWithAB } from './attribution';
import { postJson } from './apiClient';
import { getStoredLeadIdentity, mergeStoredLeadIdentity, type LeadIdentity } from './identity';
import type { LeadIntelligence } from './leadStrategy';
import {
  CHAT_FIELD_ORDER,
  calculateLeadScore,
  countCompletedFields,
  firstNumber,
  getChatSessionStatus,
  inferSalesAngle,
  sanitizeText,
  stripEmptyFields,
  type ChatFieldKey,
  type ChatLeadData,
  type ChatSessionOptions,
  type ContactLeadInput,
  type LeadCollectionName,
  type LeadStage,
} from './crmTypes';

export {
  CHAT_FIELD_ORDER,
  calculateLeadScore,
  countCompletedFields,
  firstNumber,
  inferSalesAngle,
  sanitizeText,
  stripEmptyFields,
};

export type {
  ChatFieldKey,
  ChatLeadData,
  ChatSessionOptions,
  ContactLeadInput,
  LeadCollectionName,
  LeadStage,
};

export const CHAT_SESSION_STORAGE_KEY = 'layercloud_chat_session_id';

interface ApiIdentityResponse {
  sessionId?: string;
  submissionId?: string;
  strategy?: LeadIntelligence;
  identity?: LeadIdentity;
}

function buildSharedPayload(pathOverride?: string) {
  return {
    attribution: getAttributionContextWithAB(pathOverride),
    identity: getStoredLeadIdentity(),
  };
}

function persistIdentity(response: ApiIdentityResponse) {
  if (response.identity) {
    mergeStoredLeadIdentity(response.identity);
  }
}

function buildContactLeadData(input: ContactLeadInput): Partial<ChatLeadData> {
  return {
    name: sanitizeText(input.name),
    company: sanitizeText(input.company),
    email: sanitizeText(input.email),
    phone: sanitizeText(input.phone),
    topPain: sanitizeText(input.message),
    extraContext: sanitizeText(input.message),
  };
}

export function getStoredChatSessionId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
}

export function clearStoredChatSessionId() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
}

export async function ensureChatSession(
  sessionId: string | null,
  leadData: Partial<ChatLeadData>,
  options: ChatSessionOptions = {},
) {
  const response = await postJson<ApiIdentityResponse>('/api/chat/session', {
    sessionId,
    leadData,
    options: {
      ...options,
      status: getChatSessionStatus(leadData, options.status),
    },
    ...buildSharedPayload(),
  });

  persistIdentity(response);

  const persistedSessionId = response.sessionId || sessionId;
  if (!persistedSessionId) {
    throw new Error('Chat session endpoint did not return a session id.');
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CHAT_SESSION_STORAGE_KEY, persistedSessionId);
  }

  return persistedSessionId;
}

export async function updateChatSession(
  sessionId: string,
  leadData: Partial<ChatLeadData>,
  options: ChatSessionOptions = {},
) {
  const response = await postJson<ApiIdentityResponse>('/api/chat/session', {
    sessionId,
    leadData,
    options: {
      ...options,
      status: getChatSessionStatus(leadData, options.status),
    },
    ...buildSharedPayload(),
  });

  persistIdentity(response);
}

export async function appendChatMessage(
  sessionId: string,
  message: {
    role: 'assistant' | 'user';
    content: string;
    kind?: string;
    stepKey?: string;
  },
) {
  const response = await postJson<ApiIdentityResponse>('/api/chat/message', {
    sessionId,
    message: {
      role: message.role,
      content: sanitizeText(message.content),
      kind: message.kind ?? 'message',
      ...(message.stepKey ? { stepKey: message.stepKey } : {}),
    },
    ...buildSharedPayload(),
  });

  persistIdentity(response);
}

export async function saveLeadIntelligence(_sessionId: string, _intelligence: LeadIntelligence) {
  // Kept for backwards compatibility. Enrichment now happens server-side.
}

export async function saveLeadIntelligenceForCollection(
  _collectionName: LeadCollectionName,
  _documentId: string,
  _intelligence: LeadIntelligence,
) {
  // Kept for backwards compatibility. Enrichment now happens server-side.
}

export async function updateLeadStage(
  collectionName: LeadCollectionName,
  documentId: string,
  stage: LeadStage,
) {
  await postJson<{ ok: boolean }>('/api/lead-stage', {
    collectionName,
    documentId,
    stage,
  }, { auth: 'admin' });
}

export async function submitContactSubmission(input: ContactLeadInput & { turnstileToken?: string }) {
  const response = await postJson<ApiIdentityResponse>('/api/intake/contact', {
    input: stripEmptyFields({
      name: sanitizeText(input.name),
      email: sanitizeText(input.email),
      phone: sanitizeText(input.phone),
      company: sanitizeText(input.company),
      message: sanitizeText(input.message),
    }),
    leadData: buildContactLeadData(input),
    turnstileToken: input.turnstileToken || '',
    ...buildSharedPayload('/contacto'),
  });

  persistIdentity(response);
  return response.submissionId;
}
