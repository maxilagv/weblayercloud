import { type MetaFunction } from 'react-router';
import TopicPage from '../components/marketing/TopicPage';
import { breadcrumbJsonLd, buildMeta, serviceJsonLd } from '../lib/seo';

const relatedLinks = [
  {
    href: '/arquitectura-microservicios',
    label: 'Arquitectura de microservicios',
    description: 'Separación de dominios, eventos y despliegues que no rompen toda la plataforma.',
  },
  {
    href: '/integraciones-empresariales',
    label: 'Integraciones empresariales',
    description: 'APIs, webhooks y conectores para convivir con terceros sin deuda de arquitectura.',
  },
  {
    href: '/migracion-sistemas-legacy',
    label: 'Migración legacy',
    description: 'Plan de transición para salir de planillas, ERPs cerrados o apps aisladas.',
  },
  {
    href: '/solucion',
    label: 'Ver plataforma',
    description: 'La capa comercial de MotorCloud y su arquitectura aplicada a operación real.',
  },
];

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'SaaS en Java para operaciones B2B',
    description:
      'Por qué MotorCloud usa Java como base para un SaaS con microservicios, integraciones empresariales y reglas operativas complejas.',
    path: '/saas-java',
    keywords: ['saas java', 'java para saas', 'backend java', 'plataforma b2b java', 'motorcloud'],
  });

export default function SaasJavaRoute() {
  return (
    <TopicPage
      eyebrow="SaaS en Java"
      title="Java sigue siendo una base fuerte cuando el SaaS tiene que operar en serio."
      intro="MotorCloud no usa Java por tradición. Lo usa porque el producto necesita un backend estable para flujos complejos, integraciones múltiples y crecimiento sostenido."
      emphasis="Cuando la plataforma mezcla catálogo, pricing, órdenes, pagos, usuarios, eventos y terceros, la prioridad deja de ser solo velocidad de prototipo. Pasa a ser coherencia operativa, mantenibilidad y observabilidad."
      highlights={[
        { label: 'Base técnica', value: 'Java', detail: 'Fuerte para reglas de negocio extensas y equipos que necesitan una plataforma predecible.' },
        { label: 'Operación', value: 'B2B', detail: 'Pensado para escenarios con más lógica, permisos, integraciones y trazabilidad.' },
        { label: 'Escala', value: '10+', detail: 'Microservicios coordinados sobre un núcleo de dominio consistente.' },
      ]}
      sections={[
        {
          title: 'Reglas complejas sin degradar la base',
          description:
            'En un SaaS operativo el problema no es solo atender requests. También es sostener reglas comerciales, permisos, estados y consistencia entre servicios.',
          bullets: [
            'Java permite mantener capas de dominio más estrictas y expresivas cuando el sistema crece.',
            'La plataforma no depende de scripts sueltos ni soluciones mágicas para la lógica central.',
            'Las decisiones sobre integridad, validación y contratos quedan mejor soportadas en una base tipada y madura.',
          ],
        },
        {
          title: 'Un stack más cómodo para equipos de largo plazo',
          description:
            'MotorCloud está pensado como producto, no como experimento. Eso cambia la forma en que se evalúan lenguaje, estructura del código y evolución técnica.',
          bullets: [
            'Un equipo puede trabajar por módulos sin romper contratos invisibles entre piezas del sistema.',
            'La plataforma crece mejor cuando la base favorece testing, refactors y observabilidad.',
            'Para integrar más microservicios y más dominios, la disciplina técnica deja de ser opcional.',
          ],
        },
        {
          title: 'Java como decisión de producto, no de marketing',
          description:
            'El objetivo no es “usar Java”. El objetivo es que el SaaS soporte operación real con menos deuda, menos ambigüedad y más control.',
          bullets: [
            'Mejor base para integraciones empresariales y backends con estados sensibles.',
            'Más claridad cuando la arquitectura mezcla API pública, jobs, eventos y sincronizaciones.',
            'Menos dependencia de parches rápidos que se vuelven permanentes.',
          ],
        },
      ]}
      relatedLinks={relatedLinks}
      jsonLd={[
        serviceJsonLd({
          name: 'MotorCloud SaaS en Java',
          description:
            'Base Java para un SaaS con microservicios, integraciones empresariales y operación B2B.',
          path: '/saas-java',
          serviceType: 'Arquitectura SaaS en Java',
        }),
        breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'SaaS en Java', path: '/saas-java' },
        ]),
      ]}
    />
  );
}
