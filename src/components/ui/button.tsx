import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Variantes:
 * - primary: gold. SOLO para el CTA principal, máximo uno por sección. Texto deep.
 * - accent: jade sólido con texto deep (acciones secundarias destacadas, p. ej. en el simulador).
 * - secondary: contorno con el color de texto del tono de sección.
 * - ghost: solo texto, para acciones terciarias.
 */
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-deep hover:bg-gold-bright shadow-[0_8px_30px_-12px_rgb(224_165_38/0.55)]',
  accent: 'bg-jade text-deep hover:bg-jade-bright',
  secondary: 'border border-edge text-fg hover:border-accent hover:bg-fg/5',
  ghost: 'text-fg underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

export const buttonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className);

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: StyleProps & ComponentProps<'button'>) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

/** Enlace interno con estilo de botón (usa el Link localizado de next-intl). */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

/** Enlace externo (WhatsApp, agenda…) con estilo de botón. */
export function ButtonAnchor({
  variant,
  size,
  className,
  children,
  ...props
}: StyleProps & ComponentProps<'a'> & { children: ReactNode }) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </a>
  );
}
