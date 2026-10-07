import { defineRouting } from 'next-intl/routing';

/**
 * Rutas localizadas. La clave es la ruta interna (carpetas en src/app/[locale]),
 * el valor es la URL pública por idioma. Al agregar una página nueva, regístrala aquí.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/soluciones/[slug]': {
      es: '/soluciones/[slug]',
      en: '/solutions/[slug]',
    },
    '/industrias/[slug]': {
      es: '/industrias/[slug]',
      en: '/industries/[slug]',
    },
    '/contacto': {
      es: '/contacto',
      en: '/contact',
    },
    '/privacidad': {
      es: '/privacidad',
      en: '/privacy',
    },
    '/terminos': {
      es: '/terminos',
      en: '/terms',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
