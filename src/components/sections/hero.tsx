import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { heroMarkFonts } from '@/components/brand/hero-mark/fonts';
import { HeroMark } from '@/components/brand/hero-mark/hero-mark';
import { HeroSky } from '@/components/brand/hero-mark/hero-sky';
import { StepGrid } from '@/components/brand/step-grid';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/section';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

const HIGHLIGHTS = ['fiscal', 'nearshore', 'pricing'] as const;

/**
 * Hero del home. El logo animado (HeroMark) y su cielo son la ÚNICA animación protagonista
 * de la primera pantalla; el titular se pinta sin animar para no retrasar el LCP.
 */
export async function Hero() {
  const t = await getTranslations('hero');

  return (
    <Section tone="dark" className="pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-32">
      <HeroSky />
      <StepGrid className="opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(0_168_143/0.16),transparent)]"
      />

      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-2xl">
          <p className="eyebrow mb-5">{t('eyebrow')}</p>
          <h1 className="text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-[3.6rem]">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">{t('subtitle')}</p>

          <div className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href={{ pathname: '/', hash: 'simulador' }} size="lg">
              {t('ctaPrimary')}
            </ButtonLink>
            <ButtonLink href="/contacto" variant="secondary" size="lg">
              {t('ctaSecondary')}
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-3 text-sm text-fg-muted sm:grid-cols-3 sm:gap-4">
            {HIGHLIGHTS.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jade" />
                {t(`highlights.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className={cn('order-first flex justify-center lg:order-none', heroMarkFonts)}>
          <HeroMark
            label={t('logoLabel')}
            wordmark={siteConfig.name.toUpperCase()}
            tagline={t('logoTagline')}
            className="w-60 sm:w-72 lg:w-full lg:max-w-md"
          />
        </div>
      </Container>
    </Section>
  );
}
