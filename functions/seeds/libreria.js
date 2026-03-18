'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedLibreria(businessName) {
  const categories = [
    { nombre: 'Útiles escolares', slug: 'utiles', descripcion: 'Cuadernos, carpetas y útiles para el colegio', imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Papelería', slug: 'papeleria', descripcion: 'Resmas, sobres y papel', imagen: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Arte y dibujo', slug: 'arte', descripcion: 'Pinturas, pinceles y materiales artísticos', imagen: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Tecnología', slug: 'tecnologia', descripcion: 'Memorias, cables y accesorios de oficina', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Cuaderno tapa dura 96 hojas rayado',
      descripcion: 'Cuaderno universitario tapa dura con espiral. 96 hojas rayadas 90g. Colores surtidos.',
      precio: 5800, costoActual: 2800, stockActual: 120, marca: 'Rivadavia',
      categorySlug: 'utiles', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Lapiceras BIC cristal x10 azul',
      descripcion: 'Pack 10 lapiceras BIC Cristal punta 1mm. Tinta azul de secado rápido.',
      precio: 7200, costoActual: 3500, stockActual: 80, marca: 'BIC',
      categorySlug: 'utiles', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Resma A4 75g 500 hojas',
      descripcion: 'Resma de papel para impresora A4 75g/m². Blancura 96%. Compatible con láser e inkjet.',
      precio: 8500, costoActual: 4500, stockActual: 60, marca: 'Navigator',
      categorySlug: 'papeleria', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Marcadores permanentes x12 colores',
      descripcion: 'Set 12 marcadores permanentes con punta media 1mm. Secado instantáneo. Resistentes al agua.',
      precio: 6500, costoActual: 3200, stockActual: 45, marca: 'Sharpie',
      categorySlug: 'utiles', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Set acuarelas 24 colores con pinceles',
      descripcion: 'Set profesional de acuarelas en pastilla. Incluye 3 pinceles y bloque de papel 200g.',
      precio: 18500, costoActual: 9500, stockActual: 20, marca: 'Manley',
      categorySlug: 'arte', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Lápices de colores largos x36',
      descripcion: 'Caja 36 lápices de colores largos con mina blanda. Colores vivos, alta pigmentación.',
      precio: 12800, costoActual: 6200, stockActual: 35, marca: 'Faber-Castell',
      categorySlug: 'arte', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pendrive 32GB USB 3.0',
      descripcion: 'Memoria USB 3.0 32GB. Velocidad lectura 100MB/s. Carcasa metálica con tapa protectora.',
      precio: 9500, costoActual: 5000, stockActual: 50, marca: 'Kingston',
      categorySlug: 'tecnologia', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Mouse inalámbrico ergonómico',
      descripcion: 'Mouse USB inalámbrico 2.4GHz. DPI 1200/1600/2400. Batería AA incluida. Plug & play.',
      precio: 14500, costoActual: 7500, stockActual: 25, marca: 'Logitech',
      categorySlug: 'tecnologia', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Todo para la escuela y la oficina en ${businessName}`,
      subtitulo: 'Útiles, papelería y arte al mejor precio',
      descripcion: 'Stock completo para estudiantes, docentes y profesionales.',
      badge: 'Lista de útiles disponible',
      ctaLabel: 'Ver catálogo',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
