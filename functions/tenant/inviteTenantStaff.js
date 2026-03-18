'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const callerToken = request.auth.token;
  const { tenantId, nombre, email, modulos } = request.data;

  if (!tenantId || !nombre || !email || !Array.isArray(modulos)) {
    throw new HttpsError('invalid-argument', 'Faltan campos: tenantId, nombre, email, modulos');
  }

  const isAdmin = callerToken.role === 'tenant_admin' && callerToken.tenantId === tenantId;
  const isSuperAdmin = callerToken.role === 'layercloud_superadmin';

  if (!isAdmin && !isSuperAdmin) {
    throw new HttpsError('permission-denied', 'Solo el admin del tenant puede invitar empleados');
  }

  if (modulos.length === 0) {
    throw new HttpsError('invalid-argument', 'El empleado debe tener al menos un módulo asignado');
  }

  const auth = getAuth();
  const db = getFirestore();
  const tempPassword = generateTempPassword();

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email,
      password: tempPassword,
      displayName: nombre,
    });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Ya existe un usuario con ese email');
    }
    throw new HttpsError('internal', `Error al crear usuario: ${err.message}`);
  }

  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'tenant_employee',
    tenantId,
    modules: modulos,
  });

  await db
    .collection('tenants')
    .doc(tenantId)
    .collection('staff')
    .doc(userRecord.uid)
    .set({
      uid: userRecord.uid,
      nombre,
      email,
      modulos,
      activo: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  console.log(`[LayerCloud] Staff invitado: ${email} → tenant ${tenantId} | módulos: ${modulos.join(', ')}`);

  return { success: true, tempPassword, uid: userRecord.uid };
});
