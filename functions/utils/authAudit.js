'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const { makeEmailKey, normalizeEmail } = require('./authValidation');

function extractErrorCode(error) {
  if (!error) {
    return null;
  }

  return error.code || error.status || error.message || 'unknown';
}

async function writeAuthAudit({
  db,
  kind,
  status,
  email,
  uid = null,
  tenantId = null,
  ip = 'unknown',
  source = 'unknown',
  error = null,
  metadata = null,
}) {
  if (!db || !kind || !status) {
    return;
  }

  const normalizedEmail = normalizeEmail(email || '');
  const payload = {
    kind,
    status,
    emailKey: normalizedEmail ? makeEmailKey(normalizedEmail) : null,
    uid: uid || null,
    tenantId: tenantId || null,
    ip: String(ip || 'unknown').slice(0, 120),
    source,
    errorCode: extractErrorCode(error),
    createdAt: FieldValue.serverTimestamp(),
  };

  if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  await db.collection('layercloud_auth_audit').add(payload);
}

module.exports = {
  writeAuthAudit,
};
