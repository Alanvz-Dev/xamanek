/**
 * Aliados estratégicos que aparecen bajo el logo del hero.
 * IntelliFin entrega su logo como web component (<intellifin-logo>, 3D con three.js desde cdnjs);
 * Nexia como imagen.
 */
export const partners = {
  intellifin: {
    name: 'IntelliFin',
    url: 'https://intellifin.com.mx/',
    script: '/brand/partners/intellifin-logo.js',
  },
  nexia: { name: 'Nexia', url: 'https://www.ia-nexia.com/', logo: '/brand/partners/nexia.png' },
} as const;
