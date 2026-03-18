'use strict';

const { initializeApp } = require('firebase-admin/app');

// Inicializar Admin SDK una sola vez
initializeApp();

// ── Tenant lifecycle ──────────────────────────────────────────────────────────
exports.onTenantRegistration = require('./tenant/onTenantRegistration');
exports.checkExpiredTrials   = require('./tenant/checkExpiredTrials');
exports.extendTrial          = require('./tenant/extendTrial');
exports.revokeTrial          = require('./tenant/revokeTrial');

// ── Super admin actions ───────────────────────────────────────────────────────
exports.markConverted = require('./tenant/markConverted');

// ── Analytics ─────────────────────────────────────────────────────────────────
exports.trackSession = require('./tenant/trackSession');

// ── Email ─────────────────────────────────────────────────────────────────────
exports.sendWelcomeEmail = require('./tenant/sendWelcomeEmail');

// ── Staff management (callable) ───────────────────────────────────────────────
exports.inviteTenantStaff        = require('./tenant/inviteTenantStaff');
exports.updateTenantStaffAccess  = require('./tenant/updateTenantStaffAccess');
exports.deleteTenantStaff        = require('./tenant/deleteTenantStaff');

// ── Cloudinary signed upload ───────────────────────────────────────────────────
exports.getCloudinarySignature = require('./tenant/getCloudinarySignature');
