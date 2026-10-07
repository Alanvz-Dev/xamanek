import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/forms/contact-form';
import { Container, Section, SectionHeader } from '@/components/ui/section';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { services } from '@/config/services';
import { whatsappLink } from '@/config/site';

const POINTS = ['diagnosis', 'proposal', 'timezone'] as const;

/** CTA final + formulario de contacto (sección clara; el envío es el único botón gold). */
export async function FinalCta() {
  const t = await getTranslations('finalCta');
  const ts = await getTranslations('services.items');
  const tw = await getTranslations('whatsapp');

  return (
    <Section tone="light" id="contacto" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="mb-8"
          />
          <ul className="grid gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-fg">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-night text-on-dark">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {t(`points.${point}`)}
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink(tw('message'))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 font-medium text-fg underline decoration-edge underline-offset-4 hover:decoration-night"
          >
            <WhatsAppIcon className="size-5" />
            {t('whatsapp')}
          </a>
        </div>

        <div className="rounded-3xl border border-edge bg-surface p-6 shadow-[0_30px_80px_-40px_rgb(11_31_58/0.35)] sm:p-8">
          <ContactForm
            serviceOptions={services.map((s) => ({ value: s.slug, label: ts(`${s.slug}.name`) }))}
          />
        </div>
      </Container>
    </Section>
  );
}
