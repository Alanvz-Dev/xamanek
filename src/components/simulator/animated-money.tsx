'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { pricingConfig } from '@/lib/pricing/config';
import { formatMoney } from '@/lib/pricing/format';
import type { Currency } from '@/lib/pricing/types';

/**
 * Cifra con conteo animado (Motion) al aparecer y al cambiar (incluido el cambio de moneda).
 * El texto animado es aria-hidden; los lectores de pantalla leen el valor final (sr-only).
 * Con prefers-reduced-motion muestra el valor final sin animar.
 */
export function AnimatedMoney({
  value,
  currency,
  decimals = 0,
}: {
  value: number;
  currency: Currency;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const format = (n: number) => formatMoney(n, currency, pricingConfig, { decimals });

    if (reduceMotion) {
      node.textContent = format(value);
      shown.current = value;
      return;
    }

    node.textContent = format(shown.current);
    const controls = animate(shown.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        shown.current = latest;
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [value, currency, decimals, reduceMotion]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="font-mono tabular-nums" />
      <span className="sr-only">{formatMoney(value, currency, pricingConfig, { decimals })}</span>
    </>
  );
}
