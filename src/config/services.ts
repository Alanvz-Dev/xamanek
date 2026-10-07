import type { IconName } from '@/components/ui/icon';

/**
 * Servicios de Xamanek. Los textos (nombre, descripción, beneficios, FAQ…)
 * viven en messages/{es,en}.json bajo services.items.<slug>.
 * Solo Odoo tiene simulador de precios; el resto lleva CTA a contacto.
 */
export const SERVICE_SLUGS = [
  'odoo',
  'fintech-erp',
  'whatsapp',
  'ia',
  'desarrollo-a-la-medida',
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export interface Service {
  slug: ServiceSlug;
  icon: IconName;
  hasSimulator: boolean;
}

export const services: Service[] = [
  { slug: 'odoo', icon: 'layers', hasSimulator: true },
  { slug: 'fintech-erp', icon: 'landmark', hasSimulator: false },
  { slug: 'whatsapp', icon: 'message', hasSimulator: false },
  { slug: 'ia', icon: 'bot', hasSimulator: false },
  { slug: 'desarrollo-a-la-medida', icon: 'code', hasSimulator: false },
];

export const isServiceSlug = (value: string): value is ServiceSlug =>
  (SERVICE_SLUGS as readonly string[]).includes(value);

export const getService = (slug: ServiceSlug): Service =>
  services.find((s) => s.slug === slug) as Service;
