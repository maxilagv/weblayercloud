'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedGastronomia(businessName) {
  const categories = [
    { nombre: 'Hamburguesas', slug: 'hamburguesas', descripcion: 'Combos y hamburguesas artesanales', imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Pizzas', slug: 'pizzas', descripcion: 'Pizzas al molde y a la piedra', imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Empanadas', slug: 'empanadas', descripcion: 'Empanadas artesanales', imagen: 'https://images.unsplash.com/photo-1604906580282-a3d4de68fcb9?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Bebidas', slug: 'bebidas', descripcion: 'Bebidas frías y calientes', imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Combo Smash Burger doble',
      descripcion: 'Doble medallón de carne 100% vacuno, queso cheddar, pepinillos, cebolla caramelizada y salsa especial. Incluye papas y bebida.',
      precio: 9800, costoActual: 4500, stockActual: 999, marca: businessName,
      categorySlug: 'hamburguesas', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Hamburguesa BBQ con cheddar',
      descripcion: 'Medallón vacuno, salsa BBQ, queso cheddar fundido, cebolla crispy y lechuga. Pan brioche.',
      precio: 7500, costoActual: 3200, stockActual: 999, marca: businessName,
      categorySlug: 'hamburguesas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pizza mozzarella grande',
      descripcion: 'Pizza al molde 8 porciones con salsa de tomate casera y mozzarella generosa. Masa de fermentación lenta.',
      precio: 12500, costoActual: 5500, stockActual: 999, marca: businessName,
      categorySlug: 'pizzas', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pizza especial fugazzeta',
      descripcion: 'Fugazzeta con doble mozzarella y cebolla al horno. 8 porciones. Masa bien alta.',
      precio: 14500, costoActual: 6500, stockActual: 999, marca: businessName,
      categorySlug: 'pizzas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Docena empanadas carne cortada a cuchillo',
      descripcion: '12 empanadas de carne picante o suave. Relleno generoso con huevo, aceitunas y especias. Al horno.',
      precio: 11500, costoActual: 5200, stockActual: 999, marca: businessName,
      categorySlug: 'empanadas', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1604906580282-a3d4de68fcb9?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Media docena empanadas mixtas',
      descripcion: '6 empanadas a elección: carne, pollo, caprese o jamón y queso. Al horno o fritas.',
      precio: 6200, costoActual: 2800, stockActual: 999, marca: businessName,
      categorySlug: 'empanadas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1604906580282-a3d4de68fcb9?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Gaseosa 1.5L',
      descripcion: 'Coca-Cola, 7up, Sprite o Fanta. Bien fría.',
      precio: 3200, costoActual: 1500, stockActual: 999, marca: 'Coca-Cola',
      categorySlug: 'bebidas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Agua mineral sin gas 500ml',
      descripcion: 'Agua mineral natural sin gas. Villavicencio o Dasani.',
      precio: 1800, costoActual: 800, stockActual: 999, marca: 'Villavicencio',
      categorySlug: 'bebidas', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Pedí a domicilio en ${businessName}`,
      subtitulo: 'Hamburguesas, pizzas y empanadas artesanales',
      descripcion: 'Delivery rápido en tu zona. Pedí por WhatsApp o por la web.',
      badge: 'Entrega en 45 min',
      ctaLabel: 'Ver el menú',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
    {
      titulo: 'Pizza al molde, recién hecha',
      subtitulo: 'Masa de fermentación lenta, ingredientes frescos',
      descripcion: 'Nuestras pizzas se hacen al momento. Sin congelados.',
      badge: 'Sin TACC disponible',
      ctaLabel: 'Ver pizzas',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
      orden: 2, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
