'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import type { NavItem } from './nav-types';

/**
 * Menú desplegable accesible (patrón disclosure): botón con aria-expanded,
 * cierra con Escape, clic fuera o al salir el foco. Transición CSS (sin Motion en el
 * JS inicial; Motion se reserva para el simulador, que se carga diferido).
 */
export function NavDropdown({
  label,
  items,
  wide = false,
}: {
  label: string;
  items: NavItem[];
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-on-dark/85 transition-colors hover:bg-white/5 hover:text-on-dark aria-expanded:text-on-dark"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <div
        id={panelId}
        className={cn(
          'glass absolute top-full left-0 mt-3 bg-deep/95 p-2 shadow-2xl shadow-black/40 transition-[opacity,transform,visibility] duration-200 ease-out',
          wide ? 'w-[34rem]' : 'w-72',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0',
        )}
      >
        <ul className={cn('grid gap-1', wide && 'grid-cols-2')}>
          {items.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
              >
                {item.icon ? (
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel/60 text-jade">
                    <Icon name={item.icon} className="size-4.5" />
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-on-dark">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-on-dark">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
