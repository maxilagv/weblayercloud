import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*?utm_*", "/*?fbclid=", "/*?gclid="],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
