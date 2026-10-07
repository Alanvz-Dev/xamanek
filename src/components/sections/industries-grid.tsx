import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { Container, Section, SectionHeader } from '@/components/ui/section';
import { industries } from '@/config/industries';
import { Link } from '@/i18n/navigation';

/** Industrias (sección clara). Cada tarjeta lleva a /industrias/[slug]. */
export async function IndustriesGrid() {
  const t = await getTranslations('industries');

  return (
    <Section tone="light" id="industrias" className="py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        <Reveal stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <RevealItem key={industry.slug} as="li">
              <article className="group relative flex h-full flex-col rounded-2xl border border-edge bg-surface p-6 transition-[box-shadow,border-color] duration-300 hover:border-jade/50 hover:shadow-glow">
                <span className="flex size-11 items-center justify-center rounded-xl bg-night text-on-dark">
                  <Icon name={industry.icon} className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">
                  <Link
                    href={{ pathname: '/industrias/[slug]', params: { slug: industry.slug } }}
                    className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
                  >
                    {t(`items.${industry.slug}.name`)}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">
                  {t(`items.${industry.slug}.short`)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {t('learnMore')}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </article>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
