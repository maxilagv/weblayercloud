'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

/**
 * Marca un tenant como convertido a pago.
 * Solo accesible por super admins.
 *
 * Payload: { tenantId }
 */
module.exports = onCall(async (request) => {
  if (!request.auth || request.auth.token.role !== 'layercloud_superadmin') {
    throw new HttpsError('permission-denied', 'Solo super admins.');
  }

  const { tenantId } = request.data;
  if (!tenantId) {
    throw new HttpsError('invalid-argument', 'Requerido: tenantId');
  }

  const db = getFirestore();

  // 1. Actualizar meta del tenant
  await db.collection('tenants').doc(tenantId).update({
    plan:            'paid',
    trialActive:     false,
    convertedAt:     FieldValue.serverTimestamp(),
    convertedToPaid: true,
  });

  // 2. Actualizar índice
  await db.collection('layercloud_tenants_index').doc(tenantId).update({
    convertedToPaid: true,
    plan:            'paid',
    convertedAt:     FieldValue.serverTimestamp(),
  });

  // 3. Actualizar custom claims: quitar trialActive, marcar paid
  const tenantSnap = await db.collection('tenants').doc(tenantId).get();
  const ownerUid   = tenantSnap.data()?.ownerUid;

  if (ownerUid) {
    const auth = getAuth();
    const user = await auth.getUser(ownerUid);
    await auth.setCustomUserClaims(ownerUid, {
      ...(user.customClaims ?? {}),
      trialActive: false,
      plan: 'paid',
    });
  }

  return { success: true };
});
