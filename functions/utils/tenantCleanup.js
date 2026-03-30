'use strict';

const { makeEmailKey } = require('./authValidation');

async function deleteCollectionDocuments(collectionRef, batchSize = 100) {
  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) {
      return;
    }

    const batch = collectionRef.firestore.batch();
    snapshot.docs.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
    await batch.commit();
  }
}

async function cleanupTenantById(db, tenantId) {
  if (!tenantId) {
    return;
  }

  const tenantRef = db.collection('tenants').doc(tenantId);

  try {
    const collections = await tenantRef.listCollections();
    for (const collectionRef of collections) {
      await deleteCollectionDocuments(collectionRef);
    }
  } catch (error) {
    console.error('[tenantCleanup] No pudimos listar subcolecciones:', tenantId, error);
  }

  await Promise.allSettled([
    tenantRef.delete(),
    db.collection('layercloud_tenants_index').doc(tenantId).delete(),
  ]);
}

async function cleanupPartialTenantRegistration({
  db,
  normalizedEmail,
  ownerUid,
}) {
  const ownerAccountRef = db.collection('layercloud_owner_accounts').doc(makeEmailKey(normalizedEmail));
  const ownerAccountSnapshot = await ownerAccountRef.get().catch(() => null);
  const candidateTenantIds = new Set();

  if (ownerAccountSnapshot?.exists) {
    const ownerAccount = ownerAccountSnapshot.data() || {};
    if (ownerAccount.tenantId) {
      candidateTenantIds.add(String(ownerAccount.tenantId));
    }
  }

  if (ownerUid) {
    const tenantSnapshots = await db
      .collection('tenants')
      .where('ownerUid', '==', ownerUid)
      .get()
      .catch(() => null);

    tenantSnapshots?.docs.forEach((docSnapshot) => candidateTenantIds.add(docSnapshot.id));
  }

  if (normalizedEmail) {
    const indexSnapshots = await db
      .collection('layercloud_tenants_index')
      .where('ownerEmail', '==', normalizedEmail)
      .get()
      .catch(() => null);

    indexSnapshots?.docs.forEach((docSnapshot) => candidateTenantIds.add(docSnapshot.id));
  }

  for (const tenantId of candidateTenantIds) {
    await cleanupTenantById(db, tenantId);
  }

  await ownerAccountRef.delete().catch(() => undefined);
}

async function cleanupCustomerRegistration({
  db,
  tenantId,
  normalizedEmail,
  uid,
}) {
  if (!tenantId) {
    return;
  }

  const tenantRef = db.collection('tenants').doc(tenantId);
  const tasks = [
    tenantRef.collection('customer_auth_index').doc(makeEmailKey(normalizedEmail)).delete(),
  ];

  if (uid) {
    tasks.push(tenantRef.collection('customers').doc(uid).delete());
  }

  await Promise.allSettled(tasks);
}

module.exports = {
  cleanupCustomerRegistration,
  cleanupPartialTenantRegistration,
  cleanupTenantById,
};
