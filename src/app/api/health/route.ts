import { NextResponse } from 'next/server';

// Healthcheck para Docker: siempre dinámico, sin caché.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { status: 'ok', uptime: Math.round(process.uptime()) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
