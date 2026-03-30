'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { enforceRateLimit, makeRateLimitKey } = require('../utils/rateLimit');
const {
  makeEmailKey,
  validateCustomerRegistrationInput,
} = require('../utils/authValidation');
const { cleanupCustomerRegistration } = require('../utils/tenantCleanup');
const { writeAuthAudit } = require('../utils/authAudit');

function tenantAllowsCustomerAuth(tenantMeta) {
  if (!tenantMeta) {
    return false;
  }

  if (tenantMeta.isPublicDemo) {
    return true;
  }

  const trialEndsAt = tenantMeta.trialEndsAt?.toDate?.();
  return Boolean(tenantMeta.trialActive) && trialEndsAt instanceof Date && trialEndsAt > new Date();
}

module.exports = onCall(async (request) => {
  const rawPayload = request.data || {};
  const db = getFirestore();
  const auth = getAuth();
  const ip =
    request.rawRequest?.ip ||
    request.rawRequest?.headers?.['x-forwarded-for'] ||
    'unknown';
  let payload = null;
  let failureAudited = false;

  try {
    payload = validateCustomerRegistrationInput(rawPayload);
    const tenantRef = db.collection('tenants').doc(payload.tenantId);
    const tenantSnapshot = await tenantRef.get();

    if (!tenantSnapshot.exists || !tenantAllowsCustomerAuth(tenantSnapshot.data())) {
      throw new HttpsError(
        'failed-precondition',
        'La tienda no esta disponible para registrar clientes en este momento.',
      );
    }

    await enforceRateLimit({
      db,
      scope: 'customer-register',
      key: makeRateLimitKey([payload.tenantId, payload.email, ip]),
      maxAttempts: 6,
      windowMs: 15 * 60 * 1000,
    });

    const customerIndexRef = tenantRef
      .collection('customer_auth_index')
      .doc(makeEmailKey(payload.email));
    const nowMs = Date.now();

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(customerIndexRef);

      if (snapshot.exists) {
        const customerIndex = snapshot.data() || {};
        const startedAtMs = customerIndex.startedAt?.toMillis?.() ?? 0;
        const isPendingFresh =
          customerIndex.status === 'pending' &&
          startedAtMs > 0 &&
          nowMs - startedAtMs < 10 * 60 * 1000;

        if (customerIndex.status === 'active' && customerIndex.uid) {
          throw new HttpsError(
            'already-exists',
            'Ya existe una cuenta con ese email. Inicia sesion para usarla en esta tienda.',
          );
        }

        if (isPendingFresh) {
          throw new HttpsError(
            'already-exists',
            'Ya estamos procesando una cuenta con ese email. Espera unos segundos e intenta iniciar sesion.',
          );
        }
      }

      transaction.set(
        customerIndexRef,
        {
          status: 'pending',
          email: payload.email,
          startedAt: Timestamp.fromMillis(nowMs),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    let userRecord = null;

    try {
      try {
        userRecord = await auth.createUser({
          email: payload.email,
          password: payload.password,
          displayName: `${payload.nombre} ${payload.apellido}`.trim(),
        });
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          throw new HttpsError(
            'already-exists',
            'Ya existe una cuenta con ese email. Inicia sesion para usarla en esta tienda.',
          );
        }

        throw error;
      }

      const batch = db.batch();
      const customerRef = tenantRef.collection('customers').doc(userRecord.uid);

      batch.set(
        customerRef,
        {
          uid: userRecord.uid,
          nombre: payload.nombre,
          apellido: payload.apellido,
          email: payload.email,
          telefono: payload.telefono,
          direccion: payload.direccion,
          tipo: 'web',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      batch.set(
        customerIndexRef,
        {
          status: 'active',
          uid: userRecord.uid,
          email: payload.email,
          tenantId: payload.tenantId,
          updatedAt: FieldValue.serverTimestamp(),
          completedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await batch.commit();

      await writeAuthAudit({
        db,
        kind: 'customer_register',
        status: 'success',
        email: payload.email,
        uid: userRecord.uid,
        tenantId: payload.tenantId,
        ip,
        source: 'public_customer_register',
      }).catch(() => undefined);

      return {
        success: true,
        uid: userRecord.uid,
      };
    } catch (error) {
      await cleanupCustomerRegistration({
        db,
        tenantId: payload.tenantId,
        normalizedEmail: payload.email,
        uid: userRecord?.uid ?? null,
      });

      if (userRecord) {
        await auth.deleteUser(userRecord.uid).catch(() => undefined);
      }

      await writeAuthAudit({
        db,
        kind: 'customer_register',
        status: 'failed',
        email: payload?.email || rawPayload?.email,
        uid: userRecord?.uid ?? null,
        tenantId: payload?.tenantId || rawPayload?.tenantId || null,
        ip,
        source: 'public_customer_register',
        error,
      }).catch(() => undefined);
      failureAudited = true;

      if (error instanceof HttpsError) {
        throw error;
      }

      console.error('[registerTenantCustomer] Error:', error);
      throw new HttpsError(
        'internal',
        'No pudimos crear la cuenta del cliente en este momento. Intenta nuevamente.',
      );
    }
  } catch (error) {
    if (!failureAudited) {
      await writeAuthAudit({
        db,
        kind: 'customer_register',
        status: 'failed',
        email: payload?.email || rawPayload?.email,
        tenantId: payload?.tenantId || rawPayload?.tenantId || null,
        ip,
        source: 'public_customer_register',
        error,
      }).catch(() => undefined);
    }

    if (error instanceof HttpsError) {
      throw error;
    }

    console.error('[registerTenantCustomer] Error:', error);
    throw new HttpsError(
      'internal',
      'No pudimos crear la cuenta del cliente en este momento. Intenta nuevamente.',
    );
  }
});
