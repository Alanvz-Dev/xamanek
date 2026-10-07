'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, MEDIA, useGSAPAfterPaint } from '@/lib/gsap';

/**
 * Revela contenido al hacer scroll (GSAP + ScrollTrigger).
 * - Sin `stagger`: anima el contenedor completo.
 * - Con `stagger`: anima en cascada los hijos marcados con <RevealItem> (data-reveal).
 * No pongas dentro elementos animados con Motion en la misma propiedad (regla GSAP vs Motion).
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  y = 28,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
  y?: number;
  as?: 'div' | 'ul' | 'ol';
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAPAfterPaint(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motionOk, () => {
      const targets = stagger ? gsap.utils.toArray<HTMLElement>('[data-reveal]', el) : [el];
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.09,
          delay,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
    });
  }, ref);

  return (
    <Tag
      // El ref genérico cubre div/ul/ol
      ref={ref as never}
      className={cn(className)}
      {...(stagger ? {} : { 'data-reveal': '' })}
    >
      {children}
    </Tag>
  );
}

/** Hijo animado en cascada dentro de <Reveal stagger>. */
export function RevealItem({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}) {
  return (
    <Tag className={className} data-reveal="">
      {children}
    </Tag>
  );
}
