'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Controles del simulador (sección oscura). Usan inputs nativos ocultos con
 * etiquetas estilizadas: teclado, lectores de pantalla y formularios funcionan solos.
 * Microinteracciones con Motion (whileTap, check que aparece).
 */

const focusRing =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-jade';

export function ChoiceCard({
  type = 'radio',
  name,
  value,
  checked,
  onChange,
  label,
  hint,
  icon,
  className,
}: {
  type?: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <m.label
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors duration-200',
        checked
          ? 'border-jade bg-jade/10'
          : 'border-line bg-deep/40 hover:border-jade/50 hover:bg-panel/40',
        focusRing,
        className,
      )}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm font-medium text-on-dark">
          {icon}
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            checked ? 'border-jade bg-jade text-deep' : 'border-line',
          )}
        >
          <AnimatePresence initial={false}>
            {checked ? (
              <m.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </m.span>
            ) : null}
          </AnimatePresence>
        </span>
      </span>
      {hint ? <span className="text-xs leading-relaxed text-muted-on-dark">{hint}</span> : null}
    </m.label>
  );
}

export function Chip({
  name,
  value,
  checked,
  onChange,
  children,
  tags,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  tags?: ReactNode;
}) {
  return (
    <m.label
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex cursor-pointer flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-3.5 py-2 text-sm transition-colors duration-200',
        checked
          ? 'border-jade bg-jade/15 text-on-dark'
          : 'border-line bg-deep/40 text-muted-on-dark hover:border-jade/50 hover:text-on-dark',
        focusRing,
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 items-center justify-center rounded-full border transition-colors',
          checked ? 'border-jade bg-jade text-deep' : 'border-muted-on-dark/60',
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={3.5} /> : null}
      </span>
      <span className="font-medium">{children}</span>
      {tags}
    </m.label>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-deep/70 px-2 py-0.5 font-mono text-[0.65rem] tracking-wide text-muted-on-dark uppercase">
      {children}
    </span>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  decreaseLabel,
  increaseLabel,
  children,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  children: ReactNode;
}) {
  const buttonClass =
    'flex size-10 items-center justify-center rounded-full border border-line text-on-dark transition-colors hover:border-jade hover:text-jade disabled:pointer-events-none disabled:opacity-40';
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={decreaseLabel}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      {children}
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={increaseLabel}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
