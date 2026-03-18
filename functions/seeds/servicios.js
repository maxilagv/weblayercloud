'use strict';

const { FieldValue } = require('firebase-admin/firestore');
const now = () => FieldValue.serverTimestamp();

module.exports = function seedServicios(businessName) {
  const categories = [
    { nombre: 'Consultoría', slug: 'consultoria', descripcion: 'Servicios de asesoramiento profesional', imagen: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop', orden: 1, activo: true, createdAt: now() },
    { nombre: 'Diseño', slug: 'diseno', descripcion: 'Diseño gráfico, web y de marca', imagen: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop', orden: 2, activo: true, createdAt: now() },
    { nombre: 'Capacitación', slug: 'capacitacion', descripcion: 'Cursos y talleres profesionales', imagen: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop', orden: 3, activo: true, createdAt: now() },
    { nombre: 'Packs', slug: 'packs', descripcion: 'Paquetes combinados de servicios', imagen: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop', orden: 4, activo: true, createdAt: now() },
  ];

  const products = [
    {
      nombre: 'Consultoría estratégica — sesión 2hs',
      descripcion: 'Sesión de diagnóstico y planificación estratégica para tu negocio. Incluye informe ejecutivo post-sesión.',
      precio: 85000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'consultoria', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Auditoría procesos internos',
      descripcion: 'Relevamiento completo de procesos operativos con identificación de cuellos de botella y propuesta de mejora.',
      precio: 220000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'consultoria', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Diseño de identidad visual completa',
      descripcion: 'Logotipo, paleta de colores, tipografías y manual de marca. Incluye 3 revisiones. Entrega en 15 días hábiles.',
      precio: 180000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'diseno', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Landing page profesional',
      descripcion: 'Diseño y desarrollo de landing page. Responsive, optimizada para SEO y conversión. Entrega en 10 días.',
      precio: 280000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'diseno', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Taller gestión financiera PyME — 8hs',
      descripcion: 'Capacitación en gestión financiera básica: presupuestos, flujo de caja y punto de equilibrio. Grupal hasta 10 personas.',
      precio: 95000, costoActual: 0, stockActual: 20, marca: businessName,
      categorySlug: 'capacitacion', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Curso marketing digital — 16hs',
      descripcion: 'Curso online de marketing digital: redes sociales, publicidad paga y email marketing. Con certificado.',
      precio: 48000, costoActual: 0, stockActual: 50, marca: businessName,
      categorySlug: 'capacitacion', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pack Arranque — Consultoría + Identidad',
      descripcion: 'Paquete para emprendedores: 2 sesiones de consultoría + diseño de identidad visual completa. Ahorrás 20%.',
      precio: 240000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'packs', activo: true, destacado: true, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
    {
      nombre: 'Pack Escala — 3 meses acompañamiento',
      descripcion: 'Acompañamiento mensual por 3 meses: revisión de métricas, ajustes de estrategia y soporte prioritario.',
      precio: 420000, costoActual: 0, stockActual: 999, marca: businessName,
      categorySlug: 'packs', activo: true, destacado: false, priceLocked: false,
      imagenes: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop'],
      createdAt: now(), updatedAt: now(),
    },
  ];

  const landingHeroes = [
    {
      titulo: `Hacé crecer tu negocio con ${businessName}`,
      subtitulo: 'Consultoría, diseño y capacitación profesional',
      descripcion: 'Soluciones concretas para PyMEs y emprendedores que quieren escalar.',
      badge: 'Primera consulta gratis',
      ctaLabel: 'Ver servicios',
      ctaUrl: 'products',
      imagenDesktop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&auto=format&fit=crop',
      imagenMobile: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
      orden: 1, activo: true, createdAt: now(),
    },
  ];

  const businessConfig = {
    businessName, businessPhone: '', businessEmail: '',
    businessAddress: '', whatsappNumber: '', updatedAt: now(),
  };

  return { categories, products, landingHeroes, businessConfig };
};
