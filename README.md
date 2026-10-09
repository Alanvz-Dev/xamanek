# XAMANEK — sitio corporativo

Maqueta funcional del sitio de Xamanek: implementación de Odoo ERP (con simulador de precios),
ERP para fintech y SOFOMes, marketing y cobranza por WhatsApp, agentes de IA y desarrollo a la medida.
Operación en USA y México (prioridad) y Colombia.

- **Next.js 16** (App Router, Turbopack, `output: 'standalone'`) + **TypeScript estricto** + **Tailwind CSS v4**
- **next-intl**: rutas `/es` (por defecto) y `/en`, con URLs traducidas (`/es/soluciones/odoo` ↔ `/en/solutions/odoo`)
- **GSAP** (+ `@gsap/react`, ScrollTrigger, SplitText) para el logo animado, la retícula y el scroll; **Motion** solo para microinteracciones del simulador
- **Zod** para validar formularios y la configuración de precios · **Vitest** para pruebas
- **Docker** (multi-stage, node:22-alpine) + **Caddy** (HTTPS automático)

---

## Correr en local

Requisitos: Node.js 22+ y npm.

```bash
npm install
cp .env.example .env.local   # opcional en local: hay valores por defecto
npm run dev                  # http://localhost:3000 → redirige a /es
```

**Alternativa con Docker** (si `npm run dev` falla en Windows con `ERR_SWC_NATIVE_CACHE`, o sin Node instalado):

```bash
docker compose -f docker-compose.dev.yml up          # recarga en caliente en http://localhost:3000
docker compose -f docker-compose.dev.yml exec dev npm run check   # comandos dentro del contenedor
```

### Scripts

| Comando             | Qué hace                                              |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                                |
| `npm run build`     | Build de producción (genera las 38 páginas estáticas) |
| `npm start`         | Sirve el build (para producción se usa Docker)        |
| `npm run lint`      | ESLint                                                |
| `npm run typecheck` | Genera tipos de rutas y corre `tsc --noEmit`          |
| `npm test`          | Pruebas unitarias (Vitest)                            |
| `npm run format`    | Prettier (ordena también las clases de Tailwind)      |
| `npm run check`     | lint + typecheck + test + build, todo junto           |

---

## Dónde editar

| Quiero cambiar…                            | Archivo                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| **Textos** (ambos idiomas)                 | `messages/es.json` y `messages/en.json`                   |
| **Precios del simulador Odoo**             | `src/config/odoo-pricing.json`                            |
| **Colores, tipografías, sombras**          | `src/app/globals.css` (bloque `@theme`)                   |
| Servicios (orden, ícono, simulador sí/no)  | `src/config/services.ts`                                  |
| Industrias (giro del simulador, servicios) | `src/config/industries.ts`                                |
| Casos de éxito (métricas)                  | `src/config/cases.ts`                                     |
| Oficinas, direcciones, teléfonos           | `src/config/offices.ts`                                   |
| Cifras de la barra de confianza            | `src/config/stats.ts`                                     |
| Correo, WhatsApp, URL de agenda, redes     | `src/config/site.ts` y `.env`                             |
| Logo estático (navbar, footer)             | `public/brand/logo.svg` · favicon: `src/app/icon.svg`     |
| Logo animado del hero                      | `src/components/brand/hero-mark/` (original en `design/`) |
| Rutas y sus traducciones                   | `src/i18n/routing.ts`                                     |

### Textos (i18n)

- Todo texto visible vive en `messages/*.json`; los componentes no tienen texto escrito a mano.
- `es.json` es la fuente de verdad del tipado: si usas una clave que no existe, el build falla.
- La prueba `src/i18n/messages.test.ts` falla si `en.json` no tiene exactamente las mismas claves que `es.json`.
- Contenido por servicio/industria: `services.items.<slug>` e `industries.items.<slug>`.

### Precios del simulador

`src/config/odoo-pricing.json` contiene **una tabla por moneda** (USD y MXN, sin tipo de cambio):

- `currencies.<USD|MXN>.plans`: precio por usuario/mes por plan (`standard`, `custom`)
- `currencies.<USD|MXN>.hourlyRate`: tarifa por hora de implementación
- `currencies.<USD|MXN>.support`: paquetes de soporte mensuales
- `currencies.<USD|MXN>.rounding`: redondeo de los importes de implementación
- `implementationMargin`: margen del rango de implementación (0.2 = ±20 %)
- `modules.<id>`: horas base, grupo, `requiresCustomPlan`, `requiresQuote`
- `industries.<id>`: multiplicador de complejidad y módulos recomendados
- `migrationHours`, `hoursPerIntegration`, `hosting`, `limits`, `defaults`

Todos los importes son **valores de ejemplo** (`"_todo": "Verificar con lista vigente de Odoo y tarifas Xamanek"`).
El JSON se valida con Zod (`src/lib/pricing/schema.ts`): si falta un módulo o un precio es inválido, el build y las pruebas fallan con un mensaje claro.

**Cálculo** (`src/lib/pricing/calculate.ts`, función pura sin React, reutilizable en otro servicio):

- Licencias mensuales = usuarios × precio por usuario del plan (anual = × 12)
- Implementación = (Σ horas de módulos × multiplicador del giro + horas de migración + integraciones × horas por integración) × tarifa → rango ± margen
- Los módulos `requiresQuote` (p. ej. Nómina) se excluyen del rango y se avisa "se cotiza aparte"
- Plan Custom automático si algún módulo o el hosting (Odoo.sh / on-premise) lo exigen
- Mensualidad = licencias + soporte · Primer año = implementación + 12 mensualidades

Para **agregar un módulo**: súmalo a `MODULE_IDS` en `src/lib/pricing/types.ts`, agrégalo en `modules` del JSON y su nombre en `simulator.modules` de ambos `messages/*.json`.

El estado del simulador se refleja en la URL (`?cur=MXN&ind=fintech&u=25&m=accounting,crm&…&sim=1#simulador`), así que una simulación se puede compartir.

### Colores

Los tokens de marca están en `@theme` de `src/app/globals.css`, que en Tailwind v4 genera a la vez las clases (`bg-deep`, `text-jade`…) y las CSS variables (`--color-deep`…). Las reglas de contraste están en `CLAUDE.md`.

---

## Formularios y leads

`POST /api/lead` (`src/app/api/lead/route.ts`):

- Valida con Zod (mismo esquema que el cliente: `src/lib/lead/schema.ts`)
- Honeypot anti-spam (campo oculto `fax`): si viene lleno responde 200 pero no registra
- Rate limit en memoria: 5 envíos por IP cada 10 minutos (429 con `Retry-After`)
- Para leads del simulador, el servidor **recalcula** la estimación con la misma función pura
- Hoy solo hace `console.log`. **TODO:** conectar al CRM de Odoo (modelo `crm.lead`) con las variables `ODOO_*` de `.env.example`

`GET /api/health` responde `200 {"status":"ok"}` (healthcheck de Docker).

---

## Despliegue en Ubuntu

Arquitectura: `caddy` (puertos 80/443, HTTPS automático con Let's Encrypt) → `web` (Next.js standalone, sin puertos expuestos al host).

### 1. Instalar Docker

```bash
sudo apt update && sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER   # cierra sesión y vuelve a entrar para usar docker sin sudo
```

### 2. Clonar el proyecto

```bash
git clone https://github.com/Alanvz-Dev/xamanek.git
cd xamanek
```

### 3. Configurar `.env`

```bash
cp .env.example .env
nano .env
```

Completa `DOMAIN`, `ACME_EMAIL`, `NEXT_PUBLIC_SITE_URL` (con `https://`) y `NEXT_PUBLIC_WHATSAPP_NUMBER`.

### 4. Apuntar el DNS

En tu proveedor de DNS crea registros **A** (y **AAAA** si tienes IPv6) para `tudominio.com` y `www.tudominio.com` con la IP pública del servidor. Espera a que propaguen (`dig +short tudominio.com`) antes de levantar Caddy: Let's Encrypt necesita resolver el dominio.

### 5. Abrir puertos en el firewall (ufw)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp     # HTTP/3
sudo ufw enable
sudo ufw status
```

### 6. Levantar

```bash
docker compose up -d --build
docker compose ps            # web debe aparecer como (healthy)
```

Caddy obtiene el certificado automáticamente en el primer arranque. Visita `https://tudominio.com`.

### Actualizar

```bash
git pull
docker compose up -d --build
docker image prune -f        # limpia imágenes viejas
```

> Las variables `NEXT_PUBLIC_*` se incrustan en el build: si las cambias en `.env`, ejecuta `docker compose up -d --build`.

### Logs y diagnóstico

```bash
docker compose logs -f web          # app (incluye los leads: busca "[lead]")
docker compose logs -f caddy        # certificados y tráfico
docker compose ps                   # estado y healthcheck
docker compose restart web
```

No borres el volumen `caddy_data`: guarda los certificados y evita chocar con los límites de emisión de Let's Encrypt.

---

## Placeholders y TODO

Ver la sección "Placeholders" de `CLAUDE.md` para la lista completa de contenido de ejemplo por reemplazar.
