/**
 * Estado del wizard del simulador (reducer puro, sin React).
 * Toda la aritmética vive en src/lib/pricing/calculate.ts; aquí solo se
 * administra la entrada, el paso actual y si ya se mostró el resultado.
 */
import { normalizeInput, recommendedModules } from '@/lib/pricing/calculate';
import type {
  Currency,
  HostingId,
  IndustryId,
  MigrationLevel,
  ModuleId,
  PricingConfig,
  SimulationInput,
  SupportTier,
} from '@/lib/pricing/types';

export const STEPS = ['industry', 'users', 'modules', 'extras'] as const;
export type StepId = (typeof STEPS)[number];

export interface SimulatorState {
  input: SimulationInput;
  step: number;
  /** Paso más avanzado visitado (habilita saltar con la barra de progreso) */
  maxStep: number;
  simulated: boolean;
  /** true tras la primera interacción: desde ahí el estado se refleja en la URL */
  dirty: boolean;
}

export type SimulatorAction =
  | { type: 'setCurrency'; currency: Currency }
  | { type: 'setIndustry'; industry: IndustryId }
  | { type: 'setUsers'; users: number }
  | { type: 'toggleModule'; module: ModuleId }
  | { type: 'resetModules' }
  | { type: 'setHosting'; hosting: HostingId }
  | { type: 'setMigration'; migration: MigrationLevel }
  | { type: 'setIntegrations'; integrations: number }
  | { type: 'setSupport'; support: SupportTier }
  | { type: 'goTo'; step: number }
  | { type: 'simulate' };

export function initialState(input: SimulationInput, simulated: boolean): SimulatorState {
  return {
    input,
    step: 0,
    maxStep: simulated ? STEPS.length - 1 : 0,
    simulated,
    dirty: false,
  };
}

export const canSimulate = (state: SimulatorState): boolean => state.input.modules.length > 0;

export function createSimulatorReducer(config: PricingConfig) {
  const update = (state: SimulatorState, patch: Partial<SimulationInput>): SimulatorState => ({
    ...state,
    dirty: true,
    input: normalizeInput({ ...state.input, ...patch }, config),
  });

  return function reducer(state: SimulatorState, action: SimulatorAction): SimulatorState {
    switch (action.type) {
      case 'setCurrency':
        return update(state, { currency: action.currency });
      case 'setIndustry':
        // Cada giro preselecciona sus módulos recomendados (editables en el paso 3)
        return update(state, {
          industry: action.industry,
          modules: recommendedModules(config, action.industry),
        });
      case 'setUsers':
        return update(state, { users: action.users });
      case 'toggleModule': {
        const { modules } = state.input;
        const next = modules.includes(action.module)
          ? modules.filter((m) => m !== action.module)
          : [...modules, action.module];
        return update(state, { modules: next });
      }
      case 'resetModules':
        return update(state, { modules: recommendedModules(config, state.input.industry) });
      case 'setHosting':
        return update(state, { hosting: action.hosting });
      case 'setMigration':
        return update(state, { migration: action.migration });
      case 'setIntegrations':
        return update(state, { integrations: action.integrations });
      case 'setSupport':
        return update(state, { support: action.support });
      case 'goTo': {
        const step = Math.min(Math.max(action.step, 0), STEPS.length - 1);
        return { ...state, step, maxStep: Math.max(state.maxStep, step) };
      }
      case 'simulate':
        return canSimulate(state) ? { ...state, simulated: true, dirty: true } : state;
    }
  };
}
