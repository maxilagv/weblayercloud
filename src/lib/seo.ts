import type { Metadata, MetadataRoute } from "next";

export type SeoPageKey =
  | "home"
  | "services"
  | "web"
  | "crm"
  | "campus"
  | "ai"
  | "contact";

export type SeoPage = {
  key: SeoPageKey;
  path: string;
  title: string;
  absoluteTitle?: string;
  description: string;
  h1: string;
  intent: "commercial" | "transactional" | "navigational";
  primaryEntity: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
  image?: string;
  serviceType?: string;
  breadcrumb: Array<{ name: string; path: string }>;
  keywords: string[];
};

export const site = {
  name: "LayerCloud",
  legalName: "LayerCloud",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://weblayer.cloud",
  locale: "es_AR",
  language: "es",
  description:
    "Software a medida para empresas: webs, CRM/ERP, campus virtuales y automatizaciones con IA, construidos como una arquitectura operativa conectada.",
  email: "soporte@weblayer.cloud",
  logo: "/logo-layercloud.svg",
  ogImage: "/og-image.png",
  sameAs: [] as string[],
};

export const seoPages: Record<SeoPageKey, SeoPage> = {
  home: {
    key: "home",
    path: "/",
    absoluteTitle: "LayerCloud - Software a medida, construido capa por capa",
    title: "Software a medida, construido capa por capa",
    description:
      "Creamos webs, CRM/ERP, campus virtuales y automatizaciones con IA como una sola arquitectura para que tu negocio opere con claridad.",
    h1: "Construimos tu operacion capa por capa.",
    intent: "commercial",
    primaryEntity: "LayerCloud",
    priority: 1,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    breadcrumb: [{ name: "Inicio", path: "/" }],
    keywords: [
      "software a medida",
      "desarrollo de software",
      "automatizacion con IA",
      "CRM a medida",
      "ERP a medida",
      "campus virtual",
      "desarrollo web",
    ],
  },
  services: {
    key: "services",
    path: "/servicios",
    title: "Servicios de software a medida",
    description:
      "Explora las cuatro capas de LayerCloud: webs y comercio, CRM/ERP, campus virtual y automatizacion con IA para operaciones conectadas.",
    h1: "Elegí las capas que necesita tu operación.",
    intent: "commercial",
    primaryEntity: "Servicios LayerCloud",
    priority: 0.9,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
    ],
    keywords: ["servicios de software", "arquitectura de software", "software para empresas"],
  },
  web: {
    key: "web",
    path: "/servicios/web",
    title: "Webs y comercio a medida",
    description:
      "Landings, sitios institucionales, e-commerce, embudos y medicion de conversion conectados a tus datos desde el primer dia.",
    h1: "Webs y comercio para capturar, medir y convertir.",
    intent: "transactional",
    primaryEntity: "Webs y comercio",
    priority: 0.82,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    serviceType: "Web design and ecommerce development",
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: "Webs y comercio", path: "/servicios/web" },
    ],
    keywords: ["landing pages", "ecommerce a medida", "desarrollo web", "embudos de conversion"],
  },
  crm: {
    key: "crm",
    path: "/servicios/crm",
    title: "CRM y ERP a medida",
    description:
      "Sistemas CRM/ERP para ordenar ventas, administracion, operaciones, reportes y automatizaciones alrededor de tu proceso real.",
    h1: "Tu operación, en un solo sistema.",
    intent: "transactional",
    primaryEntity: "CRM / ERP a medida",
    priority: 0.82,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    serviceType: "Custom CRM and ERP software development",
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: "CRM / ERP", path: "/servicios/crm" },
    ],
    keywords: ["CRM a medida", "ERP a medida", "software operativo", "automatizacion comercial"],
  },
  campus: {
    key: "campus",
    path: "/servicios/campus",
    title: "Campus virtual a medida",
    description:
      "Plataforma educativa con roles, notas, boletines, asistencia, avisos, inscripciones y paneles para instituciones.",
    h1: "Campus virtual para instituciones educativas.",
    intent: "transactional",
    primaryEntity: "Campus virtual",
    priority: 0.82,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    serviceType: "Custom virtual campus and education platform development",
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: "Campus virtual", path: "/servicios/campus" },
    ],
    keywords: ["campus virtual", "plataforma educativa", "software escolar", "aula virtual"],
  },
  ai: {
    key: "ai",
    path: "/servicios/ia",
    title: "Automatizacion con IA",
    description:
      "Agentes y flujos de IA para captar leads, calificar prospectos, responder consultas, integrar herramientas y automatizar seguimiento.",
    h1: "Automatización con IA para procesos reales.",
    intent: "transactional",
    primaryEntity: "Automatizacion IA",
    priority: 0.82,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    serviceType: "AI automation and workflow integration",
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: "Automatizacion IA", path: "/servicios/ia" },
    ],
    keywords: ["automatizacion con IA", "agentes IA", "IA para empresas", "automatizacion de procesos"],
  },
  contact: {
    key: "contact",
    path: "/contacto",
    title: "Iniciar proyecto",
    description:
      "Contanos que proceso queres ordenar, automatizar o escalar. Diagnosticamos, diseñamos la arquitectura y construimos software a medida.",
    h1: "Construyamos el sistema que tu operación necesita.",
    intent: "transactional",
    primaryEntity: "Contacto LayerCloud",
    priority: 0.75,
    changeFrequency: "monthly",
    lastModified: "2026-06-29",
    image: site.ogImage,
    breadcrumb: [
      { name: "Inicio", path: "/" },
      { name: "Contacto", path: "/contacto" },
    ],
    keywords: ["cotizar software a medida", "iniciar proyecto software", "contacto desarrollo software"],
  },
};

export const indexablePages = Object.values(seoPages);

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}

export function getSeoPage(key: SeoPageKey) {
  return seoPages[key];
}

export function buildMetadata(key: SeoPageKey): Metadata {
  const page = getSeoPage(key);
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image ?? site.ogImage);
  const title = page.absoluteTitle ? { absolute: page.absoluteTitle } : page.title;
  const socialTitle = page.absoluteTitle ?? `${page.title} | ${site.name}`;

  return {
    title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: page.path,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: canonical,
      title: socialTitle,
      description: page.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${site.name} - ${page.primaryEntity}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(site.logo),
    email: site.email,
    sameAs: site.sameAs,
    description: site.description,
    knowsAbout: [
      "Software a medida",
      "CRM",
      "ERP",
      "Campus virtual",
      "Automatizacion con IA",
      "Desarrollo web",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: site.language,
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
}

export function webPageJsonLd(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": page.key === "contact" ? "ContactPage" : page.key === "services" ? "CollectionPage" : "WebPage",
    "@id": `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.absoluteTitle ?? `${page.title} | ${site.name}`,
    description: page.description,
    inLanguage: site.language,
    isPartOf: {
      "@id": `${absoluteUrl("/")}#website`,
    },
    about: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(page.image ?? site.ogImage),
      width: 1200,
      height: 630,
    },
  };
}

export function breadcrumbJsonLd(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(page: SeoPage) {
  if (!page.serviceType) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(page.path)}#service`,
    name: page.primaryEntity,
    serviceType: page.serviceType,
    description: page.description,
    provider: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    url: absoluteUrl(page.path),
  };
}

export function pageJsonLd(key: SeoPageKey) {
  const page = getSeoPage(key);
  return [webPageJsonLd(page), breadcrumbJsonLd(page), serviceJsonLd(page)].filter(Boolean);
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
