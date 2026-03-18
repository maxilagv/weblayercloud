'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedIndumentaria(businessName) {
  const categories = [
    { nombre: 'Mujer', slug: 'mujer', descripcion: 'Ropa y accesorios para mujer', imagen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Hombre', slug: 'hombre', descripcion: 'Ropa y accesorios para hombre', imagen: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Niños', slug: 'ninos', descripcion: 'Indumentaria infantil', imagen: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Cinturones, carteras y más', imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Vestido midi estampado floral',
      descripcion: 'Vestido hasta la rodilla con estampado floral. Tela fresca 100% viscosa. Talles S al XL.',
      precio: 28500, costoActual: 14000, stockActual: 25, marca: 'Primaflor',
      categorySlug: 'mujer', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Campera impermeable mujer',
      descripcion: 'Campera con capucha desmontable. Impermeable al agua. Colores: negro, azul marino, verde.',
      precio: 72000, costoActual: 40000, stockActual: 15, marca: 'OutDoor',
      categorySlug: 'mujer', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Jean slim fit hombre',
      descripcion: 'Jean de corte slim, tela denim 98% algodón 2% elastano. Talles 28 al 40.',
      precio: 32000, costoActual: 16500, stockActual: 40, marca: 'DenimCo',
      categorySlug: 'hombre', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Remera básica pack x3',
      descripcion: 'Pack de 3 remeras básicas cuello redondo. 100% algodón peinado. Colores surtidos.',
      precio: 18500, costoActual: 9000, stockActual: 60, marca: 'BasicWear',
      categorySlug: 'hombre', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Buzo canguro niño',
      descripcion: 'Buzo con capucha y bolsillo frontal. Tela rompeviento. Talles 2 al 14 años.',
      precio: 22000, costoActual: 11500, stockActual: 30, marca: 'KidsLine',
      categorySlug: 'ninos', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Mochila escolar resistente',
      descripcion: 'Mochila con múltiples compartimentos, porta-notebook y refuerzo en costuras. 25 litros.',
      precio: 35000, costoActual: 18000, stockActual: 20, marca: 'BackPack Pro',
      categorySlug: 'accesorios', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Cinturón cuero legítimo',
      descripcion: 'Cinturón de cuero vacuno curtido. Hebilla metálica. Largo ajustable. Colores: negro y marrón.',
      precio: 12500, costoActual: 6000, stockActual: 35, marca: 'Cuero Fino',
      categorySlug: 'accesorios', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4061?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pantalón chino gabardina',
      descripcion: 'Pantalón de gabardina slim con cierre y bolsillos diagonales. Talles 38 al 50.',
      precio: 27500, costoActual: 14000, stockActual: 22, marca: 'Urban Fit',
      categorySlug: 'hombre', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Nueva colección en ${businessName}`,
      subtitulo: 'Moda de calidad para toda la familia',
      descripcion: 'Tendencias de la temporada con los mejores precios.',
      badge: 'Envío gratis en compras +$40.000',
      ctaLabel: 'Ver colección',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
    {
      titulo: 'Rebajas de temporada',
      subtitulo: 'Hasta 40% OFF en selección de productos',
      descripcion: 'Aprovechá los precios de fin de temporada en indumentaria seleccionada.',
      badge: 'Stock limitado',
      ctaLabel: 'Ver ofertas',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&auto=format&fit=crop',
      orden: 2, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
