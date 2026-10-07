import { NextResponse } from 'next/server';
import { HONEYPOT_FIELD, leadSchema } from '@/lib/lead/schema';
import { calculate, normalizeInput } from '@/lib/pricing/calculate';
import { pricingConfig } from '@/lib/pricing/config';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

// 5 envíos por IP cada 10 minutos (en memoria, por contenedor)
const checkRateLimit = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot: si viene lleno, respondemos 200 para no dar pistas al bot, pero no se registra.
  if (
    typeof body === 'object' &&
    body !== null &&
    String((body as Record<string, unknown>)[HONEYPOT_FIELD] ?? '').trim() !== ''
  ) {
    console.warn('[lead] honeypot activado', { ip });
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    return NextResponse.json({ ok: false, error: 'validation', fields }, { status: 422 });
  }

  const lead = parsed.data;

  // El servidor recalcula la simulación con la misma función pura que usa la UI,
  // así el registro no depende de cifras enviadas por el cliente.
  const simulation =
    lead.source === 'simulator'
      ? {
          input: normalizeInput(lead.simulation, pricingConfig),
          result: calculate(lead.simulation, pricingConfig),
          pricingVersion: pricingConfig.version,
        }
      : undefined;

  const record = { receivedAt: new Date().toISOString(), ip, ...lead, simulation };

  // TODO(CRM): enviar el lead al CRM de Odoo vía su API externa (modelo crm.lead) usando
  // ODOO_URL, ODOO_DB, ODOO_USER y ODOO_API_KEY desde variables de entorno. Ver README.
  // eslint-disable-next-line no-console -- registro intencional hasta conectar el CRM
  console.log('[lead]', JSON.stringify(record));

  return NextResponse.json({ ok: true });
}
