import { getTranslations } from 'next-intl/server';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Container, Section, SectionHeader } from '@/components/ui/section';
import { caseStudies } from '@/config/cases';
import { siteConfig } from '@/config/site';

/** Casos de éxito (placeholders en src/config/cases.ts + textos en messages). */
export async function Cases() {
  const t = await getTranslations('cases');
  const tc = await getTranslations('common.countries');
  const ti = await getTranslations('industries.items');

  return (
    <Section tone="dark" className="py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        <Reveal stagger as="ul" className="grid gap-5 lg:grid-cols-3">
          {caseStudies.map((study) => {
            const labels = t.raw(`items.${study.id}.metrics`) as string[];
            return (
              <RevealItem key={study.id} as="li">
                <article className="glass glass-hover flex h-full flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] tracking-wide text-fg-muted uppercase">
                    <span>{ti(`${study.industry}.name`)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tc(study.country)}</span>
                    {siteConfig.showPlaceholderBadges ? (
                      <span className="ml-auto rounded-full border border-edge px-2 py-0.5">
                        {t('placeholderBadge')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-5 text-sm text-fg-muted">{t(`items.${study.id}.client`)}</p>
                  <h3 className="mt-1 text-lg leading-snug font-semibold">
                    {t(`items.${study.id}.title`)}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                    {t(`items.${study.id}.summary`)}
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-edge pt-5">
                    {study.metrics.map((metric, index) => (
                      <div key={labels[index]}>
                        <dt className="sr-only">{labels[index]}</dt>
                        <dd className="font-mono text-3xl font-semibold text-accent tabular-nums">
                          {metric.prefix}
                          {metric.value}
                          {metric.suffix}
                        </dd>
                        <dd aria-hidden="true" className="mt-1 text-xs leading-snug text-fg-muted">
                          {labels[index]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              </RevealItem>
            );
          })}
        </Reveal>
      </Container>
    </Section>
  );
}
