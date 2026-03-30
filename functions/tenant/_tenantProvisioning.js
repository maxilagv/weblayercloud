'use strict';

const { HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { seedDemoData } = require('../seeds/index');
const { generateTenantId } = require('../utils/generateTenantId');
const {
  makeEmailKey,
  normalizeEmail,
  normalizePhone,
  validateTenantProvisionInput,
} = require('../utils/authValidation');

const TRIAL_DAYS = 7;
const OWNER_RESERVATION_TTL_MS = 10 * 60 * 1000;

async function ensureUniqueTenantId(db, businessType, ownerName) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const tenantId = generateTenantId(businessType, ownerName);
    const snapshot = await db.collection('tenants').doc(tenantId).get();

    if (!snapshot.exists) {
      return tenantId;
    }
  }

  throw new HttpsError('internal', 'No pudimos generar un identificador unico para el tenant.');
}

async function resolveOwnerTenant(db, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const ownerAccountRef = db.collection('layercloud_owner_accounts').doc(makeEmailKey(normalizedEmail));
  const ownerAccountSnapshot = await ownerAccountRef.get();

  if (ownerAccountSnapshot.exists) {
    const ownerAccount = ownerAccountSnapshot.data() || {};
    if (ownerAccount.tenantId) {
      return {
        tenantId: String(ownerAccount.tenantId),
        ownerAccount,
        ownerAccountRef,
      };
    }
  }

  const legacySnapshot = await db
    .collection('layercloud_tenants_index')
    .where('ownerEmail', '==', normalizedEmail)
    .limit(1)
    .get();

  if (legacySnapshot.empty) {
    return null;
  }

  const legacyTenant = legacySnapshot.docs[0];
  return {
    tenantId: legacyTenant.id,
    ownerAccount: null,
    ownerAccountRef,
  };
}

async function applyOwnerClaims(auth, uid, tenantMeta) {
  const userRecord = await auth.getUser(uid);

  await auth.setCustomUserClaims(uid, {
    ...(userRecord.customClaims ?? {}),
    tenantId: tenantMeta.tenantId,
    role: 'tenant_admin',
    trialActive: Boolean(tenantMeta.trialActive),
    active: tenantMeta.plan !== 'suspended',
    plan: tenantMeta.plan,
  });
}

function buildTenantMeta({
  uid,
  email,
  ownerName,
  businessName,
  businessType,
  phone,
  tenantId,
}) {
  const trialStartsAt = new Date();
  const trialEndsAt = new Date(trialStartsAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  return {
    tenantId,
    ownerUid: uid,
    ownerEmail: email,
    ownerName,
    businessName,
    businessType,
    phone,
    trialStartsAt: FieldValue.serverTimestamp(),
    trialEndsAt: Timestamp.fromDate(trialEndsAt),
    trialActive: true,
    plan: 'trial',
    theme: {
      primaryColor: '#FF3B00',
      primaryHover: '#CC2E00',
      mode: 'light',
    },
    siteConfig: {
      heroTitle: `Bienvenidos a ${businessName}`,
      heroSubtitle: 'Explora productos, precios y la experiencia completa.',
      whatsappNumber: phone,
      address: '',
      email,
      logoUrl: null,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function provisionTenantForUser(input, options = {}) {
  const payload = validateTenantProvisionInput(input);
  const db = getFirestore();
  const auth = getAuth();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(payload.phone);
  const ownerAccountRef = db.collection('layercloud_owner_accounts').doc(makeEmailKey(email));
  const allowExisting = Boolean(options.allowExisting);
  const nowMs = Date.now();

  const reservation = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ownerAccountRef);

    if (snapshot.exists) {
      const ownerAccount = snapshot.data() || {};
      const startedAtMs = ownerAccount.startedAt?.toMillis?.() ?? 0;
      const isPendingFresh =
        ownerAccount.status === 'pending' &&
        startedAtMs > 0 &&
        nowMs - startedAtMs < OWNER_RESERVATION_TTL_MS;

      if (ownerAccount.status === 'active' && ownerAccount.tenantId) {
        if (allowExisting) {
          return { existing: true, tenantId: String(ownerAccount.tenantId) };
        }

        throw new HttpsError(
          'already-exists',
          'Ya existe una cuenta creada con ese email. Inicia sesion o recupera tu contrasena.',
        );
      }

      if (isPendingFresh) {
        throw new HttpsError(
          'already-exists',
          'Ya estamos procesando una alta con ese email. Espera unos segundos e intenta iniciar sesion.',
        );
      }
    }

    transaction.set(
      ownerAccountRef,
      {
        status: 'pending',
        ownerUid: input.uid,
        ownerEmail: email,
        ownerName: payload.ownerName,
        businessName: payload.businessName,
        businessType: payload.businessType,
        phone,
        startedAt: Timestamp.fromMillis(nowMs),
        updatedAt: FieldValue.serverTimestamp(),
        source: options.source ?? 'unknown',
      },
      { merge: true },
    );

    return { existing: false };
  });

  if (reservation.existing) {
    return {
      success: true,
      tenantId: reservation.tenantId,
      existing: true,
    };
  }

  const tenantId = await ensureUniqueTenantId(db, payload.businessType, payload.ownerName);
  const tenantMeta = buildTenantMeta({
    uid: input.uid,
    email,
    ownerName: payload.ownerName,
    businessName: payload.businessName,
    businessType: payload.businessType,
    phone,
    tenantId,
  });

  const batch = db.batch();

  batch.set(db.collection('tenants').doc(tenantId), tenantMeta);
  batch.set(db.collection('layercloud_tenants_index').doc(tenantId), {
    tenantId,
    ownerUid: input.uid,
    ownerEmail: email,
    ownerName: payload.ownerName,
    businessType: payload.businessType,
    businessName: payload.businessName,
    trialStartsAt: FieldValue.serverTimestamp(),
    trialEndsAt: tenantMeta.trialEndsAt,
    trialActive: true,
    plan: 'trial',
    lastActiveAt: FieldValue.serverTimestamp(),
    pageViewsCount: 0,
    loginCount: 1,
    convertedToPaid: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(
    ownerAccountRef,
    {
      status: 'active',
      tenantId,
      ownerUid: input.uid,
      ownerEmail: email,
      ownerName: payload.ownerName,
      businessName: payload.businessName,
      businessType: payload.businessType,
      phone,
      trialActive: true,
      plan: 'trial',
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  await seedDemoData(db, tenantId, payload.businessType, payload.businessName);
  await applyOwnerClaims(auth, input.uid, tenantMeta);

  return {
    success: true,
    tenantId,
    existing: false,
  };
}

module.exports = {
  applyOwnerClaims,
  provisionTenantForUser,
  resolveOwnerTenant,
};
