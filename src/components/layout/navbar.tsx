import { getTranslations } from 'next-intl/server';
import { industries } from '@/config/industries';
import { services } from '@/config/services';
import { siteConfig } from '@/config/site';
import { NavShell } from './nav-shell';
import type { NavItem } from './nav-types';

/** Navbar fija. Resuelve textos y enlaces en el servidor; la interacción vive en NavShell. */
export async function Navbar() {
  const t = await getTranslations('nav');
  const ts = await getTranslations('services.items');
  const ti = await getTranslations('industries.items');

  const solutions: NavItem[] = services.map((s) => ({
    label: ts(`${s.slug}.name`),
    description: ts(`${s.slug}.short`),
    icon: s.icon,
    href: { pathname: '/soluciones/[slug]', params: { slug: s.slug } },
  }));

  const industryItems: NavItem[] = industries.map((i) => ({
    label: ti(`${i.slug}.name`),
    icon: i.icon,
    href: { pathname: '/industrias/[slug]', params: { slug: i.slug } },
  }));

  return (
    <NavShell
      solutions={solutions}
      industries={industryItems}
      simulatorHref={{ pathname: '/', hash: 'simulador' }}
      bookingUrl={siteConfig.bookingUrl}
      labels={{
        nav: t('label'),
        home: t('home'),
        solutions: t('solutions'),
        industries: t('industries'),
        simulator: t('simulator'),
        contact: t('contact'),
        bookDemo: t('bookDemo'),
        openMenu: t('openMenu'),
        closeMenu: t('closeMenu'),
      }}
    />
  );
}
