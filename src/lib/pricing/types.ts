/**
 * Tipos del motor de precios Odoo.
 * Sin dependencias de React ni de Next: este módulo (junto con calculate.ts)
 * puede moverse tal cual a un servicio aparte.
 */

export const CURRENCIES = ['USD', 'MXN'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PLANS = ['standard', 'custom'] as const;
export type PlanId = (typeof PLANS)[number];

export const INDUSTRY_IDS = [
  'fintech',
  'sofom',
  'lending',
  'retail',
  'manufacturing',
  'distribution',
  'professional-services',
  'other',
] as const;
export type IndustryId = (typeof INDUSTRY_IDS)[number];

export const MODULE_IDS = [
  'accounting',
  'invoicing',
  'sales',
  'crm',
  'inventory',
  'purchase',
  'manufacturing',
  'project',
  'helpdesk',
  'pos',
  'website',
  'documents',
  'sign',
  'studio',
  'payroll',
] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_GROUPS = ['finance', 'sales', 'operations', 'productivity'] as const;
export type ModuleGroup = (typeof MODULE_GROUPS)[number];

export const HOSTING_IDS = ['online', 'odoo-sh', 'on-premise'] as const;
export type HostingId = (typeof HOSTING_IDS)[number];

export const MIGRATION_LEVELS = ['none', 'basic', 'complex'] as const;
export type MigrationLevel = (typeof MIGRATION_LEVELS)[number];

export const SUPPORT_TIERS = ['none', 'basic', 'premium'] as const;
export type SupportTier = (typeof SUPPORT_TIERS)[number];

/* ---------------------------------------------------------------- Config -- */

export interface CurrencyPricing {
  /** Precio por usuario por mes, por plan */
  plans: Record<PlanId, number>;
  /** Tarifa por hora de implementación */
  hourlyRate: number;
  /** Paquete de soporte mensual */
  support: Record<SupportTier, number>;
  /** Redondeo de importes de implementación (ej. 100 USD, 1000 MXN) */
  rounding: number;
  /** Locale para Intl.NumberFormat */
  numberLocale: string;
  /** Nota fiscal que muestra la UI */
  taxNote: 'plusVat' | 'taxesExcluded';
}

export interface ModuleConfig {
  group: ModuleGroup;
  baseHours: number;
  requiresCustomPlan: boolean;
  requiresQuote: boolean;
}

export interface IndustryConfig {
  /** Multiplicador de complejidad aplicado a las horas de módulos */
  complexity: number;
  recommendedModules: ModuleId[];
}

export interface HostingConfig {
  requiresCustomPlan: boolean;
}

export type SimulationDefaults = Omit<SimulationInput, 'currency' | 'modules'>;

export interface PricingConfig {
  version: string;
  /** Valores iniciales del simulador (los módulos salen de los recomendados del giro) */
  defaults: SimulationDefaults;
  /** Moneda inicial según el idioma de la página */
  defaultCurrencyByLocale: Record<string, Currency>;
  /** Margen del rango de implementación (0.2 = ±20%) */
  implementationMargin: number;
  limits: {
    users: { min: number; max: number };
    integrations: { min: number; max: number };
  };
  hoursPerIntegration: number;
  migrationHours: Record<MigrationLevel, number>;
  currencies: Record<Currency, CurrencyPricing>;
  hosting: Record<HostingId, HostingConfig>;
  industries: Record<IndustryId, IndustryConfig>;
  modules: Record<ModuleId, ModuleConfig>;
}

/* ----------------------------------------------------------- Entrada/salida */

export interface SimulationInput {
  currency: Currency;
  industry: IndustryId;
  users: number;
  modules: ModuleId[];
  hosting: HostingId;
  migration: MigrationLevel;
  integrations: number;
  support: SupportTier;
}

export type PlanReason = { type: 'module'; id: ModuleId } | { type: 'hosting'; id: HostingId };

export interface MoneyRange {
  min: number;
  max: number;
}

export interface SimulationResult {
  currency: Currency;
  plan: PlanId;
  /** Por qué el plan es Custom (vacío si es Standard) */
  planReasons: PlanReason[];
  /** Módulos que se cotizan aparte (excluidos del cálculo de implementación) */
  quoteSeparately: ModuleId[];
  licenses: {
    users: number;
    pricePerUser: number;
    monthly: number;
    annual: number;
  };
  implementation: MoneyRange & {
    /** Horas totales estimadas (antes del margen) */
    hours: number;
    /** Importe central (horas × tarifa) antes de aplicar el margen */
    base: number;
  };
  support: {
    tier: SupportTier;
    monthly: number;
  };
  /** Licencias + soporte */
  monthlyTotal: number;
  /** Implementación + 12 × mensualidad */
  firstYear: MoneyRange;
  taxNote: CurrencyPricing['taxNote'];
}
