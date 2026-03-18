'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const crypto = require('crypto');

const CLOUD_NAME = 'dii3fhowb';
const API_KEY = '397338598961386';
const API_SECRET = 'mQ6ewGrtwInoLo2eh1EmismA7KQ';

module.exports = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Requiere autenticación');
  }

  const callerToken = request.auth.token;
  const validRoles = ['tenant_admin', 'layercloud_superadmin'];

  if (!validRoles.includes(callerToken.role)) {
    throw new HttpsError('permission-denied', 'Solo admins pueden subir imágenes');
  }

  const { folder } = request.data ?? {};
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    ...(folder ? { folder } : {}),
  };

  const paramString = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha256')
    .update(paramString + API_SECRET)
    .digest('hex');

  return {
    signature,
    timestamp,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder: folder ?? null,
  };
});
