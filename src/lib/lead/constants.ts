import { SERVICE_SLUGS } from '@/config/services';

/**
 * Constantes de leads SIN dependencia de Zod, para que los formularios no carguen
 * el validador hasta que el usuario envía (ver use-lead-form.ts).
 */

/** Nombre del campo trampa anti-spam. Los humanos no lo ven; los bots lo llenan. */
export const HONEYPOT_FIELD = 'fax';

export const COUNTRY_OPTIONS = ['US', 'MX', 'CO', 'OTHER'] as const;
export const SERVICE_OPTIONS = [...SERVICE_SLUGS, 'other'] as const;

export type LeadField =
  'name' | 'company' | 'email' | 'whatsapp' | 'country' | 'service' | 'message';
export type LeadKind = 'contact' | 'simulator';
