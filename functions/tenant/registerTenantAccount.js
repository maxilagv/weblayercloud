'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { provisionTenantForUser } = require('./_tenantProvisioning');
const { validateTenantAccountRegistrationInput } = require('../utils/authValidation');
const { enforceRateLimit, makeRateLimitKey } = require('../utils/rateLimit');
const { cleanupPartialTenantRegistration } = require('../utils/tenantCleanup');
const { writeAuthAudit } = require('../utils/authAudit');

module.exports = onCall(async (request) => {
  const db = getFirestore();
  const auth = getAuth();
  const rawPayload = request.data || {};
  const ip =
    request.rawRequest?.ip ||
    request.rawRequest?.headers?.['x-forwarded-for'] ||
    'unknown';
  let payload = null;
  let failureAudited = false;

  try {
    payload = validateTenantAccountRegistrationInput(rawPayload);

    await enforceRateLimit({
      db,
      scope: 'tenant-register',
      key: makeRateLimitKey([payload.email, ip]),
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    });

    let userRecord = null;

    try {
      try {
        userRecord = await auth.createUser({
          email: payload.email,
          password: payload.password,
          displayName: payload.ownerName,
        });
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          throw new HttpsError(
            'already-exists',
            'Ya existe una cuenta con ese email. Inicia sesion o recupera tu contrasena.',
          );
        }

        throw error;
      }

      const result = await provisionTenantForUser(
        {
          uid: userRecord.uid,
          email: payload.email,
          ownerName: payload.ownerName,
          businessName: payload.businessName,
          businessType: payload.businessType,
          phone: payload.phone,
        },
        { source: 'public_register_callable' },
      );

      await writeAuthAudit({
        db,
        kind: 'tenant_register',
        status: 'success',
        email: payload.email,
        uid: userRecord.uid,
        tenantId: result.tenantId,
        ip,
        source: 'public_register_callable',
        metadata: {
          businessType: payload.businessType,
        },
      }).catch(() => undefined);

      return {
        success: true,
        tenantId: result.tenantId,
      };
    } catch (error) {
      if (userRecord) {
        await Promise.allSettled([
          auth.deleteUser(userRecord.uid),
          cleanupPartialTenantRegistration({
            db,
            normalizedEmail: payload.email,
            ownerUid: userRecord.uid,
          }),
        ]);
      }

      await writeAuthAudit({
        db,
        kind: 'tenant_register',
        status: 'failed',
        email: payload?.email || rawPayload?.email,
        uid: userRecord?.uid ?? null,
        ip,
        source: 'public_register_callable',
        error,
      }).catch(() => undefined);
      failureAudited = true;

      if (error instanceof HttpsError) {
        throw error;
      }

      console.error('[registerTenantAccount] Error:', error);
      throw new HttpsError(
        'internal',
        'No pudimos crear la cuenta en este momento. Intenta nuevamente.',
      );
    }
  } catch (error) {
    if (!failureAudited) {
      await writeAuthAudit({
        db,
        kind: 'tenant_register',
        status: 'failed',
        email: payload?.email || rawPayload?.email,
        ip,
        source: 'public_register_callable',
        error,
      }).catch(() => undefined);
    }

    if (error instanceof HttpsError) {
      throw error;
    }

    console.error('[registerTenantAccount] Error:', error);
    throw new HttpsError(
      'internal',
      'No pudimos crear la cuenta en este momento. Intenta nuevamente.',
    );
  }
});
