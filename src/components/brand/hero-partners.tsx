import Image from 'next/image';
import Script from 'next/script';
import { partners } from '@/config/partners';
import { cn } from '@/lib/cn';

const SIZE = 56;
const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;
const LINK =
  'flex size-14 rounded-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus';

/**
 * Aliados bajo el logo animado: un logo en cada esquina de la base de la pirámide (la base ocupa
 * el 80 % central del SVG) y el título entre ambos; en móvil el título pasa arriba.
 * El script de IntelliFin carga con lazyOnload para no competir con el LCP.
 */
export function HeroPartners({ title, className }: { title: string; className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto grid w-4/5 grid-cols-2 items-center gap-x-3 gap-y-3 sm:grid-cols-[auto_1fr_auto]',
        className,
      )}
    >
      <p className="eyebrow col-span-2 text-center leading-relaxed sm:order-2 sm:col-span-1">
        {title}
      </p>
      {/* size-14 = SIZE: reserva el espacio antes de que el web component se registre */}
      <a href={partners.intellifin.url} {...EXTERNAL} className={cn(LINK, 'sm:order-1')}>
        <intellifin-logo
          variant="oscuro"
          height={String(SIZE)}
          mark-only=""
          role="img"
          aria-label={partners.intellifin.name}
        />
      </a>
      <a
        href={partners.nexia.url}
        {...EXTERNAL}
        className={cn(LINK, 'justify-self-end sm:order-3')}
      >
        <Image src={partners.nexia.logo} alt={partners.nexia.name} width={SIZE} height={SIZE} />
      </a>
      <Script src={partners.intellifin.script} strategy="lazyOnload" />
    </div>
  );
}
