import { describe, expect, it } from 'vitest';
import { baseInput, testConfig } from '@/lib/pricing/fixtures';
import { createSimulatorReducer, initialState } from './simulator-state';

const reducer = createSimulatorReducer(testConfig);

describe('simulator reducer', () => {
  it('al cambiar de giro preselecciona sus módulos recomendados', () => {
    const state = reducer(initialState(baseInput, false), {
      type: 'setIndustry',
      industry: 'retail',
    });
    expect(state.input.industry).toBe('retail');
    expect(state.input.modules).toEqual(['accounting', 'pos']);
    expect(state.dirty).toBe(true);
  });

  it('agrega y quita módulos', () => {
    let state = initialState(baseInput, false);
    state = reducer(state, { type: 'toggleModule', module: 'crm' });
    expect(state.input.modules).toEqual(['accounting', 'invoicing', 'crm']);
    state = reducer(state, { type: 'toggleModule', module: 'accounting' });
    expect(state.input.modules).toEqual(['invoicing', 'crm']);
  });

  it('acota usuarios al rango configurado', () => {
    const state = reducer(initialState(baseInput, false), { type: 'setUsers', users: 900 });
    expect(state.input.users).toBe(500);
  });

  it('no simula sin módulos', () => {
    const empty = initialState({ ...baseInput, modules: [] }, false);
    expect(reducer(empty, { type: 'simulate' }).simulated).toBe(false);
    expect(reducer(initialState(baseInput, false), { type: 'simulate' }).simulated).toBe(true);
  });

  it('el cambio de moneda conserva el resto de la configuración', () => {
    const state = reducer(initialState(baseInput, true), { type: 'setCurrency', currency: 'MXN' });
    expect(state.input).toEqual({ ...baseInput, currency: 'MXN' });
    expect(state.simulated).toBe(true);
  });
});
