'use client';

/**
 * Único punto de registro de GSAP. Importa gsap y useGSAP SIEMPRE desde aquí
 * (nunca directo de 'gsap/*'); los plugins se cargan y registran una sola vez
 * con loadGsapPlugins().
 *
 * GSAP se usa para: logo del hero, retícula escalonada, entrada de titulares
 * y animaciones al hacer scroll. Las microinteracciones de UI usan Motion.
 * Nunca animes el mismo elemento con ambos.
 */
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SplitText } from 'gsap/SplitText';
import type { RefObject } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export interface GsapPlugins {
  ScrollTrigger: typeof ScrollTrigger;
  SplitText: typeof SplitText;
  MorphSVGPlugin: typeof MorphSVGPlugin;
}

let pluginsPromise: Promise<GsapPlugins> | null = null;

/**
 * Carga diferida de ScrollTrigger, SplitText y MorphSVG, registrados UNA sola vez
 * (promesa memoizada). Quedan fuera del JS inicial para no retrasar el primer pintado.
 * Al terminar marca <html class="gsap-ready">, lo que desactiva el respaldo CSS de
 * [data-reveal] (ver globals.css).
 */
export function loadGsapPlugins(): Promise<GsapPlugins> {
  pluginsPromise ??= Promise.all([
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('gsap/MorphSVGPlugin'),
  ]).then(([scroll, split, morph]) => {
    const plugins = {
      ScrollTrigger: scroll.ScrollTrigger,
      SplitText: split.SplitText,
      MorphSVGPlugin: morph.MorphSVGPlugin,
    };
    gsap.registerPlugin(plugins.ScrollTrigger, plugins.SplitText, plugins.MorphSVGPlugin);
    document.documentElement.classList.add('gsap-ready');
    return plugins;
  });
  return pluginsPromise;
}

/**
 * useGSAP diferido hasta que el navegador está libre (requestIdleCallback) y se cargan
 * los plugins. SplitText y ScrollTrigger fuerzan cálculos de layout; si corrieran
 * durante la hidratación retrasarían el FCP/LCP. Los elementos animados arrancan
 * ocultos por CSS ([data-reveal]), así que diferir no produce parpadeos.
 * Todo lo creado dentro de `setup` se limpia al desmontar (contextSafe).
 */
export function useGSAPAfterPaint(
  setup: (plugins: GsapPlugins) => void,
  scope: RefObject<Element | null>,
) {
  useGSAP(
    (_context, contextSafe) => {
      const run = contextSafe ? contextSafe(setup) : setup;
      let cancelled = false;
      const cancelIdle = whenIdle(() => {
        void loadGsapPlugins().then((plugins) => {
          if (!cancelled) run(plugins);
        });
      });
      return () => {
        cancelled = true;
        cancelIdle();
      };
    },
    { scope },
  );
}

/** Ejecuta `fn` cuando el navegador está libre tras el primer pintado. Devuelve un cancelador. */
function whenIdle(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/** Condiciones de gsap.matchMedia() compartidas por todos los componentes. */
export const MEDIA = {
  motionOk: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  /** Puntero fino con hover: excluye dispositivos táctiles */
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

export { gsap, useGSAP };
