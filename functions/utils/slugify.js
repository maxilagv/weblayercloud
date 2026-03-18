'use strict';

/**
 * Convierte un string a slug URL-safe.
 * Maneja caracteres del español (á, ñ, ü, etc.)
 */
function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // elimina diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // solo letras, números, espacios y guiones
    .replace(/\s+/g, '-')              // espacios → guión
    .replace(/-+/g, '-')               // guiones múltiples → uno
    .substring(0, 32);                 // máximo 32 chars
}

module.exports = { slugify };
