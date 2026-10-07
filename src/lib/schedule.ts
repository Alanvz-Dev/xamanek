/**
 * Programación de trabajo no crítico para no competir con el primer pintado (FCP/LCP).
 * Todas devuelven una función para cancelar.
 */

/** Ejecuta `fn` cuando el navegador está libre. */
export function whenIdle(fn: () => void, timeout = 1200): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

/**
 * Ejecuta `fn` después del evento `load` y en tiempo libre. Con red lenta el navegador
 * queda "libre" mientras espera CSS y fuentes, así que `whenIdle` solo podría correr antes
 * de pintar; esperar a `load` garantiza que el contenido principal ya está en pantalla.
 */
export function afterLoadIdle(fn: () => void): () => void {
  let cancelIdle: (() => void) | undefined;
  const schedule = () => {
    cancelIdle = whenIdle(fn);
  };
  if (document.readyState === 'complete') {
    schedule();
    return () => cancelIdle?.();
  }
  window.addEventListener('load', schedule, { once: true });
  return () => {
    window.removeEventListener('load', schedule);
    cancelIdle?.();
  };
}
