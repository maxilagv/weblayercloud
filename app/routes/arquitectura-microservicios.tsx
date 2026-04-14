import { type MetaFunction } from 'react-router';
import TopicPage from '../components/marketing/TopicPage';
import { breadcrumbJsonLd, buildMeta, serviceJsonLd } from '../lib/seo';

const relatedLinks = [
  {
    href: '/saas-java',
    label: 'SaaS en Java',
    description: 'La base elegida para sostener dominios complejos, integraciones y evolución técnica.',
  },
  {
    href: '/integraciones-empresariales',
    label: 'Integraciones empresariales',
    description: 'Cómo conectar terceros sin contaminar el núcleo de negocio.',
  },
  {
    href: '/migracion-sistemas-legacy',
    label: 'Migración legacy',
    description: 'Cómo llevar una operación real a una arquitectura más modular sin cortar el negocio.',
  },
  {
    href: '/servicios/erp',
    label: 'Servicio ERP',
    description: 'La expresión comercial de esta arquitectura aplicada a procesos operativos.',
  },
];

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'Arquitectura de microservicios para SaaS B2B',
    description:
      'Cómo MotorCloud separa dominios, eventos e integraciones para operar un SaaS moderno con más de 10 microservicios coordinados.',
    path: '/arquitectura-microservicios',
    keywords: ['arquitectura microservicios', 'microservicios saas', 'event driven architecture', 'b2b software'],
  });

export default function MicroservicesRoute() {
  return (
    <TopicPage
      eyebrow="Microservicios"
      title="La arquitectura de microservicios sirve cuando cada dominio tiene que crecer sin arrastrar al resto."
      intro="MotorCloud usa microservicios porque el producto necesita separar responsabilidades reales: identidad, catálogo, pricing, órdenes, pagos, inventario, CRM, auditoría e integraciones."
      emphasis="La clave no está en partir todo por moda. Está en separar donde el dominio, la operación y el despliegue realmente lo justifican."
      highlights={[
        { label: 'Servicios', value: '10+', detail: 'Cada uno responde a dominios o capacidades con límites claros.' },
        { label: 'Modelo', value: 'Event-driven', detail: 'Los cambios importantes pueden propagarse sin acoplar todos los módulos entre sí.' },
        { label: 'Objetivo', value: 'Escala', detail: 'Desplegar, evolucionar y observar sin convertir la plataforma en un bloque inmóvil.' },
      ]}
      sections={[
        {
          title: 'Separar por dominio, no por capricho',
          description:
            'Una mala arquitectura de microservicios solo distribuye el caos. La útil separa capacidades con datos, contratos y responsabilidades claras.',
          bullets: [
            'Catálogo y pricing no evolucionan al mismo ritmo que pagos o CRM.',
            'Integraciones externas no deberían contaminar el núcleo del negocio.',
            'Auditoría, notificaciones y workflows suelen requerir ritmos distintos al API principal.',
          ],
        },
        {
          title: 'Eventos para coordinación, no para ocultar problemas',
          description:
            'Los eventos sirven cuando expresan cambios relevantes del negocio y permiten desacoplar reacciones secundarias del flujo principal.',
          bullets: [
            'Una orden creada puede disparar pagos, inventario, notificaciones y reporting sin meter todo en una sola transacción.',
            'Los consumers pueden evolucionar por separado si el contrato del evento es claro.',
            'La observabilidad tiene que acompañar: logs, traces y correlación entre servicios.',
          ],
        },
        {
          title: 'Despliegues más seguros y evolución por capas',
          description:
            'Microservicios bien definidos permiten mover una parte del sistema sin exigir una revalidación total de cada módulo.',
          bullets: [
            'Cada servicio tiene una superficie más acotada de cambio.',
            'La plataforma gana flexibilidad para crecer por dominios según prioridad de negocio.',
            'El equipo puede detectar cuellos de botella reales y no solo síntomas de un monolito saturado.',
          ],
        },
      ]}
      relatedLinks={relatedLinks}
      jsonLd={[
        serviceJsonLd({
          name: 'Arquitectura de microservicios MotorCloud',
          description:
            'Arquitectura distribuida para un SaaS con múltiples dominios, eventos e integraciones empresariales.',
          path: '/arquitectura-microservicios',
          serviceType: 'Arquitectura de microservicios',
        }),
        breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Arquitectura de microservicios', path: '/arquitectura-microservicios' },
        ]),
      ]}
    />
  );
}
