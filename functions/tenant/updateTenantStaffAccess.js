'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const callerToken = request.auth.token;
  const { tenantId, staffUid, nombre, modulos, activo } = request.data;

  if (!tenantId || !staffUid) {
    throw new HttpsError('invalid-argument', 'Faltan campos: tenantId, staffUid');
  }

  const isAdmin = callerToken.role === 'tenant_admin' && callerToken.tenantId === tenantId;
  const isSuperAdmin = callerToken.role === 'layercloud_superadmin';

  if (!isAdmin && !isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Sin permisos para modificar este empleado');
  }

  const auth = getAuth();
  const db = getFirestore();

  const staffRef = db
    .collection('tenants')
    .doc(tenantId)
    .collection('staff')
    .doc(staffUid);

  const staffSnap = await staffRef.get();
  if (!staffSnap.exists) {
    throw new HttpsError('not-found', 'Empleado no encontrado');
  }

  const currentData = staffSnap.data();
  const newModulos = Array.isArray(modulos) ? modulos : currentData.modulos;
  const newActivo = typeof activo === 'boolean' ? activo : currentData.activo;
  const newNombre = nombre ?? currentData.nombre;

  await auth.setCustomUserClaims(staffUid, {
    role: 'tenant_employee',
    tenantId,
    modules: newModulos,
    activo: newActivo,
  });

  await staffRef.update({
    nombre: newNombre,
    modulos: newModulos,
    activo: newActivo,
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`[LayerCloud] Staff actualizado: ${staffUid} → activo=${newActivo} módulos=${newModulos.join(',')}`);

  return { success: true };
});
