import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'LayerCloud — Software a medida, construido capa por capa',
  description: 'Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes, diseñados desde cero.',
  alternates: {
    canonical: 'https://weblayer.cloud/',
  },
  openGraph: {
    type: 'website',
    siteName: 'LayerCloud',
    title: 'LayerCloud — Software a medida, construido capa por capa',
    description: 'Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes — diseñados desde cero.',
    url: 'https://weblayer.cloud/',
    images: [
      {
        url: 'https://weblayer.cloud/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LayerCloud — Software a medida, construido capa por capa',
    description: 'Equipo de ingeniería de software a medida. Webs y ecosistemas de venta, CRM/ERP con IA, campus virtuales y automatizaciones inteligentes — diseñados desde cero.',
    images: ['https://weblayer.cloud/og-image.png'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
