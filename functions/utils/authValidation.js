'use strict';

const { HttpsError } = require('firebase-functions/v2/https');

const VALID_BUSINESS_TYPES = [
  'muebleria',
  'indumentaria',
  'electronica',
  'ferreteria',
  'libreria',
  'veterinaria',
  'farmacia',
  'gastronomia',
  'servicios',
  'otro',
];

function sanitizeText(value) {
  return String(value ?? '').trim();
}

function collapseWhitespace(value) {
  return sanitizeText(value).replace(/\s+/g, ' ');
}

function normalizeEmail(value) {
  return sanitizeText(value).toLowerCase();
}

function normalizePhone(value) {
  return sanitizeText(value).replace(/[^\d+]/g, '');
}

function makeEmailKey(email) {
  return encodeURIComponent(normalizeEmail(email));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function getPasswordPolicyState(password) {
  const value = String(password ?? '');

  return {
    minLength: value.length >= 10,
    hasLowercase: /[a-z]/.test(value),
    hasUppercase: /[A-Z]/.test(value),
    hasNumber: /\d/.test(value),
  };
}

function assertStrongPassword(password) {
  const policy = getPasswordPolicyState(password);
  const isValid = Object.values(policy).every(Boolean);

  if (!isValid) {
    throw new HttpsError(
      'invalid-argument',
      'La contrasena debe tener al menos 10 caracteres e incluir mayuscula, minuscula y numero.',
    );
  }
}

function validateBusinessType(businessType) {
  const normalized = sanitizeText(businessType);

  if (!VALID_BUSINESS_TYPES.includes(normalized)) {
    throw new HttpsError('invalid-argument', 'El rubro seleccionado no es valido.');
  }

  return normalized;
}

function validateTenantProvisionInput(data) {
  const ownerName = collapseWhitespace(data?.ownerName);
  const businessName = collapseWhitespace(data?.businessName);
  const businessType = validateBusinessType(data?.businessType);
  const phone = normalizePhone(data?.phone);

  if (ownerName.length < 3) {
    throw new HttpsError('invalid-argument', 'El nombre del titular es obligatorio.');
  }

  if (businessName.length < 2) {
    throw new HttpsError('invalid-argument', 'El nombre del negocio es obligatorio.');
  }

  return {
    ownerName,
    businessName,
    businessType,
    phone,
  };
}

function validateTenantAccountRegistrationInput(data) {
  const email = normalizeEmail(data?.email);
  const password = String(data?.password ?? '');
  const base = validateTenantProvisionInput(data);

  if (!isValidEmail(email)) {
    throw new HttpsError('invalid-argument', 'Debes ingresar un email valido.');
  }

  assertStrongPassword(password);

  return {
    ...base,
    email,
    password,
  };
}

function validateCustomerRegistrationInput(data) {
  const tenantId = sanitizeText(data?.tenantId);
  const nombre = collapseWhitespace(data?.nombre);
  const apellido = collapseWhitespace(data?.apellido);
  const email = normalizeEmail(data?.email);
  const telefono = normalizePhone(data?.telefono);
  const direccion = collapseWhitespace(data?.direccion);
  const password = String(data?.password ?? '');

  if (!tenantId) {
    throw new HttpsError('invalid-argument', 'Falta el tenantId.');
  }

  if (nombre.length < 2 || apellido.length < 2) {
    throw new HttpsError('invalid-argument', 'Nombre y apellido son obligatorios.');
  }

  if (!isValidEmail(email)) {
    throw new HttpsError('invalid-argument', 'Debes ingresar un email valido.');
  }

  if (telefono.length < 8) {
    throw new HttpsError('invalid-argument', 'Debes ingresar un telefono valido.');
  }

  if (direccion.length < 5) {
    throw new HttpsError('invalid-argument', 'Debes ingresar una direccion valida.');
  }

  assertStrongPassword(password);

  return {
    tenantId,
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    password,
  };
}

module.exports = {
  VALID_BUSINESS_TYPES,
  collapseWhitespace,
  getPasswordPolicyState,
  isValidEmail,
  makeEmailKey,
  normalizeEmail,
  normalizePhone,
  sanitizeText,
  validateCustomerRegistrationInput,
  validateTenantAccountRegistrationInput,
  validateTenantProvisionInput,
};
