import { createRequire } from 'node:module';
import process from 'node:process';
import { applicationDefault, cert, getApps, initializeApp, type AppOptions } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore, type CollectionReference } from 'firebase-admin/firestore';
import { PUBLIC_DEMOS, type PublicDemoDefinition } from '../src/lib/publicDemos';

const require = createRequire(import.meta.url);
const { getDemoSeedByType } = require('../functions/seeds/index.js') as {
  getDemoSeedByType: (businessType: string, businessName: string) => {
    categories: Record<string, unknown>[];
    products: Record<string, unknown>[];
    landingHeroes: Record<string, unknown>[];
    businessConfig: Record<string, unknown>;
  };
};

function resolveAdminOptions(): AppOptions {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    return {
      credential: cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)),
    };
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    };
  }

  return { credential: applicationDefault() };
}

function getDemoOverrides(demo: PublicDemoDefinition) {
  if (demo.businessType === 'gastronomia') {
    return {
      heroTitle: 'Pedidos que entran directo, sin fricción.',
      heroSubtitle: 'Combos, destacados y WhatsApp activo para vender desde el primer scroll.',
      bannerText: 'Envío gratis en pedidos mayores a $25.000',
      aboutTitle: 'Cocina con ritmo propio',
      aboutText: 'Una operación gastronómica necesita rapidez, claridad y contacto directo. Esta demo muestra cómo se ve una tienda pensada para delivery, take away y venta por catálogo visual.',
      paymentMethods: ['MercadoPago', 'Tarjeta de crédito', 'Transferencia bancaria'],
      scheduleText: 'Lunes a domingo · 11:30 a 23:30',
      whatsappNumber: '5491100000002',
      email: 'hola@casabrasa.demo',
    };
  }

  if (demo.businessType === 'muebleria') {
    return {
      heroTitle: 'Colecciones que venden por ambientación y detalle.',
      heroSubtitle: 'Una demo pensada para catálogos visuales, ticket alto y decisión de compra más larga.',
      bannerText: '12 cuotas sin interés en productos seleccionados',
      aboutTitle: 'Diseño, materiales y confianza',
      aboutText: 'Esta demo pública está curada para marcas de muebles y deco que necesitan transmitir calidad visual, orden de catálogo y confianza en cada ficha de producto.',
      paymentMethods: ['Tarjeta de crédito', 'Transferencia bancaria', 'MercadoPago'],
      scheduleText: 'Lunes a sábado · 10:00 a 19:00',
      whatsappNumber: '5491100000003',
      email: 'hola@nativocasa.demo',
    };
  }

  return {
    heroTitle: 'Moda para cada momento.',
    heroSubtitle: 'Colecciones, promos y una experiencia de compra lista para convertir.',
    bannerText: 'Envío gratis en compras mayores a $50.000',
    aboutTitle: 'Quiénes somos',
    aboutText: 'Esta demo pública muestra cómo se ve una tienda de indumentaria con catálogo visual, promos activas y branding listo para salir a vender sin depender de un desarrollo a medida.',
    paymentMethods: ['MercadoPago', 'Tarjeta de crédito', 'Transferencia bancaria'],
    scheduleText: 'Lunes a sábado · 09:00 a 20:00',
    whatsappNumber: '5491100000001',
    email: 'hola@estilonorte.demo',
  };
}

async function replaceCollection(
  collectionRef: CollectionReference,
  documents: Record<string, unknown>[],
) {
  const existing = await collectionRef.get();

  if (!existing.empty) {
    let deleteBatch = getFirestore().batch();
    let deleteOps = 0;

    for (const doc of existing.docs) {
      deleteBatch.delete(doc.ref);
      deleteOps += 1;

      if (deleteOps === 450) {
        await deleteBatch.commit();
        deleteBatch = getFirestore().batch();
        deleteOps = 0;
      }
    }

    if (deleteOps > 0) {
      await deleteBatch.commit();
    }
  }

  let writeBatch = getFirestore().batch();
  let writeOps = 0;

  for (const document of documents) {
    writeBatch.set(collectionRef.doc(), document);
    writeOps += 1;

    if (writeOps === 450) {
      await writeBatch.commit();
      writeBatch = getFirestore().batch();
      writeOps = 0;
    }
  }

  if (writeOps > 0) {
    await writeBatch.commit();
  }
}

async function seedPublicDemo(demo: PublicDemoDefinition) {
  const db = getFirestore();
  const tenantRef = db.collection('tenants').doc(demo.tenantId);
  const seed = getDemoSeedByType(demo.businessType, demo.businessName);
  const overrides = getDemoOverrides(demo);
  const trialEndsAt = Timestamp.fromDate(new Date('2099-12-31T00:00:00.000Z'));

  await tenantRef.set(
    {
      tenantId: demo.tenantId,
      ownerUid: 'layercloud-public-demo',
      ownerEmail: 'demo@layercloud.com.ar',
      ownerName: 'LayerCloud',
      businessName: demo.businessName,
      businessType: demo.businessType,
      phone: overrides.whatsappNumber,
      plan: 'paid',
      trialActive: true,
      trialEndsAt,
      hideDemoBranding: false,
      isPublicDemo: true,
      theme: {
        primaryColor: '#FF3B00',
        primaryHover: '#CC2E00',
        mode: 'light',
      },
      siteConfig: {
        ...seed.businessConfig,
        heroTitle: overrides.heroTitle,
        heroSubtitle: overrides.heroSubtitle,
        bannerText: overrides.bannerText,
        aboutTitle: overrides.aboutTitle,
        aboutText: overrides.aboutText,
        footerTagline: demo.proof,
        seoTitle: `${demo.businessName} | Demo pública LayerCloud`,
        seoDescription: demo.summary,
        paymentMethods: overrides.paymentMethods,
        whatsappNumber: overrides.whatsappNumber,
        email: overrides.email,
        scheduleText: overrides.scheduleText,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await replaceCollection(tenantRef.collection('categories'), seed.categories);
  await replaceCollection(tenantRef.collection('products'), seed.products);
  await replaceCollection(
    tenantRef.collection('landing_heroes'),
    seed.landingHeroes.map((hero) => ({
      ...hero,
      titulo: overrides.heroTitle,
      subtitulo: overrides.heroSubtitle,
      ctaLabel: 'Ver productos',
      ctaUrl: `/demo/${demo.tenantId}/products`,
    })),
  );

  await tenantRef.collection('business_config').doc('main').set(
    {
      ...seed.businessConfig,
      businessName: demo.businessName,
      businessPhone: overrides.whatsappNumber,
      businessEmail: overrides.email,
      whatsappNumber: overrides.whatsappNumber,
      businessAddress: 'Buenos Aires, Argentina',
      updatedAt: new Date(),
    },
    { merge: true },
  );

  await db.collection('layercloud_tenants_index').doc(demo.tenantId).set(
    {
      tenantId: demo.tenantId,
      ownerEmail: 'demo@layercloud.com.ar',
      ownerName: 'LayerCloud',
      businessType: demo.businessType,
      businessName: demo.businessName,
      trialEndsAt,
      trialActive: true,
      convertedToPaid: true,
      pageViewsCount: 0,
      loginCount: 0,
      lastActiveAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`Public demo seeded: ${demo.tenantId}`);
}

async function main() {
  if (!getApps().length) {
    initializeApp(resolveAdminOptions());
  }

  for (const demo of PUBLIC_DEMOS) {
    await seedPublicDemo(demo);
  }

  console.log(`Done. ${PUBLIC_DEMOS.length} public demos updated.`);
}

main().catch((error) => {
  console.error('Error seeding public demos:', error);
  process.exitCode = 1;
});
