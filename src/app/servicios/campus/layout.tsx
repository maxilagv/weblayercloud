import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Virtual — LayerCloud",
  description: "Plataforma educativa a medida: gestión de cursos, evaluaciones, certificaciones, analítica educativa y módulos por rol.",
  openGraph: {
    type: "website",
    siteName: "LayerCloud",
    title: "Campus Virtual — LayerCloud",
    description: "Plataforma educativa avanzada para instituciones. Paneles por rol, notificaciones a familias, boletines, asistencia, certificaciones y votaciones estudiantiles.",
    images: [{ url: "https://weblayer.cloud/og-image.png", width: 1200, height: 630 }],
    url: "https://weblayer.cloud/servicios/campus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Virtual — LayerCloud",
    description: "Plataforma educativa avanzada para instituciones. Paneles por rol, notificaciones a familias, boletines, asistencia, certificaciones y votaciones estudiantiles.",
    images: ["https://weblayer.cloud/og-image.png"],
  },
  alternates: {
    canonical: "https://weblayer.cloud/servicios/campus",
  },
};

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
