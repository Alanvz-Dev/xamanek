import type { ReactNode } from 'react';
import { StepGrid } from '@/components/brand/step-grid';
import { Container, Section, type Tone } from '@/components/ui/section';
import { SplitHeading } from '@/components/motion/split-heading';

/** Banda de llamada a la acción (un solo botón gold por banda). */
export function CtaBand({
  title,
  subtitle,
  actions,
  tone = 'dark',
  grid = false,
}: {
  title: string;
  subtitle: string;
  actions: ReactNode;
  tone?: Tone;
  /** Muestra la retícula escalonada (solo bandas que llevan al simulador) */
  grid?: boolean;
}) {
  return (
    <Section tone={tone} className="py-20 sm:py-24">
      {grid ? <StepGrid trigger="scroll" className="opacity-60" /> : null}
      <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <SplitHeading className="text-3xl leading-tight font-semibold sm:text-4xl">
            {title}
          </SplitHeading>
          <p className="mt-4 text-lg leading-relaxed text-fg-muted">{subtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-3 xs:w-auto xs:flex-row">{actions}</div>
      </Container>
    </Section>
  );
}
