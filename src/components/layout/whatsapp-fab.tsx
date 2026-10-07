import { getTranslations } from 'next-intl/server';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { whatsappLink } from '@/config/site';

/** Botón flotante de WhatsApp. Número en src/config/site.ts (NEXT_PUBLIC_WHATSAPP_NUMBER). */
export async function WhatsAppFab() {
  const t = await getTranslations('whatsapp');
  return (
    <a
      href={whatsappLink(t('message'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('label')}
      title={t('label')}
      className="fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-jade text-deep shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-jade sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
