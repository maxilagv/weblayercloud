'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { makeEmailKey } = require('../utils/authValidation');

module.exports = onCall(async (request) => {
  if (request.auth?.token.role !== 'layercloud_superadmin') {
    throw new HttpsError('permission-denied', 'Solo el super admin puede revocar trials');
  }

  const { tenantId } = request.data;

  if (!tenantId) {
    throw new HttpsError('invalid-argument', 'Requerido: tenantId');
  }

  const db   = getFirestore();
  const auth = getAuth();

  const metaSnap = await db.collection('tenants').doc(tenantId).get();
  if (!metaSnap.exists) {
    throw new HttpsError('not-found', `Tenant ${tenantId} no existe`);
  }

  const { ownerUid, ownerEmail } = metaSnap.data();

  const batch = db.batch();
  batch.update(
    db.collection('tenants').doc(tenantId),
    { trialActive: false, plan: 'suspended' }
  );
  batch.update(
    db.collection('layercloud_tenants_index').doc(tenantId),
    { trialActive: false }
  );
  if (ownerEmail) {
    batch.set(
      db.collection('layercloud_owner_accounts').doc(makeEmailKey(ownerEmail)),
      {
        tenantId,
        ownerEmail,
        ...(ownerUid ? { ownerUid } : {}),
        trialActive: false,
        plan: 'suspended',
      },
      { merge: true }
    );
  }
  await batch.commit();

  if (ownerUid) {
    await auth.setCustomUserClaims(ownerUid, {
      tenantId,
      role:        'tenant_admin',
      trialActive: false,
      active:      false,
      plan:        'suspended',
    });
  }

  console.log(`[revokeTrial] Trial revocado: ${tenantId}`);

  return { success: true, tenantId };
});
