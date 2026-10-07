import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/section';
import { industries } from '@/config/industries';
import { offices, telHref } from '@/config/offices';
import { services } from '@/config/services';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';

const linkClass = 'text-sm text-muted-on-dark transition-colors hover:text-on-dark';

export async function Footer() {
  const t = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const ts = await getTranslations('services.items');
  const ti = await getTranslations('industries.items');
  const to = await getTranslations('offices');
  const tc = await getTranslations('common.countries');

  const primaryOffices = offices.filter((o) => o.primary);
  const secondaryOffices = offices.filter((o) => !o.primary);

  return (
    <footer className="tone-dark border-t border-line bg-deep text-fg">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-md">
            <Image src="/brand/logo.svg" alt="" width={36} height={36} unoptimized />
            <span className="font-display text-lg font-semibold tracking-[0.18em] uppercase">
              {siteConfig.name}
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-on-dark">{t('tagline')}</p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-on-dark hover:text-jade"
          >
            <Mail aria-hidden="true" className="size-4 text-jade" />
            {siteConfig.email}
          </a>
        </div>

        <nav aria-label={t('solutions')}>
          <h2 className="eyebrow mb-4">{t('solutions')}</h2>
          <ul className="grid gap-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={{ pathname: '/soluciones/[slug]', params: { slug: s.slug } }}
                  className={linkClass}
                >
                  {ts(`${s.slug}.name`)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={{ pathname: '/', hash: 'simulador' }} className={linkClass}>
                {tn('simulator')}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('industries')}>
          <h2 className="eyebrow mb-4">{t('industries')}</h2>
          <ul className="grid gap-2.5">
            {industries.map((i) => (
              <li key={i.slug}>
                <Link
                  href={{ pathname: '/industrias/[slug]', params: { slug: i.slug } }}
                  className={linkClass}
                >
                  {ti(`${i.slug}.name`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-4">{t('offices')}</h2>
          <ul className="grid gap-6">
            {primaryOffices.map((office) => (
              <li key={office.id}>
                <p className="font-display text-sm font-semibold">{to(`${office.id}.name`)}</p>
                <p className="mt-1 flex gap-2 text-sm text-muted-on-dark">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jade" />
                  <span>
                    {to(`${office.id}.city`)}
                    <br />
                    {office.address}
                  </span>
                </p>
                <a
                  href={telHref(office.phone)}
                  className="mt-1 flex gap-2 font-mono text-sm text-muted-on-dark hover:text-on-dark"
                >
                  <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-jade" />
                  {office.phone}
                </a>
              </li>
            ))}
          </ul>
          {secondaryOffices.map((office) => (
            <p key={office.id} className="mt-6 text-sm text-muted-on-dark">
              {t('alsoIn', { country: tc(office.countryCode) })}
            </p>
          ))}
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-4 py-6 text-xs text-muted-on-dark sm:flex-row sm:items-center sm:justify-between">
          <p>{t('rights', { year: new Date().getFullYear() })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacidad" className="hover:text-on-dark">
                {t('legal.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-on-dark">
                {t('legal.terms')}
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
