/**
 * Geometría del logo placeholder (pirámide escalonada + piedra angular flotante con ojo).
 * La versión estática vive en public/brand/logo.svg; el hero usa esta geometría
 * en línea para poder animar sus partes. Si se sustituye el logo real, actualiza
 * ambos y conserva las partes animables: tiers, stairs, capstone, eye, iris.
 */
export const LOGO_VIEWBOX = '0 0 240 240';

/** Niveles de la pirámide, de abajo hacia arriba */
export const TIERS = [
  '24,226 216,226 204,198 36,198',
  '44,194 196,194 186,168 54,168',
  '62,164 178,164 170,140 70,140',
  '78,136 162,136 156,116 84,116',
] as const;

/** Escalinata central */
export const STAIRS = 'M112 116 L104 226 M128 116 L136 226';
export const STAIR_STEPS = [
  'M110 140 H130',
  'M109 152 H131',
  'M108 164 H132',
  'M107 180 H133',
  'M106 196 H134',
  'M105 212 H135',
] as const;

/** Piedra angular flotante */
export const CAPSTONE = '120,18 166,100 74,100';

/** Ojo: misma estructura de comandos abierta/cerrada para un morph limpio */
export const EYE_OPEN = 'M96 70 Q120 50 144 70 Q120 90 96 70 Z';
export const EYE_CLOSED = 'M96 70 Q120 71 144 70 Q120 73 96 70 Z';
export const EYE_CENTER = { x: 120, y: 70 } as const;
