import { type MetaFunction } from 'react-router';
import TopicPage from '../components/marketing/TopicPage';
import { breadcrumbJsonLd, buildMeta, serviceJsonLd } from '../lib/seo';

const relatedLinks = [
  {
    href: '/arquitectura-microservicios',
    label: 'Microservicios',
    description: 'La base para desacoplar conectores externos del núcleo del producto.',
  },
  {
    href: '/saas-java',
    label: 'SaaS en Java',
    description: 'La decisión técnica que sostiene reglas e integraciones con mayor disciplina.',
  },
  {
    href: '/migracion-sistemas-legacy',
    label: 'Migración legacy',
    description: 'La mayoría de las migraciones reales dependen de integraciones intermedias bien diseñadas.',
  },
  {
    href: '/servicios',
    label: 'Servicios',
    description: 'La traducción comercial de esta capa técnica en proyectos concretos.',
  },
];

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'Integraciones empresariales para SaaS y operación B2B',
    description:
      'Cómo MotorCloud diseña APIs, webhooks y conectores para pagos, marketplaces y terceros sin romper el núcleo operativo.',
    path: '/integraciones-empresariales',
    keywords: ['integraciones empresariales', 'apis b2b', 'webhooks', 'marketplaces', 'erp integration'],
  });

export default function EnterpriseIntegrationsRoute() {
  return (
    <TopicPage
      eyebrow="Integraciones empresariales"
      title="Integrar no es pegar APIs. Es decidir dónde termina tu producto y dónde empieza el borde con terceros."
      intro="MotorCloud necesita convivir con procesadores de pago, marketplaces, ERPs externos, notificaciones y sistemas previos. Eso obliga a diseñar una capa de integración seria."
      emphasis="La integración correcta no invade todo el sistema. Se encapsula, se observa y se vuelve reemplazable cuando el negocio cambia de proveedor o canal."
      highlights={[
        { label: 'Canales', value: 'API + Webhooks', detail: 'La plataforma puede hablar con terceros por contratos claros y reacciones asíncronas.' },
        { label: 'Objetivo', value: 'Aislamiento', detail: 'Las reglas del producto no deberían depender de cada proveedor externo.' },
        { label: 'Resultado', value: 'Control', detail: 'Más trazabilidad cuando un tercero falla, cambia o responde fuera de tiempo.' },
      ]}
      sections={[
        {
          title: 'El núcleo de negocio no se negocia',
          description:
            'Pagos, marketplaces o ERPs externos resuelven una parte del flujo. La lógica comercial central sigue viviendo dentro del producto.',
          bullets: [
            'Precios, permisos, stock y estados no deberían estar enterrados en adaptadores externos.',
            'La capa de integración traduce contratos, no define la operación.',
            'El sistema sigue entendiendo sus entidades aunque cambien los proveedores conectados.',
          ],
        },
        {
          title: 'Webhooks y eventos con trazabilidad',
          description:
            'Las integraciones reales fallan, se retrasan y devuelven estados parciales. Por eso el sistema necesita trazabilidad, reintentos y observabilidad.',
          bullets: [
            'Cada callback relevante debe poder rastrearse desde el proveedor hasta el impacto interno.',
            'Las colas ayudan a desacoplar la velocidad del tercero del flujo principal del producto.',
            'La auditoría evita que un error de integración se convierta en un misterio operativo.',
          ],
        },
        {
          title: 'Conectores reemplazables',
          description:
            'Una plataforma sana asume que algún proveedor va a cambiar. La arquitectura tiene que tolerarlo sin reescribir todo.',
          bullets: [
            'Los adaptadores encapsulan el detalle de cada proveedor.',
            'El dominio interno conserva contratos propios y más estables.',
            'Eso permite crecer por canales sin deformar el sistema central.',
          ],
        },
      ]}
      relatedLinks={relatedLinks}
      jsonLd={[
        serviceJsonLd({
          name: 'Integraciones empresariales MotorCloud',
          description:
            'Diseño de APIs, webhooks y conectores para plataformas B2B con operación compleja.',
          path: '/integraciones-empresariales',
          serviceType: 'Integraciones empresariales',
        }),
        breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Integraciones empresariales', path: '/integraciones-empresariales' },
        ]),
      ]}
    />
  );
}
