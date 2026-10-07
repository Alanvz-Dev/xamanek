/**
 * Serializa / parsea el estado del simulador en query params para compartir
 * una simulación. Funciones puras (sin window), probadas en url-state.test.ts.
 *
 *   ?cur=MXN&ind=fintech&u=25&m=accounting,crm&h=online&mig=basic&int=2&sup=basic&sim=1
 */
import { normalizeInput, recommendedModules } from './calculate';
import type { PricingConfig, SimulationInput } from './types';
import {
  CURRENCIES,
  HOSTING_IDS,
  INDUSTRY_IDS,
  MIGRATION_LEVELS,
  MODULE_IDS,
  SUPPORT_TIERS,
} from './types';

export const QUERY_KEYS = {
  currency: 'cur',
  industry: 'ind',
  users: 'u',
  modules: 'm',
  hosting: 'h',
  migration: 'mig',
  integrations: 'int',
  support: 'sup',
  simulated: 'sim',
} as const;

export interface SimulatorUrlState {
  input: SimulationInput;
  /** true si la URL indica que el resultado ya se había mostrado */
  simulated: boolean;
}

const pick = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

const int = (value: string | null): number | undefined => {
  if (value === null || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export function serializeSimulation(input: SimulationInput, simulated: boolean): string {
  const params = new URLSearchParams();
  params.set(QUERY_KEYS.currency, input.currency);
  params.set(QUERY_KEYS.industry, input.industry);
  params.set(QUERY_KEYS.users, String(input.users));
  params.set(QUERY_KEYS.modules, input.modules.join(','));
  params.set(QUERY_KEYS.hosting, input.hosting);
  params.set(QUERY_KEYS.migration, input.migration);
  params.set(QUERY_KEYS.integrations, String(input.integrations));
  params.set(QUERY_KEYS.support, input.support);
  if (simulated) params.set(QUERY_KEYS.simulated, '1');
  return params.toString();
}

/**
 * Lee el estado desde la URL. Cada valor inválido o ausente cae al de `fallback`.
 * Si llega un giro (ind) sin módulos (m), se usan los recomendados de ese giro.
 */
export function parseSimulation(
  search: string | URLSearchParams,
  fallback: SimulationInput,
  config: PricingConfig,
): SimulatorUrlState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;

  const industry = pick(INDUSTRY_IDS, params.get(QUERY_KEYS.industry)) ?? fallback.industry;
  const rawModules = params.get(QUERY_KEYS.modules);
  const modules =
    rawModules !== null
      ? rawModules
          .split(',')
          .map((m) => pick(MODULE_IDS, m.trim()))
          .filter((m) => m !== undefined)
      : params.has(QUERY_KEYS.industry)
        ? recommendedModules(config, industry)
        : fallback.modules;

  const input = normalizeInput(
    {
      currency: pick(CURRENCIES, params.get(QUERY_KEYS.currency)) ?? fallback.currency,
      industry,
      users: int(params.get(QUERY_KEYS.users)) ?? fallback.users,
      modules,
      hosting: pick(HOSTING_IDS, params.get(QUERY_KEYS.hosting)) ?? fallback.hosting,
      migration: pick(MIGRATION_LEVELS, params.get(QUERY_KEYS.migration)) ?? fallback.migration,
      integrations: int(params.get(QUERY_KEYS.integrations)) ?? fallback.integrations,
      support: pick(SUPPORT_TIERS, params.get(QUERY_KEYS.support)) ?? fallback.support,
    },
    config,
  );

  return { input, simulated: params.get(QUERY_KEYS.simulated) === '1' };
}
