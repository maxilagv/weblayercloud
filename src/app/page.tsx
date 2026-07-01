import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, pageJsonLd } from '@/lib/seo';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = buildMetadata("home");

export default function Page() {
  return (
    <>
      <JsonLd data={pageJsonLd("home")} />
      <HomePageClient />
    </>
  );
}
