import type { IconName } from '@/components/ui/icon';
import type { IndustryId } from '@/lib/pricing/types';
import type { ServiceSlug } from './services';

/**
 * Industrias con página propia (/industrias/[slug]). Textos en
 * messages/{es,en}.json bajo industries.items.<slug>.
 * `simulatorIndustry` es el giro que se preselecciona en el simulador.
 */
export const INDUSTRY_SLUGS = [
  'fintech',
  'sofom-sofipo',
  'financieras',
  'retail',
  'manufactura',
  'distribucion',
] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export interface Industry {
  slug: IndustrySlug;
  icon: IconName;
  simulatorIndustry: IndustryId;
  /** Servicios que se destacan en la página de la industria */
  services: ServiceSlug[];
}

export const industries: Industry[] = [
  {
    slug: 'fintech',
    icon: 'zap',
    simulatorIndustry: 'fintech',
    services: ['fintech-erp', 'ia', 'whatsapp'],
  },
  {
    slug: 'sofom-sofipo',
    icon: 'landmark',
    simulatorIndustry: 'sofom',
    services: ['fintech-erp', 'whatsapp', 'odoo'],
  },
  {
    slug: 'financieras',
    icon: 'coins',
    simulatorIndustry: 'lending',
    services: ['fintech-erp', 'whatsapp', 'ia'],
  },
  {
    slug: 'retail',
    icon: 'store',
    simulatorIndustry: 'retail',
    services: ['odoo', 'whatsapp', 'ia'],
  },
  {
    slug: 'manufactura',
    icon: 'factory',
    simulatorIndustry: 'manufacturing',
    services: ['odoo', 'desarrollo-a-la-medida', 'ia'],
  },
  {
    slug: 'distribucion',
    icon: 'truck',
    simulatorIndustry: 'distribution',
    services: ['odoo', 'whatsapp', 'desarrollo-a-la-medida'],
  },
];

export const isIndustrySlug = (value: string): value is IndustrySlug =>
  (INDUSTRY_SLUGS as readonly string[]).includes(value);

export const getIndustry = (slug: IndustrySlug): Industry =>
  industries.find((i) => i.slug === slug) as Industry;
