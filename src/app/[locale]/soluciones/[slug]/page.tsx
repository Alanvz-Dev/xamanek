import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/sections/cta-band';
import { Faq, type FaqItem } from '@/components/sections/faq';
import { FeatureCards } from '@/components/sections/feature-cards';
import { PageHero } from '@/components/sections/page-hero';
import { Process } from '@/components/sections/process';
import { ServicesGrid } from '@/components/sections/services-grid';
import { ButtonAnchor, ButtonLink } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { getService, isServiceSlug, SERVICE_SLUGS } from '@/config/services';
import { whatsappLink } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

type Props = PageProps<'/[locale]/soluciones/[slug]'>;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const t = await getTranslations({ locale: locale as Locale, namespace: 'services.items' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/soluciones/[slug]', params: { slug } },
    title: t(`${slug}.metaTitle`),
    description: t(`${slug}.metaDescription`),
  });
}

/**
 * Plantilla de servicio: hero, beneficios, cómo funciona, FAQ y CTA.
 * Solo Odoo (hasSimulator) enlaza al simulador; el resto lleva CTA de contacto.
 */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();

  const service = getService(slug);
  const ts = await getTranslations('services');
  const t = await getTranslations('services.items');
  const td = await getTranslations('serviceDetail');
  const tc = await getTranslations('common');
  const tw = await getTranslations('whatsapp');

  const contactHref = { pathname: '/contacto', query: { servicio: slug } } as const;
  const whatsapp = whatsappLink(`${tw('message')} (${t(`${slug}.name`)})`);

  const whatsappButton = (
    <ButtonAnchor
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      size="lg"
    >
      <WhatsAppIcon className="size-5" />
      {tc('talkToExpert')}
    </ButtonAnchor>
  );

  return (
    <>
      <PageHero
        eyebrow={t(`${slug}.name`)}
        title={t(`${slug}.heroTitle`)}
        subtitle={t(`${slug}.heroSubtitle`)}
        icon={service.icon}
        actions={
          service.hasSimulator ? (
            <>
              <ButtonLink href={{ pathname: '/', hash: 'simulador' }} size="lg">
                {td('simulatorCta')}
              </ButtonLink>
              <ButtonLink href={contactHref} variant="secondary" size="lg">
                {tc('bookCall')}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href={contactHref} size="lg">
                {tc('bookCall')}
              </ButtonLink>
              {whatsappButton}
            </>
          )
        }
      />

      <FeatureCards
        eyebrow={td('benefitsEyebrow')}
        title={td('benefitsTitle')}
        items={t.raw(`${slug}.benefits`) as { title: string; text: string }[]}
      />

      <Process
        tone="dark"
        eyebrow={td('howEyebrow')}
        title={td('howTitle')}
        steps={t.raw(`${slug}.steps`) as { title: string; text: string }[]}
      />

      {service.hasSimulator ? (
        <CtaBand
          tone="night"
          grid
          title={td('simulatorTitle')}
          subtitle={td('simulatorSubtitle')}
          actions={
            <ButtonLink href={{ pathname: '/', hash: 'simulador' }} size="lg">
              {td('simulatorCta')}
            </ButtonLink>
          }
        />
      ) : null}

      <Faq
        eyebrow={td('faqEyebrow')}
        title={td('faqTitle')}
        items={t.raw(`${slug}.faq`) as FaqItem[]}
      />

      <CtaBand
        title={td('ctaTitle')}
        subtitle={td('ctaSubtitle')}
        actions={
          <>
            <ButtonLink href={contactHref} size="lg">
              {tc('bookCall')}
            </ButtonLink>
            {whatsappButton}
          </>
        }
      />

      <ServicesGrid
        tone="light"
        only={SERVICE_SLUGS.filter((s) => s !== slug)}
        eyebrow={ts('eyebrow')}
        title={td('relatedTitle')}
      />
    </>
  );
}
