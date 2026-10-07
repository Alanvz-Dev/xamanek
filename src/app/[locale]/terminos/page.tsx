import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '@/components/sections/legal-page';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/terminos'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta.terms' });
  return buildMetadata({
    locale: locale as Locale,
    href: '/terminos',
    title: t('title'),
    description: t('description'),
  });
}

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
