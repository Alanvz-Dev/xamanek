/**
 * Rate limit simple en memoria (ventana fija por clave/IP).
 * Suficiente para un solo contenedor. Si se escala a varias réplicas,
 * mover a Redis u otro almacén compartido.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Segundos hasta que se reinicia la ventana */
  retryAfter: number;
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    // Limpieza oportunista para que el Map no crezca sin límite
    if (hits.size > 5_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
    }

    entry.count += 1;
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), retryAfter };
  };
}

/**
 * IP del cliente. Caddy reemplaza X-Forwarded-For con la IP real del cliente
 * (no confía en el valor entrante salvo que se configure trusted_proxies).
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip') || 'unknown';
}
