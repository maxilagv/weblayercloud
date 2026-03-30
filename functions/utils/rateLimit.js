'use strict';

const { HttpsError } = require('firebase-functions/v2/https');
const { Timestamp } = require('firebase-admin/firestore');

function makeRateLimitKey(parts) {
  return parts
    .flatMap((part) => String(part ?? '').split(','))
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join('|');
}

async function enforceRateLimit({
  db,
  scope,
  key,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
}) {
  const docId = `${scope}:${key}`;
  const ref = db.collection('_auth_rate_limits').doc(docId);
  const nowMs = Date.now();
  const now = Timestamp.fromMillis(nowMs);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);

    let attempts = 0;
    let firstAttemptMs = nowMs;

    if (snapshot.exists) {
      const data = snapshot.data() || {};
      const storedFirstAttemptMs = data.firstAttemptAt?.toMillis?.() ?? 0;
      const windowStillOpen = storedFirstAttemptMs > 0 && nowMs - storedFirstAttemptMs < windowMs;

      if (windowStillOpen) {
        attempts = Number(data.attempts ?? 0);
        firstAttemptMs = storedFirstAttemptMs;
      }
    }

    if (attempts >= maxAttempts) {
      throw new HttpsError(
        'resource-exhausted',
        'Demasiados intentos. Espera unos minutos antes de volver a intentar.',
      );
    }

    transaction.set(
      ref,
      {
        scope,
        key,
        attempts: attempts + 1,
        firstAttemptAt: Timestamp.fromMillis(firstAttemptMs),
        lastAttemptAt: now,
        expireAt: Timestamp.fromMillis(firstAttemptMs + windowMs),
      },
      { merge: true },
    );
  });
}

module.exports = {
  enforceRateLimit,
  makeRateLimitKey,
};
