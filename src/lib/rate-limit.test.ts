import { describe, expect, it } from 'vitest';
import { clientIp, createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('permite hasta el límite y bloquea después, por clave', () => {
    const check = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(check('a', 0).ok).toBe(true);
    expect(check('a', 1).ok).toBe(true);
    expect(check('a', 2)).toMatchObject({ ok: false, remaining: 0, retryAfter: 60 });
    expect(check('b', 3).ok).toBe(true);
  });

  it('reinicia al terminar la ventana', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1_000 });
    expect(check('a', 0).ok).toBe(true);
    expect(check('a', 500).ok).toBe(false);
    expect(check('a', 1_000).ok).toBe(true);
  });
});

describe('clientIp', () => {
  it('toma la primera IP de X-Forwarded-For', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.2' }))).toBe(
      '203.0.113.7',
    );
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});
