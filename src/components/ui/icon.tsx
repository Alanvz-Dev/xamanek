import type { LucideProps } from 'lucide-react';
import {
  Bot,
  Building2,
  Coins,
  CodeXml,
  Factory,
  Landmark,
  Layers,
  MessageCircle,
  Store,
  Truck,
  Zap,
} from 'lucide-react';

/**
 * Íconos referenciables por nombre desde src/config (los archivos de config no
 * importan componentes). Para agregar uno, impórtalo de lucide-react y súmalo aquí.
 */
const icons = {
  bot: Bot,
  building: Building2,
  code: CodeXml,
  coins: Coins,
  factory: Factory,
  landmark: Landmark,
  layers: Layers,
  message: MessageCircle,
  store: Store,
  truck: Truck,
  zap: Zap,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" strokeWidth={1.6} {...props} />;
}
