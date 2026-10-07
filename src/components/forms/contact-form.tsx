'use client';

import { CircleCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { COUNTRY_OPTIONS, HONEYPOT_FIELD } from '@/lib/lead/constants';
import { HoneypotField, SelectField, TextAreaField, TextField } from './fields';
import { useLeadForm } from './use-lead-form';

export interface ContactFormProps {
  /** Opciones de servicio ya traducidas (las resuelve el servidor) */
  serviceOptions: { value: string; label: string }[];
  defaultService?: string;
  /** Botón gold solo si es el CTA principal de la sección */
  submitVariant?: 'primary' | 'accent';
}

/**
 * Formulario de contacto: nombre, empresa, email, WhatsApp, país, servicio y mensaje.
 * Valida en cliente con el mismo esquema Zod que /api/lead; incluye honeypot.
 */
export function ContactForm({
  serviceOptions,
  defaultService = '',
  submitVariant = 'primary',
}: ContactFormProps) {
  const t = useTranslations('forms');
  const locale = useLocale();
  const successRef = useRef<HTMLDivElement>(null);
  const { status, errors, onSubmit } = useLeadForm({
    kind: 'contact',
    buildPayload: (values) => ({ ...values, source: 'contact', locale }),
  });

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-edge bg-surface-strong p-8"
      >
        <CircleCheck aria-hidden="true" className="size-8 text-accent" />
        <p className="font-display text-xl font-semibold">{t('success.title')}</p>
        <p className="text-fg-muted">{t('success.text')}</p>
      </div>
    );
  }

  const error = (field: keyof typeof errors) => (errors[field] ? t(`errors.${field}`) : undefined);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      <TextField
        label={t('fields.name')}
        name="name"
        autoComplete="name"
        placeholder={t('placeholders.name')}
        required
        error={error('name')}
      />
      <TextField
        label={t('fields.company')}
        name="company"
        autoComplete="organization"
        placeholder={t('placeholders.company')}
        required
        error={error('company')}
      />
      <TextField
        label={t('fields.email')}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t('placeholders.email')}
        required
        error={error('email')}
      />
      <TextField
        label={t('fields.whatsapp')}
        name="whatsapp"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder={t('placeholders.whatsapp')}
        required
        error={error('whatsapp')}
      />
      <SelectField
        label={t('fields.country')}
        name="country"
        defaultValue=""
        placeholder={t('selectPlaceholder')}
        options={COUNTRY_OPTIONS.map((value) => ({ value, label: t(`countryOptions.${value}`) }))}
        required
        error={error('country')}
      />
      <SelectField
        label={t('fields.service')}
        name="service"
        defaultValue={defaultService}
        placeholder={t('selectPlaceholder')}
        options={[...serviceOptions, { value: 'other', label: t('serviceOther') }]}
        required
        error={error('service')}
      />
      <TextAreaField
        className="sm:col-span-2"
        label={t('fields.message')}
        optionalLabel={t('optional')}
        name="message"
        placeholder={t('placeholders.message')}
        maxLength={2000}
        error={error('message')}
      />
      <HoneypotField name={HONEYPOT_FIELD} label={t('honeypot')} />

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-muted">
          {t.rich('privacy', {
            link: (chunks) => (
              <Link href="/privacidad" className="font-medium text-fg underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <Button
          type="submit"
          variant={submitVariant}
          size="lg"
          disabled={status === 'submitting'}
          aria-busy={status === 'submitting'}
          className="w-full shrink-0 sm:w-auto"
        >
          {status === 'submitting' ? t('sending') : t('submit')}
        </Button>
      </div>

      <div aria-live="assertive" className="sm:col-span-2">
        {hasErrors ? <p className="text-sm font-medium text-danger">{t('errorSummary')}</p> : null}
        {status === 'error' ? (
          <p className="text-sm font-medium text-danger">{t('failure')}</p>
        ) : null}
        {status === 'rate_limited' ? (
          <p className="text-sm font-medium text-danger">{t('rateLimited')}</p>
        ) : null}
      </div>
    </form>
  );
}

function ContactFormFromQuery(props: ContactFormProps) {
  const service = useSearchParams().get('servicio') ?? '';
  const valid = props.serviceOptions.some((o) => o.value === service);
  return <ContactForm {...props} defaultService={valid ? service : props.defaultService} />;
}

/**
 * Variante que preselecciona el servicio desde ?servicio=<slug>.
 * El fallback (render estático) es el mismo formulario sin preselección.
 */
export function ContactFormWithQuery(props: ContactFormProps) {
  return (
    <Suspense fallback={<ContactForm {...props} />}>
      <ContactFormFromQuery {...props} />
    </Suspense>
  );
}
