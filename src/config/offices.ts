/**
 * Oficinas y presencia. Direcciones y teléfonos son PLACEHOLDERS (TODO).
 * El nombre del país/ciudad se traduce en messages bajo offices.<id>.
 * `primary`: oficinas comerciales prioritarias (USA y México) que se muestran en el footer.
 */
export const OFFICE_IDS = ['us', 'mx', 'co'] as const;
export type OfficeId = (typeof OFFICE_IDS)[number];

export interface Office {
  id: OfficeId;
  countryCode: 'US' | 'MX' | 'CO';
  primary: boolean;
  /** TODO: dirección real */
  address: string;
  /** TODO: teléfono real */
  phone: string;
}

export const offices: Office[] = [
  {
    id: 'us',
    countryCode: 'US',
    primary: true,
    address: '000 Placeholder St., Suite 100, Houston, TX 77002',
    phone: '+1 (000) 000-0000',
  },
  {
    id: 'mx',
    countryCode: 'MX',
    primary: true,
    address: 'Av. Placeholder 000, Piso 0, Col. Juárez, CDMX 06600',
    phone: '+52 55 0000 0000',
  },
  {
    id: 'co',
    countryCode: 'CO',
    primary: false,
    address: 'Calle 00 # 00-00, Bogotá',
    phone: '+57 601 000 0000',
  },
];

export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;
