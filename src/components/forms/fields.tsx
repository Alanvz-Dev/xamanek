import type { ComponentProps, ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * Campos de formulario accesibles. Heredan el tono de la sección (tokens fg, edge,
 * surface, danger), así que funcionan igual en secciones claras y oscuras.
 */
const controlClasses =
  'w-full rounded-xl border bg-surface-strong px-4 text-[0.95rem] text-fg placeholder:text-fg-muted transition-[border-color,box-shadow] duration-150 focus:border-focus focus:ring-2 focus:ring-focus/25 focus:outline-none aria-invalid:border-danger';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

function FieldShell({ label, error, hint, optionalLabel, className, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
        {optionalLabel ? (
          <span className="ml-1 font-normal text-fg-muted">{optionalLabel}</span>
        ) : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Common = Omit<FieldShellProps, 'children'>;

export function TextField({
  label,
  error,
  hint,
  optionalLabel,
  className,
  ...props
}: Common & ComponentProps<'input'>) {
  return (
    <FieldShell {...{ label, error, hint, optionalLabel, className }}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlClasses, 'h-12')}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optionalLabel,
  className,
  placeholder,
  options,
  ...props
}: Common &
  Omit<ComponentProps<'select'>, 'children'> & {
    placeholder: string;
    options: { value: string; label: string }[];
  }) {
  return (
    <FieldShell {...{ label, error, hint, optionalLabel, className }}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlClasses, 'h-12 appearance-none bg-no-repeat pr-10')}
          style={{
            backgroundImage:
              'linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 20px) 52%, calc(100% - 15px) 52%',
            backgroundSize: '5px 5px, 5px 5px',
          }}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  optionalLabel,
  className,
  ...props
}: Common & ComponentProps<'textarea'>) {
  return (
    <FieldShell {...{ label, error, hint, optionalLabel, className }}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlClasses, 'min-h-32 py-3')}
          {...props}
        />
      )}
    </FieldShell>
  );
}

/** Campo trampa anti-spam: invisible y fuera del orden de tabulación. */
export function HoneypotField({ name, label }: { name: string; label: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden"
    >
      <label>
        {label}
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
