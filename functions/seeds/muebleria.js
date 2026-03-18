'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedMuebleria(businessName) {
  const categories = [
    { nombre: 'Living', slug: 'living', descripcion: 'Sillones, sofás y mesas de centro', imagen: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Dormitorio', slug: 'dormitorio', descripcion: 'Camas, placares y mesas de luz', imagen: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Comedor', slug: 'comedor', descripcion: 'Mesas, sillas y vajilleros', imagen: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Oficina', slug: 'oficina', descripcion: 'Escritorios, sillas ergonómicas y bibliotecas', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Sillón 3 cuerpos tapizado en tela',
      descripcion: 'Estructura de madera maciza con tapizado en tela de alta resistencia. Disponible en gris, beige y verde. Ideal para living.',
      precio: 485000, costoActual: 280000, stockActual: 8, marca: 'HomeStyle',
      categorySlug: 'living', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Mesa ratona vidrio templado',
      descripcion: 'Mesa de centro con tapa de vidrio templado 8mm y base de acero negro mate. 90x50cm.',
      precio: 185000, costoActual: 98000, stockActual: 14, marca: 'Metalia',
      categorySlug: 'living', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Placard 3 puertas corredizas',
      descripcion: 'Placard melamina blanca con espejo central. Incluye 2 cajones internos y barra para ropa. 1.80m ancho.',
      precio: 620000, costoActual: 370000, stockActual: 5, marca: 'MelaFlex',
      categorySlug: 'dormitorio', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Cama matrimonial con cajones',
      descripcion: 'Sommier 160x200 con 4 cajones de almacenamiento. Respaldo tapizado en ecocuero. Incluye colchón.',
      precio: 890000, costoActual: 540000, stockActual: 3, marca: 'DuermiPlus',
      categorySlug: 'dormitorio', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Mesa de comedor extensible 6 personas',
      descripcion: 'Mesa de madera maciza con extensión central. Pasa de 1.40m a 1.80m. Acabado roble natural.',
      precio: 420000, costoActual: 250000, stockActual: 6, marca: 'Madera Viva',
      categorySlug: 'comedor', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Sillas comedor tapizadas x4',
      descripcion: 'Set de 4 sillas con estructura metálica y asiento tapizado en tela antimanchas. Color negro o blanco.',
      precio: 280000, costoActual: 155000, stockActual: 10, marca: 'SitWell',
      categorySlug: 'comedor', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Escritorio en L melamina',
      descripcion: 'Escritorio esquinero con estante superior y cajón con cerradura. 160x120cm. Color wengué.',
      precio: 340000, costoActual: 195000, stockActual: 7, marca: 'OficePlus',
      categorySlug: 'oficina', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Silla ejecutiva ergonómica',
      descripcion: 'Silla de oficina con apoyabrazos regulables, altura ajustable y respaldo lumbar. Garantía 2 años.',
      precio: 215000, costoActual: 118000, stockActual: 12, marca: 'ErgoPro',
      categorySlug: 'oficina', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Bienvenidos a ${businessName}`,
      subtitulo: 'Calidad y estilo para tu hogar',
      descripcion: 'Muebles diseñados para durar. Fabricación propia con materiales seleccionados.',
      badge: 'Envío gratis CABA y GBA',
      ctaLabel: 'Ver catálogo',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
    {
      titulo: 'Nuevos modelos 2025',
      subtitulo: 'Dormitorios y livings renovados',
      descripcion: 'Explorá nuestra colección actualizada con los últimos diseños en muebles.',
      badge: 'Hasta 18 cuotas sin interés',
      ctaLabel: 'Ver novedades',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop',
      orden: 2, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName,
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    whatsappNumber: '',
    updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
