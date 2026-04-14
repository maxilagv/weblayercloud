import { type MetaFunction } from 'react-router';
import TopicPage from '../components/marketing/TopicPage';
import { breadcrumbJsonLd, buildMeta, serviceJsonLd } from '../lib/seo';

const relatedLinks = [
  {
    href: '/integraciones-empresariales',
    label: 'Integraciones empresariales',
    description: 'Las migraciones reales suelen requerir convivir por etapas con sistemas anteriores.',
  },
  {
    href: '/arquitectura-microservicios',
    label: 'Microservicios',
    description: 'Una arquitectura modular facilita transiciones por dominio y reduce riesgo operativo.',
  },
  {
    href: '/saas-java',
    label: 'SaaS en Java',
    description: 'La base técnica elegida para sostener reglas y migraciones sin improvisación.',
  },
  {
    href: '/contacto',
    label: 'Solicitar diagnóstico',
    description: 'La migración empieza entendiendo datos, procesos y sistemas actuales.',
  },
];

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'Migración de sistemas legacy a una plataforma moderna',
    description:
      'Cómo MotorCloud plantea migraciones desde Excel, sistemas cerrados o aplicaciones aisladas hacia una arquitectura moderna y operable.',
    path: '/migracion-sistemas-legacy',
    keywords: ['migracion sistemas legacy', 'migracion erp', 'excel a saas', 'transformacion operativa', 'motorcloud'],
  });

export default function LegacyMigrationRoute() {
  return (
    <TopicPage
      eyebrow="Migración legacy"
      title="Migrar no es tirar todo y empezar de cero. Es mover una operación real sin romperla."
      intro="La mayoría de las empresas llegan a una nueva plataforma cuando ya dependen de planillas, circuitos manuales, ERPs viejos o aplicaciones que no se hablan entre sí."
      emphasis="MotorCloud plantea la migración como transición controlada: entender dominios, aislar riesgos, mover datos con criterio y convivir por etapas cuando hace falta."
      highlights={[
        { label: 'Entrada', value: 'Excel + Legacy', detail: 'Punto habitual cuando la operación ya está repartida en herramientas que no comparten verdad.' },
        { label: 'Método', value: 'Por etapas', detail: 'Primero mapa operativo, después dominios prioritarios, luego corte o convivencia controlada.' },
        { label: 'Meta', value: 'Continuidad', detail: 'Reducir riesgo operativo mientras la nueva plataforma toma el control.' },
      ]}
      sections={[
        {
          title: 'La primera tarea es entender el sistema actual',
          description:
            'Antes de mover datos hay que entender qué reglas realmente usa la operación, qué decisiones toma cada equipo y dónde viven hoy los estados críticos.',
          bullets: [
            'No todo lo que existe en el legacy merece migrarse uno a uno.',
            'Hay que separar dato histórico, dato vivo y lógica realmente vigente.',
            'Sin ese mapa, la migración solo copia desorden al sistema nuevo.',
          ],
        },
        {
          title: 'Convivencia temporal sin caos',
          description:
            'En muchos casos conviene una transición con integraciones temporales, doble corrida o cortes parciales por dominio.',
          bullets: [
            'Catálogo y pricing pueden migrar antes que finanzas o CRM.',
            'Algunas fuentes externas siguen vivas un tiempo mientras el nuevo núcleo toma forma.',
            'La trazabilidad y los criterios de corte importan más que la velocidad aparente.',
          ],
        },
        {
          title: 'La migración termina cuando el equipo opera mejor',
          description:
            'El éxito no es solo pasar datos. Es lograr que la plataforma nueva permita decidir, vender y ejecutar mejor que antes.',
          bullets: [
            'Menos pasos manuales y menos dependencia de personas clave.',
            'Mayor visibilidad operativa sobre órdenes, stock, pagos y clientes.',
            'Una base lista para seguir creciendo sin volver al parche permanente.',
          ],
        },
      ]}
      relatedLinks={relatedLinks}
      jsonLd={[
        serviceJsonLd({
          name: 'Migración de sistemas legacy MotorCloud',
          description:
            'Transición desde sistemas legacy, Excel o aplicaciones aisladas hacia una plataforma moderna.',
          path: '/migracion-sistemas-legacy',
          serviceType: 'Migración de sistemas legacy',
        }),
        breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Migración de sistemas legacy', path: '/migracion-sistemas-legacy' },
        ]),
      ]}
    />
  );
}
