import type { ComponentProps } from 'react';
import type { IconName } from '@/components/ui/icon';
import type { Link } from '@/i18n/navigation';

export type Href = ComponentProps<typeof Link>['href'];

export interface NavItem {
  label: string;
  description?: string;
  icon?: IconName;
  href: Href;
}

export interface NavLabels {
  nav: string;
  home: string;
  solutions: string;
  industries: string;
  simulator: string;
  contact: string;
  bookDemo: string;
  openMenu: string;
  closeMenu: string;
}
