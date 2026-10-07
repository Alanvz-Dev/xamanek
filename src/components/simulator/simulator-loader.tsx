'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { SimulatorProps } from './odoo-simulator';

/**
 * Carga diferida del simulador: su JS (wizard, Motion, Zod, tablas de precios) no
 * participa en la hidratación inicial y solo se descarga cuando la sección se acerca
 * al viewport, así no retrasa el primer pintado ni el LCP.
 * El esqueleto reserva el alto aproximado para evitar saltos de layout.
 */
const OdooSimulator = dynamic(() => import('./odoo-simulator'), {
  ssr: false,
  loading: () => <SimulatorSkeleton />,
});

function SimulatorSkeleton() {
  const t = useTranslations('simulator');
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">{t('loading')}</span>
      <div
        aria-hidden="true"
        className="h-9 w-56 self-end rounded-full border border-line bg-deep/40"
      />
      <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="glass min-h-[34rem] animate-pulse" />
        <div className="glass hidden min-h-80 animate-pulse lg:block" />
      </div>
    </div>
  );
}

export function SimulatorLoader(props: SimulatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{visible ? <OdooSimulator {...props} /> : <SimulatorSkeleton />}</div>;
}
