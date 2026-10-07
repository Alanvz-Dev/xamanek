/**
 * Datos generales del sitio. Todo lo marcado con TODO es placeholder.
 * Las variables NEXT_PUBLIC_* se leen en build (ver .env.example).
 */
export const siteConfig = {
  name: 'Xamanek',
  // TODO: razón social real
  legalName: 'Xamanek Technologies',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  // TODO: correo real de ventas
  email: 'contacto@xamanek.com',
  whatsapp: {
    // Formato internacional sin "+" ni espacios (wa.me). TODO: número real.
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5215500000000',
  },
  // TODO: URL de agenda (Calendly, HubSpot, Odoo Appointments…). Si es null, "Agendar demo" lleva a /contacto.
  bookingUrl: null as string | null,
  // Muestra etiquetas "Datos de ejemplo" en cifras y casos placeholder. Poner en false con datos reales.
  showPlaceholderBadges: true,
  social: {
    // TODO: perfiles reales
    linkedin: 'https://www.linkedin.com/company/xamanek',
  },
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
