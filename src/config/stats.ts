/**
 * Cifras de la barra de confianza — PLACEHOLDERS (TODO: cifras reales).
 * Etiquetas en messages bajo trust.stats.<id>.
 */
export const STAT_IDS = ['projects', 'years', 'users', 'countries'] as const;
export type StatId = (typeof STAT_IDS)[number];

export interface Stat {
  id: StatId;
  value: number;
  prefix?: string;
  suffix?: string;
}

export const stats: Stat[] = [
  { id: 'projects', value: 120, suffix: '+' },
  { id: 'years', value: 10, suffix: '+' },
  { id: 'users', value: 8500, suffix: '+' },
  { id: 'countries', value: 3 },
];
