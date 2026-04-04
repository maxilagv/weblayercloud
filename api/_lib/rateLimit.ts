import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';
import { sanitizeText } from './http';

interface RateLimitConfig {
  key: string;
  bucket: string;
  maxRequests: number;
  windowSeconds: number;
}

export async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const windowStart = Date.now() - config.windowSeconds * 1000;
  const docId = `${config.bucket}:${config.key}`.slice(0, 200);
  const ref = adminDb.collection('_rateLimits').doc(docId);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    const recentRequests: number[] = (data?.timestamps ?? [])
      .filter((ts: number) => ts > windowStart);

    if (recentRequests.length >= config.maxRequests) {
      return false;
    }

    tx.set(ref, {
      timestamps: [...recentRequests, Date.now()],
      updatedAt: Timestamp.now(),
    });
    return true;
  });
}

export function getClientKey(req: any, fallbackBody?: Record<string, unknown>): string {
  const forwarded = sanitizeText(req?.headers?.['x-forwarded-for']);
  const ip = forwarded
    ? forwarded.split(',')[0]?.trim()
    : sanitizeText(req?.headers?.['x-real-ip']);

  if (ip && ip !== 'unknown') {
    return ip.slice(0, 64);
  }

  // Fallback to visitorId from body if available
  if (fallbackBody) {
    const attribution = fallbackBody.attribution;
    if (attribution && typeof attribution === 'object' && 'visitorId' in attribution) {
      const visitorId = sanitizeText((attribution as Record<string, unknown>).visitorId as string);
      if (visitorId) {
        return `vid_${visitorId}`.slice(0, 64);
      }
    }
  }

  return 'unknown';
}
