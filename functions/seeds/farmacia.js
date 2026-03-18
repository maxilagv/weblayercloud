'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedFarmacia(businessName) {
  const categories = [
    { nombre: 'Medicamentos', slug: 'medicamentos', descripcion: 'Analgésicos, antigripales y vitaminas', imagen: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Perfumería', slug: 'perfumeria', descripcion: 'Perfumes, desodorantes y fragancias', imagen: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Cuidado personal', slug: 'cuidado', descripcion: 'Cremas, protectores y cosméticos', imagen: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Bebé y mamá', slug: 'bebe', descripcion: 'Productos para bebés y embarazadas', imagen: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Ibuprofeno 400mg x20 comprimidos',
      descripcion: 'Analgésico y antiinflamatorio. 20 comprimidos recubiertos. Venta libre.',
      precio: 4800, costoActual: 2400, stockActual: 150, marca: 'Bayer',
      categorySlug: 'medicamentos', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Vitamina C 1000mg x30 efervescentes',
      descripcion: 'Suplemento de vitamina C de alta dosis en comprimidos efervescentes. Sabor naranja.',
      precio: 6500, costoActual: 3200, stockActual: 80, marca: 'Redoxon',
      categorySlug: 'medicamentos', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Perfume mujer 100ml',
      descripcion: 'Eau de parfum floral con notas de jazmín y vainilla. Duración 8 horas.',
      precio: 48000, costoActual: 28000, stockActual: 20, marca: 'L\'Oreal',
      categorySlug: 'perfumeria', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Desodorante roll-on 72hs',
      descripcion: 'Antitranspirante roll-on sin alcohol. Protección 72 horas. No mancha la ropa.',
      precio: 5200, costoActual: 2600, stockActual: 60, marca: 'Dove',
      categorySlug: 'perfumeria', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Protector solar SPF50+ 200ml',
      descripcion: 'Protector solar de amplio espectro UVA/UVB. Resistente al agua. Fórmula no grasa.',
      precio: 14500, costoActual: 7500, stockActual: 40, marca: 'Nivea Sun',
      categorySlug: 'cuidado', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Crema hidratante facial 50ml',
      descripcion: 'Crema hidratante con ácido hialurónico y vitamina E. Para todo tipo de piel.',
      precio: 12800, costoActual: 6400, stockActual: 35, marca: 'Neutrogena',
      categorySlug: 'cuidado', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pañales talla M x40 unidades',
      descripcion: 'Pañales con hasta 12 horas de protección. Capa interior suave, indicador de humedad.',
      precio: 28000, costoActual: 16000, stockActual: 30, marca: 'Pampers',
      categorySlug: 'bebe', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Leche maternizada en polvo 800g',
      descripcion: 'Leche de inicio con DHA y prebióticos. De 0 a 6 meses. Sin gluten.',
      precio: 32000, costoActual: 18500, stockActual: 25, marca: 'NAN',
      categorySlug: 'bebe', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Tu salud primero en ${businessName}`,
      subtitulo: 'Medicamentos, perfumería y cuidado personal',
      descripcion: 'Atención farmacéutica personalizada. Envío a domicilio.',
      badge: 'Farmacéutico disponible',
      ctaLabel: 'Ver productos',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
