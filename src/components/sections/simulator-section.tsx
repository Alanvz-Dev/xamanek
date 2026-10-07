import { MessageSquareMore } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { StepGrid } from '@/components/brand/step-grid';
import { SimulatorLoader } from '@/components/simulator/simulator-loader';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeader } from '@/components/ui/section';
import type { IndustryId } from '@/lib/pricing/types';

/**
 * Sección del simulador Odoo (id="simulador"), con la retícula escalonada de fondo.
 * Reutilizada en el home y en /industrias/[slug] con el giro preseleccionado.
 */
export async function SimulatorSection({
  initialIndustry,
  title,
  subtitle,
}: {
  initialIndustry?: IndustryId;
  title?: string;
  subtitle?: string;
}) {
  const t = await getTranslations('simulator');

  return (
    <Section tone="night" id="simulador" className="scroll-mt-16 py-20 sm:py-28">
      <StepGrid trigger="scroll" className="opacity-70" />
      <Container>
        <SectionHeader
          eyebrow={t('eyebrow')}
          title={title ?? t('title')}
          subtitle={subtitle ?? t('subtitle')}
        />
        <SimulatorLoader initialIndustry={initialIndustry} />

        <aside className="mt-8 flex flex-col gap-4 rounded-2xl border border-dashed border-line bg-deep/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="flex items-start gap-3 text-sm text-fg-muted sm:items-center">
            <MessageSquareMore aria-hidden="true" className="size-5 shrink-0 text-jade" />
            {t('customQuote.text')}
          </p>
          <ButtonLink href="/contacto" variant="secondary" className="shrink-0">
            {t('customQuote.cta')}
          </ButtonLink>
        </aside>
      </Container>
    </Section>
  );
}
