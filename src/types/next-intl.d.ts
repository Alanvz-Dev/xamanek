import type { routing } from '@/i18n/routing';
import type messages from '../../messages/es.json';

// Tipado estricto de claves: es.json es la fuente de verdad.
// La prueba src/i18n/messages.test.ts verifica que en.json tenga las mismas claves.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
