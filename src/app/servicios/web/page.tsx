import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";
import WebPageClient from "./WebPageClient";

export const metadata: Metadata = buildMetadata("web");

export default function ServiciosWebPage() {
  return (
    <>
      <JsonLd data={pageJsonLd("web")} />
      <WebPageClient />
    </>
  );
}
