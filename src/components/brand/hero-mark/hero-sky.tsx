'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, MEDIA } from '@/lib/gsap';
import { afterLoadIdle } from '@/lib/schedule';
import { createSky } from './sky';

/**
 * Cielo animado detrás del hero (estrellas, polvo dorado, estrellas fugaces).
 * Arranca después del evento load y en tiempo libre; el polvo asciende desde el centro del logo
 * ([data-hero-mark]). Se pausa fuera de pantalla y con prefers-reduced-motion se dibuja
 * un solo cuadro estático.
 */
export function HeroSky({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stop: (() => void) | undefined;
    const cancelIdle = afterLoadIdle(() => {
      stop = startSky(canvas);
    });
    return () => {
      cancelIdle();
      stop?.();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 h-full w-full', className)}
    />
  );
}

function startSky(canvas: HTMLCanvasElement): () => void {
  const reduce = window.matchMedia(MEDIA.reduced).matches;
  const sky = createSky(canvas);

  const originX = () => {
    const mark = canvas.parentElement?.querySelector('[data-hero-mark]');
    if (!mark) return 0.5;
    const area = canvas.getBoundingClientRect();
    const logo = mark.getBoundingClientRect();
    return (logo.left + logo.width / 2 - area.left) / area.width;
  };
  const resize = () => {
    sky.resize(originX());
    if (reduce) sky.drawStatic();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  let last = performance.now();
  const tick = () => {
    const t = performance.now();
    sky.draw(t, Math.min(t - last, 50));
    last = t;
  };
  let running = false;
  const setRunning = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) {
      last = performance.now();
      gsap.ticker.add(tick);
    } else {
      gsap.ticker.remove(tick);
    }
  };

  let observer: IntersectionObserver | null = null;
  if (!reduce) {
    observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));
    observer.observe(canvas);
  }

  return () => {
    observer?.disconnect();
    resizeObserver.disconnect();
    setRunning(false);
  };
}
