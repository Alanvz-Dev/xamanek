import { getTranslations } from 'next-intl/server';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Container, Section, SectionHeader, type Tone } from '@/components/ui/section';

interface Step {
  title: string;
  text: string;
  duration?: string;
}

/**
 * Proceso en 4 pasos. Por defecto usa process.steps; las páginas de servicio
 * pasan sus propios pasos ("cómo funciona").
 */
export async function Process({
  tone = 'light',
  eyebrow,
  title,
  subtitle,
  steps,
}: {
  tone?: Tone;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps?: Step[];
}) {
  const t = await getTranslations('process');
  const items = steps ?? (t.raw('steps') as Step[]);

  return (
    <Section tone={tone} className="py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow={eyebrow ?? t('eyebrow')}
          title={title ?? t('title')}
          subtitle={subtitle ?? (steps ? undefined : t('subtitle'))}
        />
        <Reveal stagger as="ol" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {items.map((step, index) => (
            <RevealItem
              key={step.title}
              as="li"
              className="relative flex flex-col gap-3 lg:border-l lg:border-edge lg:px-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="font-mono text-sm font-semibold text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{step.text}</p>
              {step.duration ? (
                <span className="mt-auto w-fit rounded-full border border-edge px-3 py-1 font-mono text-xs text-fg-muted">
                  {step.duration}
                </span>
              ) : null}
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
