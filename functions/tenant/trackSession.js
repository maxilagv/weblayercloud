'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

/**
 * Registra un evento de sesión del tenant y actualiza contadores en el índice.
 * Callable desde el frontend (requiere auth, cualquier rol).
 *
 * Payload:
 *   tenantId  string
 *   event     string  (page_view | login | product_edit | order_view | etc.)
 *   path      string  ruta visitada
 */
module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const { tenantId, event, path } = request.data;

  if (!tenantId || !event) {
    throw new HttpsError('invalid-argument', 'Requerido: tenantId y event');
  }

  const db = getFirestore();

  // 1. Escribir el evento de sesión
  await db.collection('layercloud_sessions').add({
    tenantId,
    userId:    request.auth.uid,
    event,
    path:      path ?? '/',
    timestamp: FieldValue.serverTimestamp(),
    userAgent: request.rawRequest?.headers?.['user-agent'] ?? null,
  });

  // 2. Actualizar contadores en el índice del super admin
  const indexRef = db.collection('layercloud_tenants_index').doc(tenantId);
  const updates  = { lastActiveAt: FieldValue.serverTimestamp() };

  if (event === 'page_view') {
    updates.pageViewsCount = FieldValue.increment(1);
  }
  if (event === 'login') {
    updates.loginCount = FieldValue.increment(1);
  }

  // update() no falla si el doc no existe, pero queremos silenciar el error
  // en caso de que el índice aún no esté creado (race condition en el registro)
  try {
    await indexRef.update(updates);
  } catch (e) {
    // Silencioso — el evento se guardó igual en layercloud_sessions
  }

  return { success: true };
});
