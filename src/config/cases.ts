import type { IndustrySlug } from './industries';
import type { ServiceSlug } from './services';

/**
 * Casos de éxito — PLACEHOLDERS. Reemplazar por casos reales con autorización
 * del cliente. Textos en messages/{es,en}.json bajo cases.items.<id>.
 * Las métricas son cifras de ejemplo; su etiqueta vive en los mensajes.
 */
export const CASE_IDS = ['sofom-cobranza', 'distribuidora-odoo', 'fintech-ia'] as const;
export type CaseId = (typeof CASE_IDS)[number];

export interface CaseMetric {
  value: number;
  prefix?: string;
  suffix?: string;
}

export interface CaseStudy {
  id: CaseId;
  industry: IndustrySlug;
  country: 'US' | 'MX' | 'CO';
  services: ServiceSlug[];
  /** Dos métricas por caso; etiquetas en cases.items.<id>.metrics */
  metrics: [CaseMetric, CaseMetric];
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'sofom-cobranza',
    industry: 'sofom-sofipo',
    country: 'MX',
    services: ['fintech-erp', 'whatsapp'],
    metrics: [
      { value: 32, prefix: '−', suffix: '%' },
      { value: 4, suffix: 'x' },
    ],
  },
  {
    id: 'distribuidora-odoo',
    industry: 'distribucion',
    country: 'US',
    services: ['odoo'],
    metrics: [{ value: 11 }, { value: 27, prefix: '−', suffix: '%' }],
  },
  {
    id: 'fintech-ia',
    industry: 'fintech',
    country: 'CO',
    services: ['ia', 'whatsapp'],
    metrics: [
      { value: 68, suffix: '%' },
      { value: 24, suffix: '/7' },
    ],
  },
];
