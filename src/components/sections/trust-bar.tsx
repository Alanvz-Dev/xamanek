import { getTranslations } from 'next-intl/server';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Container, Section } from '@/components/ui/section';
import { offices } from '@/config/offices';
import { siteConfig } from '@/config/site';
import { stats } from '@/config/stats';

/** Barra de confianza: presencia USA · México · Colombia y cifras (placeholder en src/config/stats.ts). */
export async function TrustBar() {
  const t = await getTranslations('trust');
  const tc = await getTranslations('common');
  const numberFormat = new Intl.NumberFormat('en-US');

  return (
    <Section tone="light" aria-label={t('label')} className="py-12 sm:py-14">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{t('presence')}</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-lg font-semibold">
            {offices.map((office, index) => (
              <li key={office.id} className="flex items-center gap-3">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-fg-muted">
                    ·
                  </span>
                ) : null}
                {tc(`countries.${office.countryCode}`)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Reveal stagger as="ul" className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <RevealItem key={stat.id} as="li" className="flex flex-col">
                <span className="font-mono text-3xl font-semibold tabular-nums">
                  {stat.prefix}
                  {numberFormat.format(stat.value)}
                  {stat.suffix}
                </span>
                <span className="mt-1 text-sm text-fg-muted">{t(`stats.${stat.id}`)}</span>
              </RevealItem>
            ))}
          </Reveal>
          {siteConfig.showPlaceholderBadges ? (
            <p className="mt-4 text-xs text-fg-muted">* {tc('placeholderData')}</p>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
