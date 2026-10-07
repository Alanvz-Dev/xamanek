import type { Metadata } from 'next';
import { offices } from '@/config/offices';
import { siteConfig } from '@/config/site';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

type Href = Parameters<typeof getPathname>[0]['href'];

const OG_LOCALES: Record<Locale, string> = { es: 'es_MX', en: 'en_US' };

/** URL absoluta de una ruta interna en un idioma (respeta rutas traducidas). */
export function absoluteUrl(href: Href, locale: Locale): string {
  return `${siteConfig.url}${getPathname({ href, locale })}`;
}

/**
 * Metadata estándar por página: título, descripción, canonical, hreflang (es/en/x-default),
 * Open Graph y Twitter. La imagen OG la genera src/app/[locale]/opengraph-image.tsx.
 */
export function buildMetadata({
  locale,
  href,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: Locale;
  href: Href;
  title: string;
  description: string;
  /** true para no aplicar la plantilla "%s · Xamanek" (home) */
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = absoluteUrl(href, locale);
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(href, l)]),
  ) as Record<Locale, string>;
  const ogImage = `${siteConfig.url}/${locale}/opengraph-image`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, 'x-default': languages[routing.defaultLocale] },
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export function organizationJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: `${siteConfig.url}/${locale}`,
    logo: `${siteConfig.url}/brand/logo.svg`,
    email: siteConfig.email,
    sameAs: [siteConfig.social.linkedin],
    address: offices.map((office) => ({
      '@type': 'PostalAddress',
      streetAddress: office.address,
      addressCountry: office.countryCode,
    })),
    contactPoint: offices.map((office) => ({
      '@type': 'ContactPoint',
      telephone: office.phone,
      contactType: 'sales',
      areaServed: office.countryCode,
      availableLanguage: ['Spanish', 'English'],
    })),
  };
}

/** Serializa JSON-LD escapando "<" para que no pueda cerrar el <script>. */
export const jsonLdScript = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');
