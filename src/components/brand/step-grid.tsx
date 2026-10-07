'use client';

import { useId, useRef } from 'react';
import { cn } from '@/lib/cn';
import { gsap, MEDIA, useGSAPAfterPaint } from '@/lib/gsap';

/**
 * Firma visual: retícula de líneas finas en forma de escalones de pirámide maya.
 * SVG decorativo de opacidad baja para el hero y el simulador.
 * GSAP dibuja las líneas en cascada (al montar o al entrar en viewport) y aplica
 * un parallax muy leve. Con prefers-reduced-motion queda estática.
 */

const W = 1440;
const H = 720;

type Point = [number, number];

/** Contorno escalonado: sube y avanza n veces, meseta, y baja en espejo. */
function steppedPath(cx: number, base: number, halfWidth: number, steps: number, stepH: number) {
  const stepW = (halfWidth * 0.62) / steps;
  const left: Point[] = [[cx - halfWidth, base]];
  let x = cx - halfWidth;
  let y = base;
  for (let i = 0; i < steps; i++) {
    y -= stepH;
    left.push([x, y]);
    x += stepW;
    left.push([x, y]);
  }
  const right = left.map(([px, py]): Point => [2 * cx - px, py]).reverse();
  return `M${[...left, ...right].map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L')}`;
}

const PYRAMIDS = [
  { halfWidth: 700, steps: 7, stepH: 62 },
  { halfWidth: 560, steps: 6, stepH: 58 },
  { halfWidth: 430, steps: 5, stepH: 54 },
  { halfWidth: 310, steps: 4, stepH: 50 },
  { halfWidth: 200, steps: 3, stepH: 46 },
].map((p) => steppedPath(W / 2, H, p.halfWidth, p.steps, p.stepH));

const HORIZONTALS = Array.from({ length: 9 }, (_, i) => H - (i + 1) * 62);

export function StepGrid({
  className,
  trigger = 'mount',
}: {
  className?: string;
  /** mount: dibuja al cargar (hero) · scroll: al entrar en viewport (simulador) */
  trigger?: 'mount' | 'scroll';
}) {
  const ref = useRef<SVGSVGElement>(null);
  // ids únicos: el componente aparece más de una vez por página (hero + simulador)
  const uid = useId();
  const fadeId = `${uid}-fade`;
  const maskId = `${uid}-mask`;

  useGSAPAfterPaint(() => {
    const svg = ref.current;
    if (!svg) return;
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motionOk, () => {
      const lines = svg.querySelectorAll('[data-line]');
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(lines, {
        strokeDashoffset: 0,
        duration: 2.4,
        ease: 'power2.inOut',
        stagger: { each: 0.08, from: 'end' },
        delay: trigger === 'mount' ? 0.3 : 0,
        scrollTrigger:
          trigger === 'scroll' ? { trigger: svg, start: 'top 80%', once: true } : undefined,
      });
      gsap.to(svg, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: svg, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }, ref);

  return (
    // La opacidad (className) va en el contenedor: GSAP anima la del <svg> de 0 a 1
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 -z-10 text-jade', className)}
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
        data-reveal=""
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.7" />
            <stop offset="1" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id={maskId}>
            <rect width={W} height={H} fill={`url(#${fadeId})`} />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`} fill="none" stroke="currentColor" strokeWidth="1">
          <g strokeOpacity="0.07">
            {HORIZONTALS.map((y) => (
              <path key={y} data-line="" pathLength={1} d={`M0 ${y} H${W}`} />
            ))}
          </g>
          <g strokeOpacity="0.2">
            {PYRAMIDS.map((d) => (
              <path key={d} data-line="" pathLength={1} d={d} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
