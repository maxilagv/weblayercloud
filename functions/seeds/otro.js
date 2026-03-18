'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

// Seed genérico para rubros no especificados
module.exports = function seedOtro(businessName) {
  const categories = [
    { nombre: 'Productos', slug: 'productos', descripcion: 'Nuestros productos principales', imagen: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Servicios', slug: 'servicios', descripcion: 'Nuestros servicios', imagen: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Promociones', slug: 'promociones', descripcion: 'Ofertas y descuentos especiales', imagen: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Producto ejemplo 1',
      descripcion: 'Descripción de tu producto. Editá este texto desde el panel de administración.',
      precio: 25000, costoActual: 12000, stockActual: 50, marca: businessName,
      categorySlug: 'productos', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Producto ejemplo 2',
      descripcion: 'Descripción de tu producto. Podés agregar fotos, precio y stock desde el admin.',
      precio: 18500, costoActual: 9000, stockActual: 30, marca: businessName,
      categorySlug: 'productos', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Servicio ejemplo',
      descripcion: 'Descripción de tu servicio. Editá todos los detalles desde el panel.',
      precio: 45000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'servicios', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Bienvenidos a ${businessName}`,
      subtitulo: 'Tu negocio online, listo para crecer',
      descripcion: 'Editá este texto, subí tus productos y empezá a vender.',
      badge: 'Demo activa 7 días',
      ctaLabel: 'Ver productos',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
