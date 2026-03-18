'use strict';

const seedMuebleria   = require('./muebleria');
const seedIndumentaria = require('./indumentaria');
const seedElectronica  = require('./electronica');
const seedFerreteria   = require('./ferreteria');
const seedLibreria     = require('./libreria');
const seedVeterinaria  = require('./veterinaria');
const seedFarmacia     = require('./farmacia');
const seedGastronomia  = require('./gastronomia');
const seedServicios    = require('./servicios');
const seedOtro         = require('./otro');

const SEEDS = {
  muebleria:    seedMuebleria,
  indumentaria: seedIndumentaria,
  electronica:  seedElectronica,
  ferreteria:   seedFerreteria,
  libreria:     seedLibreria,
  veterinaria:  seedVeterinaria,
  farmacia:     seedFarmacia,
  gastronomia:  seedGastronomia,
  servicios:    seedServicios,
  otro:         seedOtro,
};

/**
 * Devuelve el objeto de seed para el rubro dado.
 * Si el rubro no existe, usa el seed genérico "otro".
 *
 * @param {string} businessType  — clave del rubro (ej: "muebleria")
 * @param {string} businessName  — nombre del negocio para personalizar textos
 * @returns {{ categories, products, landingHeroes, businessConfig }}
 */
function getDemoSeedByType(businessType, businessName) {
  const seedFn = SEEDS[businessType] ?? SEEDS.otro;
  return seedFn(businessName);
}

/**
 * Escribe todos los documentos de demo en Firestore para un tenant.
 * Usa batch writes en grupos de 500 (límite de Firestore).
 *
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} tenantId
 * @param {string} businessType
 * @param {string} businessName
 */
async function seedDemoData(db, tenantId, businessType, businessName) {
  const tenantRef = db.collection('tenants').doc(tenantId);
  const seeds = getDemoSeedByType(businessType, businessName);

  // Firestore batch admite máx 500 ops. Dividimos si es necesario.
  const ops = [];

  seeds.categories.forEach(cat => {
    ops.push({ ref: tenantRef.collection('categories').doc(), data: cat });
  });

  seeds.products.forEach(prod => {
    ops.push({ ref: tenantRef.collection('products').doc(), data: prod });
  });

  seeds.landingHeroes.forEach(hero => {
    ops.push({ ref: tenantRef.collection('landing_heroes').doc(), data: hero });
  });

  ops.push({
    ref: tenantRef.collection('business_config').doc('main'),
    data: seeds.businessConfig,
  });

  // Dividir en batches de 499 ops
  const BATCH_SIZE = 499;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const batch = db.batch();
    ops.slice(i, i + BATCH_SIZE).forEach(op => batch.set(op.ref, op.data));
    await batch.commit();
  }

  console.log(`[seed] ${ops.length} docs sembrados para tenant ${tenantId} (${businessType})`);
}

module.exports = { seedDemoData, getDemoSeedByType };
