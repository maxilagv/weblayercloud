import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import "@/styles/layercloud.css";
import "@/styles/home.css";
import "@/styles/inner.css";
import "@/styles/servicios.css";

import { LangProvider } from "@/context/LangContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, site, websiteJsonLd } from "@/lib/seo";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const instrument = Instrument_Serif({ weight: ["400"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#14131A",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: site.name,
  publisher: site.name,
  category: "technology",
  title: {
    default: "LayerCloud - Software a medida",
    template: "%s | LayerCloud",
  },
  description: site.description,
  keywords: [
    "software a medida",
    "desarrollo de software",
    "CRM a medida",
    "ERP a medida",
    "campus virtual",
    "automatizacion con IA",
    "desarrollo web",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: "LayerCloud - Software a medida",
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: "LayerCloud" }],
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LayerCloud - Software a medida",
    description: site.description,
    images: [site.ogImage],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo-layercloud.svg",
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
          <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
          <Navigation />
          {children}
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
