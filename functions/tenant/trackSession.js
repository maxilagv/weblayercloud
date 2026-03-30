'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  return payload;
}

/**
 * Registra un evento de sesion del tenant y actualiza contadores en el indice.
 * Callable desde el frontend. Acepta visitantes anonimos para cubrir demos publicas.
 *
 * Payload:
 *   tenantId  string
 *   event     string
 *   path      string
 *   payload   object
 */
module.exports = onCall(async (request) => {
  const { tenantId, event, path, payload } = request.data ?? {};

  if (!tenantId || !event) {
    throw new HttpsError('invalid-argument', 'Requerido: tenantId y event');
  }

  const db = getFirestore();
  const userId = request.auth?.uid ?? null;

  await db.collection('layercloud_sessions').add({
    tenantId,
    userId,
    authState: userId ? 'authenticated' : 'anonymous',
    event,
    path: typeof path === 'string' && path.length > 0 ? path : '/',
    payload: sanitizePayload(payload),
    timestamp: FieldValue.serverTimestamp(),
    userAgent: request.rawRequest?.headers?.['user-agent'] ?? null,
  });

  const indexRef = db.collection('layercloud_tenants_index').doc(tenantId);
  const updates = { lastActiveAt: FieldValue.serverTimestamp() };

  if (event === 'page_view') {
    updates.pageViewsCount = FieldValue.increment(1);
  }
  if (event === 'login') {
    updates.loginCount = FieldValue.increment(1);
  }

  try {
    await indexRef.update(updates);
  } catch (error) {
    // El evento ya fue persistido, no rompemos el tracking si el indice todavia no existe.
  }

  return { success: true };
});
