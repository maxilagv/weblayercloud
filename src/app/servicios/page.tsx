import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";
import ServiciosPageClient from "./ServiciosPageClient";

export const metadata: Metadata = buildMetadata("services");

export default function ServiciosPage() {
  return (
    <>
      <JsonLd data={pageJsonLd("services")} />
      <ServiciosPageClient />
    </>
  );
}
