import { describe, expect, it } from 'vitest';
import { baseInput, testConfig } from './fixtures';
import { parseSimulation, serializeSimulation } from './url-state';

describe('url-state', () => {
  it('serializa y parsea sin pérdida (ida y vuelta)', () => {
    const input = {
      ...baseInput,
      currency: 'MXN',
      users: 42,
      modules: ['accounting', 'crm', 'studio'],
    } as const;
    const qs = serializeSimulation({ ...input, modules: [...input.modules] }, true);
    const parsed = parseSimulation(qs, baseInput, testConfig);
    expect(parsed.simulated).toBe(true);
    expect(parsed.input).toEqual({ ...input, modules: ['accounting', 'crm', 'studio'] });
  });

  it('usa el fallback para valores inválidos o ausentes', () => {
    const parsed = parseSimulation('cur=EUR&u=abc&h=mars&sup=', baseInput, testConfig);
    expect(parsed.input).toEqual(baseInput);
    expect(parsed.simulated).toBe(false);
  });

  it('acota valores fuera de rango', () => {
    const parsed = parseSimulation('u=100000&int=-3', baseInput, testConfig);
    expect(parsed.input.users).toBe(500);
    expect(parsed.input.integrations).toBe(0);
  });

  it('con giro y sin módulos usa los recomendados del giro', () => {
    const parsed = parseSimulation('ind=retail', baseInput, testConfig);
    expect(parsed.input.industry).toBe('retail');
    expect(parsed.input.modules).toEqual(['accounting', 'pos']);
  });

  it('ignora módulos desconocidos', () => {
    const parsed = parseSimulation('m=accounting,warp-drive,crm', baseInput, testConfig);
    expect(parsed.input.modules).toEqual(['accounting', 'crm']);
  });
});
