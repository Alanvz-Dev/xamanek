import type { ReactNode } from 'react';
import { StepGrid } from '@/components/brand/step-grid';
import { Icon, type IconName } from '@/components/ui/icon';
import { Container, Section } from '@/components/ui/section';

/** Hero de páginas interiores (servicio, industria, contacto) con la retícula escalonada. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
  icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  /** Ícono grande decorativo a la derecha (desktop) */
  icon?: IconName;
}) {
  return (
    <Section tone="dark" className="pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
      <StepGrid className="opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/3 -z-10 h-[30rem] w-[50rem] rounded-full bg-[radial-gradient(closest-side,rgb(0_168_143/0.14),transparent)]"
      />
      <Container className="grid items-end gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="max-w-3xl">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="text-4xl leading-[1.1] font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">{subtitle}</p>
          {actions ? (
            <div className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">{actions}</div>
          ) : null}
        </div>
        {icon ? (
          <div aria-hidden="true" className="hidden justify-end lg:flex">
            <div className="glass relative flex size-56 items-center justify-center shadow-glow">
              <Icon name={icon} className="size-24 text-jade" strokeWidth={1} />
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
