const VISITOR_ID_KEY = 'layercloud_visitor_id';
const SESSION_ID_KEY = 'layercloud_session_id';
const FIRST_TOUCH_KEY = 'layercloud_first_touch_v1';

interface StoredTouchpoint {
  path: string;
  url: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  occurredAt: string;
}

function sanitizeText(value: string | null | undefined) {
  return (value ?? '').trim();
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateLocalStorage(key: string, prefix: string) {
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const created = generateId(prefix);
  window.localStorage.setItem(key, created);
  return created;
}

function getOrCreateSessionStorage(key: string, prefix: string) {
  const existing = window.sessionStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const created = generateId(prefix);
  window.sessionStorage.setItem(key, created);
  return created;
}

function getTouchpoint(pathOverride?: string): StoredTouchpoint {
  const params = new URLSearchParams(window.location.search);

  return {
    path: pathOverride ?? window.location.pathname,
    url: window.location.href,
    referrer: document.referrer || 'direct',
    utmSource: sanitizeText(params.get('utm_source')),
    utmMedium: sanitizeText(params.get('utm_medium')),
    utmCampaign: sanitizeText(params.get('utm_campaign')),
    utmContent: sanitizeText(params.get('utm_content')),
    utmTerm: sanitizeText(params.get('utm_term')),
    occurredAt: new Date().toISOString(),
  };
}

function getPrimaryChannel(touchpoint: StoredTouchpoint) {
  if (touchpoint.utmSource || touchpoint.utmMedium) {
    return [touchpoint.utmSource || 'unknown', touchpoint.utmMedium || 'unknown'].join(' / ');
  }

  if (touchpoint.referrer && touchpoint.referrer !== 'direct') {
    return 'referral';
  }

  return 'direct';
}

function getStoredFirstTouch(pathOverride?: string) {
  const currentTouch = getTouchpoint(pathOverride);
  const rawValue = window.localStorage.getItem(FIRST_TOUCH_KEY);

  if (rawValue) {
    try {
      const parsed = JSON.parse(rawValue) as StoredTouchpoint;
      if (parsed?.url) {
        return parsed;
      }
    } catch {
      // ignore invalid storage and recreate
    }
  }

  window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(currentTouch));
  return currentTouch;
}

export function getAttributionContext(pathOverride?: string) {
  if (typeof window === 'undefined') {
    return {};
  }

  const visitorId = getOrCreateLocalStorage(VISITOR_ID_KEY, 'visitor');
  const visitorSessionId = getOrCreateSessionStorage(SESSION_ID_KEY, 'session');
  const currentTouch = getTouchpoint(pathOverride);
  const firstTouch = getStoredFirstTouch(pathOverride);

  return {
    visitorId,
    visitorSessionId,
    currentPath: currentTouch.path,
    currentUrl: currentTouch.url,
    pageTitle: document.title || '',
    referrer: currentTouch.referrer,
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    utmSource: currentTouch.utmSource,
    utmMedium: currentTouch.utmMedium,
    utmCampaign: currentTouch.utmCampaign,
    utmContent: currentTouch.utmContent,
    utmTerm: currentTouch.utmTerm,
    attributionChannel: getPrimaryChannel(currentTouch),
    landingPath: firstTouch.path,
    landingUrl: firstTouch.url,
    firstReferrer: firstTouch.referrer,
    firstUtmSource: firstTouch.utmSource,
    firstUtmMedium: firstTouch.utmMedium,
    firstUtmCampaign: firstTouch.utmCampaign,
    firstUtmContent: firstTouch.utmContent,
    firstUtmTerm: firstTouch.utmTerm,
    firstAttributionChannel: getPrimaryChannel(firstTouch),
    firstTouchAt: firstTouch.occurredAt,
  };
}
