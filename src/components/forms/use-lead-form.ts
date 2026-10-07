'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { HONEYPOT_FIELD, type LeadField, type LeadKind } from '@/lib/lead/constants';

export type LeadStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

/**
 * Lógica compartida de formularios de lead: valida con el esquema Zod (el mismo
 * que usa el servidor), enfoca el primer campo inválido y envía a /api/lead.
 * El esquema se importa al enviar, así Zod no forma parte del JS inicial.
 */
export function useLeadForm({
  kind,
  buildPayload,
}: {
  kind: LeadKind;
  /** Combina los valores del formulario con datos extra (source, locale, simulación…) */
  buildPayload: (values: Record<string, string>) => Record<string, unknown>;
}) {
  const [status, setStatus] = useState<LeadStatus>('idle');
  const [errors, setErrors] = useState<Partial<Record<LeadField, true>>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(
      [...new FormData(form).entries()].map(([key, value]) => [key, String(value)]),
    );

    const { contactLeadSchema, simulatorLeadSchema, fieldErrors } =
      await import('@/lib/lead/schema');
    const schema = kind === 'contact' ? contactLeadSchema : simulatorLeadSchema;
    const parsed = schema.safeParse(buildPayload(values));
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus('submitting');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, [HONEYPOT_FIELD]: values[HONEYPOT_FIELD] ?? '' }),
      });
      if (response.status === 429) setStatus('rate_limited');
      else setStatus(response.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return { status, errors, onSubmit };
}
