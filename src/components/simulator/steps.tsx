'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties, Dispatch, KeyboardEvent } from 'react';
import { useId, useState } from 'react';
import { pricingConfig } from '@/lib/pricing/config';
import {
  HOSTING_IDS,
  INDUSTRY_IDS,
  MIGRATION_LEVELS,
  MODULE_GROUPS,
  MODULE_IDS,
  SUPPORT_TIERS,
  type SimulationInput,
} from '@/lib/pricing/types';
import { ChoiceCard, Chip, Stepper, Tag } from './controls';
import type { SimulatorAction } from './simulator-state';

interface StepProps {
  input: SimulationInput;
  dispatch: Dispatch<SimulatorAction>;
}

const fieldsetClass = 'min-w-0 border-0 p-0';
const legendClass = 'mb-3 text-sm font-semibold text-on-dark';

/* ------------------------------------------------------------------ Giro -- */

export function StepIndustry({ input, dispatch }: StepProps) {
  const t = useTranslations('simulator');
  return (
    <fieldset className={fieldsetClass}>
      <legend className="sr-only">{t('stepTitles.industry')}</legend>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 xl:grid-cols-4">
        {INDUSTRY_IDS.map((industry) => (
          <ChoiceCard
            key={industry}
            name="industry"
            value={industry}
            checked={input.industry === industry}
            onChange={() => dispatch({ type: 'setIndustry', industry })}
            label={t(`industries.${industry}`)}
          />
        ))}
      </div>
    </fieldset>
  );
}

/* -------------------------------------------------------------- Usuarios -- */

const { min: MIN_USERS, max: MAX_USERS } = pricingConfig.limits.users;
const SLIDER_STEPS = 1000;

// Escala logarítmica: la mayoría de las empresas está entre 5 y 50 usuarios,
// así ese tramo ocupa buena parte del slider.
const toSlider = (users: number) =>
  Math.round((Math.log(users / MIN_USERS) / Math.log(MAX_USERS / MIN_USERS)) * SLIDER_STEPS);
const fromSlider = (position: number) =>
  Math.round(MIN_USERS * Math.pow(MAX_USERS / MIN_USERS, position / SLIDER_STEPS));

export function StepUsers({ input, dispatch }: StepProps) {
  const t = useTranslations('simulator.users');
  const sliderId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const setUsers = (users: number) => dispatch({ type: 'setUsers', users });
  const position = toSlider(input.users);

  // Las flechas mueven de 1 en 1 y RePág/AvPág de 10 en 10, en usuarios reales
  const onSliderKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 10,
      PageDown: -10,
    };
    const delta = deltas[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    setUsers(input.users + delta);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <label htmlFor={sliderId} className={legendClass}>
          {t('label')}
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={position}
          onChange={(event) => setUsers(fromSlider(Number(event.target.value)))}
          onKeyDown={onSliderKey}
          aria-valuetext={t('count', { count: input.users })}
          className="range-jade mt-4 w-full"
          style={{ '--fill': `${(position / SLIDER_STEPS) * 100}%` } as CSSProperties}
        />
        <div className="mt-2 flex justify-between font-mono text-xs text-muted-on-dark">
          <span>{MIN_USERS}</span>
          <span>{MAX_USERS}</span>
        </div>
      </div>

      <Stepper
        value={input.users}
        min={MIN_USERS}
        max={MAX_USERS}
        onChange={setUsers}
        decreaseLabel={t('decrease')}
        increaseLabel={t('increase')}
      >
        <input
          type="number"
          inputMode="numeric"
          min={MIN_USERS}
          max={MAX_USERS}
          aria-label={t('label')}
          value={draft ?? String(input.users)}
          onChange={(event) => {
            setDraft(event.target.value);
            const n = Number(event.target.value);
            if (event.target.value !== '' && Number.isFinite(n)) setUsers(n);
          }}
          onBlur={() => setDraft(null)}
          className="h-12 w-28 rounded-xl border border-line bg-deep/60 text-center font-mono text-xl text-on-dark focus:border-jade focus:outline-none"
        />
      </Stepper>
      <p className="font-mono text-sm text-muted-on-dark" aria-hidden="true">
        {t('count', { count: input.users })}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- Módulos -- */

export function StepModules({ input, dispatch }: StepProps) {
  const t = useTranslations('simulator');
  const selected = new Set(input.modules);

  return (
    <div className="flex flex-col gap-7">
      {MODULE_GROUPS.map((group) => {
        const modules = MODULE_IDS.filter((id) => pricingConfig.modules[id].group === group);
        return (
          <fieldset key={group} className={fieldsetClass}>
            <legend className={legendClass}>{t(`groups.${group}`)}</legend>
            <div className="flex flex-wrap gap-2">
              {modules.map((id) => {
                const config = pricingConfig.modules[id];
                return (
                  <Chip
                    key={id}
                    name="modules"
                    value={id}
                    checked={selected.has(id)}
                    onChange={() => dispatch({ type: 'toggleModule', module: id })}
                    tags={
                      config.requiresCustomPlan || config.requiresQuote ? (
                        <>
                          {config.requiresCustomPlan ? <Tag>{t('moduleTags.custom')}</Tag> : null}
                          {config.requiresQuote ? <Tag>{t('moduleTags.quote')}</Tag> : null}
                        </>
                      ) : undefined
                    }
                  >
                    {t(`modules.${id}`)}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="font-mono text-sm text-muted-on-dark" aria-live="polite">
          {t('modulesSelected', { count: input.modules.length })}
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'resetModules' })}
          className="inline-flex items-center gap-1.5 text-sm text-jade hover:underline"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          {t('resetRecommended')}
        </button>
      </div>
      {input.modules.length === 0 ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {t('modulesRequired')}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Extras -- */

export function StepExtras({ input, dispatch }: StepProps) {
  const t = useTranslations('simulator');
  const { min, max } = pricingConfig.limits.integrations;
  const integrationsLabelId = useId();

  return (
    <div className="flex flex-col gap-8">
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('hosting.label')}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {HOSTING_IDS.map((hosting) => (
            <ChoiceCard
              key={hosting}
              name="hosting"
              value={hosting}
              checked={input.hosting === hosting}
              onChange={() => dispatch({ type: 'setHosting', hosting })}
              label={t(`hosting.options.${hosting}`)}
              hint={t(`hosting.hints.${hosting}`)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('migration.label')}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {MIGRATION_LEVELS.map((migration) => (
            <ChoiceCard
              key={migration}
              name="migration"
              value={migration}
              checked={input.migration === migration}
              onChange={() => dispatch({ type: 'setMigration', migration })}
              label={t(`migration.options.${migration}`)}
              hint={t(`migration.hints.${migration}`)}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <p className={legendClass} id={integrationsLabelId}>
          {t('integrations.label')}
        </p>
        <p className="-mt-2 mb-4 text-xs text-muted-on-dark">{t('integrations.hint')}</p>
        <Stepper
          value={input.integrations}
          min={min}
          max={max}
          onChange={(integrations) => dispatch({ type: 'setIntegrations', integrations })}
          decreaseLabel={t('integrations.decrease')}
          increaseLabel={t('integrations.increase')}
        >
          <output
            aria-labelledby={integrationsLabelId}
            aria-live="polite"
            className="min-w-36 text-center font-mono text-base text-on-dark"
          >
            {t('integrations.count', { count: input.integrations })}
          </output>
        </Stepper>
      </div>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('support.label')}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {SUPPORT_TIERS.map((support) => (
            <ChoiceCard
              key={support}
              name="support"
              value={support}
              checked={input.support === support}
              onChange={() => dispatch({ type: 'setSupport', support })}
              label={t(`support.options.${support}`)}
              hint={t(`support.hints.${support}`)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
