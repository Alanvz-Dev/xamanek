'use client';

import { useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, MEDIA, useGSAPAfterPaint } from '@/lib/gsap';
import {
  CAPSTONE,
  EYE_CENTER,
  EYE_CLOSED,
  EYE_OPEN,
  LOGO_VIEWBOX,
  STAIR_STEPS,
  STAIRS,
  TIERS,
} from './logo-geometry';

/** Desplazamiento máximo del iris al seguir el cursor (unidades del viewBox) */
const IRIS_TRAVEL = { x: 6, y: 3.5 };

/**
 * Logo protagonista del hero (GSAP):
 * 1. Entrada: niveles de la pirámide en cascada → piedra angular desciende → el ojo se abre (MorphSVG).
 * 2. Reposo: la piedra angular flota, el ojo parpadea cada pocos segundos (MorphSVG).
 * 3. El iris sigue al cursor de forma sutil — solo con puntero fino (no táctil).
 * Con prefers-reduced-motion todo queda estático.
 */
export function AnimatedLogo({ label, className }: { label: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId();
  const ids = {
    face: `${uid}-face`,
    cap: `${uid}-cap`,
    glow: `${uid}-glow`,
    eyeClip: `${uid}-eye`,
  };

  useGSAPAfterPaint(() => {
    const svg = ref.current;
    if (!svg) return;
    const q = gsap.utils.selector(svg);
    const [eye] = q('[data-eye]');
    const [iris] = q('[data-iris]');
    const [capstone] = q('[data-capstone]');
    const [glow] = q('[data-glow]');

    const mm = gsap.matchMedia();

    mm.add(MEDIA.motionOk, () => {
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set([iris, glow], { transformOrigin: '50% 50%' });

      const blink = () =>
        gsap
          .timeline()
          .to(eye, { morphSVG: EYE_CLOSED, duration: 0.09, ease: 'power2.in' })
          .to(iris, { scaleY: 0.08, duration: 0.09, ease: 'power2.in' }, '<')
          .to(eye, { morphSVG: EYE_OPEN, duration: 0.16, ease: 'power2.out' })
          .to(iris, { scaleY: 1, duration: 0.16, ease: 'power2.out' }, '<');

      // Parpadeo a intervalos aleatorios (a veces doble), como un ojo real
      const scheduleBlink = () => {
        const tl = blink();
        if (Math.random() < 0.2) tl.add(blink(), '+=0.12');
        gsap.delayedCall(gsap.utils.random(2.8, 6), scheduleBlink);
      };

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(q('[data-tier]'), { y: 14, autoAlpha: 0, duration: 0.6, stagger: -0.09 })
        .from(q('[data-stairs]'), { autoAlpha: 0, duration: 0.5 }, '-=0.25')
        .from(capstone, { y: -28, autoAlpha: 0, duration: 0.9 }, '-=0.2')
        .from(glow, { autoAlpha: 0, scaleX: 0.3, duration: 0.8 }, '<0.3')
        .fromTo(eye, { morphSVG: EYE_CLOSED }, { morphSVG: EYE_OPEN, duration: 0.4 }, '-=0.3')
        .from(iris, { scaleY: 0.08, duration: 0.4 }, '<')
        .add(() => {
          gsap.to([capstone], {
            y: -5,
            duration: 2.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          gsap.to(glow, {
            scaleX: 0.82,
            opacity: 0.55,
            duration: 2.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          gsap.delayedCall(2.2, scheduleBlink);
        });
    });

    // Seguimiento del cursor: solo con movimiento permitido y puntero fino
    mm.add(`${MEDIA.motionOk} and ${MEDIA.finePointer}`, () => {
      const xTo = gsap.quickTo(iris, 'x', { duration: 0.7, ease: 'power3.out' });
      const yTo = gsap.quickTo(iris, 'y', { duration: 0.7, ease: 'power3.out' });

      const onMove = (event: PointerEvent) => {
        const box = svg.getBoundingClientRect();
        const scale = box.width / 240;
        const cx = box.left + EYE_CENTER.x * scale;
        const cy = box.top + EYE_CENTER.y * scale;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const reach = Math.min(1, Math.hypot(dx, dy) / 420);
        const angle = Math.atan2(dy, dx);
        xTo(Math.cos(angle) * IRIS_TRAVEL.x * reach);
        yTo(Math.sin(angle) * IRIS_TRAVEL.y * reach);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      return () => {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
      };
    });
  }, ref);

  return (
    <svg
      ref={ref}
      viewBox={LOGO_VIEWBOX}
      role="img"
      aria-label={label}
      data-reveal=""
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id={ids.face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--color-panel)]" />
          <stop offset="1" className="[stop-color:var(--color-night)]" />
        </linearGradient>
        <linearGradient id={ids.cap} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" className="[stop-color:var(--color-jade)]" stopOpacity="0.32" />
          <stop offset="1" className="[stop-color:var(--color-jade)]" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id={ids.glow}>
          <stop offset="0" className="[stop-color:var(--color-jade)]" stopOpacity="0.55" />
          <stop offset="1" className="[stop-color:var(--color-jade)]" stopOpacity="0" />
        </radialGradient>
        <clipPath id={ids.eyeClip}>
          <path d={EYE_OPEN} />
        </clipPath>
      </defs>

      {/* Pirámide escalonada */}
      <g className="stroke-jade" strokeWidth="1.5" strokeLinejoin="round">
        {TIERS.map((points) => (
          <polygon key={points} data-tier="" points={points} fill={`url(#${ids.face})`} />
        ))}
      </g>
      <g
        data-stairs=""
        className="stroke-muted-on-dark"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      >
        <path d={STAIRS} fill="none" />
        {STAIR_STEPS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* Halo bajo la piedra angular */}
      <ellipse data-glow="" cx="120" cy="108" rx="46" ry="5" fill={`url(#${ids.glow})`} />

      {/* Piedra angular flotante con el ojo */}
      <g data-capstone="">
        <polygon
          points={CAPSTONE}
          fill={`url(#${ids.cap})`}
          className="stroke-jade"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path data-eye="" d={EYE_OPEN} className="fill-deep stroke-on-dark" strokeWidth="1.6" />
        <g clipPath={`url(#${ids.eyeClip})`}>
          <g data-iris="">
            <circle cx={EYE_CENTER.x} cy={EYE_CENTER.y} r="9" className="fill-jade" />
            <circle cx={EYE_CENTER.x} cy={EYE_CENTER.y} r="4" className="fill-deep" />
            <circle cx={EYE_CENTER.x + 3} cy={EYE_CENTER.y - 3} r="1.6" className="fill-on-dark" />
          </g>
        </g>
      </g>
    </svg>
  );
}
