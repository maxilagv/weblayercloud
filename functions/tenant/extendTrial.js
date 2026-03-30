'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { makeEmailKey } = require('../utils/authValidation');

module.exports = onCall(async (request) => {
  if (request.auth?.token.role !== 'layercloud_superadmin') {
    throw new HttpsError('permission-denied', 'Solo el super admin puede extender trials');
  }

  const { tenantId, extraDays } = request.data;

  if (!tenantId || typeof extraDays !== 'number' || extraDays < 1) {
    throw new HttpsError('invalid-argument', 'Requerido: tenantId (string) y extraDays (number >= 1)');
  }

  const db   = getFirestore();
  const auth = getAuth();

  const metaRef  = db.collection('tenants').doc(tenantId);
  const indexRef = db.collection('layercloud_tenants_index').doc(tenantId);

  const [metaSnap, indexSnap] = await Promise.all([metaRef.get(), indexRef.get()]);

  if (!metaSnap.exists) {
    throw new HttpsError('not-found', `Tenant ${tenantId} no existe`);
  }

  const meta      = metaSnap.data();
  const baseDate  = meta.trialEndsAt.toDate();
  const newEnd    = new Date(baseDate.getTime() + extraDays * 24 * 60 * 60 * 1000);
  const newEndTs  = Timestamp.fromDate(newEnd);

  const batch = db.batch();
  batch.update(metaRef,  { trialEndsAt: newEndTs, trialActive: true, plan: 'trial' });
  batch.update(indexRef, { trialEndsAt: newEndTs, trialActive: true });
  if (meta.ownerEmail) {
    batch.set(
      db.collection('layercloud_owner_accounts').doc(makeEmailKey(meta.ownerEmail)),
      {
        tenantId,
        ownerEmail: meta.ownerEmail,
        ...(meta.ownerUid ? { ownerUid: meta.ownerUid } : {}),
        trialEndsAt: newEndTs,
        trialActive: true,
        plan: 'trial',
      },
      { merge: true }
    );
  }
  await batch.commit();

  // Restaurar custom claims si estaban revocados
  if (meta.ownerUid) {
    await auth.setCustomUserClaims(meta.ownerUid, {
      tenantId,
      role:        'tenant_admin',
      trialActive: true,
      active:      true,
      plan:        'trial',
    });
  }

  console.log(`[extendTrial] ${tenantId}: +${extraDays} días → nuevo vencimiento ${newEnd.toISOString()}`);

  return { success: true, tenantId, newTrialEndsAt: newEnd.toISOString() };
});
