# Screenshot tool — `shot.mjs`

Capturador de pantallas para análisis continuo de LayerCloud. Dada una URL,
devuelve PNGs en multi-viewport (desktop / tablet / mobile) en above-the-fold
y página completa. Alimenta a [`skill-impacto`](../../.claude/skills/ui-ux-pro-max/data/skill-impacto.md)
para medir deseo/dopamina y comparar con sitios de terceros.

**Cero dependencias.** No usa Playwright ni Puppeteer: habla el DevTools
Protocol (CDP) directo desde Node (que ya trae `fetch` y `WebSocket` globales)
contra el **Edge o Chrome ya instalado** en la máquina, en modo headless.

## Requisitos

- Node 18+ (probado con v24). `fetch` y `WebSocket` globales.
- Edge o Chrome instalado (autodetección). Override: `--browser <ruta.exe>` o
  `SHOT_BROWSER=<ruta.exe>`.

## Uso

```bash
# Captura puntual de una URL (lo que pidas)
node tool/screenshot/shot.mjs https://linear.app --name linear

# Solo el gancho (above-the-fold) en los 3 viewports
node tool/screenshot/shot.mjs https://stripe.com --shot fold

# Nuestra home (requiere el dev server: npm run dev)
node tool/screenshot/shot.mjs http://localhost:3000 --name home
```

### Opciones

| Flag | Default | Qué hace |
|------|---------|----------|
| `--viewport` | `desktop,tablet,mobile` | Cuáles capturar (1440 / 768 / 375) |
| `--shot` | `both` | `full`, `fold` o `both` |
| `--name` | host de la URL | Etiqueta en el nombre del archivo |
| `--wait` | `2000` | ms de settle para dejar correr el hero 3D / animaciones |
| `--out` | `./shots` | Carpeta de salida |
| `--browser` | autodetección | Ruta a msedge.exe / chrome.exe |

### Salida

PNGs en `tool/screenshot/shots/` (gitignored), nombrados:

```
<YYYYMMDD-HHMMSS>__<label>__<viewport>__<fold|full>.png
```

El timestamp permite comparar **antes/después** del mismo sitio de forma continua.

## Handoff a skill-impacto

1. Corré `shot.mjs <url>`.
2. Abrí los PNG (la herramienta Read los renderiza).
3. Pasalos por el protocolo de `skill-impacto` (medir 4 termómetros → BRIEF →
   `/ui-ux-pro-max`). Los sitios de terceros se usan como referencia de mercado.

## Gotchas (reales, verificados)

- **WebGL en headless.** Con `--disable-gpu` se usa SwiftShader; el hero
  `HomeHero` puede caer a su fallback de aurora CSS en vez del WebGL exacto. El
  `--wait` ayuda a capturar un frame "vivo".
- **dpr limitado a 2.** El full-page por software a dpr 3 en páginas largas se
  cuelga; por eso tablet/mobile usan dpr 2. Suficiente para análisis.
- **Red del navegador.** Si una URL externa muestra la página de error de
  Edge/DNS, es que ese entorno no tiene salida a internet — no es un bug de la
  tool (el pipeline de captura sí corrió).
- **Sitios de terceros.** Banners de cookies / anti-bot pueden tapar contenido.
  No se intenta evadirlos; es una limitación conocida.
- **`localhost`.** Necesita el dev server corriendo (`npm run dev`) o usá la URL
  desplegada en Vercel.
