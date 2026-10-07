import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import es from '../../messages/es.json';
import { CASE_IDS } from '@/config/cases';
import { INDUSTRY_SLUGS } from '@/config/industries';
import { SERVICE_SLUGS } from '@/config/services';

/** Lista de rutas de claves; los arreglos se representan con su índice. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => keyPaths(item, `${prefix}[${i}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

describe('messages', () => {
  it('es.json y en.json tienen exactamente las mismas claves', () => {
    const esKeys = keyPaths(es).sort();
    const enKeys = keyPaths(en).sort();
    expect(enKeys.filter((k) => !esKeys.includes(k))).toEqual([]);
    expect(esKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
  });

  it('no hay textos vacíos', () => {
    for (const messages of [es, en]) {
      const empty = keyPaths(messages).filter((path) => {
        const value = path
          .split(/\.|\[(\d+)\]/)
          .filter(Boolean)
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], messages);
        return typeof value === 'string' && value.trim() === '';
      });
      expect(empty).toEqual([]);
    }
  });

  it('cada servicio, industria y caso de src/config tiene textos', () => {
    for (const slug of SERVICE_SLUGS) expect(es.services.items).toHaveProperty([slug]);
    for (const slug of INDUSTRY_SLUGS) expect(es.industries.items).toHaveProperty([slug]);
    for (const id of CASE_IDS) expect(es.cases.items).toHaveProperty([id]);
  });
});
