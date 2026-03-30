'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { applyOwnerClaims, resolveOwnerTenant } = require('./_tenantProvisioning');
const { makeEmailKey, normalizeEmail } = require('../utils/authValidation');
const { writeAuthAudit } = require('../utils/authAudit');

module.exports = onCall(async (request) => {
  const db = getFirestore();
  const ip =
    request.rawRequest?.ip ||
    request.rawRequest?.headers?.['x-forwarded-for'] ||
    'unknown';

  if (!request.auth) {
    await writeAuthAudit({
      db,
      kind: 'tenant_access_repair',
      status: 'failed',
      ip,
      source: 'tenant_login_repair',
      error: new HttpsError('unauthenticated', 'Debes iniciar sesion para reparar el acceso.'),
    }).catch(() => undefined);
    throw new HttpsError('unauthenticated', 'Debes iniciar sesion para reparar el acceso.');
  }

  const auth = getAuth();
  const email = normalizeEmail(request.auth.token.email);

  if (!email) {
    await writeAuthAudit({
      db,
      kind: 'tenant_access_repair',
      status: 'failed',
      uid: request.auth.uid,
      ip,
      source: 'tenant_login_repair',
      error: new HttpsError('failed-precondition', 'Tu usuario no tiene un email valido.'),
    }).catch(() => undefined);
    throw new HttpsError('failed-precondition', 'Tu usuario no tiene un email valido.');
  }

  const resolvedOwner = await resolveOwnerTenant(db, email);

  if (!resolvedOwner?.tenantId) {
    await writeAuthAudit({
      db,
      kind: 'tenant_access_repair',
      status: 'failed',
      email,
      uid: request.auth.uid,
      ip,
      source: 'tenant_login_repair',
      error: new HttpsError(
        'not-found',
        'No encontramos un tenant asociado a este email. Revisa tus credenciales o crea una cuenta nueva.',
      ),
    }).catch(() => undefined);
    throw new HttpsError(
      'not-found',
      'No encontramos un tenant asociado a este email. Revisa tus credenciales o crea una cuenta nueva.',
    );
  }

  const tenantRef = db.collection('tenants').doc(resolvedOwner.tenantId);
  const tenantSnapshot = await tenantRef.get();

  if (!tenantSnapshot.exists) {
    await writeAuthAudit({
      db,
      kind: 'tenant_access_repair',
      status: 'failed',
      email,
      uid: request.auth.uid,
      tenantId: resolvedOwner.tenantId,
      ip,
      source: 'tenant_login_repair',
      error: new HttpsError('not-found', 'El tenant asociado a este usuario ya no existe.'),
    }).catch(() => undefined);
    throw new HttpsError('not-found', 'El tenant asociado a este usuario ya no existe.');
  }

  const tenantMeta = tenantSnapshot.data();
  await applyOwnerClaims(auth, request.auth.uid, tenantMeta);

  await Promise.allSettled([
    tenantRef.set(
      {
        ownerUid: request.auth.uid,
        ownerEmail: email,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    ),
    db.collection('layercloud_owner_accounts').doc(makeEmailKey(email)).set(
      {
        status: 'active',
        tenantId: tenantMeta.tenantId,
        ownerUid: request.auth.uid,
        ownerEmail: email,
        ownerName: tenantMeta.ownerName,
        businessName: tenantMeta.businessName,
        businessType: tenantMeta.businessType,
        phone: tenantMeta.phone ?? '',
        trialActive: Boolean(tenantMeta.trialActive),
        plan: tenantMeta.plan ?? 'trial',
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    ),
  ]);

  await writeAuthAudit({
    db,
    kind: 'tenant_access_repair',
    status: 'success',
    email,
    uid: request.auth.uid,
    tenantId: tenantMeta.tenantId,
    ip,
    source: 'tenant_login_repair',
  }).catch(() => undefined);

  return {
    success: true,
    tenantId: tenantMeta.tenantId,
    role: 'tenant_admin',
    trialActive: Boolean(tenantMeta.trialActive),
  };
});
