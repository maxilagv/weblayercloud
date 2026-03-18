'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const callerToken = request.auth.token;
  const { tenantId, staffUid } = request.data;

  if (!tenantId || !staffUid) {
    throw new HttpsError('invalid-argument', 'Faltan campos: tenantId, staffUid');
  }

  const isAdmin = callerToken.role === 'tenant_admin' && callerToken.tenantId === tenantId;
  const isSuperAdmin = callerToken.role === 'layercloud_superadmin';

  if (!isAdmin && !isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Sin permisos para eliminar este empleado');
  }

  // Prevenir que un empleado se auto-elimine
  if (request.auth.uid === staffUid) {
    throw new HttpsError('failed-precondition', 'No puedes eliminarte a ti mismo');
  }

  const auth = getAuth();
  const db = getFirestore();

  await db
    .collection('tenants')
    .doc(tenantId)
    .collection('staff')
    .doc(staffUid)
    .delete();

  try {
    await auth.deleteUser(staffUid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.warn(`[LayerCloud] No se pudo eliminar Auth user ${staffUid}:`, err.message);
    }
  }

  console.log(`[LayerCloud] Staff eliminado: ${staffUid} del tenant ${tenantId}`);

  return { success: true };
});
