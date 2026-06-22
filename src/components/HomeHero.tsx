"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import styles from "./HomeHero.module.css";

import type * as THREE_NS from "three";

/**
 * HomeHero — "Aurora Flow": an interactive curl-flow field.
 *
 * Thousands of comet streaks drift along a divergence-free noise field like
 * wind through ink. The cursor is a repulsor — move it and you carve a living
 * wake through the stream; click to send a shockwave that blows the flow open.
 * Colors ride the brand gradient on warm paper.
 *
 * This is a deliberately different engine from the campus hero (which assembles
 * particles into a sphere): here nothing "forms" — it flows, and it answers the
 * pointer. Degrades to a CSS aurora for no-WebGL / reduced-motion.
 */

const STOPS: [number, number, number][] = [
  [0x3d / 255, 0x38 / 255, 0xe0 / 255], // indigo
  [0x7c / 255, 0x5c / 255, 0xff / 255], // violet
  [0xfb / 255, 0x7a / 255, 0x5b / 255], // coral
  [0xf4 / 255, 0xa9 / 255, 0x3b / 255], // amber
];
function gradient(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  const f = x - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

export default function HomeHero() {
  const { t } = useLang();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (prefersReduced || !canvas || !host) return;

    let renderer: THREE_NS.WebGLRenderer | null = null;
    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (disposed) return;
        let gl: THREE_NS.WebGLRenderer;
        try {
          gl = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
          if (!gl.getContext()) throw new Error("no webgl");
        } catch {
          return;
        }
        renderer = gl;

        const isMobile = window.matchMedia("(max-width: 640px)").matches;
        const N = isMobile ? 650 : 1900;
        const VIEW_H = 12; // world units tall
        const STREAK = 0.34; // comet tail length
        const SPEED = 2.1; // world units / sec

        const w = () => host.clientWidth;
        const h = () => host.clientHeight;
        let halfH = VIEW_H / 2;
        let halfW = halfH * (w() / h());

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100);
        camera.position.z = 10;

        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        gl.setSize(w(), h(), false);

        // Particle state (current head position + velocity carry)
        const cx = new Float32Array(N);
        const cy = new Float32Array(N);
        const vx = new Float32Array(N);
        const vy = new Float32Array(N);

        const linePos = new Float32Array(N * 6);
        const lineCol = new Float32Array(N * 6);

        const spawn = (i: number, anywhere: boolean) => {
          cx[i] = (Math.random() * 2 - 1) * halfW * 1.05;
          cy[i] = anywhere ? (Math.random() * 2 - 1) * halfH * 1.05 : (Math.random() * 2 - 1) * halfH * 1.05;
          vx[i] = 0;
          vy[i] = 0;
          // color rides the gradient by horizontal band + a little jitter
          const tt = Math.min(1, Math.max(0, (cx[i] / halfW) * 0.5 + 0.5 + (Math.random() - 0.5) * 0.18));
          const col = gradient(tt);
          for (let k = 0; k < 3; k++) {
            lineCol[i * 6 + k] = col[k];
            lineCol[i * 6 + 3 + k] = col[k];
          }
        };
        for (let i = 0; i < N; i++) spawn(i, true);

        const geo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(linePos, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute("position", posAttr);
        geo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
        const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false });
        const lines = new THREE.LineSegments(geo, mat);
        scene.add(lines);

        // pointer in world coords
        const mouse = { x: 1e6, y: 1e6, active: false };
        const shocks: { x: number; y: number; age: number }[] = [];

        const toWorld = (clientX: number, clientY: number) => {
          const r = host.getBoundingClientRect();
          const nx = (clientX - r.left) / r.width;
          const ny = (clientY - r.top) / r.height;
          mouse.x = (nx * 2 - 1) * halfW;
          mouse.y = -(ny * 2 - 1) * halfH;
        };
        const onMove = (e: PointerEvent) => {
          mouse.active = true;
          toWorld(e.clientX, e.clientY);
          const r = host.getBoundingClientRect();
          if (glowRef.current) {
            glowRef.current.style.opacity = "1";
            glowRef.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
          }
        };
        const onLeave = () => {
          mouse.active = false;
          mouse.x = 1e6;
          if (glowRef.current) glowRef.current.style.opacity = "0";
        };
        const onDown = (e: PointerEvent) => {
          toWorld(e.clientX, e.clientY);
          shocks.push({ x: mouse.x, y: mouse.y, age: 0 });
          if (shocks.length > 5) shocks.shift();
        };
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
        host.addEventListener("pointerdown", onDown);

        const onResize = () => {
          if (!renderer) return;
          halfH = VIEW_H / 2;
          halfW = halfH * (w() / h());
          camera.left = -halfW;
          camera.right = halfW;
          camera.top = halfH;
          camera.bottom = -halfH;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w(), h(), false);
        };
        window.addEventListener("resize", onResize);

        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
        io.observe(host);

        setLive(true);

        const MOUSE_R = 2.4;
        let last = performance.now();
        let intro = 0;

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!renderer || !visible) return;
          const now = performance.now();
          let dt = (now - last) / 1000;
          last = now;
          if (dt > 0.05) dt = 0.05; // clamp after tab switch
          const time = now / 1000;
          intro = Math.min(1, intro + dt * 0.5); // fade flow in
          mat.opacity = 0.5 * intro;

          for (let s = shocks.length - 1; s >= 0; s--) {
            shocks[s].age += dt;
            if (shocks[s].age > 1.4) shocks.splice(s, 1);
          }

          const pos = geo.attributes.position.array as Float32Array;
          const margin = 0.6;

          for (let i = 0; i < N; i++) {
            const x = cx[i];
            const y = cy[i];

            // divergence-free-ish flow direction from layered waves
            const angle =
              (Math.sin(x * 0.45 + time * 0.25) +
                Math.cos(y * 0.5 - time * 0.22) +
                Math.sin((x + y) * 0.22 + time * 0.18)) *
              Math.PI;
            let dx = Math.cos(angle);
            let dy = Math.sin(angle);

            // pointer repulsion — carve a wake
            if (mouse.active) {
              const rx = x - mouse.x;
              const ry = y - mouse.y;
              const d2 = rx * rx + ry * ry;
              if (d2 < MOUSE_R * MOUSE_R) {
                const d = Math.sqrt(d2) || 0.0001;
                const f = (1 - d / MOUSE_R) * 2.6;
                dx += (rx / d) * f;
                dy += (ry / d) * f;
              }
            }

            // click shockwaves
            for (let s = 0; s < shocks.length; s++) {
              const sh = shocks[s];
              const rx = x - sh.x;
              const ry = y - sh.y;
              const d = Math.sqrt(rx * rx + ry * ry) || 0.0001;
              const ringR = sh.age * 9;
              const band = Math.abs(d - ringR);
              if (band < 1.4) {
                const f = (1 - band / 1.4) * (1 - sh.age / 1.4) * 4.5;
                dx += (rx / d) * f;
                dy += (ry / d) * f;
              }
            }

            const len = Math.hypot(dx, dy) || 1;
            dx /= len;
            dy /= len;

            // smooth velocity
            vx[i] += (dx - vx[i]) * 0.25;
            vy[i] += (dy - vy[i]) * 0.25;

            const nx = x + vx[i] * SPEED * dt;
            const ny = y + vy[i] * SPEED * dt;
            cx[i] = nx;
            cy[i] = ny;

            // streak: tail behind the head along velocity
            const tailX = nx - vx[i] * STREAK;
            const tailY = ny - vy[i] * STREAK;

            const o = i * 6;
            pos[o] = tailX; pos[o + 1] = tailY; pos[o + 2] = 0;
            pos[o + 3] = nx; pos[o + 4] = ny; pos[o + 5] = 0;

            // wrap around edges
            if (nx < -halfW - margin || nx > halfW + margin || ny < -halfH - margin || ny > halfH + margin) {
              spawn(i, false);
              if (nx > halfW + margin) cx[i] = -halfW - margin;
              else if (nx < -halfW - margin) cx[i] = halfW + margin;
              if (ny > halfH + margin) cy[i] = -halfH - margin;
              else if (ny < -halfH - margin) cy[i] = halfH + margin;
            }
          }
          geo.attributes.position.needsUpdate = true;

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          host.removeEventListener("pointerdown", onDown);
          window.removeEventListener("resize", onResize);
          io.disconnect();
          geo.dispose();
          mat.dispose();
        };
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
      renderer?.dispose();
    };
  }, []);

  return (
    <section className={`${styles.hero} ${live ? styles.live : ""}`} aria-label={t("LayerCloud — inicio", "LayerCloud — home")}>
      <div className={styles.sticky} ref={hostRef}>
        <div className={styles.aurora} aria-hidden="true">
          <span className={`${styles.blob} ${styles.b1}`} />
          <span className={`${styles.blob} ${styles.b2}`} />
          <span className={`${styles.blob} ${styles.b3}`} />
          <span className={`${styles.blob} ${styles.b4}`} />
        </div>
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        <div className={styles.pointerGlow} ref={glowRef} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            <span>{t("Software a medida · capa por capa", "Custom software · layer by layer")}</span>
          </div>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: t(
                "Construimos tu operación <em>capa por capa.</em>",
                "We build your operation <em>layer by layer.</em>"
              ),
            }}
          />
          <p className={styles.lead}>
            {t(
              "Webs, CRM/ERP, campus virtuales y automatizaciones con IA — diseñados como una sola arquitectura para que tu negocio opere con claridad.",
              "Websites, CRM/ERP, virtual campuses and AI automations — designed as one architecture so your business runs with clarity."
            )}
          </p>
          <div className={styles.cta}>
            <Link href="/contacto" className="btn btn-lg">
              {t("Iniciar proyecto", "Start project")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#soluciones" className="btn btn-lg btn-ghost">{t("Ver soluciones", "See solutions")}</a>
          </div>

          <p className={styles.hint} aria-hidden="true">{t("Movés el cursor y el flujo te responde · clic para una onda", "Move your cursor — the flow responds · click for a shockwave")}</p>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">{t("Scroll", "Scroll")}</div>
      </div>
    </section>
  );
}
