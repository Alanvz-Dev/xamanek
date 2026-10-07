import { Reveal, RevealItem } from '@/components/motion/reveal';
import { Container, Section, SectionHeader, type Tone } from '@/components/ui/section';
import { cn } from '@/lib/cn';

/** Tarjetas de texto numeradas (beneficios de un servicio, retos de una industria). */
export function FeatureCards({
  eyebrow,
  title,
  items,
  tone = 'light',
  columns = 4,
}: {
  eyebrow: string;
  title: string;
  items: { title: string; text: string }[];
  tone?: Tone;
  columns?: 3 | 4;
}) {
  return (
    <Section tone={tone} className="py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <Reveal
          stagger
          as="ul"
          className={cn(
            'grid gap-4 sm:grid-cols-2',
            columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          {items.map((item, index) => (
            <RevealItem key={item.title} as="li">
              <article
                className={cn(
                  'flex h-full flex-col gap-3 rounded-2xl border border-edge p-6',
                  tone === 'light' ? 'bg-surface' : 'glass',
                )}
              >
                <span className="font-mono text-sm font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg leading-snug font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{item.text}</p>
              </article>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
