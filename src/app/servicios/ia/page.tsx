import { Metadata } from "next";
import IAClientPage from "./IAClientPage";

export const metadata: Metadata = {
  title: "Automatización con IA — LayerCloud",
  description: "Agentes IA para procesos administrativos, ventas, soporte y marketing. Inteligencia que opera sola, 24/7.",
  openGraph: {
    type: "website",
    siteName: "LayerCloud",
    title: "Automatizaciones con IA — LayerCloud",
    description: "Agentes IA que captan leads, califican prospectos, actualizan tu CRM y reportan resultados sin intervención humana. Flujos completos de automatización empresarial.",
    images: [{ url: "https://weblayer.cloud/public/og-image.png", width: 1200, height: 630 }],
    url: "https://weblayer.cloud/servicios/ia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automatizaciones con IA — LayerCloud",
    description: "Agentes IA que captan leads, califican prospectos, actualizan tu CRM y reportan resultados sin intervención humana. Flujos completos de automatización empresarial.",
    images: ["https://weblayer.cloud/public/og-image.png"],
  },
  alternates: {
    canonical: "https://weblayer.cloud/servicios/ia",
  },
};

export default function IAPage() {
  return <IAClientPage />;
}
