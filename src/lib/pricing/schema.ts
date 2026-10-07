import { z } from 'zod';
import {
  CURRENCIES,
  HOSTING_IDS,
  INDUSTRY_IDS,
  MIGRATION_LEVELS,
  MODULE_GROUPS,
  MODULE_IDS,
  PLANS,
  SUPPORT_TIERS,
} from './types';

const money = z.number().nonnegative();
const range = z.object({ min: z.number().int().nonnegative(), max: z.number().int().positive() });

/**
 * Esquema del JSON de precios. Si alguien edita src/config/odoo-pricing.json
 * con un error (falta un módulo, un precio negativo…), el build y las pruebas fallan
 * con un mensaje claro. Los records con z.enum exigen TODAS las claves.
 */
export const pricingConfigSchema = z.object({
  version: z.string(),
  defaults: z.object({
    industry: z.enum(INDUSTRY_IDS),
    users: z.number().int().positive(),
    hosting: z.enum(HOSTING_IDS),
    migration: z.enum(MIGRATION_LEVELS),
    integrations: z.number().int().nonnegative(),
    support: z.enum(SUPPORT_TIERS),
  }),
  defaultCurrencyByLocale: z.record(z.string(), z.enum(CURRENCIES)),
  implementationMargin: z.number().min(0).max(0.9),
  limits: z.object({ users: range, integrations: range }),
  hoursPerIntegration: z.number().nonnegative(),
  migrationHours: z.record(z.enum(MIGRATION_LEVELS), z.number().nonnegative()),
  currencies: z.record(
    z.enum(CURRENCIES),
    z.object({
      plans: z.record(z.enum(PLANS), money),
      hourlyRate: money,
      support: z.record(z.enum(SUPPORT_TIERS), money),
      rounding: z.number().int().nonnegative(),
      numberLocale: z.string(),
      taxNote: z.enum(['plusVat', 'taxesExcluded']),
    }),
  ),
  hosting: z.record(z.enum(HOSTING_IDS), z.object({ requiresCustomPlan: z.boolean() })),
  industries: z.record(
    z.enum(INDUSTRY_IDS),
    z.object({
      complexity: z.number().positive(),
      recommendedModules: z.array(z.enum(MODULE_IDS)),
    }),
  ),
  modules: z.record(
    z.enum(MODULE_IDS),
    z.object({
      group: z.enum(MODULE_GROUPS),
      baseHours: z.number().nonnegative(),
      requiresCustomPlan: z.boolean(),
      requiresQuote: z.boolean(),
    }),
  ),
});

/** Entrada del simulador (usada por /api/lead para validar lo que manda el cliente). */
export const simulationInputSchema = z.object({
  currency: z.enum(CURRENCIES),
  industry: z.enum(INDUSTRY_IDS),
  users: z.number().int(),
  modules: z.array(z.enum(MODULE_IDS)).max(MODULE_IDS.length),
  hosting: z.enum(HOSTING_IDS),
  migration: z.enum(MIGRATION_LEVELS),
  integrations: z.number().int(),
  support: z.enum(SUPPORT_TIERS),
});
