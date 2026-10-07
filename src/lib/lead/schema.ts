import { z } from 'zod';
import { routing } from '@/i18n/routing';
import { simulationInputSchema } from '@/lib/pricing/schema';
import { COUNTRY_OPTIONS, type LeadField, SERVICE_OPTIONS } from './constants';

/**
 * Esquemas de leads compartidos por cliente (validación inmediata) y servidor (/api/lead).
 * Los mensajes de error se traducen en la UI por campo (forms.errors.<campo>).
 */

export { HONEYPOT_FIELD } from './constants';

const base = {
  locale: z.enum(routing.locales),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.email().max(200),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{8,22}$/)
    .refine((v) => v.replace(/\D/g, '').length >= 8),
};

export const contactLeadSchema = z.object({
  source: z.literal('contact'),
  ...base,
  country: z.enum(COUNTRY_OPTIONS),
  service: z.enum(SERVICE_OPTIONS),
  message: z.string().trim().max(2000).default(''),
});

export const simulatorLeadSchema = z.object({
  source: z.literal('simulator'),
  ...base,
  simulation: simulationInputSchema,
});

export const leadSchema = z.discriminatedUnion('source', [contactLeadSchema, simulatorLeadSchema]);

export type ContactLead = z.infer<typeof contactLeadSchema>;
export type SimulatorLead = z.infer<typeof simulatorLeadSchema>;
export type Lead = z.infer<typeof leadSchema>;

/** Campos con error a partir de un ZodError (para pintar errores por campo). */
export function fieldErrors(error: z.ZodError): Partial<Record<LeadField, true>> {
  const result: Partial<Record<LeadField, true>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string') result[field as LeadField] = true;
  }
  return result;
}
