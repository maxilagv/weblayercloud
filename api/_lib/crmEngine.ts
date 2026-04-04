import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  CHAT_FIELD_ORDER,
  calculateLeadScore,
  countCompletedFields,
  getChatSessionStatus,
  inferSalesAngle,
  sanitizeText as sanitizeLeadText,
  stripEmptyFields,
  type ChatLeadData,
  type ChatSessionOptions,
  type ContactLeadInput,
  type LeadCollectionName,
  type LeadStage,
} from '../../src/lib/crmTypes';
import {
  countLeadFields,
  shouldAnalyzeLead,
  type LeadIntelligence,
  type LeadTranscriptMessage,
} from '../../src/lib/leadStrategy';
import type { LeadIdentity } from '../../src/lib/identity';
import { adminDb } from './firebaseAdmin';
import { safeJsonValue, sanitizeEventName, sanitizeText, toPlainObject } from './http';

type SourceType = 'chatbot' | 'contact_form';

const STAGE_VALUES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export interface AttributionContext {
  visitorId: string;
  visitorSessionId: string;
  currentPath: string;
  currentUrl?: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  screen?: string;
  language?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  attributionChannel?: string;
  landingPath?: string;
  landingUrl?: string;
  firstReferrer?: string;
  firstUtmSource?: string;
  firstUtmMedium?: string;
  firstUtmCampaign?: string;
  firstUtmContent?: string;
  firstUtmTerm?: string;
  firstAttributionChannel?: string;
  firstTouchAt?: string;
  abVariants?: Record<string, string>;
}

export interface ChatMessageInput {
  role: 'assistant' | 'user';
  content: string;
  kind?: string;
  stepKey?: string;
}

export interface ResolvedLeadContext {
  sourceType: SourceType;
  leadData: Partial<ChatLeadData>;
  attribution: AttributionContext;
  identity: LeadIdentity;
}

interface BehaviorDelta {
  behaviorIntentScore: number;
  engagementScore: number;
  channelQualityScore: number;
  formLikelihoodScore: number;
  returnVisitorScore: number;
  maxScrollDepth: number;
  maxTimeBucketSeconds: number;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;
}

function normalizeKey(value: string) {
  return sanitizeText(value).toLowerCase().replace(/\s+/g, ' ').slice(0, 180);
}

function normalizePhone(value: string) {
  const digits = sanitizeText(value).replace(/[^\d+]/g, '');
  if (!digits || /prefiere no compartir/i.test(value)) {
    return '';
  }

  return digits.slice(0, 32);
}

function normalizeEmail(value: string) {
  return sanitizeText(value).toLowerCase().slice(0, 180);
}

function sanitizeLeadStage(value: unknown): LeadStage {
  return STAGE_VALUES.includes(value as LeadStage) ? (value as LeadStage) : 'new';
}

function safeArrayUnion(...values: Array<string | undefined>) {
  const filtered = values.map((value) => sanitizeText(value)).filter(Boolean);
  return filtered.length > 0 ? FieldValue.arrayUnion(...filtered) : undefined;
}

function parseTimeBucketToSeconds(payload: Record<string, unknown>) {
  const numericValue = Number(payload.seconds);
  if (Number.isFinite(numericValue) && numericValue > 0) {
    return Math.round(numericValue);
  }

  const bucket = sanitizeText(typeof payload.bucket === 'string' ? payload.bucket : '');
  const mapped = bucket.match(/^(\d+)(s)$/i);
  if (!mapped) {
    return 0;
  }

  return Number(mapped[1]) || 0;
}

function getBehaviorDelta(
  eventName: string,
  path: string,
  payload: Record<string, unknown>,
  attribution: AttributionContext,
): BehaviorDelta {
  const lowerPath = path.toLowerCase();
  const delta: BehaviorDelta = {
    behaviorIntentScore: 0,
    engagementScore: 0,
    channelQualityScore: 0,
    formLikelihoodScore: 0,
    returnVisitorScore: 0,
    maxScrollDepth: 0,
    maxTimeBucketSeconds: 0,
  };

  if (eventName === 'page_view') {
    delta.engagementScore += 2;
    if (/(contacto|solucion)/.test(lowerPath)) {
      delta.behaviorIntentScore += 6;
      delta.formLikelihoodScore += 4;
    }
  }

  if (eventName === 'return_visit') {
    delta.behaviorIntentScore += 12;
    delta.engagementScore += 8;
    delta.returnVisitorScore += 18;
  }

  if (eventName === 'cta_click') {
    delta.behaviorIntentScore += 14;
    delta.formLikelihoodScore += 10;
  }

  if (eventName === 'chat_open') {
    delta.behaviorIntentScore += 8;
    delta.engagementScore += 4;
  }

  if (eventName === 'chat_start') {
    delta.behaviorIntentScore += 16;
    delta.formLikelihoodScore += 8;
  }

  if (eventName === 'chat_step_completed') {
    delta.behaviorIntentScore += 5;
    delta.engagementScore += 4;
  }

  if (eventName === 'chat_completed') {
    delta.behaviorIntentScore += 18;
    delta.formLikelihoodScore += 16;
  }

  if (eventName === 'form_start') {
    delta.behaviorIntentScore += 12;
    delta.formLikelihoodScore += 16;
  }

  if (eventName === 'form_submit' || eventName === 'contact_submission') {
    delta.behaviorIntentScore += 26;
    delta.formLikelihoodScore += 28;
    delta.engagementScore += 6;
  }

  if (eventName === 'pricing_interest') {
    delta.behaviorIntentScore += 18;
    delta.formLikelihoodScore += 12;
  }

  if (eventName === 'scroll_depth') {
    const depth = Number(payload.depth);
    if (Number.isFinite(depth)) {
      delta.engagementScore += depth >= 75 ? 8 : depth >= 50 ? 5 : depth >= 25 ? 3 : 1;
      delta.maxScrollDepth = Math.max(0, Math.min(100, Math.round(depth)));
    }
  }

  if (eventName === 'time_on_page_bucket') {
    const seconds = parseTimeBucketToSeconds(payload);
    if (seconds >= 90) {
      delta.engagementScore += 10;
      delta.behaviorIntentScore += 8;
    } else if (seconds >= 45) {
      delta.engagementScore += 6;
      delta.behaviorIntentScore += 4;
    } else if (seconds >= 15) {
      delta.engagementScore += 3;
    }

    delta.maxTimeBucketSeconds = seconds;
  }

  if (eventName === 'section_view') {
    delta.engagementScore += 4;
    const sectionName = sanitizeText(typeof payload.section === 'string' ? payload.section : '').toLowerCase();
    if (/(pricing|contact|cta|diagnostico|solucion)/.test(sectionName)) {
      delta.behaviorIntentScore += 8;
      delta.formLikelihoodScore += 5;
    }
  }

  const channel = (attribution.firstAttributionChannel || attribution.attributionChannel || '').toLowerCase();
  if (/google|search|linkedin|referral/.test(channel)) {
    delta.channelQualityScore += 6;
  } else if (/direct/.test(channel)) {
    delta.channelQualityScore += 3;
  } else if (channel) {
    delta.channelQualityScore += 4;
  }

  return delta;
}

function normalizePayload(input: unknown) {
  const payload = safeJsonValue(toPlainObject(input));
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === 'string') {
        return sanitizeText(value).length > 0;
      }

      return ['number', 'boolean', 'object'].includes(typeof value);
    }),
  );
}

function extractHostname(value: string) {
  const rawValue = sanitizeText(value);
  if (!rawValue) {
    return '';
  }

  const candidate = rawValue.startsWith('http://') || rawValue.startsWith('https://') ? rawValue : `https://${rawValue}`;
  try {
    return new URL(candidate).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

function deriveDomain(leadData: Partial<ChatLeadData>) {
  const websiteDomain = extractHostname(sanitizeLeadText(leadData.website));
  if (websiteDomain) {
    return websiteDomain;
  }

  const email = normalizeEmail(leadData.email || '');
  const [, domain = ''] = email.split('@');
  return domain;
}

function normalizeIdentity(raw: unknown): LeadIdentity {
  const value = toPlainObject(raw);
  return stripUndefined({
    personId: sanitizeText(typeof value.personId === 'string' ? value.personId : ''),
    organizationId: sanitizeText(typeof value.organizationId === 'string' ? value.organizationId : ''),
    leadThreadId: sanitizeText(typeof value.leadThreadId === 'string' ? value.leadThreadId : ''),
  });
}

export function normalizeAttribution(raw: unknown, pathOverride?: string): AttributionContext {
  const value = toPlainObject(raw);
  const currentPath = sanitizeText(
    pathOverride || (typeof value.currentPath === 'string' ? value.currentPath : ''),
  ) || '/';

  return {
    visitorId: sanitizeText(typeof value.visitorId === 'string' ? value.visitorId : '') || `visitor_${randomUUID()}`,
    visitorSessionId:
      sanitizeText(typeof value.visitorSessionId === 'string' ? value.visitorSessionId : '') ||
      `session_${randomUUID()}`,
    currentPath,
    currentUrl: sanitizeText(typeof value.currentUrl === 'string' ? value.currentUrl : ''),
    pageTitle: sanitizeText(typeof value.pageTitle === 'string' ? value.pageTitle : ''),
    referrer: sanitizeText(typeof value.referrer === 'string' ? value.referrer : ''),
    userAgent: sanitizeText(typeof value.userAgent === 'string' ? value.userAgent : ''),
    screen: sanitizeText(typeof value.screen === 'string' ? value.screen : ''),
    language: sanitizeText(typeof value.language === 'string' ? value.language : ''),
    utmSource: sanitizeText(typeof value.utmSource === 'string' ? value.utmSource : ''),
    utmMedium: sanitizeText(typeof value.utmMedium === 'string' ? value.utmMedium : ''),
    utmCampaign: sanitizeText(typeof value.utmCampaign === 'string' ? value.utmCampaign : ''),
    utmContent: sanitizeText(typeof value.utmContent === 'string' ? value.utmContent : ''),
    utmTerm: sanitizeText(typeof value.utmTerm === 'string' ? value.utmTerm : ''),
    attributionChannel: sanitizeText(typeof value.attributionChannel === 'string' ? value.attributionChannel : ''),
    landingPath: sanitizeText(typeof value.landingPath === 'string' ? value.landingPath : '') || currentPath,
    landingUrl: sanitizeText(typeof value.landingUrl === 'string' ? value.landingUrl : ''),
    firstReferrer: sanitizeText(typeof value.firstReferrer === 'string' ? value.firstReferrer : ''),
    firstUtmSource: sanitizeText(typeof value.firstUtmSource === 'string' ? value.firstUtmSource : ''),
    firstUtmMedium: sanitizeText(typeof value.firstUtmMedium === 'string' ? value.firstUtmMedium : ''),
    firstUtmCampaign: sanitizeText(typeof value.firstUtmCampaign === 'string' ? value.firstUtmCampaign : ''),
    firstUtmContent: sanitizeText(typeof value.firstUtmContent === 'string' ? value.firstUtmContent : ''),
    firstUtmTerm: sanitizeText(typeof value.firstUtmTerm === 'string' ? value.firstUtmTerm : ''),
    firstAttributionChannel: sanitizeText(
      typeof value.firstAttributionChannel === 'string' ? value.firstAttributionChannel : '',
    ),
    firstTouchAt: sanitizeText(typeof value.firstTouchAt === 'string' ? value.firstTouchAt : ''),
    abVariants: sanitizeAbVariants(value.abVariants),
  };
}

function sanitizeAbVariants(raw: unknown): Record<string, string> | undefined {
  const obj = toPlainObject(raw);
  const entries = Object.entries(obj).filter(
    ([, v]) => typeof v === 'string' && v.length > 0 && v.length <= 100,
  );
  if (entries.length === 0) return undefined;
  return Object.fromEntries(
    entries.slice(0, 20).map(([k, v]) => [sanitizeText(k).slice(0, 60), sanitizeText(v as string).slice(0, 100)]),
  );
}

export function normalizeLeadData(raw: unknown): Partial<ChatLeadData> {
  const value = toPlainObject(raw);
  const normalized = CHAT_FIELD_ORDER.reduce(
    (accumulator, key) => {
      const fieldValue = value[key];
      const safeValue = sanitizeLeadText(typeof fieldValue === 'string' ? fieldValue : '');
      if (safeValue) {
        accumulator[key] = safeValue;
      }
      return accumulator;
    },
    {} as Partial<ChatLeadData>,
  );

  return stripEmptyFields(normalized as Record<string, unknown>) as Partial<ChatLeadData>;
}

function buildAttributionFields(attribution: AttributionContext) {
  return stripUndefined({
    visitorId: attribution.visitorId,
    visitorSessionId: attribution.visitorSessionId,
    currentPath: attribution.currentPath,
    currentUrl: attribution.currentUrl,
    pageTitle: attribution.pageTitle,
    referrer: attribution.referrer,
    userAgent: attribution.userAgent,
    screen: attribution.screen,
    language: attribution.language,
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmContent: attribution.utmContent,
    utmTerm: attribution.utmTerm,
    attributionChannel: attribution.attributionChannel,
    landingPath: attribution.landingPath,
    landingUrl: attribution.landingUrl,
    firstReferrer: attribution.firstReferrer,
    firstUtmSource: attribution.firstUtmSource,
    firstUtmMedium: attribution.firstUtmMedium,
    firstUtmCampaign: attribution.firstUtmCampaign,
    firstUtmContent: attribution.firstUtmContent,
    firstUtmTerm: attribution.firstUtmTerm,
    firstAttributionChannel: attribution.firstAttributionChannel,
    firstTouchAt: attribution.firstTouchAt,
    ...(attribution.abVariants ? { abVariants: attribution.abVariants } : {}),
  });
}

function mapStrategyToAiFields(strategy: LeadIntelligence) {
  return {
    aiPriorityLevel: strategy.priorityLevel,
    aiIntentScore: strategy.intentScore,
    aiUrgencyScore: strategy.urgencyScore,
    aiFitScore: strategy.fitScore,
    aiReadinessScore: strategy.readinessScore,
    aiBuyerMotivation: strategy.buyerMotivation,
    aiRecommendedOffer: strategy.recommendedOffer,
    aiOfferToShowNow: strategy.offerToShowNow,
    aiOfferReason: strategy.offerReason,
    aiSalesAngle: strategy.salesAngle,
    aiExecutiveSummary: strategy.executiveSummary,
    aiPainSummary: strategy.painSummary,
    aiNextBestAction: strategy.nextBestAction,
    aiWhatToSayNow: strategy.whatToSayNow,
    aiFollowUpMessage: strategy.followUpMessage,
    aiFollowUpWhatsApp: strategy.followUpWhatsApp,
    aiFollowUpEmailSubject: strategy.followUpEmailSubject,
    aiFollowUpEmailBody: strategy.followUpEmailBody,
    aiObjections: strategy.objections,
    aiMissingData: strategy.missingData,
    aiAutomationWins: strategy.automationWins,
    aiConfidence: strategy.confidence,
    aiGeneratedBy: strategy.generatedBy,
    aiModel: strategy.model,
    aiAnalysisVersion: strategy.analysisVersion,
    aiUpdatedAt: Timestamp.now(),
  };
}

async function getDocIfExists(collectionName: string, documentId?: string) {
  const safeId = sanitizeText(documentId);
  if (!safeId) {
    return null;
  }

  const snapshot = await adminDb.collection(collectionName).doc(safeId).get();
  return snapshot.exists ? snapshot : null;
}

async function findFirstByField(collectionName: string, field: string, value: string) {
  const normalizedValue = sanitizeText(value);
  if (!normalizedValue) {
    return null;
  }

  const snapshot = await adminDb.collection(collectionName).where(field, '==', normalizedValue).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function upsertVisitorProfile(
  attribution: AttributionContext,
  identity: LeadIdentity,
  input: {
    eventName?: string;
    path?: string;
    payload?: Record<string, unknown>;
    registerVisit?: boolean;
  } = {},
) {
  const eventName = sanitizeEventName(input.eventName || '');
  const path = sanitizeText(input.path || attribution.currentPath) || '/';
  const payload = normalizePayload(input.payload);
  const profileRef = adminDb.collection('visitorProfiles').doc(attribution.visitorId);
  const now = Timestamp.now();
  let isReturnVisit = false;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    const data = snapshot.data() || {};
    const isNewSession =
      sanitizeText(attribution.visitorSessionId) &&
      sanitizeText(attribution.visitorSessionId) !== sanitizeText(data.lastVisitorSessionId);
    isReturnVisit = Boolean(input.registerVisit && snapshot.exists && isNewSession);

    const delta = getBehaviorDelta(eventName, path, payload, attribution);
    const nextVisitCount = Number(data.visitCount || 0) + (input.registerVisit ? 1 : 0);
    const nextEventCount = Number(data.eventCount || 0) + (eventName ? 1 : 0);
    const nextSessionCount = Number(data.sessionCount || 0) + (isNewSession ? 1 : snapshot.exists ? 0 : 1);

    const profileData = stripUndefined({
      visitorId: attribution.visitorId,
      lastVisitorSessionId: attribution.visitorSessionId,
      currentPath: path,
      currentUrl: attribution.currentUrl,
      landingPath: data.landingPath || attribution.landingPath,
      landingUrl: data.landingUrl || attribution.landingUrl,
      firstSeenAt: snapshot.exists ? data.firstSeenAt : now,
      lastSeenAt: now,
      firstTouchAt: data.firstTouchAt || attribution.firstTouchAt || now.toDate().toISOString(),
      lastReferrer: attribution.referrer,
      firstReferrer: data.firstReferrer || attribution.firstReferrer,
      attributionChannel: attribution.attributionChannel,
      firstAttributionChannel: data.firstAttributionChannel || attribution.firstAttributionChannel,
      utmCampaign: attribution.utmCampaign,
      firstUtmCampaign: data.firstUtmCampaign || attribution.firstUtmCampaign,
      eventCount: nextEventCount,
      visitCount: nextVisitCount,
      sessionCount: nextSessionCount,
      returnVisitCount: Number(data.returnVisitCount || 0) + (isReturnVisit ? 1 : 0),
      behaviorIntentScore: Math.min(100, Number(data.behaviorIntentScore || 0) + delta.behaviorIntentScore),
      engagementScore: Math.min(100, Number(data.engagementScore || 0) + delta.engagementScore),
      channelQualityScore: Math.min(100, Number(data.channelQualityScore || 0) + delta.channelQualityScore),
      formLikelihoodScore: Math.min(100, Number(data.formLikelihoodScore || 0) + delta.formLikelihoodScore),
      returnVisitorScore: Math.min(100, Number(data.returnVisitorScore || 0) + delta.returnVisitorScore),
      maxScrollDepth: Math.max(Number(data.maxScrollDepth || 0), delta.maxScrollDepth),
      maxTimeBucketSeconds: Math.max(Number(data.maxTimeBucketSeconds || 0), delta.maxTimeBucketSeconds),
      personId: identity.personId,
      organizationId: identity.organizationId,
      leadThreadId: identity.leadThreadId,
      updatedAt: now,
      createdAt: snapshot.exists ? data.createdAt : now,
      lastEventName: eventName || data.lastEventName,
    });

    transaction.set(
      profileRef,
      {
        ...profileData,
        ...(safeArrayUnion(path) ? { pathsSeen: safeArrayUnion(path) } : {}),
        ...(safeArrayUnion(attribution.visitorSessionId) ? { sessionIds: safeArrayUnion(attribution.visitorSessionId) } : {}),
        ...(safeArrayUnion(attribution.attributionChannel, attribution.firstAttributionChannel)
          ? { channelsSeen: safeArrayUnion(attribution.attributionChannel, attribution.firstAttributionChannel) }
          : {}),
        ...(safeArrayUnion(attribution.utmCampaign, attribution.firstUtmCampaign)
          ? { campaignsSeen: safeArrayUnion(attribution.utmCampaign, attribution.firstUtmCampaign) }
          : {}),
      },
      { merge: true },
    );
  });

  return { profileId: profileRef.id, isReturnVisit };
}

export async function recordEvent(input: {
  eventName: string;
  attribution: AttributionContext;
  identity?: LeadIdentity;
  path?: string;
  payload?: Record<string, unknown>;
}) {
  const eventName = sanitizeEventName(input.eventName);
  if (!eventName) {
    return null;
  }

  const attribution = normalizeAttribution(input.attribution, input.path);
  const identity = normalizeIdentity(input.identity);
  const payload = normalizePayload(input.payload);
  const now = Timestamp.now();

  await upsertVisitorProfile(attribution, identity, {
    eventName,
    path: attribution.currentPath,
    payload,
  });

  const eventRef = adminDb.collection('events').doc();
  await eventRef.set({
    eventName,
    path: attribution.currentPath,
    payload,
    occurredAt: now,
    visitorId: attribution.visitorId,
    visitorSessionId: attribution.visitorSessionId,
    personId: identity.personId || null,
    organizationId: identity.organizationId || null,
    leadThreadId: identity.leadThreadId || null,
    ...buildAttributionFields(attribution),
  });

  if (identity.leadThreadId) {
    const delta = getBehaviorDelta(eventName, attribution.currentPath, payload, attribution);
    await adminDb.collection('leadThreads').doc(identity.leadThreadId).set(
      {
        updatedAt: now,
        lastBehaviorEvent: eventName,
        behaviorIntentScore: FieldValue.increment(delta.behaviorIntentScore),
        engagementScore: FieldValue.increment(delta.engagementScore),
        channelQualityScore: FieldValue.increment(delta.channelQualityScore),
        formLikelihoodScore: FieldValue.increment(delta.formLikelihoodScore),
        returnVisitorScore: FieldValue.increment(delta.returnVisitorScore),
        currentPath: attribution.currentPath,
        ...(attribution.attributionChannel ? { attributionChannel: attribution.attributionChannel } : {}),
      },
      { merge: true },
    );
  }

  return eventRef.id;
}

export async function recordPageVisit(input: {
  attribution: AttributionContext;
  identity?: LeadIdentity;
  path: string;
}) {
  const attribution = normalizeAttribution(input.attribution, input.path);
  const identity = normalizeIdentity(input.identity);
  const now = Timestamp.now();
  const { isReturnVisit } = await upsertVisitorProfile(attribution, identity, {
    registerVisit: true,
    path: attribution.currentPath,
  });

  await adminDb.collection('visitors').add({
    path: attribution.currentPath,
    timestamp: now,
    ...buildAttributionFields(attribution),
  });

  await recordEvent({
    eventName: 'page_view',
    attribution,
    identity,
    path: attribution.currentPath,
    payload: {},
  });

  if (isReturnVisit) {
    await recordEvent({
      eventName: 'return_visit',
      attribution,
      identity,
      path: attribution.currentPath,
      payload: {},
    });
  }
}

async function ensureOrganization(
  leadData: Partial<ChatLeadData>,
  identity: LeadIdentity,
  attribution: AttributionContext,
) {
  const providedId = sanitizeText(identity.organizationId);
  const companyName = sanitizeLeadText(leadData.company);
  const normalizedName = normalizeKey(companyName);
  const normalizedDomain = deriveDomain(leadData);

  if (!providedId && !companyName && !normalizedDomain) {
    return null;
  }

  let snapshot =
    (await getDocIfExists('organizations', providedId)) ||
    (normalizedDomain ? await findFirstByField('organizations', 'normalizedDomain', normalizedDomain) : null) ||
    (normalizedName ? await findFirstByField('organizations', 'normalizedName', normalizedName) : null);

  const now = Timestamp.now();
  const ref = snapshot?.ref ?? adminDb.collection('organizations').doc();
  const data = snapshot?.data() || {};

  await ref.set(
    stripUndefined({
      name: companyName || sanitizeText(data.name),
      normalizedName: normalizedName || sanitizeText(data.normalizedName),
      normalizedDomain: normalizedDomain || sanitizeText(data.normalizedDomain),
      website: sanitizeLeadText(leadData.website) || sanitizeText(data.website),
      industry: sanitizeLeadText(leadData.industry) || sanitizeText(data.industry),
      location: sanitizeLeadText(leadData.location) || sanitizeText(data.location),
      latestVisitorId: attribution.visitorId,
      latestVisitorSessionId: attribution.visitorSessionId,
      firstAttributionChannel: sanitizeText(data.firstAttributionChannel) || attribution.firstAttributionChannel,
      latestAttributionChannel: attribution.attributionChannel,
      firstUtmCampaign: sanitizeText(data.firstUtmCampaign) || attribution.firstUtmCampaign,
      latestUtmCampaign: attribution.utmCampaign,
      updatedAt: now,
      createdAt: snapshot ? data.createdAt || now : now,
    }),
    { merge: true },
  );

  snapshot = await ref.get();
  return snapshot;
}

async function ensurePerson(
  leadData: Partial<ChatLeadData>,
  identity: LeadIdentity,
  organizationId: string,
  attribution: AttributionContext,
) {
  const providedId = sanitizeText(identity.personId);
  const email = normalizeEmail(leadData.email || '');
  const phone = normalizePhone(leadData.phone || '');
  const name = sanitizeLeadText(leadData.name);

  if (!providedId && !email && !phone && !name) {
    return null;
  }

  let snapshot =
    (await getDocIfExists('people', providedId)) ||
    (email ? await findFirstByField('people', 'normalizedEmail', email) : null) ||
    (phone ? await findFirstByField('people', 'normalizedPhone', phone) : null);

  const ref = snapshot?.ref ?? adminDb.collection('people').doc();
  const data = snapshot?.data() || {};
  const now = Timestamp.now();

  await ref.set(
    stripUndefined({
      name: name || sanitizeText(data.name),
      normalizedName: normalizeKey(name) || sanitizeText(data.normalizedName),
      email: sanitizeLeadText(leadData.email) || sanitizeText(data.email),
      normalizedEmail: email || sanitizeText(data.normalizedEmail),
      phone: sanitizeLeadText(leadData.phone) || sanitizeText(data.phone),
      normalizedPhone: phone || sanitizeText(data.normalizedPhone),
      role: sanitizeLeadText(leadData.role) || sanitizeText(data.role),
      company: sanitizeLeadText(leadData.company) || sanitizeText(data.company),
      organizationId: organizationId || sanitizeText(data.organizationId),
      latestVisitorId: attribution.visitorId,
      latestVisitorSessionId: attribution.visitorSessionId,
      firstAttributionChannel: sanitizeText(data.firstAttributionChannel) || attribution.firstAttributionChannel,
      latestAttributionChannel: attribution.attributionChannel,
      updatedAt: now,
      createdAt: snapshot ? data.createdAt || now : now,
    }),
    { merge: true },
  );

  snapshot = await ref.get();
  return snapshot;
}

async function ensureLeadThread(input: {
  sourceType: SourceType;
  leadData: Partial<ChatLeadData>;
  attribution: AttributionContext;
  identity: LeadIdentity;
  personSnapshot: FirebaseFirestore.DocumentSnapshot | null;
  organizationSnapshot: FirebaseFirestore.DocumentSnapshot | null;
}) {
  const preferredLeadThreadId =
    sanitizeText(input.identity.leadThreadId) ||
    sanitizeText(input.personSnapshot?.get('latestLeadThreadId')) ||
    sanitizeText(input.organizationSnapshot?.get('latestLeadThreadId'));
  let snapshot =
    (await getDocIfExists('leadThreads', preferredLeadThreadId)) ||
    (await getDocIfExists('leadThreads', sanitizeText(input.personSnapshot?.get('activeLeadThreadId')))) ||
    null;

  const ref = snapshot?.ref ?? adminDb.collection('leadThreads').doc();
  const data = snapshot?.data() || {};
  const now = Timestamp.now();
  const pipelineStage = sanitizeLeadStage(snapshot?.get('pipelineStage'));
  const salesAngle = inferSalesAngle(input.leadData);
  const completedFields = countCompletedFields(input.leadData);
  const leadScore = calculateLeadScore(input.leadData);
  const status = getChatSessionStatus(input.leadData);

  await ref.set(
    {
      ...stripUndefined({
        source: input.sourceType,
        pipelineStage,
        status,
        completedFields,
        totalQuestions: CHAT_FIELD_ORDER.length,
        leadScore,
        salesAngle,
        personId: input.personSnapshot?.id,
        organizationId: input.organizationSnapshot?.id,
        visitorId: input.attribution.visitorId,
        visitorSessionId: input.attribution.visitorSessionId,
        firstAttributionChannel: sanitizeText(data.firstAttributionChannel) || input.attribution.firstAttributionChannel,
        attributionChannel: input.attribution.attributionChannel,
        firstUtmCampaign: sanitizeText(data.firstUtmCampaign) || input.attribution.firstUtmCampaign,
        utmCampaign: input.attribution.utmCampaign,
        currentPath: input.attribution.currentPath,
        landingPath: sanitizeText(data.landingPath) || input.attribution.landingPath,
        name: sanitizeLeadText(input.leadData.name) || sanitizeText(data.name),
        company: sanitizeLeadText(input.leadData.company) || sanitizeText(data.company),
        email: sanitizeLeadText(input.leadData.email) || sanitizeText(data.email),
        phone: sanitizeLeadText(input.leadData.phone) || sanitizeText(data.phone),
        role: sanitizeLeadText(input.leadData.role) || sanitizeText(data.role),
        location: sanitizeLeadText(input.leadData.location) || sanitizeText(data.location),
        industry: sanitizeLeadText(input.leadData.industry) || sanitizeText(data.industry),
        website: sanitizeLeadText(input.leadData.website) || sanitizeText(data.website),
        monthlyOrders: sanitizeLeadText(input.leadData.monthlyOrders) || sanitizeText(data.monthlyOrders),
        teamSize: sanitizeLeadText(input.leadData.teamSize) || sanitizeText(data.teamSize),
        currentTools: sanitizeLeadText(input.leadData.currentTools) || sanitizeText(data.currentTools),
        salesChannels: sanitizeLeadText(input.leadData.salesChannels) || sanitizeText(data.salesChannels),
        topPain: sanitizeLeadText(input.leadData.topPain) || sanitizeText(data.topPain),
        urgency: sanitizeLeadText(input.leadData.urgency) || sanitizeText(data.urgency),
        budget: sanitizeLeadText(input.leadData.budget) || sanitizeText(data.budget),
        extraContext: sanitizeLeadText(input.leadData.extraContext) || sanitizeText(data.extraContext),
        updatedAt: now,
        createdAt: snapshot ? data.createdAt || now : now,
      }),
      ...(safeArrayUnion(input.attribution.visitorId) ? { visitorIds: safeArrayUnion(input.attribution.visitorId) } : {}),
      ...(safeArrayUnion(input.attribution.visitorSessionId)
        ? { visitorSessionIds: safeArrayUnion(input.attribution.visitorSessionId) }
        : {}),
      ...(safeArrayUnion(input.sourceType) ? { sourceTypes: safeArrayUnion(input.sourceType) } : {}),
    },
    { merge: true },
  );

  snapshot = await ref.get();
  return snapshot;
}

async function linkResolvedContext(input: {
  identity: LeadIdentity;
  attribution: AttributionContext;
}) {
  const { identity, attribution } = input;
  const now = Timestamp.now();
  const updates = stripUndefined({
    personId: identity.personId,
    organizationId: identity.organizationId,
    leadThreadId: identity.leadThreadId,
    updatedAt: now,
  });

  if (identity.personId) {
    await adminDb.collection('people').doc(identity.personId).set(
      {
        ...updates,
        latestLeadThreadId: identity.leadThreadId,
        activeLeadThreadId: identity.leadThreadId,
        ...(safeArrayUnion(attribution.visitorId) ? { visitorIds: safeArrayUnion(attribution.visitorId) } : {}),
      },
      { merge: true },
    );
  }

  if (identity.organizationId) {
    await adminDb.collection('organizations').doc(identity.organizationId).set(
      {
        ...updates,
        latestLeadThreadId: identity.leadThreadId,
        ...(safeArrayUnion(attribution.visitorId) ? { visitorIds: safeArrayUnion(attribution.visitorId) } : {}),
      },
      { merge: true },
    );
  }

  await adminDb.collection('visitorProfiles').doc(attribution.visitorId).set(updates, { merge: true });
}

export async function resolveLeadContext(input: {
  sourceType: SourceType;
  leadData: unknown;
  attribution: unknown;
  identity?: unknown;
}) {
  const leadData = normalizeLeadData(input.leadData);
  const attribution = normalizeAttribution(input.attribution);
  const identity = normalizeIdentity(input.identity);

  const organizationSnapshot = await ensureOrganization(leadData, identity, attribution);
  const personSnapshot = await ensurePerson(leadData, identity, organizationSnapshot?.id || '', attribution);
  const leadThreadSnapshot = await ensureLeadThread({
    sourceType: input.sourceType,
    leadData,
    attribution,
    identity,
    personSnapshot,
    organizationSnapshot,
  });

  const resolvedIdentity = stripUndefined({
    personId: personSnapshot?.id,
    organizationId: organizationSnapshot?.id,
    leadThreadId: leadThreadSnapshot.id,
  });

  await upsertVisitorProfile(attribution, resolvedIdentity);
  await linkResolvedContext({
    identity: resolvedIdentity,
    attribution,
  });

  return {
    sourceType: input.sourceType,
    leadData,
    attribution,
    identity: resolvedIdentity,
  } satisfies ResolvedLeadContext;
}

export async function syncLegacyChatSession(input: {
  sessionId: string;
  leadData: Partial<ChatLeadData>;
  attribution: AttributionContext;
  identity: LeadIdentity;
  options?: ChatSessionOptions;
}) {
  const ref = adminDb.collection('chatSessions').doc(input.sessionId);
  const snapshot = await ref.get();
  const data = snapshot.data() || {};
  const now = Timestamp.now();
  const status = getChatSessionStatus(input.leadData, input.options?.status);

  await ref.set(
    stripUndefined({
      source: 'chatbot',
      pipelineStage: sanitizeLeadStage(snapshot.get('pipelineStage')),
      status,
      ...input.leadData,
      ...buildAttributionFields(input.attribution),
      personId: input.identity.personId,
      organizationId: input.identity.organizationId,
      leadThreadId: input.identity.leadThreadId,
      normalizedEmail: normalizeEmail(input.leadData.email || ''),
      normalizedPhone: normalizePhone(input.leadData.phone || ''),
      normalizedCompany: normalizeKey(input.leadData.company || ''),
      completedFields: countCompletedFields(input.leadData),
      totalQuestions: CHAT_FIELD_ORDER.length,
      leadScore: calculateLeadScore(input.leadData),
      salesAngle: inferSalesAngle(input.leadData),
      currentStepKey:
        input.options?.currentStepKey !== undefined
          ? input.options.currentStepKey || 'completed'
          : sanitizeText(data.currentStepKey),
      currentStepIndex:
        typeof input.options?.currentStepIndex === 'number'
          ? input.options.currentStepIndex
          : Number.isFinite(data.currentStepIndex)
            ? Number(data.currentStepIndex)
            : 0,
      updatedAt: now,
      createdAt: snapshot.exists ? data.createdAt || now : now,
    }),
    { merge: true },
  );
}

export async function appendLegacyChatMessage(sessionId: string, message: ChatMessageInput) {
  const content = sanitizeLeadText(message.content);
  if (!content) {
    throw new Error('Chat message content is required.');
  }

  const now = Timestamp.now();
  const messageRef = adminDb.collection('chatSessions').doc(sessionId).collection('messages').doc();
  await messageRef.set(
    stripUndefined({
      role: message.role,
      content,
      kind: sanitizeText(message.kind || 'message'),
      stepKey: sanitizeText(message.stepKey),
      createdAt: now,
    }),
  );

  await adminDb.collection('chatSessions').doc(sessionId).set(
    {
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: content.slice(0, 180),
      lastSpeaker: message.role,
    },
    { merge: true },
  );

  return messageRef.id;
}

export async function loadRecentChatTranscript(sessionId: string, count = 24) {
  const snapshot = await adminDb
    .collection('chatSessions')
    .doc(sessionId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .limit(count)
    .get();

  const transcript: LeadTranscriptMessage[] = snapshot.docs
    .map((docItem): LeadTranscriptMessage => ({
      role: docItem.get('role') === 'assistant' ? 'assistant' : 'user',
      content: sanitizeText(docItem.get('content')),
    }))
    .filter((item) => item.content);

  return transcript.reverse();
}

export function getPendingChatMilestone(leadData: Partial<ChatLeadData>, sessionData: Record<string, unknown>) {
  if (!shouldAnalyzeLead(leadData)) {
    return null;
  }

  const milestones = Array.isArray(sessionData.analysisMilestones)
    ? sessionData.analysisMilestones.filter((value) => typeof value === 'number')
    : [];
  const answeredFields = countLeadFields(leadData);
  const nextMilestone = [8, 12, 16].find((value) => value === answeredFields && !milestones.includes(value));
  if (nextMilestone) {
    return nextMilestone;
  }

  const isComplete = countCompletedFields(leadData) >= CHAT_FIELD_ORDER.length;
  if (isComplete && !milestones.includes(100)) {
    return 100;
  }

  return null;
}

export async function persistLeadAnalysis(input: {
  sourceType: SourceType;
  sourceCollection: LeadCollectionName;
  sourceDocumentId: string;
  leadData: Partial<ChatLeadData>;
  identity: LeadIdentity;
  strategy: LeadIntelligence;
  transcript?: LeadTranscriptMessage[];
  milestone?: number | null;
}) {
  const now = Timestamp.now();
  const aiFields = mapStrategyToAiFields(input.strategy);
  const transcript = safeJsonValue((input.transcript || []).slice(-16));
  const threadId = sanitizeText(input.identity.leadThreadId);

  if (threadId) {
    const threadRef = adminDb.collection('leadThreads').doc(threadId);
    await threadRef.set(
      {
        ...stripUndefined({
          ...input.leadData,
          personId: input.identity.personId,
          organizationId: input.identity.organizationId,
          updatedAt: now,
          lastAnalyzedAt: now,
          latestSourceType: input.sourceType,
          latestSourceCollection: input.sourceCollection,
          latestSourceDocumentId: input.sourceDocumentId,
          latestTranscriptExcerpt: transcript,
          leadScore: calculateLeadScore(input.leadData),
          salesAngle: inferSalesAngle(input.leadData),
          completedFields: countCompletedFields(input.leadData),
        }),
        ...aiFields,
        analysisCount: FieldValue.increment(1),
        ...(typeof input.milestone === 'number' ? { analysisMilestones: FieldValue.arrayUnion(input.milestone) } : {}),
      },
      { merge: true },
    );

    await threadRef.collection('analyses').add({
      sourceType: input.sourceType,
      sourceCollection: input.sourceCollection,
      sourceDocumentId: input.sourceDocumentId,
      leadData: safeJsonValue(input.leadData),
      transcript,
      strategy: safeJsonValue(input.strategy),
      milestone: input.milestone ?? null,
      createdAt: now,
    });
  }

  const legacyRef = adminDb.collection(input.sourceCollection).doc(input.sourceDocumentId);
  await legacyRef.set(
    {
      ...aiFields,
      updatedAt: now,
      ...(typeof input.milestone === 'number' ? { analysisMilestones: FieldValue.arrayUnion(input.milestone) } : {}),
    },
    { merge: true },
  );

  if (input.identity.personId) {
    await adminDb.collection('people').doc(input.identity.personId).set(
      {
        updatedAt: now,
        latestLeadThreadId: input.identity.leadThreadId,
        latestRecommendedOffer: input.strategy.offerToShowNow,
        latestPriorityLevel: input.strategy.priorityLevel,
        latestReadinessScore: input.strategy.readinessScore,
      },
      { merge: true },
    );
  }

  if (input.identity.organizationId) {
    await adminDb.collection('organizations').doc(input.identity.organizationId).set(
      {
        updatedAt: now,
        latestLeadThreadId: input.identity.leadThreadId,
        latestRecommendedOffer: input.strategy.offerToShowNow,
        latestPriorityLevel: input.strategy.priorityLevel,
        latestReadinessScore: input.strategy.readinessScore,
      },
      { merge: true },
    );
  }
}

export async function syncLegacyContactSubmission(input: {
  leadData: Partial<ChatLeadData>;
  contactInput: Partial<ContactLeadInput>;
  attribution: AttributionContext;
  identity: LeadIdentity;
}) {
  let snapshot =
    (await getDocIfExists('contactSubmissions', sanitizeText(input.identity.leadThreadId))) ||
    (input.identity.leadThreadId
      ? await findFirstByField('contactSubmissions', 'leadThreadId', input.identity.leadThreadId)
      : null) ||
    (normalizeEmail(input.leadData.email || '')
      ? await findFirstByField('contactSubmissions', 'normalizedEmail', normalizeEmail(input.leadData.email || ''))
      : null);

  const ref = snapshot?.ref ?? adminDb.collection('contactSubmissions').doc();
  const data = snapshot?.data() || {};
  const now = Timestamp.now();

  await ref.set(
    stripUndefined({
      source: 'contact_form',
      pipelineStage: sanitizeLeadStage(snapshot?.get('pipelineStage')),
      name: sanitizeLeadText(input.contactInput.name || input.leadData.name) || sanitizeText(data.name),
      email: sanitizeLeadText(input.contactInput.email || input.leadData.email) || sanitizeText(data.email),
      phone: sanitizeLeadText(input.contactInput.phone || input.leadData.phone) || sanitizeText(data.phone),
      company: sanitizeLeadText(input.contactInput.company || input.leadData.company) || sanitizeText(data.company),
      message:
        sanitizeLeadText(input.contactInput.message || input.leadData.topPain || input.leadData.extraContext) ||
        sanitizeText(data.message),
      topPain: sanitizeLeadText(input.leadData.topPain) || sanitizeText(data.topPain),
      extraContext: sanitizeLeadText(input.leadData.extraContext) || sanitizeText(data.extraContext),
      leadScore: calculateLeadScore(input.leadData),
      salesAngle: inferSalesAngle(input.leadData),
      normalizedEmail: normalizeEmail(input.leadData.email || ''),
      normalizedPhone: normalizePhone(input.leadData.phone || ''),
      normalizedCompany: normalizeKey(input.leadData.company || ''),
      personId: input.identity.personId,
      organizationId: input.identity.organizationId,
      leadThreadId: input.identity.leadThreadId,
      ...buildAttributionFields(input.attribution),
      updatedAt: now,
      createdAt: snapshot ? data.createdAt || now : now,
    }),
    { merge: true },
  );

  snapshot = await ref.get();
  return snapshot.id;
}

export async function updateLeadStageForCollection(
  collectionName: LeadCollectionName,
  documentId: string,
  stage: LeadStage,
) {
  const safeStage = sanitizeLeadStage(stage);
  const docRef = adminDb.collection(collectionName).doc(documentId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new Error('Lead document not found.');
  }

  const now = Timestamp.now();
  await docRef.set(
    {
      pipelineStage: safeStage,
      updatedAt: now,
    },
    { merge: true },
  );

  const leadThreadId = sanitizeText(snapshot.get('leadThreadId'));
  const personId = sanitizeText(snapshot.get('personId'));
  const organizationId = sanitizeText(snapshot.get('organizationId'));

  if (leadThreadId) {
    await adminDb.collection('leadThreads').doc(leadThreadId).set(
      {
        pipelineStage: safeStage,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  if (personId) {
    await adminDb.collection('people').doc(personId).set(
      {
        latestPipelineStage: safeStage,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  if (organizationId) {
    await adminDb.collection('organizations').doc(organizationId).set(
      {
        latestPipelineStage: safeStage,
        updatedAt: now,
      },
      { merge: true },
    );
  }
}
