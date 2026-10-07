'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';

// Carga diferida de las features de Motion (reduce el JS inicial).
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

/**
 * Motion SOLO para microinteracciones de UI (wizard, chips, resultado, moneda).
 * Envuelve al simulador (cargado diferido), así Motion no entra en el JS inicial.
 * Usa `m.*` de 'motion/react-m' dentro de este proveedor.
 * reducedMotion="user" respeta prefers-reduced-motion automáticamente.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
