import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";
import CrmPageClient from "./CrmPageClient";

export const metadata: Metadata = buildMetadata("crm");

export default function CRMServicesPage() {
  return (
    <>
      <JsonLd data={pageJsonLd("crm")} />
      <CrmPageClient />
    </>
  );
}
