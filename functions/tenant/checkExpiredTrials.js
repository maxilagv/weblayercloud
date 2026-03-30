'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { makeEmailKey } = require('../utils/authValidation');

module.exports = onSchedule(
  {
    schedule:  'every 60 minutes',
    timeZone:  'America/Argentina/Buenos_Aires',
  },
  async () => {
    const db   = getFirestore();
    const auth = getAuth();
    const now  = Timestamp.now();

    // Buscar todos los trials activos que ya vencieron
    const snap = await db.collection('layercloud_tenants_index')
      .where('trialActive', '==', true)
      .where('trialEndsAt', '<', now)
      .get();

    if (snap.empty) {
      console.log('[checkExpiredTrials] Sin trials vencidos.');
      return;
    }

    console.log(`[checkExpiredTrials] ${snap.size} trial(s) vencido(s) — procesando...`);

    for (const indexDoc of snap.docs) {
      const { tenantId, ownerEmail } = indexDoc.data();

      try {
        // Obtener ownerUid desde el meta del tenant
        const metaSnap = await db.collection('tenants').doc(tenantId).get();
        const ownerUid = metaSnap.data()?.ownerUid;

        // Batch: actualizar meta + índice
        const batch = db.batch();
        batch.update(
          db.collection('tenants').doc(tenantId),
          { trialActive: false, plan: 'suspended' }
        );
        batch.update(indexDoc.ref, { trialActive: false });
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

        // Actualizar custom claims del propietario
        if (ownerUid) {
          await auth.setCustomUserClaims(ownerUid, {
            tenantId,
            role:        'tenant_admin',
            trialActive: false,
            active:      false,
            plan:        'suspended',
          });
        }

        console.log(`[checkExpiredTrials] Trial vencido: ${tenantId} (${ownerEmail})`);
      } catch (err) {
        // Continuar con los demás aunque falle uno
        console.error(`[checkExpiredTrials] Error procesando ${tenantId}:`, err);
      }
    }
  }
);
