'use client';

import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BookDemoButton } from './book-demo-button';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LocaleSwitcher } from './locale-switcher';
import { MobileMenu } from './mobile-menu';
import { NavDropdown } from './nav-dropdown';
import type { Href, NavItem, NavLabels } from './nav-types';

export interface NavShellProps {
  solutions: NavItem[];
  industries: NavItem[];
  simulatorHref: Href;
  bookingUrl: string | null;
  labels: NavLabels;
}

const linkClass =
  'rounded-full px-3 py-2 text-sm font-medium text-on-dark/85 transition-colors hover:text-on-dark hover:bg-white/5';

export function NavShell({
  solutions,
  industries,
  simulatorHref,
  bookingUrl,
  labels,
}: NavShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'tone-dark fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled || menuOpen
            ? 'border-line bg-deep/85 backdrop-blur-md'
            : 'border-transparent bg-transparent',
        )}
      >
        <nav
          aria-label={labels.nav}
          className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-md"
            aria-label={labels.home}
            onClick={closeMenu}
          >
            <Image src="/brand/logo.svg" alt="" width={32} height={32} unoptimized priority />
            <span className="font-display text-lg font-semibold tracking-[0.18em] text-on-dark uppercase">
              {siteConfig.name}
            </span>
          </Link>

          <ul className="ml-6 hidden items-center gap-1 lg:flex">
            <li>
              <NavDropdown label={labels.solutions} items={solutions} wide />
            </li>
            <li>
              <NavDropdown label={labels.industries} items={industries} />
            </li>
            <li>
              <Link href={simulatorHref} className={linkClass}>
                {labels.simulator}
              </Link>
            </li>
            <li>
              <Link href="/contacto" className={linkClass}>
                {labels.contact}
              </Link>
            </li>
          </ul>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* En móvil, idioma y CTA viven dentro del menú */}
            <div className="hidden items-center gap-3 sm:flex">
              <LocaleSwitcher />
              <BookDemoButton bookingUrl={bookingUrl} label={labels.bookDemo} />
            </div>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-on-dark hover:bg-white/5 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Fuera del <header>: su backdrop-filter crearía un bloque contenedor para position:fixed */}
      <MobileMenu
        id="mobile-menu"
        open={menuOpen}
        onClose={closeMenu}
        solutions={solutions}
        industries={industries}
        simulatorHref={simulatorHref}
        bookingUrl={bookingUrl}
        labels={labels}
      />
    </>
  );
}
