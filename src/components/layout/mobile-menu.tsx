'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LocaleSwitcher } from './locale-switcher';
import { BookDemoButton } from './book-demo-button';
import type { NavShellProps } from './nav-shell';

/** Menú móvil a pantalla completa (transición CSS). Bloquea el scroll del body mientras está abierto. */
export function MobileMenu({
  id,
  open,
  onClose,
  solutions,
  industries,
  simulatorHref,
  bookingUrl,
  labels,
}: NavShellProps & { id: string; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const groups = [
    { title: labels.solutions, items: solutions },
    { title: labels.industries, items: industries },
  ];

  return (
    <div
      id={id}
      className={cn(
        'tone-dark fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-deep px-4 pt-6 pb-10 transition-[opacity,transform,visibility] duration-200 ease-out sm:px-6 lg:hidden',
        open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="eyebrow mb-3">{group.title}</h2>
            <ul className="grid gap-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-on-dark hover:bg-white/5"
                  >
                    {item.icon ? (
                      <Icon name={item.icon} className="size-5 shrink-0 text-jade" />
                    ) : null}
                    <span className="text-[0.95rem]">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <ul className="grid gap-1 border-t border-line pt-6">
          <li>
            <Link
              href={simulatorHref}
              onClick={onClose}
              className="block rounded-xl px-3 py-2.5 text-on-dark hover:bg-white/5"
            >
              {labels.simulator}
            </Link>
          </li>
          <li>
            <Link
              href="/contacto"
              onClick={onClose}
              className="block rounded-xl px-3 py-2.5 text-on-dark hover:bg-white/5"
            >
              {labels.contact}
            </Link>
          </li>
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <LocaleSwitcher />
          <BookDemoButton bookingUrl={bookingUrl} label={labels.bookDemo} onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
