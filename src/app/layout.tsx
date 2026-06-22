import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import "@/styles/layercloud.css";
import "@/styles/home.css";
import "@/styles/inner.css";
import "@/styles/servicios.css";

import { LangProvider } from "@/context/LangContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const instrument = Instrument_Serif({ weight: ["400"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#14131A",
};

export const metadata: Metadata = {
  title: "LayerCloud — Software a medida, construido capa por capa",
  description: "Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes, diseñados desde cero.",
  openGraph: {
    type: "website",
    siteName: "LayerCloud",
    title: "LayerCloud — Software a medida, construido capa por capa",
    description: "Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes — diseñados desde cero.",
    images: [{ url: "https://weblayer.cloud/og-image.png", width: 1200, height: 630 }],
    url: "https://weblayer.cloud/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LayerCloud — Software a medida, construido capa por capa",
    description: "Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes — diseñados desde cero.",
    images: ["https://weblayer.cloud/og-image.png"],
  },
  alternates: {
    canonical: "https://weblayer.cloud/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-lang="es">
      <body className={`${hanken.variable} ${instrument.variable} ${jetbrains.variable} grain`}>
        <LangProvider>
          <Navigation />
          {children}
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
