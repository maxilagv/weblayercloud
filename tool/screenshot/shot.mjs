#!/usr/bin/env node
// shot.mjs — capturador de pantallas para análisis (LayerCloud / skill-impacto)
//
// Driver del DevTools Protocol (CDP) en Node puro: NO requiere npm install.
// Usa Edge o Chrome ya instalados en la máquina, en modo headless, y captura
// multi-viewport (desktop/tablet/mobile) en above-the-fold y página completa.
//
// Uso:
//   node tool/screenshot/shot.mjs <url> [opciones]
//     --viewport desktop,tablet,mobile   (default: las 3)
//     --shot full|fold|both              (default: both)
//     --name <label>                     (default: host de la url)
//     --wait <ms>                        (default: 2000) settle para animaciones/3D
//     --out <dir>                        (default: ./shots junto a este script)
//     --browser <ruta-exe>              (default: autodetección Edge -> Chrome)
//
// Ejemplo:
//   node tool/screenshot/shot.mjs https://linear.app --name linear --shot both
//   node tool/screenshot/shot.mjs http://localhost:3000 --name home

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- viewports
// dpr cap: el render por software (SwiftShader, --disable-gpu) hace que un
// full-page a dpr 3 en páginas largas tarde demasiado. dpr 2 es suficiente
// para análisis y evita timeouts.
const VIEWPORTS = {
  desktop: { width: 1440, height: 900, dpr: 1, mobile: false },
  tablet: { width: 768, height: 1024, dpr: 2, mobile: true },
  mobile: { width: 375, height: 812, dpr: 2, mobile: true },
};

// ---------------------------------------------------------------- args
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const url = args._[0];
if (!url) {
  console.error("Uso: node shot.mjs <url> [--viewport ...] [--shot full|fold|both] [--name x] [--wait ms]");
  process.exit(1);
}

const viewports = (args.viewport && args.viewport !== true ? String(args.viewport) : "desktop,tablet,mobile")
  .split(",").map((v) => v.trim()).filter((v) => VIEWPORTS[v]);
if (viewports.length === 0) { console.error("Viewports inválidos."); process.exit(1); }

const shotMode = args.shot && args.shot !== true ? String(args.shot) : "both"; // full|fold|both
const wait = args.wait && args.wait !== true ? parseInt(args.wait, 10) : 2000;
const outDir = args.out && args.out !== true ? resolve(String(args.out)) : resolve(__dirname, "shots");

function hostLabel(u) {
  try { return new URL(u).host.replace(/[:.]/g, "-"); } catch { return "page"; }
}
const label = (args.name && args.name !== true ? String(args.name) : hostLabel(url)).replace(/[^a-z0-9_-]/gi, "-");

// ---------------------------------------------------------------- browser detection
const CANDIDATES = [
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
function findBrowser() {
  if (args.browser && args.browser !== true) return String(args.browser);
  if (process.env.SHOT_BROWSER) return process.env.SHOT_BROWSER;
  for (const c of CANDIDATES) if (existsSync(c)) return c;
  throw new Error("No se encontró Edge ni Chrome. Pasá --browser <ruta-al-exe>.");
}

// ---------------------------------------------------------------- CDP client
let _id = 0;
const pending = new Map();
const eventHandlers = [];

function cdpSend(ws, method, params = {}, sessionId, timeout = 30000) {
  const id = ++_id;
  const msg = { id, method, params };
  if (sessionId) msg.sessionId = sessionId;
  ws.send(JSON.stringify(msg));
  return new Promise((res, rej) => {
    pending.set(id, { res, rej });
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); rej(new Error(`CDP timeout: ${method}`)); }
    }, timeout);
  });
}

function onEvent(ws, predicate, timeout = 30000) {
  return new Promise((res, rej) => {
    const h = (m) => { if (predicate(m)) { remove(); res(m); } };
    const remove = () => { const i = eventHandlers.indexOf(h); if (i >= 0) eventHandlers.splice(i, 1); };
    eventHandlers.push(h);
    setTimeout(() => { remove(); rej(new Error("CDP event timeout")); }, timeout);
  });
}

function attachWsHandlers(ws) {
  ws.addEventListener("message", (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch { return; }
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) rej(new Error(m.error.message)); else res(m.result);
    } else if (m.method) {
      for (const h of [...eventHandlers]) h(m);
    }
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pollJson(port, path = "/json/version", tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${path}`);
      if (r.ok) return await r.json();
    } catch { /* not ready */ }
    await sleep(250);
  }
  throw new Error("El navegador no expuso el puerto de depuración a tiempo.");
}

// ---------------------------------------------------------------- main
async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = findBrowser();
  const port = 9222 + Math.floor(Math.random() * 2000);
  const userDataDir = mkdtempSync(join(tmpdir(), "shot-"));

  const child = spawn(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15).replace(/(\d{8})(\d{6})/, "$1-$2");
  const saved = [];
  let ws;

  try {
    const version = await pollJson(port);
    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res, { once: true });
      ws.addEventListener("error", () => rej(new Error("No se pudo conectar al WebSocket de CDP")), { once: true });
    });
    attachWsHandlers(ws);

    // Crear target y adjuntarse en modo flatten (todo por el mismo ws)
    const { targetId } = await cdpSend(ws, "Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdpSend(ws, "Target.attachToTarget", { targetId, flatten: true });

    await cdpSend(ws, "Page.enable", {}, sessionId);

    for (const vp of viewports) {
      const { width, height, dpr, mobile } = VIEWPORTS[vp];
      await cdpSend(ws, "Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: dpr, mobile,
      }, sessionId);

      const loaded = onEvent(ws, (m) => m.method === "Page.loadEventFired" && m.sessionId === sessionId, 45000);
      await cdpSend(ws, "Page.navigate", { url }, sessionId);
      await loaded.catch(() => {}); // seguimos aunque load tarde
      await sleep(wait); // settle: deja correr hero 3D / GSAP

      // El full-page por software (SwiftShader) puede tardar: timeout amplio.
      const SHOT_TIMEOUT = 90000;
      if (shotMode === "fold" || shotMode === "both") {
        const { data } = await cdpSend(ws, "Page.captureScreenshot", { format: "png" }, sessionId, SHOT_TIMEOUT);
        const f = join(outDir, `${stamp}__${label}__${vp}__fold.png`);
        writeFileSync(f, Buffer.from(data, "base64")); saved.push(f);
      }
      if (shotMode === "full" || shotMode === "both") {
        const { data } = await cdpSend(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId, SHOT_TIMEOUT);
        const f = join(outDir, `${stamp}__${label}__${vp}__full.png`);
        writeFileSync(f, Buffer.from(data, "base64")); saved.push(f);
      }
    }
  } finally {
    try { ws?.close(); } catch {}
    try { child.kill(); } catch {}
    // cleanup del perfil temporal (best-effort: el proceso puede tardar en soltar locks)
    setTimeout(() => { try { rmSync(userDataDir, { recursive: true, force: true }); } catch {} }, 500);
  }

  console.log(`\n${saved.length} captura(s) en ${outDir}:`);
  for (const f of saved) console.log("  " + f);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
