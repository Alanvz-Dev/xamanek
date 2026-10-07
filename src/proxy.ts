import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Todo excepto API, internos de Next y archivos con extensión (sitemap.xml, robots.txt, imágenes…)
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
