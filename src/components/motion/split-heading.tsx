'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { gsap, MEDIA, useGSAPAfterPaint } from '@/lib/gsap';

/**
 * Titular con entrada por palabras (GSAP SplitText, máscara por líneas) al entrar en viewport.
 * Con prefers-reduced-motion se muestra estático. SplitText añade aria-label al
 * elemento, así que los lectores de pantalla leen el texto completo.
 */
export function SplitHeading({
  as: Tag = 'h2',
  id,
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAPAfterPaint(({ SplitText }) => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motionOk, () => {
      const split = SplitText.create(el, {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(el, { autoAlpha: 1 });
          return gsap.from(self.words, {
            yPercent: 110,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.035,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
      return () => split.revert();
    });
  }, ref);

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
