'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedVeterinaria(businessName) {
  const categories = [
    { nombre: 'Perros', slug: 'perros', descripcion: 'Alimentos, accesorios y juguetes para perros', imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Gatos', slug: 'gatos', descripcion: 'Todo para tu gato', imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Higiene', slug: 'higiene', descripcion: 'Antiparasitarios, champús y cuidado', imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Correas, camas, comederos y más', imagen: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Alimento perro adulto raza mediana 15kg',
      descripcion: 'Alimento completo para perros adultos de raza mediana. Con proteína de pollo y cereales. Sin colorantes.',
      precio: 72000, costoActual: 45000, stockActual: 25, marca: 'Royal Canin',
      categorySlug: 'perros', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Snack dental perro medianos x12u',
      descripcion: 'Premios dentales con clorofila y menta. Reduce el sarro y refresca el aliento. Talla M.',
      precio: 14500, costoActual: 7500, stockActual: 40, marca: 'Dentix',
      categorySlug: 'perros', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Alimento gato castrado 3kg',
      descripcion: 'Croquetas especiales para gatos castrados. Controla el peso y cuida las vías urinarias.',
      precio: 32000, costoActual: 18500, stockActual: 30, marca: 'Whiskas Pro',
      categorySlug: 'gatos', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Arena sanitaria sílice 4L',
      descripcion: 'Arena de sílice ultraabsorbente. Sin polvo, sin olor. Rinde hasta 30 días para 1 gato.',
      precio: 18500, costoActual: 10000, stockActual: 50, marca: 'SilicaGel',
      categorySlug: 'gatos', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Antiparasitario pipeta perro 10-25kg',
      descripcion: 'Pipeta antiparasitaria spot-on contra pulgas, garrapatas y piojos. Protección 4 semanas.',
      precio: 12500, costoActual: 6500, stockActual: 60, marca: 'Frontline',
      categorySlug: 'higiene', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Champú neutro para perros 500ml',
      descripcion: 'Champú hipoalergénico con pH neutro. Con vitamina E y aloe vera. Apto pieles sensibles.',
      precio: 9800, costoActual: 4800, stockActual: 35, marca: 'PetCare',
      categorySlug: 'higiene', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Cama ortopédica perro grande',
      descripcion: 'Cama con relleno viscoelástico para perros de hasta 35kg. Funda lavable. 90x70cm.',
      precio: 55000, costoActual: 30000, stockActual: 12, marca: 'PetComfort',
      categorySlug: 'accesorios', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Correa retráctil 5m hasta 25kg',
      descripcion: 'Correa extensible con freno de seguridad. Mango ergonómico antideslizante. Colores surtidos.',
      precio: 22000, costoActual: 11500, stockActual: 20, marca: 'Flexi',
      categorySlug: 'accesorios', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Tu mascota merece lo mejor en ${businessName}`,
      subtitulo: 'Alimentos, higiene y accesorios premium',
      descripcion: 'Todo lo que tu perro o gato necesita, en un solo lugar.',
      badge: 'Envío a domicilio',
      ctaLabel: 'Ver productos',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
