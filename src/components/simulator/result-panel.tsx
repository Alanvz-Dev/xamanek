'use client';

import { Check, Info, Link2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useTranslations } from 'next-intl';
import type { ReactNode, Ref } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { pricingConfig } from '@/lib/pricing/config';
import { decimalsFor, formatMoney } from '@/lib/pricing/format';
import type { SimulationInput, SimulationResult } from '@/lib/pricing/types';
import { AnimatedMoney } from './animated-money';
import { ProposalForm } from './proposal-form';

function Row({
  label,
  detail,
  children,
  emphasis = false,
}: {
  label: string;
  detail?: ReactNode;
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 py-4',
        emphasis && 'rounded-xl border border-jade/30 bg-jade/[0.07] px-4',
      )}
    >
      <dt className="text-sm text-muted-on-dark">{label}</dt>
      <dd className={cn('font-mono text-on-dark', emphasis ? 'text-2xl' : 'text-xl')}>
        {children}
      </dd>
      {detail ? <dd className="text-xs text-muted-on-dark">{detail}</dd> : null}
    </div>
  );
}

/**
 * Resultado del simulador. Se muestra sin pedir datos; debajo, el CTA a propuesta detallada.
 * Las cifras cuentan hacia arriba (Motion). Un resumen sr-only con aria-live anuncia cambios.
 */
export function ResultPanel({
  result,
  input,
  headingRef,
}: {
  result: SimulationResult;
  input: SimulationInput;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const t = useTranslations('simulator');
  const [proposalOpen, setProposalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { currency } = result;
  const money = (n: number) => formatMoney(n, currency, pricingConfig);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles: no hacemos nada (el enlace sigue en la barra de direcciones)
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl font-semibold text-on-dark focus:outline-none"
        >
          {t('result.title')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-jade/50 bg-jade/10 px-3 py-1 font-mono text-xs text-on-dark">
            {t('result.plan', { plan: t(`result.plans.${result.plan}`) })}
          </span>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted-on-dark">
            {t(`result.taxes.${result.taxNote}`)}
          </span>
        </div>
      </div>

      {result.planReasons.length > 0 ? (
        <div className="flex gap-3 rounded-xl border border-line bg-deep/50 p-4 text-sm text-muted-on-dark">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jade" />
          <div>
            <p className="font-medium text-on-dark">{t('result.customNote')}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {result.planReasons.map((reason) => (
                <li key={`${reason.type}-${reason.id}`}>
                  {reason.type === 'module'
                    ? t('result.reasonModule', { module: t(`modules.${reason.id}`) })
                    : t('result.reasonHosting', { hosting: t(`hosting.options.${reason.id}`) })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {result.quoteSeparately.length > 0 ? (
        <p className="flex gap-3 rounded-xl border border-line bg-deep/50 p-4 text-sm text-muted-on-dark">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jade" />
          {t('result.quoteNote', {
            modules: result.quoteSeparately.map((id) => t(`modules.${id}`)).join(', '),
          })}
        </p>
      ) : null}

      <dl className="divide-y divide-line">
        <Row
          label={t('result.implementation')}
          detail={t('result.implementationDetail', { hours: result.implementation.hours })}
        >
          <AnimatedMoney value={result.implementation.min} currency={currency} />
          <span aria-hidden="true" className="px-1.5 text-muted-on-dark">
            –
          </span>
          <AnimatedMoney value={result.implementation.max} currency={currency} />
        </Row>
        <Row
          label={t('result.licenses')}
          detail={
            <>
              {t('result.licensesDetail', {
                users: result.licenses.users,
                price: formatMoney(result.licenses.pricePerUser, currency, pricingConfig, {
                  decimals: decimalsFor(result.licenses.pricePerUser),
                }),
              })}
              {' · '}
              {t('result.annual', { amount: money(result.licenses.annual) })}
            </>
          }
        >
          <AnimatedMoney
            value={result.licenses.monthly}
            currency={currency}
            decimals={decimalsFor(result.licenses.monthly)}
          />{' '}
          <span className="font-sans text-sm text-muted-on-dark">{t('result.perMonth')}</span>
        </Row>
        <Row
          label={t('result.support')}
          detail={t('result.supportDetail', {
            tier: t(`support.options.${result.support.tier}`),
          })}
        >
          <AnimatedMoney value={result.support.monthly} currency={currency} />{' '}
          <span className="font-sans text-sm text-muted-on-dark">{t('result.perMonth')}</span>
        </Row>
      </dl>

      <dl className="grid gap-3">
        <Row label={t('result.monthlyTotal')} detail={t('result.monthlyTotalDetail')} emphasis>
          <AnimatedMoney
            value={result.monthlyTotal}
            currency={currency}
            decimals={decimalsFor(result.monthlyTotal)}
          />{' '}
          <span className="font-sans text-sm text-muted-on-dark">{t('result.perMonth')}</span>
        </Row>
        <Row label={t('result.firstYear')} detail={t('result.firstYearDetail')} emphasis>
          <AnimatedMoney value={result.firstYear.min} currency={currency} />
          <span aria-hidden="true" className="px-1.5 text-muted-on-dark">
            –
          </span>
          <AnimatedMoney value={result.firstYear.max} currency={currency} />
        </Row>
      </dl>

      <p className="text-xs leading-relaxed text-muted-on-dark">{t('result.disclaimer')}</p>

      <AnimatePresence initial={false} mode="wait">
        {proposalOpen ? (
          <m.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ProposalForm input={input} onClose={() => setProposalOpen(false)} />
          </m.div>
        ) : (
          <m.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-start gap-2"
          >
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => setProposalOpen(true)}
            >
              {t('result.proposalCta')}
            </Button>
            <Button variant="ghost" size="sm" className="px-0 whitespace-normal" onClick={copyLink}>
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Link2 aria-hidden="true" className="size-4" />
              )}
              {copied ? t('result.copied') : t('result.share')}
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
