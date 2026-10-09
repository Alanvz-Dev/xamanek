import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Imagen Docker mínima: copia solo .next/standalone + .next/static + public
  output: 'standalone',
  poweredByHeader: false,
  // Solo en docker-compose.dev.yml: sondeo de archivos porque el bind mount de Windows no emite eventos
  ...(process.env.NEXT_DEV_POLL_MS && {
    watchOptions: { pollIntervalMs: Number(process.env.NEXT_DEV_POLL_MS) },
  }),
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default withNextIntl(nextConfig);
