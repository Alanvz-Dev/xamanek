import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ContactFormWithQuery } from '@/components/forms/contact-form';
import { PageHero } from '@/components/sections/page-hero';
import { Container, Section } from '@/components/ui/section';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { offices, telHref } from '@/config/offices';
import { services } from '@/config/services';
import { siteConfig, whatsappLink } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contacto'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'meta.contact' });
  return buildMetadata({
    locale: locale as Locale,
    href: '/contacto',
    title: t('title'),
    description: t('description'),
  });
}

export default async function ContactPage() {
  const t = await getTranslations('contactPage');
  const ts = await getTranslations('services.items');
  const to = await getTranslations('offices');
  const tw = await getTranslations('whatsapp');

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <Section tone="light" className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <div className="rounded-3xl border border-edge bg-surface p-6 shadow-[0_30px_80px_-40px_rgb(11_31_58/0.35)] sm:p-8">
            <ContactFormWithQuery
              serviceOptions={services.map((s) => ({ value: s.slug, label: ts(`${s.slug}.name`) }))}
            />
          </div>

          <aside className="flex flex-col gap-8">
            <h2 className="font-display text-xl font-semibold">{t('channels.title')}</h2>
            <ul className="grid gap-5">
              <li>
                <a
                  href={whatsappLink(tw('message'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night text-on-dark">
                    <WhatsAppIcon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-fg-muted">{t('channels.whatsapp')}</span>
                    <span className="font-medium underline-offset-4 group-hover:underline">
                      {tw('label')}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="group flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-night text-on-dark">
                    <Mail aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-fg-muted">{t('channels.email')}</span>
                    <span className="font-medium underline-offset-4 group-hover:underline">
                      {siteConfig.email}
                    </span>
                  </span>
                </a>
              </li>
            </ul>

            <div>
              <h3 className="eyebrow mb-4">{t('channels.offices')}</h3>
              <ul className="grid gap-5">
                {offices.map((office) => (
                  <li key={office.id} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface">
                      <MapPin aria-hidden="true" className="size-5" />
                    </span>
                    <span className="text-sm">
                      <span className="block font-semibold">
                        {to(`${office.id}.name`)} · {to(`${office.id}.city`)}
                      </span>
                      <span className="block text-fg-muted">{office.address}</span>
                      <a
                        href={telHref(office.phone)}
                        className="mt-1 inline-flex items-center gap-1.5 font-mono text-fg-muted hover:text-fg"
                      >
                        <Phone aria-hidden="true" className="size-3.5" />
                        {office.phone}
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
