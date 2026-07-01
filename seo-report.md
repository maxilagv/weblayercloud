# SEO Report

## Resumen ejecutivo
- Estado inicial: metadata duplicada entre layout/page, varias rutas cliente sin metadata propia, sitemap con `new Date()` en cada build y structured data ausente.
- Cambios implementados: capa SEO central, wrappers server por ruta critica, canonical absoluto, Open Graph/Twitter consistente, JSON-LD parseable, robots/sitemap desde una sola fuente y auditoria ejecutable.
- Riesgos restantes: validar rich results y sitemap en herramientas externas despues del deploy; medir Core Web Vitals de campo cuando haya trafico suficiente.

## Rutas revisadas
| Ruta | Indexable | Canonical | Title | Schema | Sitemap | Estado |
|---|---:|---|---|---|---|---|
| `/` | Si | `https://weblayer.cloud` | Unico | WebPage + Organization + WebSite | Si | OK |
| `/servicios` | Si | `https://weblayer.cloud/servicios` | Unico | CollectionPage + Breadcrumb | Si | OK |
| `/servicios/web` | Si | `https://weblayer.cloud/servicios/web` | Unico | WebPage + Service + Breadcrumb | Si | OK |
| `/servicios/crm` | Si | `https://weblayer.cloud/servicios/crm` | Unico | WebPage + Service + Breadcrumb | Si | OK |
| `/servicios/campus` | Si | `https://weblayer.cloud/servicios/campus` | Unico | WebPage + Service + Breadcrumb | Si | OK |
| `/servicios/ia` | Si | `https://weblayer.cloud/servicios/ia` | Unico | WebPage + Service + Breadcrumb | Si | OK |
| `/contacto` | Si | `https://weblayer.cloud/contacto` | Unico | ContactPage + Breadcrumb | Si | OK |

## Cambios tecnicos
- Metadata: centralizada en `src/lib/seo.ts` y aplicada con `buildMetadata`.
- Structured data: `Organization`, `WebSite`, `WebPage`, `CollectionPage`, `ContactPage`, `Service` y `BreadcrumbList`.
- Sitemap: generado desde `indexablePages`, con `lastModified` estable.
- Robots: sitemap declarado, rastreo permitido, parametros de tracking fuera de crawl.
- Renderizado: paginas cliente criticas envueltas por Server Components para metadata inicial.
- Pruebas: `npm run seo:audit` valida HTML real de rutas criticas.

## Pruebas ejecutadas
- `npm.cmd run build`: OK.
- `npm.cmd run lint`: OK con warnings existentes.
- `npm.cmd run seo:audit`: OK en 7 rutas criticas.

## Acciones manuales pendientes
- Enviar `https://weblayer.cloud/sitemap.xml` en Google Search Console.
- Enviar sitemap en Bing Webmaster Tools.
- Validar JSON-LD con Rich Results Test y Schema Markup Validator.
- Revisar Core Web Vitals de campo despues del deploy.
- Conectar/confirmar medicion de conversiones y eventos organicos.
