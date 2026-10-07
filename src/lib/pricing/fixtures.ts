/**
 * Configuración fija para pruebas: números redondos para verificar la aritmética
 * sin depender de los precios de ejemplo de src/config/odoo-pricing.json.
 */
import type { ModuleConfig, ModuleId, PricingConfig, SimulationInput } from './types';
import { INDUSTRY_IDS, MODULE_IDS } from './types';

const baseModule: ModuleConfig = {
  group: 'operations',
  baseHours: 10,
  requiresCustomPlan: false,
  requiresQuote: false,
};

const moduleOverrides: Partial<Record<ModuleId, Partial<ModuleConfig>>> = {
  accounting: { group: 'finance', baseHours: 40 },
  invoicing: { group: 'finance', baseHours: 20 },
  studio: { group: 'productivity', baseHours: 30, requiresCustomPlan: true },
  payroll: { group: 'finance', baseHours: 50, requiresQuote: true },
};

export const testConfig: PricingConfig = {
  version: 'test',
  defaults: {
    industry: 'other',
    users: 10,
    hosting: 'online',
    migration: 'basic',
    integrations: 1,
    support: 'basic',
  },
  defaultCurrencyByLocale: { es: 'MXN', en: 'USD' },
  implementationMargin: 0.2,
  limits: { users: { min: 1, max: 500 }, integrations: { min: 0, max: 10 } },
  hoursPerIntegration: 10,
  migrationHours: { none: 0, basic: 20, complex: 60 },
  currencies: {
    USD: {
      plans: { standard: 30, custom: 45 },
      hourlyRate: 100,
      support: { none: 0, basic: 500, premium: 1500 },
      rounding: 100,
      numberLocale: 'en-US',
      taxNote: 'taxesExcluded',
    },
    MXN: {
      plans: { standard: 500, custom: 750 },
      hourlyRate: 1800,
      support: { none: 0, basic: 9000, premium: 27000 },
      rounding: 1000,
      numberLocale: 'es-MX',
      taxNote: 'plusVat',
    },
  },
  hosting: {
    online: { requiresCustomPlan: false },
    'odoo-sh': { requiresCustomPlan: true },
    'on-premise': { requiresCustomPlan: true },
  },
  industries: Object.fromEntries(
    INDUSTRY_IDS.map((id) => [
      id,
      {
        complexity: id === 'fintech' ? 1.5 : 1,
        recommendedModules: id === 'retail' ? ['accounting', 'pos'] : ['accounting', 'invoicing'],
      },
    ]),
  ) as PricingConfig['industries'],
  modules: Object.fromEntries(
    MODULE_IDS.map((id) => [id, { ...baseModule, ...moduleOverrides[id] }]),
  ) as PricingConfig['modules'],
};

export const baseInput: SimulationInput = {
  currency: 'USD',
  industry: 'other',
  users: 10,
  modules: ['accounting', 'invoicing'],
  hosting: 'online',
  migration: 'basic',
  integrations: 2,
  support: 'basic',
};
