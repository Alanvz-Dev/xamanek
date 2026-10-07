import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { WhatsAppFab } from '@/components/layout/whatsapp-fab';
import { siteConfig } from '@/config/site';
import { routing } from '@/i18n/routing';
import { jsonLdScript, organizationJsonLd } from '@/lib/seo';
import { fontVariables } from '../fonts';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: { template: `%s · ${siteConfig.name}`, default: siteConfig.name },
};

export const viewport: Viewport = {
  themeColor: '#06121F',
  colorScheme: 'dark',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Solo estos namespaces viajan al cliente (componentes 'use client' con useTranslations). */
const CLIENT_NAMESPACES = ['nav', 'simulator', 'forms'] as const;

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations('common');
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html lang={locale} className={fontVariables} data-scroll-behavior="smooth">
      <body>
        <a
          href="#contenido"
          className="sr-only z-60 rounded-full bg-jade px-4 py-2 font-semibold text-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <Navbar />
          <main id="contenido">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <WhatsAppFab />
        <script
          type="application/ld+json"
          // JSON-LD generado en el servidor a partir de src/config (sin datos del usuario)
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(locale)) }}
        />
      </body>
    </html>
  );
}
