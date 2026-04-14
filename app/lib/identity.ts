export interface LeadIdentity {
  personId?: string;
  organizationId?: string;
  leadThreadId?: string;
}

const LEAD_IDENTITY_STORAGE_KEY = 'layercloud_lead_identity_v1';

function sanitizeText(value: string | null | undefined) {
  return (value ?? '').trim();
}

export function getStoredLeadIdentity(): LeadIdentity {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(LEAD_IDENTITY_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as LeadIdentity;
    return {
      personId: sanitizeText(parsed.personId) || undefined,
      organizationId: sanitizeText(parsed.organizationId) || undefined,
      leadThreadId: sanitizeText(parsed.leadThreadId) || undefined,
    };
  } catch {
    return {};
  }
}

export function mergeStoredLeadIdentity(nextIdentity: LeadIdentity) {
  if (typeof window === 'undefined') {
    return {};
  }

  const merged = {
    ...getStoredLeadIdentity(),
    ...(sanitizeText(nextIdentity.personId) ? { personId: sanitizeText(nextIdentity.personId) } : {}),
    ...(sanitizeText(nextIdentity.organizationId)
      ? { organizationId: sanitizeText(nextIdentity.organizationId) }
      : {}),
    ...(sanitizeText(nextIdentity.leadThreadId)
      ? { leadThreadId: sanitizeText(nextIdentity.leadThreadId) }
      : {}),
  };

  window.localStorage.setItem(LEAD_IDENTITY_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function clearStoredLeadIdentity() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LEAD_IDENTITY_STORAGE_KEY);
}
