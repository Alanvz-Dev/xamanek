import { useTranslations } from 'next-intl';
import { StepGrid } from '@/components/brand/step-grid';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/section';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <Section tone="dark" className="flex min-h-[80vh] items-center pt-32 pb-20">
      <StepGrid className="opacity-50" />
      <Container className="max-w-2xl text-center">
        <p className="font-mono text-6xl font-semibold text-jade">404</p>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-fg-muted">{t('text')}</p>
        <ButtonLink href="/" size="lg" className="mt-10">
          {t('cta')}
        </ButtonLink>
      </Container>
    </Section>
  );
}
