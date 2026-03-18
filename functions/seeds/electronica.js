'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedElectronica(businessName) {
  const categories = [
    { nombre: 'Audio', slug: 'audio', descripcion: 'Auriculares, parlantes y accesorios de sonido', imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Carga', slug: 'carga', descripcion: 'Cargadores, cables y powerbanks', imagen: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Smartphones', slug: 'smartphones', descripcion: 'Teléfonos y tablets', imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Fundas, protectores y más', imagen: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Auriculares Bluetooth inalámbricos',
      descripcion: 'Auriculares over-ear con cancelación activa de ruido. Batería 30hs. Compatible iOS y Android.',
      precio: 48500, costoActual: 28000, stockActual: 22, marca: 'SoundMax',
      categorySlug: 'audio', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Parlante portátil resistente al agua',
      descripcion: 'Parlante Bluetooth IPX7, batería 24hs, bass boost. Ideal para exteriores.',
      precio: 35000, costoActual: 19000, stockActual: 18, marca: 'BassGo',
      categorySlug: 'audio', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Cargador USB-C 65W GaN',
      descripcion: 'Cargador ultracompacto GaN 65W. Carga hasta 3 dispositivos simultáneamente. Incluye cable.',
      precio: 14500, costoActual: 7500, stockActual: 45, marca: 'FastCharge',
      categorySlug: 'carga', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Powerbank 20000mAh carga rápida',
      descripcion: 'Power bank con carga rápida 22.5W. Pantalla LED indicadora. 2 puertos USB + 1 USB-C.',
      precio: 38000, costoActual: 20000, stockActual: 28, marca: 'PowerPlus',
      categorySlug: 'carga', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Cable USB-C a Lightning 1.2m',
      descripcion: 'Cable trenzado nylon compatible MFi. Carga rápida 20W. Resistente a 10.000 dobleces.',
      precio: 8500, costoActual: 4000, stockActual: 80, marca: 'CablePro',
      categorySlug: 'carga', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Funda antigolpe iPhone 15',
      descripcion: 'Funda protectora transparente con marco reforzado. Protección esquinas 360°. Certificado MIL-STD.',
      precio: 6500, costoActual: 2800, stockActual: 55, marca: 'SafeCase',
      categorySlug: 'accesorios', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Protector pantalla vidrio templado',
      descripcion: 'Vidrio templado 9H anti-rayones. Bordes curvados 2.5D. Pack x2 unidades. Para Samsung y iPhone.',
      precio: 4800, costoActual: 1900, stockActual: 100, marca: 'GlassPro',
      categorySlug: 'accesorios', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Auriculares in-ear con micrófono',
      descripcion: 'Auriculares intrauriculares con tres tamaños de almohadillas. Micrófono integrado. Control en cable.',
      precio: 9500, costoActual: 4500, stockActual: 40, marca: 'EarFit',
      categorySlug: 'audio', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Tecnología al alcance de todos en ${businessName}`,
      subtitulo: 'Los mejores accesorios para tu celular',
      descripcion: 'Stock permanente de auriculares, cargadores y accesorios de primera calidad.',
      badge: 'Envío en 24hs',
      ctaLabel: 'Ver catálogo',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
    {
      titulo: 'Cargá más rápido, viajá más liviano',
      subtitulo: 'Cargadores GaN y powerbanks de alta capacidad',
      descripcion: 'La tecnología GaN hace que tus cargadores sean más pequeños y más potentes.',
      badge: 'Garantía 12 meses',
      ctaLabel: 'Ver cargadores',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop',
      orden: 2, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
