import { describe, expect, it } from 'vitest';
import { fieldErrors, leadSchema } from './schema';

const contact = {
  source: 'contact',
  locale: 'es',
  name: 'Ana Martínez',
  company: 'Financiera Ejemplo',
  email: 'ana@ejemplo.com',
  whatsapp: '+52 55 1234 5678',
  country: 'MX',
  service: 'odoo',
  message: 'Queremos migrar a Odoo.',
};

describe('leadSchema', () => {
  it('acepta un lead de contacto válido', () => {
    expect(leadSchema.safeParse(contact).success).toBe(true);
  });

  it('reporta los campos inválidos', () => {
    const result = leadSchema.safeParse({ ...contact, email: 'no-es-correo', whatsapp: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toEqual({ email: true, whatsapp: true });
    }
  });

  it('acepta un lead del simulador con su configuración', () => {
    const result = leadSchema.safeParse({
      source: 'simulator',
      locale: 'en',
      name: 'Jane Smith',
      company: 'Acme Lending',
      email: 'jane@acme.com',
      whatsapp: '+1 713 555 0123',
      simulation: {
        currency: 'USD',
        industry: 'lending',
        users: 25,
        modules: ['accounting', 'crm'],
        hosting: 'online',
        migration: 'basic',
        integrations: 2,
        support: 'basic',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una moneda no soportada en la simulación', () => {
    const result = leadSchema.safeParse({
      source: 'simulator',
      locale: 'es',
      name: 'Ana',
      company: 'Ejemplo',
      email: 'ana@ejemplo.com',
      whatsapp: '+52 55 1234 5678',
      simulation: { currency: 'EUR' },
    });
    expect(result.success).toBe(false);
  });
});
