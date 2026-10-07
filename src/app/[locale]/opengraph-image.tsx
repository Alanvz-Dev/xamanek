import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = siteConfig.name;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Colores de marca (ImageResponse no lee CSS variables)
const DEEP = '#06121F';
const JADE = '#00A88F';
const ON_DARK = '#E8EEF5';
const MUTED = '#8FA3BC';

/** Imagen Open Graph por idioma, generada en build con el titular del hero. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'hero' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: `radial-gradient(circle at 80% 20%, rgba(0,168,143,0.22), transparent 55%), ${DEEP}`,
        color: ON_DARK,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 240 240">
          <polygon points="120,18 166,100 74,100" fill="none" stroke={JADE} strokeWidth="6" />
          <polygon
            points="78,136 162,136 156,116 84,116"
            fill="none"
            stroke={JADE}
            strokeWidth="5"
          />
          <polygon
            points="62,164 178,164 170,140 70,140"
            fill="none"
            stroke={JADE}
            strokeWidth="5"
          />
          <polygon
            points="44,194 196,194 186,168 54,168"
            fill="none"
            stroke={JADE}
            strokeWidth="5"
          />
          <polygon
            points="24,226 216,226 204,198 36,198"
            fill="none"
            stroke={JADE}
            strokeWidth="5"
          />
          <circle cx="120" cy="70" r="12" fill={JADE} />
        </svg>
        <span style={{ fontSize: 34, letterSpacing: 8, fontWeight: 700 }}>
          {siteConfig.name.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 980 }}>
        <span style={{ fontSize: 24, letterSpacing: 6, color: MUTED }}>{t('eyebrow')}</span>
        <span style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700 }}>{t('title')}</span>
      </div>
      <div style={{ display: 'flex', height: 6, width: 160, background: JADE, borderRadius: 3 }} />
    </div>,
    size,
  );
}
