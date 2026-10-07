import { getFormatter, getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui/section';

// TODO: fecha real de publicación de los documentos legales
const LAST_UPDATED = new Date('2026-10-01');

/** Plantilla de documento legal (placeholder hasta recibir los textos del área legal). */
export async function LegalPage({ doc }: { doc: 'privacy' | 'terms' }) {
  const t = await getTranslations('legal');
  const format = await getFormatter();
  const sections = t.raw(`${doc}.sections`) as { title: string; text: string }[];

  return (
    <>
      {/* Cabecera oscura: la navbar transparente necesita fondo oscuro arriba */}
      <Section tone="dark" className="pt-32 pb-12 sm:pt-40">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-semibold">{t(`${doc}.title`)}</h1>
          <p className="mt-3 text-sm text-fg-muted">
            {t('updated', { date: format.dateTime(LAST_UPDATED, { dateStyle: 'long' }) })}
          </p>
        </Container>
      </Section>
      <Section tone="light" className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <p className="rounded-xl border border-dashed border-edge bg-surface p-4 text-sm text-fg-muted">
            {t('placeholder')}
          </p>
          <div className="mt-10 grid gap-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-3 leading-relaxed text-fg-muted">{section.text}</p>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
