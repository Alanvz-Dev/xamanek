import raw from '@/config/odoo-pricing.json';
import { pricingConfigSchema } from './schema';
import type { PricingConfig } from './types';

/** Configuración de precios validada (falla en build si el JSON es inválido). */
export const pricingConfig: PricingConfig = pricingConfigSchema.parse(raw);
