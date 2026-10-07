import { Plus } from 'lucide-react';
import { Container, Section, SectionHeader, type Tone } from '@/components/ui/section';

export interface FaqItem {
  q: string;
  a: string;
}

/** Preguntas frecuentes con <details> nativo: accesible y funcional sin JavaScript. */
export function Faq({
  eyebrow,
  title,
  items,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  items: FaqItem[];
  tone?: Tone;
}) {
  return (
    <Section tone={tone} className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} className="mb-0" />
        <div className="divide-y divide-edge border-y border-edge">
          {items.map((item) => (
            <details key={item.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-left font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-edge transition-transform duration-200 group-open:rotate-45"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-fg-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
