import { describe, expect, it } from 'vitest';
import rawPricing from '@/config/odoo-pricing.json';
import { calculate, defaultInput, normalizeInput, recommendedModules } from './calculate';
import { baseInput, testConfig } from './fixtures';
import { pricingConfigSchema } from './schema';
import { MODULE_IDS } from './types';

describe('calculate — USD y MXN con la misma configuración', () => {
  // horas = (40 + 20) × 1.0 + 20 (migración básica) + 2 × 10 (integraciones) = 100
  it('calcula en USD con la tabla USD', () => {
    const r = calculate({ ...baseInput, currency: 'USD' }, testConfig);
    expect(r.currency).toBe('USD');
    expect(r.plan).toBe('standard');
    expect(r.licenses).toEqual({ users: 10, pricePerUser: 30, monthly: 300, annual: 3600 });
    expect(r.implementation).toEqual({ hours: 100, base: 10_000, min: 8_000, max: 12_000 });
    expect(r.support).toEqual({ tier: 'basic', monthly: 500 });
    expect(r.monthlyTotal).toBe(800);
    expect(r.firstYear).toEqual({ min: 17_600, max: 21_600 });
    expect(r.taxNote).toBe('taxesExcluded');
  });

  it('calcula en MXN con la tabla MXN (sin tipo de cambio)', () => {
    const r = calculate({ ...baseInput, currency: 'MXN' }, testConfig);
    expect(r.currency).toBe('MXN');
    expect(r.licenses).toEqual({ users: 10, pricePerUser: 500, monthly: 5_000, annual: 60_000 });
    expect(r.implementation).toEqual({ hours: 100, base: 180_000, min: 144_000, max: 216_000 });
    expect(r.support.monthly).toBe(9_000);
    expect(r.monthlyTotal).toBe(14_000);
    expect(r.firstYear).toEqual({ min: 312_000, max: 384_000 });
    expect(r.taxNote).toBe('plusVat');
  });

  it('las horas no dependen de la moneda; los importes sí', () => {
    const usd = calculate({ ...baseInput, currency: 'USD' }, testConfig);
    const mxn = calculate({ ...baseInput, currency: 'MXN' }, testConfig);
    expect(usd.implementation.hours).toBe(mxn.implementation.hours);
    // MXN no es USD × tipo de cambio: cada tabla es independiente
    expect(mxn.licenses.pricePerUser).toBe(testConfig.currencies.MXN.plans.standard);
    expect(usd.licenses.pricePerUser).toBe(testConfig.currencies.USD.plans.standard);
  });

  it('usa la tabla propia de cada moneda con el JSON real', () => {
    const config = pricingConfigSchema.parse(rawPricing);
    const input = { ...baseInput };
    const usd = calculate({ ...input, currency: 'USD' }, config);
    const mxn = calculate({ ...input, currency: 'MXN' }, config);
    expect(usd.licenses.pricePerUser).toBe(config.currencies.USD.plans.standard);
    expect(mxn.licenses.pricePerUser).toBe(config.currencies.MXN.plans.standard);
    expect(usd.implementation.base).toBe(
      usd.implementation.hours * config.currencies.USD.hourlyRate,
    );
    expect(mxn.implementation.base).toBe(
      mxn.implementation.hours * config.currencies.MXN.hourlyRate,
    );
  });
});

describe('calculate — cambio automático a plan Custom', () => {
  it('se mantiene en Standard sin módulos ni hosting que lo exijan', () => {
    const r = calculate(baseInput, testConfig);
    expect(r.plan).toBe('standard');
    expect(r.planReasons).toEqual([]);
  });

  it('cambia a Custom por un módulo (Studio)', () => {
    const r = calculate({ ...baseInput, modules: ['accounting', 'studio'] }, testConfig);
    expect(r.plan).toBe('custom');
    expect(r.planReasons).toEqual([{ type: 'module', id: 'studio' }]);
    expect(r.licenses.pricePerUser).toBe(45);
    expect(r.licenses.monthly).toBe(450);
  });

  it.each(['odoo-sh', 'on-premise'] as const)('cambia a Custom por hosting %s', (hosting) => {
    const r = calculate({ ...baseInput, hosting }, testConfig);
    expect(r.plan).toBe('custom');
    expect(r.planReasons).toEqual([{ type: 'hosting', id: hosting }]);
    expect(r.licenses.pricePerUser).toBe(45);
  });

  it('acumula ambas razones', () => {
    const r = calculate(
      { ...baseInput, modules: ['studio'], hosting: 'odoo-sh', currency: 'MXN' },
      testConfig,
    );
    expect(r.planReasons).toEqual([
      { type: 'module', id: 'studio' },
      { type: 'hosting', id: 'odoo-sh' },
    ]);
    expect(r.licenses.pricePerUser).toBe(750);
  });
});

describe('calculate — multiplicador de giro', () => {
  const lean = { ...baseInput, migration: 'none', integrations: 0 } as const;

  it('multiplica las horas de módulos según el giro', () => {
    const other = calculate({ ...lean, industry: 'other' }, testConfig); // ×1.0
    const fintech = calculate({ ...lean, industry: 'fintech' }, testConfig); // ×1.5
    expect(other.implementation.hours).toBe(60);
    expect(fintech.implementation.hours).toBe(90);
    expect(fintech.implementation.base).toBe(9_000);
  });

  it('no multiplica migración ni integraciones', () => {
    const r = calculate(
      { ...baseInput, industry: 'fintech', migration: 'basic', integrations: 1 },
      testConfig,
    );
    // 60 × 1.5 + 20 + 1 × 10
    expect(r.implementation.hours).toBe(120);
  });
});

describe('calculate — rango de implementación', () => {
  it('aplica el margen configurado (±20%)', () => {
    const r = calculate(baseInput, testConfig);
    expect(r.implementation.min).toBe(r.implementation.base * 0.8);
    expect(r.implementation.max).toBe(r.implementation.base * 1.2);
  });

  it('respeta otro margen configurado (±10%)', () => {
    const r = calculate(baseInput, { ...testConfig, implementationMargin: 0.1 });
    expect(r.implementation).toMatchObject({ base: 10_000, min: 9_000, max: 11_000 });
  });

  it('redondea los extremos al múltiplo configurado por moneda', () => {
    // 100h × 105.5 = 10,550 → ±20% = 8,440 / 12,660 → múltiplos de 100 (rounding USD)
    const config = {
      ...testConfig,
      currencies: {
        ...testConfig.currencies,
        USD: { ...testConfig.currencies.USD, hourlyRate: 105.5 },
      },
    };
    const r = calculate(baseInput, config);
    expect(r.implementation.base).toBe(10_550);
    expect(r.implementation.min).toBe(8_400); // 8,440 → 8,400
    expect(r.implementation.max).toBe(12_700); // 12,660 → 12,700
  });
});

describe('calculate — módulos que se cotizan aparte', () => {
  it('excluye sus horas y los reporta', () => {
    const r = calculate(
      { ...baseInput, modules: ['accounting', 'invoicing', 'payroll'] },
      testConfig,
    );
    expect(r.quoteSeparately).toEqual(['payroll']);
    expect(r.implementation.hours).toBe(100);
  });
});

describe('normalizeInput', () => {
  it('acota usuarios e integraciones a los límites', () => {
    expect(normalizeInput({ ...baseInput, users: 0 }, testConfig).users).toBe(1);
    expect(normalizeInput({ ...baseInput, users: 9_999 }, testConfig).users).toBe(500);
    expect(normalizeInput({ ...baseInput, users: Number.NaN }, testConfig).users).toBe(1);
    expect(normalizeInput({ ...baseInput, integrations: 15 }, testConfig).integrations).toBe(10);
  });

  it('quita duplicados y ordena los módulos', () => {
    const r = normalizeInput(
      { ...baseInput, modules: ['crm', 'accounting', 'crm', 'accounting'] },
      testConfig,
    );
    expect(r.modules).toEqual(['accounting', 'crm']);
  });
});

describe('defaultInput / recommendedModules', () => {
  it('preselecciona los módulos recomendados del giro', () => {
    expect(recommendedModules(testConfig, 'retail')).toEqual(['accounting', 'pos']);
    const input = defaultInput(testConfig, { currency: 'MXN', industry: 'retail' });
    expect(input).toMatchObject({ currency: 'MXN', industry: 'retail', users: 10 });
    expect(input.modules).toEqual(['accounting', 'pos']);
  });
});

describe('src/config/odoo-pricing.json', () => {
  it('cumple el esquema y sus módulos recomendados existen', () => {
    const config = pricingConfigSchema.parse(rawPricing);
    for (const industry of Object.values(config.industries)) {
      for (const id of industry.recommendedModules) expect(MODULE_IDS).toContain(id);
    }
  });

  it('marca los precios como valores de ejemplo por verificar', () => {
    expect(rawPricing._todo).toMatch(/Verificar/);
    expect(rawPricing.currencies.USD._todo).toMatch(/Verificar/);
    expect(rawPricing.currencies.MXN._todo).toMatch(/Verificar/);
  });
});
