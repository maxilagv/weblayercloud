import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = buildMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <JsonLd data={pageJsonLd("contact")} />
      <ContactPageClient />
    </>
  );
}
