# Pendientes y decisiones abiertas

Última actualización: 6 de octubre de 2026.

## Por decidir

1. **Lema del logo en español.** "Your north star in technology" (debajo del logo animado del hero) está en inglés en
   `/es` y `/en`, como venía en el diseño original. ¿Se traduce en `/es` o se queda como lema de marca en inglés?
   → `hero.logoTagline` en `messages/es.json`.
2. **Logo estático** para navbar, footer y favicon (distinto al animado del hero). Al tenerlo, reemplazar:
   - `public/brand/logo.svg` (navbar, footer, datos estructurados)
   - `src/app/icon.svg` (favicon)
   - La imagen para redes sociales (`src/app/[locale]/opengraph-image.tsx`) también usa la pirámide placeholder.
3. **Textos comerciales por revisar** antes de publicar, por ejemplo "Primera llamada de diagnóstico sin costo" y las
   cifras de la barra de confianza y de los casos de éxito (hoy marcadas como "Datos de ejemplo").
4. **Rendimiento del home con el logo animado.** Lighthouse móvil da 83–90 (sin el logo 85–91, en la misma máquina con
   ruido). Si en producción queda por debajo de 90, la siguiente optimización sería separar el logo en capas para que
   las animaciones corran en la GPU.

## Datos placeholder por reemplazar

- Precios, tarifas, horas y multiplicadores del simulador: `src/config/odoo-pricing.json` (todo marcado con `_todo`).
- Correo, razón social, LinkedIn y URL de agenda: `src/config/site.ts`.
- Número de WhatsApp: `.env` (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
- Direcciones y teléfonos de oficinas: `src/config/offices.ts`.
- Cifras de confianza y casos de éxito: `src/config/stats.ts`, `src/config/cases.ts` y `cases.items` en `messages/*.json`.
  Con datos reales, poner `showPlaceholderBadges: false` en `src/config/site.ts`.
- Aviso de privacidad y términos: `legal.*` en `messages/*.json`.

## Por implementar

- Conectar `/api/lead` al CRM de Odoo (`crm.lead`) con las variables `ODOO_*` de `.env.example`. Hoy los leads solo se
  registran en los logs del contenedor (`docker compose logs web`, buscar `[lead]`).
- Si el sitio corre con varias réplicas, mover el rate limit de memoria a Redis.

## Notas

- El diseño original del logo animado está en `design/xamanek-movimiento.html` (no se publica en el sitio).
- El proyecto está dentro de OneDrive: si los builds se sienten lentos, conviene moverlo fuera (por ejemplo `C:\dev\xamanek`).
