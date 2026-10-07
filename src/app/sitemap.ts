import type { MetadataRoute } from 'next';
import { INDUSTRY_SLUGS } from '@/config/industries';
import { SERVICE_SLUGS } from '@/config/services';
import { routing } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';

type Href = Parameters<typeof absoluteUrl>[0];

/** sitemap.xml con todas las páginas en ambos idiomas y sus alternativas hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { href: Href; priority: number }[] = [
    { href: '/', priority: 1 },
    ...SERVICE_SLUGS.map((slug) => ({
      href: { pathname: '/soluciones/[slug]', params: { slug } } as const,
      priority: 0.9,
    })),
    ...INDUSTRY_SLUGS.map((slug) => ({
      href: { pathname: '/industrias/[slug]', params: { slug } } as const,
      priority: 0.8,
    })),
    { href: '/contacto', priority: 0.7 },
    { href: '/privacidad', priority: 0.2 },
    { href: '/terminos', priority: 0.2 },
  ];

  const lastModified = new Date();

  return pages.flatMap(({ href, priority }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(href, locale),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(href, l)])),
      },
    })),
  );
}
