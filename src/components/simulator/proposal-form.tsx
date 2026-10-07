'use client';

import { CircleCheck, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { HoneypotField, TextField } from '@/components/forms/fields';
import { useLeadForm } from '@/components/forms/use-lead-form';
import { Button } from '@/components/ui/button';
import { HONEYPOT_FIELD } from '@/lib/lead/constants';
import type { SimulationInput } from '@/lib/pricing/types';

/**
 * Formulario corto (nombre, email, WhatsApp, empresa) que envía a /api/lead
 * la configuración simulada completa, incluida la moneda.
 */
export function ProposalForm({ input, onClose }: { input: SimulationInput; onClose: () => void }) {
  const t = useTranslations('simulator.proposal');
  const tf = useTranslations('forms');
  const locale = useLocale();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const { status, errors, onSubmit } = useLeadForm({
    kind: 'simulator',
    buildPayload: (values) => ({ ...values, source: 'simulator', locale, simulation: input }),
  });

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col gap-2 rounded-xl border border-jade/40 bg-jade/10 p-5"
      >
        <CircleCheck aria-hidden="true" className="size-6 text-jade" />
        <p className="font-semibold text-on-dark">{tf('success.title')}</p>
        <p className="text-sm text-muted-on-dark">{tf('success.text')}</p>
      </div>
    );
  }

  const error = (field: keyof typeof errors) => (errors[field] ? tf(`errors.${field}`) : undefined);

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-col gap-4 rounded-xl border border-line bg-deep/60 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-base font-semibold text-on-dark">{t('title')}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-on-dark">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="rounded-full p-1.5 text-muted-on-dark hover:bg-white/5 hover:text-on-dark"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          ref={firstFieldRef}
          label={tf('fields.name')}
          name="name"
          autoComplete="name"
          required
          error={error('name')}
        />
        <TextField
          label={tf('fields.company')}
          name="company"
          autoComplete="organization"
          required
          error={error('company')}
        />
        <TextField
          label={tf('fields.email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          error={error('email')}
        />
        <TextField
          label={tf('fields.whatsapp')}
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={tf('placeholders.whatsapp')}
          required
          error={error('whatsapp')}
        />
      </div>
      <HoneypotField name={HONEYPOT_FIELD} label={tf('honeypot')} />

      <Button
        type="submit"
        variant="accent"
        disabled={status === 'submitting'}
        aria-busy={status === 'submitting'}
      >
        {status === 'submitting' ? tf('sending') : t('submit')}
      </Button>

      <div aria-live="assertive">
        {status === 'error' ? (
          <p className="text-sm font-medium text-danger">{tf('failure')}</p>
        ) : null}
        {status === 'rate_limited' ? (
          <p className="text-sm font-medium text-danger">{tf('rateLimited')}</p>
        ) : null}
      </div>
    </form>
  );
}
