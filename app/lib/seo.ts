export const SITE_NAME = 'MotorCloud';
export const SITE_URL = 'https://motor.cloud';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`;

export interface SeoMetaInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  robots?: string;
  type?: 'website' | 'article';
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ServiceSchemaInput {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function canonicalUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  return normalizedPath === '/' ? SITE_URL : `${SITE_URL}${normalizedPath}`;
}

export function buildMeta(input: SeoMetaInput) {
  const canonical = canonicalUrl(input.path);
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const robots = input.robots ?? 'index,follow';
  const type = input.type ?? 'website';
  const fullTitle = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} | ${SITE_NAME}`;

  const meta = [
    { title: fullTitle },
    { name: 'description', content: input.description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: input.description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'es_AR' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: image },
  ];

  if (input.keywords?.length) {
    meta.push({ name: 'keywords', content: input.keywords.join(', ') });
  }

  return meta;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.svg`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      addressLocality: 'Buenos Aires',
    },
    sameAs: ['https://motor.cloud'],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-AR',
  };
}

export function softwareApplicationJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function serviceJsonLd(input: ServiceSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    url: canonicalUrl(input.path),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Argentina',
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqJsonLd(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}
