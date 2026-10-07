import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FeatureCards } from '@/components/sections/feature-cards';
import { FinalCta } from '@/components/sections/final-cta';
import { PageHero } from '@/components/sections/page-hero';
import { ServicesGrid } from '@/components/sections/services-grid';
import { SimulatorSection } from '@/components/sections/simulator-section';
import { ButtonLink } from '@/components/ui/button';
import { getIndustry, INDUSTRY_SLUGS, isIndustrySlug } from '@/config/industries';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

type Props = PageProps<'/[locale]/industrias/[slug]'>;

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isIndustrySlug(slug)) return {};
  const t = await getTranslations({ locale: locale as Locale, namespace: 'industries.items' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/industrias/[slug]', params: { slug } },
    title: t(`${slug}.metaTitle`),
    description: t(`${slug}.metaDescription`),
  });
}

/** Plantilla de industria: reutiliza el simulador con el giro preseleccionado. */
export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  if (!isIndustrySlug(slug)) notFound();

  const industry = getIndustry(slug);
  const t = await getTranslations('industries.items');
  const td = await getTranslations('industryDetail');
  const th = await getTranslations('hero');
  const tc = await getTranslations('common');
  const name = t(`${slug}.name`);

  return (
    <>
      <PageHero
        eyebrow={name}
        title={t(`${slug}.heroTitle`)}
        subtitle={t(`${slug}.heroSubtitle`)}
        icon={industry.icon}
        actions={
          <>
            <ButtonLink
              href={{ pathname: '/industrias/[slug]', params: { slug }, hash: 'simulador' }}
              size="lg"
            >
              {th('ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/contacto" variant="secondary" size="lg">
              {tc('talkToExpert')}
            </ButtonLink>
          </>
        }
      />

      <FeatureCards
        columns={3}
        eyebrow={td('challengesEyebrow')}
        title={td('challengesTitle', { industry: name })}
        items={t.raw(`${slug}.challenges`) as { title: string; text: string }[]}
      />

      <ServicesGrid
        only={industry.services}
        eyebrow={td('servicesEyebrow')}
        title={td('servicesTitle', { industry: name })}
      />

      <SimulatorSection
        initialIndustry={industry.simulatorIndustry}
        title={td('simulatorTitle', { industry: name })}
        subtitle={td('simulatorSubtitle')}
      />

      <FinalCta />
    </>
  );
}
