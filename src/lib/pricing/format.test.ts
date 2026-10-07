import { describe, expect, it } from 'vitest';
import { testConfig } from './fixtures';
import { decimalsFor, formatMoney } from './format';

describe('formatMoney', () => {
  it('muestra el código de moneda para distinguir USD de MXN', () => {
    expect(formatMoney(12_500, 'USD', testConfig)).toBe('$12,500 USD');
    expect(formatMoney(215_000, 'MXN', testConfig)).toBe('$215,000 MXN');
  });

  it('admite centavos para precios por usuario', () => {
    expect(formatMoney(31.1, 'USD', testConfig, { decimals: 2 })).toBe('$31.10 USD');
  });

  it('decimalsFor solo pide centavos cuando hacen falta', () => {
    expect(decimalsFor(450)).toBe(0);
    expect(decimalsFor(31.1)).toBe(2);
  });
});
