import { ButtonAnchor, ButtonLink } from '@/components/ui/button';

/**
 * CTA gold "Agendar demo". Si hay URL de agenda en src/config/site.ts abre la
 * agenda externa; si no, lleva a /contacto.
 */
export function BookDemoButton({
  bookingUrl,
  label,
  className,
  onClick,
}: {
  bookingUrl: string | null;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return bookingUrl ? (
    <ButtonAnchor
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      size="sm"
      className={className}
      onClick={onClick}
    >
      {label}
    </ButtonAnchor>
  ) : (
    <ButtonLink href="/contacto" size="sm" className={className} onClick={onClick}>
      {label}
    </ButtonLink>
  );
}
