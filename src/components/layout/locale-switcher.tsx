'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { MouseEvent } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Selector ES | EN. Lleva a la misma página en el otro idioma (rutas traducidas)
 * y conserva los query params, así una simulación en curso no se pierde.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const current = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const switchWithQuery = (event: MouseEvent, locale: Locale) => {
    const search = window.location.search;
    if (!search) return; // el <Link> navega normalmente
    event.preventDefault();
    const query = Object.fromEntries(new URLSearchParams(search));
    // pathname y params siempre corresponden a la ruta actual
    router.replace({ pathname, params, query } as never, { locale, scroll: false });
  };

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn(
        'flex items-center rounded-full border border-line p-0.5 font-mono text-xs',
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const active = locale === current;
        const languageName = t(`languages.${locale}`);
        return (
          <Link
            key={locale}
            // pathname y params siempre corresponden a la ruta actual
            href={{ pathname, params } as never}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? 'true' : undefined}
            aria-label={active ? languageName : t('switchTo', { language: languageName })}
            onClick={(event) => !active && switchWithQuery(event, locale)}
            className={cn(
              'rounded-full px-2.5 py-1 font-medium uppercase transition-colors',
              active ? 'bg-jade text-deep' : 'text-muted-on-dark hover:text-on-dark',
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
