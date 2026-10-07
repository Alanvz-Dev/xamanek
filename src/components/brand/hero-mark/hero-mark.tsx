'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { gsap, MEDIA } from '@/lib/gsap';
import { afterLoadIdle } from '@/lib/schedule';
import { buildMark, VIEWBOX } from './build-mark';
import { createMarkController } from './mark-controller';
import './hero-mark.css';

/**
 * Logo animado del hero (diseño de Xamanek: design/xamanek-movimiento.html).
 * - El SVG se construye en el cliente después del evento load y en tiempo libre (el titular,
 *   que es el LCP, ya está pintado) y su ciclo corre en el ticker de GSAP.
 * - El ojo sigue al cursor solo con puntero fino (no en táctil); un toque sobre el logo
 *   lo hace parpadear y emite una onda.
 * - Fuera de pantalla se pausa todo; con prefers-reduced-motion queda estático.
 */
export function HeroMark({
  label,
  wordmark,
  tagline,
  className,
}: {
  label: string;
  wordmark: string;
  tagline: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // El wordmark y el lema se pintan al arrancar el logo: así sus fuentes (Cinzel y
  // Cormorant) se descargan después del titular y no compiten con el LCP.
  const [live, setLive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    let stop: (() => void) | undefined;
    const cancelIdle = afterLoadIdle(() => {
      setLive(true);
      stop = startMark(root, svg);
    });
    return () => {
      cancelIdle();
      stop?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-hero-mark=""
      className={cn('xmk flex flex-col items-center gap-3 sm:gap-4', className)}
    >
      <svg
        ref={svgRef}
        viewBox={VIEWBOX}
        role="img"
        aria-label={label}
        className="block aspect-[600/680] h-auto w-full touch-manipulation overflow-visible"
      />
      {/* min-h reserva el alto antes de que aparezca el texto (sin saltos de layout) */}
      <p
        className="xmk-wordmark min-h-[1em] text-[clamp(1.75rem,4.2vw,3.25rem)]"
        data-text={live ? wordmark : undefined}
        aria-hidden="true"
      >
        {live
          ? [...wordmark].map((letter, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties}>
                {letter}
              </span>
            ))
          : null}
      </p>
      <p
        className="xmk-tagline fade min-h-[1.4em] text-lg whitespace-nowrap sm:text-xl"
        style={{ '--d': '4.1s' } as CSSProperties}
      >
        {live ? tagline : null}
      </p>
    </div>
  );
}

/** Construye el logo, conecta eventos y arranca el ciclo. Devuelve la limpieza. */
function startMark(root: HTMLDivElement, svg: SVGSVGElement): () => void {
  const reduce = window.matchMedia(MEDIA.reduced).matches;
  const finePointer = window.matchMedia(MEDIA.finePointer).matches;
  const controller = createMarkController(svg, buildMark(svg), { reduce });
  root.classList.add('is-live');

  const onMove = (event: PointerEvent) => controller.pointer(event.clientX, event.clientY);
  const onLeave = () => controller.leave();
  const onTap = (event: PointerEvent) => {
    if (finePointer) controller.pointer(event.clientX, event.clientY);
    controller.tap();
  };
  const followPointer = finePointer && !reduce;
  if (followPointer) {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
  root.addEventListener('pointerdown', onTap, { passive: true });

  const tick = () => controller.frame(performance.now());
  let running = false;
  const setRunning = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
    root.classList.toggle('is-paused', !on);
  };

  let observer: IntersectionObserver | null = null;
  if (reduce) {
    controller.frame(performance.now());
  } else {
    observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));
    observer.observe(root);
  }

  return () => {
    observer?.disconnect();
    setRunning(false);
    root.removeEventListener('pointerdown', onTap);
    if (followPointer) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', onLeave);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    }
    root.classList.remove('is-live', 'is-paused');
    svg.replaceChildren();
  };
}
