'use strict';

const { slugify } = require('./slugify');

/**
 * Genera un tenantId único, legible y URL-safe.
 * Formato: {rubro}-{apellido}-{4chars}
 * Ejemplo: "muebleria-gomez-xk92"
 */
function generateTenantId(businessType, ownerName) {
  const nameParts = ownerName.trim().split(/\s+/);
  const lastName  = nameParts[nameParts.length - 1] || 'demo';
  const slug      = slugify(lastName).substring(0, 16);
  const suffix    = Math.random().toString(36).substring(2, 6); // 4 chars aleatorios
  return `${businessType}-${slug}-${suffix}`;
}

module.exports = { generateTenantId };
