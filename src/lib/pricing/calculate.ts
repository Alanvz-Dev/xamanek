/**
 * Motor de cálculo del simulador Odoo — función PURA.
 * - Sin React, sin Next, sin I/O: recibe la configuración como parámetro.
 * - Cada moneda usa su propia tabla de precios (no hay conversión por tipo de cambio).
 * - Reutilizable tal cual en el servidor (/api/lead lo usa para recalcular).
 */
import type {
  Currency,
  IndustryId,
  ModuleId,
  PlanReason,
  PricingConfig,
  SimulationInput,
  SimulationResult,
} from './types';
import { MODULE_IDS } from './types';

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const roundTo = (value: number, step: number): number =>
  step > 0 ? Math.round(value / step) * step : Math.round(value);

const roundCents = (value: number): number => Math.round(value * 100) / 100;

/** Módulos recomendados para un giro (copia defensiva, orden canónico). */
export function recommendedModules(config: PricingConfig, industry: IndustryId): ModuleId[] {
  const recommended = new Set(config.industries[industry].recommendedModules);
  return MODULE_IDS.filter((id) => recommended.has(id));
}

/** Moneda inicial según idioma (MXN en /es, USD en /en por defecto). */
export function defaultCurrency(config: PricingConfig, locale: string): Currency {
  return config.defaultCurrencyByLocale[locale] ?? 'USD';
}

/** Entrada inicial del simulador; `industry` permite preseleccionar el giro. */
export function defaultInput(
  config: PricingConfig,
  { currency, industry = config.defaults.industry }: { currency: Currency; industry?: IndustryId },
): SimulationInput {
  return {
    ...config.defaults,
    currency,
    industry,
    modules: recommendedModules(config, industry),
  };
}

/**
 * Normaliza la entrada: acota usuarios e integraciones a los límites del JSON,
 * quita módulos duplicados o desconocidos y los deja en orden canónico.
 */
export function normalizeInput(input: SimulationInput, config: PricingConfig): SimulationInput {
  const { users, integrations } = config.limits;
  const selected = new Set(input.modules);
  return {
    ...input,
    users: clamp(input.users, users.min, users.max),
    integrations: clamp(input.integrations, integrations.min, integrations.max),
    modules: MODULE_IDS.filter((id) => selected.has(id) && id in config.modules),
  };
}

export function calculate(rawInput: SimulationInput, config: PricingConfig): SimulationResult {
  const input = normalizeInput(rawInput, config);
  const prices = config.currencies[input.currency];

  // 1. Plan: Custom si algún módulo o el hosting lo exige
  const planReasons: PlanReason[] = [
    ...input.modules
      .filter((id) => config.modules[id].requiresCustomPlan)
      .map((id): PlanReason => ({ type: 'module', id })),
    ...(config.hosting[input.hosting].requiresCustomPlan
      ? [{ type: 'hosting', id: input.hosting } satisfies PlanReason]
      : []),
  ];
  const plan = planReasons.length > 0 ? 'custom' : 'standard';

  // 2. Licencias = usuarios × precio por usuario del plan (tabla de la moneda)
  const pricePerUser = prices.plans[plan];
  const licensesMonthly = roundCents(input.users * pricePerUser);

  // 3. Implementación = (Σ horas módulos × multiplicador giro + migración + integraciones) × tarifa
  //    Los módulos "requiresQuote" se cotizan aparte y NO suman horas.
  const quoteSeparately = input.modules.filter((id) => config.modules[id].requiresQuote);
  const moduleHours = input.modules
    .filter((id) => !config.modules[id].requiresQuote)
    .reduce((sum, id) => sum + config.modules[id].baseHours, 0);
  const hours = Math.round(
    moduleHours * config.industries[input.industry].complexity +
      config.migrationHours[input.migration] +
      input.integrations * config.hoursPerIntegration,
  );
  const base = hours * prices.hourlyRate;
  const margin = config.implementationMargin;
  const implementation = {
    hours,
    base,
    min: roundTo(base * (1 - margin), prices.rounding),
    max: roundTo(base * (1 + margin), prices.rounding),
  };

  // 4. Soporte y totales
  const supportMonthly = prices.support[input.support];
  const monthlyTotal = roundCents(licensesMonthly + supportMonthly);
  const yearlyRecurring = roundCents(monthlyTotal * 12);

  return {
    currency: input.currency,
    plan,
    planReasons,
    quoteSeparately,
    licenses: {
      users: input.users,
      pricePerUser,
      monthly: licensesMonthly,
      annual: roundCents(licensesMonthly * 12),
    },
    implementation,
    support: { tier: input.support, monthly: supportMonthly },
    monthlyTotal,
    firstYear: {
      min: roundCents(implementation.min + yearlyRecurring),
      max: roundCents(implementation.max + yearlyRecurring),
    },
    taxNote: prices.taxNote,
  };
}
