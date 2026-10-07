import type { Currency, PricingConfig } from './types';

const formatters = new Map<string, Intl.NumberFormat>();

/**
 * "$12,500 USD" · "$215,000 MXN". Siempre con el código visible porque ambas
 * monedas usan el símbolo $.
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  config: PricingConfig,
  { decimals = 0 }: { decimals?: number } = {},
): string {
  const locale = config.currencies[currency].numberLocale;
  const key = `${locale}|${currency}|${decimals}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, formatter);
  }
  return `${formatter.format(amount)} ${currency}`;
}

/** Decimales a mostrar: centavos solo si el importe los tiene (ej. $31.10 por usuario). */
export const decimalsFor = (amount: number): number => (Number.isInteger(amount) ? 0 : 2);
