import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { Container, Section, SectionHeader, type Tone } from '@/components/ui/section';
import { services, type ServiceSlug } from '@/config/services';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Grid de servicios (tarjetas tipo vidrio con brillo jade en hover).
 * - Home: todos los servicios, Odoo destacado (id="soluciones").
 * - `only`: subconjunto ("Otras soluciones", servicios recomendados por industria).
 */
export async function ServicesGrid({
  tone = 'dark',
  only,
  title,
  eyebrow,
  subtitle,
}: {
  tone?: Tone;
  only?: ServiceSlug[];
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}) {
  const t = await getTranslations('services');
  const items = only ? services.filter((s) => only.includes(s.slug)) : services;
  const isHome = !only;

  return (
    <Section tone={tone} id={isHome ? 'soluciones' : undefined} className="py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow={eyebrow ?? t('eyebrow')}
          title={title ?? t('title')}
          subtitle={subtitle ?? (isHome ? t('subtitle') : undefined)}
        />
        <Reveal
          stagger
          as="ul"
          className={cn(
            'grid gap-4 sm:grid-cols-2 lg:gap-5',
            items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {items.map((service, index) => (
            <RevealItem
              key={service.slug}
              as="li"
              className={cn(isHome && index === 0 && 'sm:col-span-2')}
            >
              <article className="glass glass-hover group relative flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={cn(
                      'flex size-12 items-center justify-center rounded-xl border',
                      tone === 'light'
                        ? 'border-transparent bg-night text-on-dark'
                        : 'border-edge bg-deep/50 text-jade',
                    )}
                  >
                    <Icon name={service.icon} className="size-6" />
                  </span>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 font-mono text-[0.68rem] tracking-wide uppercase',
                      service.hasSimulator
                        ? 'border-jade/50 bg-jade/10 text-fg'
                        : 'border-edge text-fg-muted',
                    )}
                  >
                    {service.hasSimulator ? t('simulatorBadge') : t('quoteBadge')}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  <Link
                    href={{ pathname: '/soluciones/[slug]', params: { slug: service.slug } }}
                    className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
                  >
                    {t(`items.${service.slug}.name`)}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                  {t(`items.${service.slug}.short`)}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {t('learnMore')}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
