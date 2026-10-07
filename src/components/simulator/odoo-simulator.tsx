'use client';

import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { MotionProvider } from '@/components/motion/motion-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { calculate, defaultCurrency, defaultInput } from '@/lib/pricing/calculate';
import { pricingConfig } from '@/lib/pricing/config';
import { formatMoney } from '@/lib/pricing/format';
import type { IndustryId } from '@/lib/pricing/types';
import { parseSimulation, serializeSimulation } from '@/lib/pricing/url-state';
import { CurrencySwitch } from './currency-switch';
import { ResultPanel } from './result-panel';
import {
  canSimulate,
  createSimulatorReducer,
  initialState,
  STEPS,
  type StepId,
} from './simulator-state';
import { StepExtras, StepIndustry, StepModules, StepUsers } from './steps';

const reducer = createSimulatorReducer(pricingConfig);

const STEP_COMPONENTS: Record<StepId, typeof StepIndustry> = {
  industry: StepIndustry,
  users: StepUsers,
  modules: StepModules,
  extras: StepExtras,
};

export interface SimulatorProps {
  /** Giro preseleccionado (páginas de industria) */
  initialIndustry?: IndustryId;
}

/**
 * Simulador de precios Odoo. Solo cliente (se carga diferido con SimulatorLoader):
 * lee el estado inicial de la URL (?cur=…&ind=…) para que una simulación compartida
 * se abra igual, y refleja cada cambio de vuelta en la URL.
 */
export default function OdooSimulator({ initialIndustry }: SimulatorProps) {
  const t = useTranslations('simulator');
  const locale = useLocale();
  const [state, dispatch] = useReducer(reducer, null, () => {
    const fallback = defaultInput(pricingConfig, {
      currency: defaultCurrency(pricingConfig, locale),
      industry: initialIndustry,
    });
    const parsed = parseSimulation(window.location.search, fallback, pricingConfig);
    return initialState(parsed.input, parsed.simulated);
  });
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultRegionRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => calculate(state.input, pricingConfig), [state.input]);
  const showResult = state.simulated && canSimulate(state);
  const stepId = STEPS[state.step];
  const StepComponent = STEP_COMPONENTS[stepId];
  const isLastStep = state.step === STEPS.length - 1;

  // El estado completo vive en la URL para poder compartir la simulación
  useEffect(() => {
    if (!state.dirty) return;
    const query = serializeSimulation(state.input, state.simulated);
    // #simulador: quien abra el enlace compartido llega directo a la sección
    window.history.replaceState(null, '', `?${query}#simulador`);
  }, [state.input, state.simulated, state.dirty]);

  const onSimulate = () => {
    const firstTime = !state.simulated;
    dispatch({ type: 'simulate' });
    if (firstTime) {
      // Lleva el foco (y el scroll en móvil) al resultado
      requestAnimationFrame(() => {
        resultRegionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        resultHeadingRef.current?.focus({ preventScroll: true });
      });
    }
  };

  return (
    <MotionProvider>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-on-dark" aria-live="polite">
            {t('progress', { current: state.step + 1, total: STEPS.length })}
          </p>
          <CurrencySwitch
            value={state.input.currency}
            onChange={(currency) => dispatch({ type: 'setCurrency', currency })}
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* ---------------------------------------------------------- Wizard */}
          <div className="glass p-5 sm:p-8">
            <ol className="mb-8 grid grid-cols-4 gap-2">
              {STEPS.map((id, index) => {
                const reachable = index <= state.maxStep;
                const current = index === state.step;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => dispatch({ type: 'goTo', step: index })}
                      aria-current={current ? 'step' : undefined}
                      aria-label={t('nav.goToStep', { step: index + 1, name: t(`steps.${id}`) })}
                      className="group flex w-full flex-col gap-2 text-left disabled:cursor-not-allowed"
                    >
                      <span className="h-1 w-full overflow-hidden rounded-full bg-line">
                        <m.span
                          className="block h-full rounded-full bg-jade"
                          initial={false}
                          animate={{ width: index <= state.step ? '100%' : '0%' }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </span>
                      <span
                        className={cn(
                          'font-mono text-[0.7rem] tracking-wide uppercase',
                          current ? 'text-on-dark' : 'text-muted-on-dark',
                          reachable && !current && 'group-hover:text-on-dark',
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                        {/* En móvil basta el número: el título del paso ya está en el h3 */}
                        <span className="hidden sm:inline">
                          {' · '}
                          {t(`steps.${id}`)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <AnimatePresence mode="wait" initial={false}>
              <m.section
                key={stepId}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                aria-labelledby={`sim-step-${stepId}`}
              >
                <h3
                  id={`sim-step-${stepId}`}
                  className="font-display text-xl font-semibold text-on-dark sm:text-2xl"
                >
                  {t(`stepTitles.${stepId}`)}
                </h3>
                <p className="mt-2 mb-6 text-sm text-muted-on-dark">{t(`stepHints.${stepId}`)}</p>
                <StepComponent input={state.input} dispatch={dispatch} />
              </m.section>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: 'goTo', step: state.step - 1 })}
                disabled={state.step === 0}
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t('nav.back')}
              </Button>
              {isLastStep ? (
                <Button size="lg" onClick={onSimulate} disabled={!canSimulate(state)}>
                  <Calculator aria-hidden="true" className="size-5" />
                  {t('nav.simulate')}
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={() => dispatch({ type: 'goTo', step: state.step + 1 })}
                  disabled={stepId === 'modules' && !canSimulate(state)}
                >
                  {t('nav.next')}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------- Resultado */}
          <div ref={resultRegionRef} className="glass scroll-mt-24 p-5 sm:p-8 lg:sticky lg:top-24">
            {showResult ? (
              <ResultPanel result={result} input={state.input} headingRef={resultHeadingRef} />
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-line bg-deep/60 text-jade">
                  <Calculator aria-hidden="true" className="size-6" />
                </span>
                <p className="max-w-xs text-sm text-muted-on-dark">
                  {state.simulated ? t('modulesRequired') : t('result.empty')}
                </p>
              </div>
            )}
            {/* Anuncio accesible del resultado (no anuncia cada cuadro del conteo) */}
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {showResult
                ? t('result.announce', {
                    min: formatMoney(result.implementation.min, result.currency, pricingConfig),
                    max: formatMoney(result.implementation.max, result.currency, pricingConfig),
                    monthly: formatMoney(result.monthlyTotal, result.currency, pricingConfig),
                  })
                : ''}
            </p>
          </div>
        </div>
      </div>
    </MotionProvider>
  );
}
