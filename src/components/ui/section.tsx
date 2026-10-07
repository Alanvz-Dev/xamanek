import type { ComponentProps, ReactNode } from 'react';
import { SplitHeading } from '@/components/motion/split-heading';
import { cn } from '@/lib/cn';

/**
 * Tono de sección. Alterna oscuro/claro a lo largo de la página.
 * - dark: fondo deep · night: fondo azul noche · light: fondo light con texto night.
 * La clase .tone-* define los tokens semánticos (text-fg, text-accent, border-edge…),
 * así que los hijos respetan el contraste automáticamente. Ver globals.css.
 */
export type Tone = 'dark' | 'night' | 'light';

const toneClasses: Record<Tone, string> = {
  dark: 'tone-dark bg-deep text-fg',
  night: 'tone-night bg-night text-fg',
  light: 'tone-light bg-light text-fg',
};

export function Section({
  tone = 'dark',
  className,
  children,
  ...props
}: { tone?: Tone } & ComponentProps<'section'>) {
  return (
    <section
      className={cn('relative isolate overflow-hidden', toneClasses[tone], className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />
  );
}

/** Encabezado estándar de sección: eyebrow + título (animado con SplitText) + subtítulo. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
  as = 'h2',
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <header
      className={cn(
        'mb-10 max-w-3xl md:mb-14',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <SplitHeading
        as={as}
        id={id}
        className="text-3xl leading-tight font-semibold sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </SplitHeading>
      {subtitle ? (
        <p className="mt-5 text-base leading-relaxed text-fg-muted sm:text-lg">{subtitle}</p>
      ) : null}
    </header>
  );
}
