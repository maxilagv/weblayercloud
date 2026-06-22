import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/nosotros'],
    },
    sitemap: 'https://weblayer.cloud/sitemap.xml',
  };
}
