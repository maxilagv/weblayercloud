'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedFerreteria(businessName) {
  const categories = [
    { nombre: 'Herramientas', slug: 'herramientas', descripcion: 'Herramientas manuales y eléctricas', imagen: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Pinturas', slug: 'pinturas', descripcion: 'Pinturas, esmaltes y accesorios', imagen: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Electricidad', slug: 'electricidad', descripcion: 'Materiales eléctricos y luminarias', imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Plomería', slug: 'plomeria', descripcion: 'Caños, conexiones y grifería', imagen: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Taladro percutor 750W con maletín',
      descripcion: 'Taladro percutor 750W con mandril 13mm. Incluye maletín, mechas y accesorios. Garantía 1 año.',
      precio: 185000, costoActual: 105000, stockActual: 10, marca: 'PowerDrill',
      categorySlug: 'herramientas', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Set destornilladores 12 piezas',
      descripcion: 'Juego de 12 destornilladores con mango antideslizante. Incluye Phillips y planos en varios tamaños.',
      precio: 22500, costoActual: 11000, stockActual: 35, marca: 'ToolSet',
      categorySlug: 'herramientas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pintura látex interior blanco mate 20L',
      descripcion: 'Pintura látex de alta cobertura para interiores. Rinde 80m² por mano. Secado rápido 2 horas.',
      precio: 42000, costoActual: 25000, stockActual: 20, marca: 'Colorin',
      categorySlug: 'pinturas', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Esmalte sintético colores x1L',
      descripcion: 'Esmalte brillante de alta dureza para madera y metal. Disponible en 12 colores. Secado 6 horas.',
      precio: 12800, costoActual: 6500, stockActual: 50, marca: 'Sherwin',
      categorySlug: 'pinturas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1625480862379-b64e2a264b28?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Rollo cable eléctrico 2.5mm 100m',
      descripcion: 'Cable unipolar 2.5mm² IRAM, con aislación termoplástica. Colores disponibles: rojo, negro, verde.',
      precio: 38500, costoActual: 22000, stockActual: 15, marca: 'Prysmian',
      categorySlug: 'electricidad', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Kit luces LED tira 5m',
      descripcion: 'Tira LED RGB 5050 con control remoto. IP65 impermeable. 60 LEDs/metro. Consumo 14W/metro.',
      precio: 18500, costoActual: 9500, stockActual: 30, marca: 'LightPro',
      categorySlug: 'electricidad', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Llave de paso esfera 1/2"',
      descripcion: 'Llave de paso de bronce cromado. Cuerpo esférico, cierre total. Temperatura hasta 120°C.',
      precio: 8500, costoActual: 4200, stockActual: 60, marca: 'Hidro',
      categorySlug: 'plomeria', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Mezcladora monocomando cocina',
      descripcion: 'Canilla de cocina monocomando con pico giratorio 360°. Acabado cromado. Incluye flexibles.',
      precio: 55000, costoActual: 30000, stockActual: 8, marca: 'Grifex',
      categorySlug: 'plomeria', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Todo para tu obra en ${businessName}`,
      subtitulo: 'Herramientas, pinturas y materiales de primera',
      descripcion: 'Stock completo para profesionales y particulares. Atención personalizada.',
      badge: 'Precios de mayorista',
      ctaLabel: 'Ver catálogo',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
