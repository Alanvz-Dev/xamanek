'use client';

import * as m from 'motion/react-m';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent } from 'react';
import { Fragment, useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { CURRENCIES, type Currency } from '@/lib/pricing/types';

/**
 * Switch USD / MXN con semántica de radiogroup (flechas para cambiar, tabindex itinerante).
 * La opción activa se resalta en jade; el indicador se desliza con Motion (layoutId).
 */
export function CurrencySwitch({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) {
  const t = useTranslations('simulator.currency');
  const labelId = useId();
  const pillId = useId();
  const refs = useRef<Partial<Record<Currency, HTMLButtonElement | null>>>({});

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = CURRENCIES.indexOf(value);
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = CURRENCIES[(index + delta + CURRENCIES.length) % CURRENCIES.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      <span id={labelId} className="eyebrow hidden sm:inline">
        {t('description')}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="inline-flex items-center rounded-full border border-line bg-deep/70 p-1 font-mono text-sm"
      >
        {CURRENCIES.map((currency, index) => {
          const active = currency === value;
          return (
            <Fragment key={currency}>
              {index > 0 ? (
                <span aria-hidden="true" className="px-1 text-muted-on-dark">
                  /
                </span>
              ) : null}
              <button
                ref={(node) => {
                  refs.current[currency] = node;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange(currency)}
                onKeyDown={onKeyDown}
                className="relative isolate rounded-full px-4 py-1.5 font-semibold"
              >
                {active ? (
                  <m.span
                    layoutId={pillId}
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-jade"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                  />
                ) : null}
                <span
                  className={cn(active ? 'text-deep' : 'text-muted-on-dark hover:text-on-dark')}
                >
                  {currency}
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
