import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, pageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("campus");

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={pageJsonLd("campus")} />
      {children}
    </>
  );
}
