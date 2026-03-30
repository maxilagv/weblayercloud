'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { provisionTenantForUser } = require('./_tenantProvisioning');
const { validateTenantProvisionInput } = require('../utils/authValidation');

module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticacion.');
  }

  const email = request.auth.token.email;
  if (!email) {
    throw new HttpsError('failed-precondition', 'Tu usuario no tiene un email valido.');
  }

  const payload = validateTenantProvisionInput(request.data || {});

  return provisionTenantForUser(
    {
      uid: request.auth.uid,
      email,
      ownerName: payload.ownerName,
      businessName: payload.businessName,
      businessType: payload.businessType,
      phone: payload.phone,
    },
    {
      allowExisting: true,
      source: 'legacy_authenticated_flow',
    },
  );
});
