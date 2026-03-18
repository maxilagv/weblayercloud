'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { generateTenantId } = require('../utils/generateTenantId');
const { seedDemoData } = require('../seeds/index');

const TRIAL_DAYS = 7;

module.exports = onCall(async (request) => {
  // 1. Verificar autenticación
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const { ownerName, businessName, businessType, phone } = request.data;
  const uid   = request.auth.uid;
  const email = request.auth.token.email;

  // 2. Validaciones básicas
  if (!ownerName || !businessName || !businessType) {
    throw new HttpsError('invalid-argument', 'Faltan campos requeridos: ownerName, businessName, businessType');
  }

  const VALID_TYPES = [
    'muebleria','indumentaria','electronica','ferreteria',
    'libreria','veterinaria','farmacia','gastronomia','servicios','otro',
  ];
  if (!VALID_TYPES.includes(businessType)) {
    throw new HttpsError('invalid-argument', `businessType inválido: ${businessType}`);
  }

  const db   = getFirestore();
  const auth = getAuth();

  // 3. Verificar que el usuario no tenga ya un tenant
  const existing = await db.collection('layercloud_tenants_index')
    .where('ownerEmail', '==', email)
    .limit(1)
    .get();

  if (!existing.empty) {
    const existingTenantId = existing.docs[0].data().tenantId;
    // No crear uno nuevo — devolver el existente
    return { success: true, tenantId: existingTenantId, existing: true };
  }

  // 4. Generar tenantId único
  const tenantId = generateTenantId(businessType, ownerName);

  // 5. Calcular fechas del trial
  const trialStartsAt = new Date();
  const trialEndsAt   = new Date(trialStartsAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  // 6. Crear documento meta del tenant
  await db.collection('tenants').doc(tenantId).set({
    tenantId,
    ownerUid:   uid,
    ownerEmail: email,
    ownerName,
    businessName,
    businessType,
    phone: phone ?? '',
    trialStartsAt: FieldValue.serverTimestamp(),
    trialEndsAt:   Timestamp.fromDate(trialEndsAt),
    trialActive:   true,
    plan:          'trial',
    theme: {
      primaryColor: '#3B82F6',
      primaryHover: '#2563EB',
      mode:         'light',
    },
    siteConfig: {
      heroTitle:      `Bienvenidos a ${businessName}`,
      heroSubtitle:   '¡Explorá nuestros productos!',
      whatsappNumber: (phone ?? '').replace(/\D/g, ''),
      address:        '',
      email:          email,
      logoUrl:        null,
    },
    createdAt: FieldValue.serverTimestamp(),
  });

  // 7. Sembrar datos de demo
  await seedDemoData(db, tenantId, businessType, businessName);

  // 8. Asignar custom claims
  await auth.setCustomUserClaims(uid, {
    tenantId,
    role:        'tenant_admin',
    trialActive: true,
  });

  // 9. Crear entrada en el índice del super admin
  await db.collection('layercloud_tenants_index').doc(tenantId).set({
    tenantId,
    ownerEmail:      email,
    ownerName,
    businessType,
    businessName,
    trialStartsAt:   Timestamp.fromDate(trialStartsAt),
    trialEndsAt:     Timestamp.fromDate(trialEndsAt),
    trialActive:     true,
    lastActiveAt:    FieldValue.serverTimestamp(),
    pageViewsCount:  0,
    loginCount:      1,
    convertedToPaid: false,
    createdAt:       FieldValue.serverTimestamp(),
  });

  console.log(`[LayerCloud] Tenant creado: ${tenantId} (${businessType}) owner: ${email}`);

  return { success: true, tenantId, existing: false };
});
