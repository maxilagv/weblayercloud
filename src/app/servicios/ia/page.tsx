import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";
import IAClientPage from "./IAClientPage";

export const metadata: Metadata = buildMetadata("ai");

export default function IAPage() {
  return (
    <>
      <JsonLd data={pageJsonLd("ai")} />
      <IAClientPage />
    </>
  );
}
