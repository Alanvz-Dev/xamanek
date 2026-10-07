import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Cases } from '@/components/sections/cases';
import { FinalCta } from '@/components/sections/final-cta';
import { Hero } from '@/components/sections/hero';
import { IndustriesGrid } from '@/components/sections/industries-grid';
import { Process } from '@/components/sections/process';
import { ServicesGrid } from '@/components/sections/services-grid';
import { SimulatorSection } from '@/components/sections/simulator-section';
import { TrustBar } from '@/components/sections/trust-bar';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta.home' });
  return buildMetadata({
    locale: locale as Locale,
    href: '/',
    title: t('title'),
    description: t('description'),
    absoluteTitle: true,
  });
}

/** Home: alterna secciones oscuras y claras. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <IndustriesGrid />
      <SimulatorSection />
      <Process />
      <Cases />
      <FinalCta />
    </>
  );
}
