# CLAUDE.md — reglas del proyecto XAMANEK

Sitio corporativo de Xamanek (Next.js 16 App Router + TypeScript estricto + Tailwind v4 + next-intl).
Lee también @AGENTS.md: Next.js 16 tiene cambios incompatibles con versiones anteriores; la documentación
de la versión instalada está en `node_modules/next/dist/docs/`.

## Comandos

- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run format`
- `npm run check` = lint + typecheck + test + build. **Debe pasar en verde antes de dar un cambio por terminado.**

## Estructura

```
messages/{es,en}.json        Todo texto visible (es.json = fuente de verdad del tipado)
src/app/[locale]/            Páginas (layout raíz con <html lang>, home, soluciones, industrias, contacto, legales)
src/app/api/lead|health      Route handlers
src/app/sitemap.ts robots.ts SEO
src/config/                  Datos editables: site, services, industries, cases, offices, stats, odoo-pricing.json
src/lib/pricing/             Motor de precios PURO (types, schema, calculate, format, url-state) + pruebas
src/lib/lead/                Esquemas Zod de leads (schema.ts) y constantes sin Zod (constants.ts)
src/lib/gsap.ts              ÚNICO módulo que importa GSAP y registra plugins
src/lib/seo.ts               buildMetadata (canonical, hreflang, OG) + JSON-LD
src/i18n/                    routing (rutas traducidas), navigation (Link/useRouter localizados), request
src/proxy.ts                 Middleware de next-intl (en Next 16 se llama proxy.ts)
src/components/ui/           Primitivos: Button, Section/Container/SectionHeader, Icon, WhatsAppIcon
src/components/brand/        AnimatedLogo, StepGrid (retícula maya), logo-geometry
src/components/motion/       Wrappers GSAP (SplitHeading, Reveal) y MotionProvider
src/components/layout/       Navbar (server) + NavShell/NavDropdown/MobileMenu/LocaleSwitcher (client), Footer, WhatsAppFab
src/components/sections/     Secciones reutilizables (Hero, ServicesGrid, Faq, CtaBand, PageHero…)
src/components/simulator/    Simulador (cliente, carga diferida con SimulatorLoader)
src/components/forms/        Campos, ContactForm, useLeadForm
```

## Marca

Tokens en `src/app/globals.css` (`@theme`): generan clases Tailwind y CSS variables. No uses hex sueltos en componentes.

| Token           | Hex       | Uso                                                      |
| --------------- | --------- | -------------------------------------------------------- |
| `deep`          | `#06121F` | Fondo principal oscuro                                   |
| `night`         | `#0B1F3A` | Azul de marca; **texto en secciones claras**             |
| `panel`         | `#132D52` | Tarjetas y paneles                                       |
| `line`          | `#1E3A5F` | Bordes y divisores                                       |
| `jade`          | `#00A88F` | Interactivo: links, sliders, selección, datos            |
| `gold`          | `#E0A526` | **SOLO** botón CTA principal, **máximo uno por sección** |
| `light`         | `#F4F7FA` | Fondo de secciones claras                                |
| `on-dark`       | `#E8EEF5` | Texto sobre oscuro                                       |
| `muted-on-dark` | `#8FA3BC` | Texto secundario sobre oscuro                            |

Tipografía (next/font en `src/app/fonts.ts`): **Sora** títulos (`font-display`), **Inter** texto (`font-sans`), **JetBrains Mono** cifras y precios (`font-mono`).

Estilo: futurista pero corporativo (público: CFOs y dueños de empresa). Paneles tipo vidrio (`.glass`, borde 1px `line`) con brillo jade sutil en hover (`.glass-hover`). Sin neón ni estética cripto. **Alterna secciones oscuras y claras.** Firma visual: `StepGrid` (escalones de pirámide maya, opacidad baja) solo en hero, simulador y bandas que llevan al simulador.

## Contraste (obligatorio, WCAG AA)

- **jade y gold NUNCA como color de texto sobre fondo claro.** En secciones claras el texto es `night`.
- Texto sobre botón gold: `deep`. Texto sobre botón jade: `deep`.
- Usa siempre `<Section tone="dark|night|light">`: define tokens semánticos que ya respetan el contraste:
  `text-fg`, `text-fg-muted`, `text-accent` (jade en oscuro, night en claro), `border-edge`, `bg-surface`,
  `text-danger`, `outline-focus`. Prefiere estos tokens a los de paleta dentro de componentes reutilizables.
- La navbar es transparente con texto claro: **toda página debe empezar con una sección oscura**.
- Botones: `Button`/`ButtonLink`/`ButtonAnchor` con `variant="primary"` (gold) solo una vez por sección;
  `accent` (jade), `secondary` (contorno) y `ghost` para lo demás. No pases utilidades de `display` (`hidden`…)
  a un botón: envuélvelo en un contenedor.

## Animación: GSAP vs Motion

- **GSAP** (`src/lib/gsap.ts`): logo del hero, retícula escalonada, entrada de titulares (SplitText) y revelado al hacer scroll.
  - Importa SIEMPRE desde `@/lib/gsap`, nunca de `gsap/*`. Los plugins se registran una sola vez con `loadGsapPlugins()`.
  - En componentes usa `useGSAPAfterPaint(setup, ref)`: corre tras el primer pintado (no afecta el LCP) y limpia al desmontar.
  - Usa `gsap.matchMedia()` con `MEDIA.motionOk`; el seguimiento del cursor además exige `MEDIA.finePointer` (no táctil).
  - Elementos animados con `data-reveal` arrancan ocultos por CSS (solo sin movimiento reducido) y tienen respaldo CSS a 2.5s.
- **Motion** (`motion/react-m` dentro de `MotionProvider`): SOLO microinteracciones del simulador (wizard, chips, resultado, conteo de cifras, switch de moneda). Los menús usan transiciones CSS para mantener Motion fuera del JS inicial.
- **Nunca animes el mismo elemento con GSAP y Motion.**
- Todo respeta `prefers-reduced-motion`. Nada de videos de fondo ni 3D.
- El logo del hero es la única animación protagonista de la primera pantalla; el `h1` del hero no se anima (es el LCP).

## Convenciones

- **i18n:** ningún texto visible en componentes. Claves nuevas en `es.json` y `en.json` (la prueba de paridad lo exige).
  Usa `Link`, `useRouter`, `usePathname`, `getPathname` de `@/i18n/navigation` (no los de `next/link`/`next/navigation`).
  Nueva página → registrar su ruta traducida en `src/i18n/routing.ts`.
- **Locale en servidor:** `src/i18n/request.ts` usa `next/root-params` (no `setRequestLocale`). En `generateMetadata` y
  rutas de imagen pasa el locale explícito: `getTranslations({ locale, namespace })`.
- **Server vs client:** las páginas y secciones son Server Components; solo lo interactivo lleva `'use client'`.
  Los namespaces que viajan al cliente se eligen en `CLIENT_NAMESPACES` del layout (`nav`, `simulator`, `forms`).
- **Datos editables** en `src/config/` (no dentro de componentes). Íconos por nombre (`IconName` en `components/ui/icon.tsx`).
- **Precios:** solo en `src/config/odoo-pricing.json`. La lógica vive en `src/lib/pricing/calculate.ts` (pura, sin React/Next);
  todo cambio de cálculo lleva su prueba en `calculate.test.ts`. Solo Odoo tiene precio; el resto de servicios lleva CTA a contacto.
- **Rendimiento:** el simulador se carga diferido (`SimulatorLoader`, al acercarse al viewport); Zod se importa al enviar un
  formulario. No agregues dependencias pesadas al JS inicial. Objetivo Lighthouse móvil ≥ 90 en rendimiento y accesibilidad.
- **Responsive:** mobile-first, sin scroll horizontal a 360px (las decoraciones absolutas van dentro de `Section`, que recorta).
- **SEO:** cada página exporta `generateMetadata` con `buildMetadata()` (canonical, hreflang es/en/x-default, OG, Twitter).
- No se usa `cacheComponents` (desactivado a propósito): el sitio es estático con `generateStaticParams`.
- Formato: Prettier (comillas simples, 100 columnas, orden de clases Tailwind). Imports de tipos con `import type`.

## Placeholders (por reemplazar antes de publicar)

- `public/brand/logo.svg` y `src/components/brand/logo-geometry.ts`: logo placeholder.
- `src/config/odoo-pricing.json`: todos los precios, tarifas, horas y multiplicadores son de ejemplo (`_todo`).
- `src/config/site.ts`: correo, razón social, LinkedIn, `bookingUrl` (agenda), número de WhatsApp (o `.env`).
- `src/config/offices.ts`: direcciones y teléfonos.
- `src/config/stats.ts` y `src/config/cases.ts` (+ textos en `cases.items`): cifras y casos de ejemplo.
  Con datos reales, pon `showPlaceholderBadges: false` en `site.ts`.
- `messages/*.json` → `legal.*`: aviso de privacidad y términos de ejemplo; fecha en `components/sections/legal-page.tsx`.
- `src/app/api/lead/route.ts`: TODO conectar al CRM de Odoo (`crm.lead`) con las variables `ODOO_*`.
- `src/lib/rate-limit.ts`: en memoria (un contenedor). Con varias réplicas, mover a Redis.
