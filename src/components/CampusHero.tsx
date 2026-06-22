"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLang } from "@/context/LangContext";
import styles from "./CampusHero.module.css";

// Types only — the actual runtime module is imported dynamically inside the
// effect so the ~600kb WebGL bundle never touches SSR or the initial chunk.
import type * as THREE_NS from "three";

gsap.registerPlugin(ScrollTrigger);

/**
 * CampusHero — a pure-code, scroll-driven 3D hero for the Virtual Campus page.
 *
 * The story: a community begins as a scattered cloud of points (information
 * living in disconnected silos). As the visitor scrolls, the points converge
 * onto a luminous globe and weave gradient threads between each other — the
 * unified campus taking shape. Four brighter "hub" nodes (the roles) light up
 * and their labels track the 3D anchors in screen space.
 *
 * Everything degrades gracefully: no WebGL or reduced-motion falls back to an
 * animated CSS aurora with the full message visible and no pinning.
 */

// Brand gradient stops (cool -> warm) sampled across the globe for a premium,
// intentional color story rather than random confetti.
const STOPS: [number, number, number][] = [
  [0x3d / 255, 0x38 / 255, 0xe0 / 255], // indigo
  [0x7c / 255, 0x5c / 255, 0xff / 255], // violet
  [0xfb / 255, 0x7a / 255, 0x5b / 255], // coral
  [0xf4 / 255, 0xa9 / 255, 0x3b / 255], // amber
];

function sampleGradient(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  const f = x - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function CampusHero() {
  const { t, lang } = useLang();

  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hubRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll progress (0..1) is written here by ScrollTrigger and read by the
  // render loop — this decouples the rAF render cadence from scroll events.
  const progressRef = useRef(0);

  const [act, setAct] = useState(0);
  const [webglReady, setWebglReady] = useState(false);

  const HUB_KEYS = ["alumnos", "docentes", "familias", "directivos"] as const;
  const hubLabels: Record<(typeof HUB_KEYS)[number], string> = {
    alumnos: t("Alumnos", "Students"),
    docentes: t("Docentes", "Teachers"),
    familias: t("Familias", "Families"),
    directivos: t("Directivos", "Directors"),
  };

  const acts = [
    {
      k: t("Dispersión", "Scattered"),
      line: t("Hoy la información vive dispersa.", "Today, information lives scattered."),
    },
    {
      k: t("Conexión", "Connecting"),
      line: t("Cada actor empieza a conectarse.", "Every actor starts to connect."),
    },
    {
      k: t("Comunidad", "Community"),
      line: t("Alumnos, docentes y familias, en sincronía.", "Students, teachers and families, in sync."),
    },
    {
      k: t("Un campus", "One campus"),
      line: t("Todo converge en un solo lugar.", "It all converges into one place."),
    },
  ];

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    if (prefersReduced || !canvas || !outer || !sticky) return;

    let renderer: THREE_NS.WebGLRenderer | null = null;
    let rafId = 0;
    let st: ScrollTrigger | null = null;
    let disposed = false;
    let cleanupExtra: (() => void) | null = null;

    // Three.js is heavy + needs the DOM/WebGL — import it only on the client.
    import("three")
      .then((THREE) => {
        if (disposed) return;

        let gl: THREE_NS.WebGLRenderer;
        try {
          gl = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
          // Probe the context — some environments hand back a renderer with a lost context.
          if (!gl.getContext()) throw new Error("no webgl context");
        } catch {
          return; // CSS aurora fallback stays.
        }
        renderer = gl;

        const PAPER = 0xefeae1;
        const isMobile = window.matchMedia("(max-width: 640px)").matches;
        const COUNT = isMobile ? 460 : 1100;
        const RADIUS = 6.2;

        const w = () => sticky.clientWidth;
        const h = () => sticky.clientHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(PAPER, 0.034); // distant points melt into the paper -> depth

        const camera = new THREE.PerspectiveCamera(50, w() / h(), 0.1, 100);
        camera.position.set(0, 0, 19);

        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        gl.setSize(w(), h(), false);

        const group = new THREE.Group();
        group.rotation.z = 0.18; // gentle planetary tilt
        scene.add(group);

        // --- Soft circular sprite for round, glowing points -----------------
        const makeSprite = () => {
          const c = document.createElement("canvas");
          c.width = c.height = 64;
          const ctx = c.getContext("2d")!;
          const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.35, "rgba(255,255,255,0.85)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 64, 64);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };
        const sprite = makeSprite();

        // --- Particle positions: cloud (start) + sphere (target) ------------
        const cloud = new Float32Array(COUNT * 3);
        const sphere = new Float32Array(COUNT * 3);
        const phase = new Float32Array(COUNT); // per-point drift offset for organic life
        const colors = new Float32Array(COUNT * 3);

        const GA = Math.PI * (3 - Math.sqrt(5)); // golden angle
        for (let i = 0; i < COUNT; i++) {
          // Fibonacci sphere -> even, organic distribution
          const yy = 1 - (i / (COUNT - 1)) * 2;
          const r = Math.sqrt(Math.max(0, 1 - yy * yy));
          const th = GA * i;
          const sx = Math.cos(th) * r * RADIUS;
          const sy = yy * RADIUS;
          const sz = Math.sin(th) * r * RADIUS;
          sphere[i * 3] = sx;
          sphere[i * 3 + 1] = sy;
          sphere[i * 3 + 2] = sz;

          // Scattered cloud — wide, flattened, drifting field
          cloud[i * 3] = (Math.random() - 0.5) * 34;
          cloud[i * 3 + 1] = (Math.random() - 0.5) * 17;
          cloud[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2;

          phase[i] = Math.random() * Math.PI * 2;

          // Color by vertical position -> cool top, warm bottom
          const c = sampleGradient((1 - (sy / RADIUS + 1) / 2) * 0.95 + 0.02);
          colors[i * 3] = c[0];
          colors[i * 3 + 1] = c[1];
          colors[i * 3 + 2] = c[2];
        }

        const pGeo = new THREE.BufferGeometry();
        const pPos = new THREE.BufferAttribute(new Float32Array(cloud), 3);
        pPos.setUsage(THREE.DynamicDrawUsage);
        pGeo.setAttribute("position", pPos);
        pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const pMat = new THREE.PointsMaterial({
          size: isMobile ? 0.5 : 0.42,
          map: sprite,
          vertexColors: true,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
          sizeAttenuation: true,
          fog: true,
        });
        const points = new THREE.Points(pGeo, pMat);
        group.add(points);

        // --- Connection threads: nearest-neighbor graph on the sphere -------
        const pairs: [number, number][] = [];
        const seen = new Set<string>();
        const K = isMobile ? 2 : 3;
        const MAX_SEG = isMobile ? 520 : 1500;
        for (let i = 0; i < COUNT && pairs.length < MAX_SEG; i++) {
          const ax = sphere[i * 3];
          const ay = sphere[i * 3 + 1];
          const az = sphere[i * 3 + 2];
          // find K nearest
          const best: { j: number; d: number }[] = [];
          for (let j = 0; j < COUNT; j++) {
            if (j === i) continue;
            const dx = ax - sphere[j * 3];
            const dy = ay - sphere[j * 3 + 1];
            const dz = az - sphere[j * 3 + 2];
            const d = dx * dx + dy * dy + dz * dz;
            if (best.length < K) {
              best.push({ j, d });
              best.sort((m, n) => n.d - m.d);
            } else if (d < best[0].d) {
              best[0] = { j, d };
              best.sort((m, n) => n.d - m.d);
            }
          }
          for (const b of best) {
            const key = i < b.j ? `${i}_${b.j}` : `${b.j}_${i}`;
            if (seen.has(key)) continue;
            seen.add(key);
            pairs.push([i, b.j]);
            if (pairs.length >= MAX_SEG) break;
          }
        }

        const lPos = new Float32Array(pairs.length * 6);
        const lCol = new Float32Array(pairs.length * 6);
        for (let s = 0; s < pairs.length; s++) {
          const [i, j] = pairs[s];
          lCol[s * 6] = colors[i * 3];
          lCol[s * 6 + 1] = colors[i * 3 + 1];
          lCol[s * 6 + 2] = colors[i * 3 + 2];
          lCol[s * 6 + 3] = colors[j * 3];
          lCol[s * 6 + 4] = colors[j * 3 + 1];
          lCol[s * 6 + 5] = colors[j * 3 + 2];
        }
        const lGeo = new THREE.BufferGeometry();
        const lPosAttr = new THREE.BufferAttribute(lPos, 3);
        lPosAttr.setUsage(THREE.DynamicDrawUsage);
        lGeo.setAttribute("position", lPosAttr);
        lGeo.setAttribute("color", new THREE.BufferAttribute(lCol, 3));
        const lMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          fog: true,
        });
        const lines = new THREE.LineSegments(lGeo, lMat);
        group.add(lines);

        // --- Role hubs: 4 larger glowing anchors on the sphere --------------
        const hubLocal: THREE_NS.Vector3[] = [
          new THREE.Vector3(0, RADIUS, 0),
          new THREE.Vector3(RADIUS * 0.92, -RADIUS * 0.36, RADIUS * 0.1),
          new THREE.Vector3(-RADIUS * 0.55, -RADIUS * 0.5, RADIUS * 0.62),
          new THREE.Vector3(-RADIUS * 0.4, RADIUS * 0.2, -RADIUS * 0.85),
        ];
        const hubSprites: THREE_NS.Sprite[] = hubLocal.map((p, idx) => {
          const c = sampleGradient(idx / 3);
          const mat = new THREE.SpriteMaterial({
            map: sprite,
            color: new THREE.Color(c[0], c[1], c[2]),
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: true,
          });
          const sp = new THREE.Sprite(mat);
          sp.scale.setScalar(2.4);
          sp.position.copy(p);
          group.add(sp);
          return sp;
        });

        // Faint core glow for depth behind the globe
        const coreMat = new THREE.SpriteMaterial({
          map: sprite,
          color: new THREE.Color(0.49, 0.42, 1),
          transparent: true,
          opacity: 0.0,
          depthWrite: false,
        });
        const core = new THREE.Sprite(coreMat);
        core.scale.setScalar(RADIUS * 3.4);
        group.add(core);

        const tmp = new THREE.Vector3();

        // --- Resize ---------------------------------------------------------
        const onResize = () => {
          if (!renderer) return;
          camera.aspect = w() / h();
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w(), h(), false);
        };
        window.addEventListener("resize", onResize);

        // --- Visibility gate (pause render when offscreen) ------------------
        let visible = true;
        const io = new IntersectionObserver(
          ([e]) => {
            visible = e.isIntersecting;
          },
          { threshold: 0 }
        );
        io.observe(sticky);

        setWebglReady(true);

        // --- Scroll: pin + progress ----------------------------------------
        st = ScrollTrigger.create({
          trigger: outer,
          start: "top top",
          end: "bottom bottom",
          pin: sticky,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const a = Math.min(Math.floor(self.progress * 4), 3);
            setAct((prev) => (prev === a ? prev : a));
          },
        });

        // --- Render loop ----------------------------------------------------
        const start = performance.now();
        let smoothP = 0;
        let rot = 0;

        const tick = () => {
          rafId = requestAnimationFrame(tick);
          if (!renderer || !visible) return;

          const time = (performance.now() - start) / 1000;
          smoothP += (progressRef.current - smoothP) * 0.08;
          const p = smoothP;

          // Story parameters
          const morph = smoothstep(0.1, 0.62, p); // cloud -> sphere
          const link = smoothstep(0.4, 0.72, p); // threads weave in
          const reveal = smoothstep(0.55, 0.85, p); // role hubs light up
          const settle = morph; // drift calms as it forms

          // Particle morph + organic drift
          const pa = pGeo.attributes.position.array as Float32Array;
          const driftAmp = lerp(1.3, 0.12, settle);
          for (let i = 0; i < COUNT; i++) {
            const ix = i * 3;
            const ph = phase[i];
            const dx = Math.sin(time * 0.5 + ph) * driftAmp;
            const dy = Math.cos(time * 0.42 + ph * 1.3) * driftAmp;
            const dz = Math.sin(time * 0.36 + ph * 0.7) * driftAmp;
            pa[ix] = lerp(cloud[ix], sphere[ix], morph) + dx;
            pa[ix + 1] = lerp(cloud[ix + 1], sphere[ix + 1], morph) + dy;
            pa[ix + 2] = lerp(cloud[ix + 2], sphere[ix + 2], morph) + dz;
          }
          pGeo.attributes.position.needsUpdate = true;

          // Threads follow the morphed points; fade in as the globe forms
          if (link > 0.001) {
            const la = lGeo.attributes.position.array as Float32Array;
            for (let s = 0; s < pairs.length; s++) {
              const [i, j] = pairs[s];
              const si = s * 6;
              la[si] = pa[i * 3];
              la[si + 1] = pa[i * 3 + 1];
              la[si + 2] = pa[i * 3 + 2];
              la[si + 3] = pa[j * 3];
              la[si + 4] = pa[j * 3 + 1];
              la[si + 5] = pa[j * 3 + 2];
            }
            lGeo.attributes.position.needsUpdate = true;
          }
          lMat.opacity = link * 0.34;

          // Rotation: slow always, a touch faster as the campus comes alive
          rot += (0.0016 + p * 0.004);
          group.rotation.y = rot;
          group.rotation.x = Math.sin(time * 0.12) * 0.06 + morph * 0.12;

          // Camera breathes in during forming, eases back at the climax
          const camZ = lerp(19, 14.5, smoothstep(0.0, 0.6, p)) + smoothstep(0.82, 1, p) * 2.2;
          camera.position.z += (camZ - camera.position.z) * 0.06;
          camera.position.y = Math.sin(time * 0.18) * 0.5;
          camera.lookAt(0, 0, 0);

          // Hub glow + core
          for (const sp of hubSprites) {
            (sp.material as THREE_NS.SpriteMaterial).opacity = reveal * (0.55 + Math.sin(time * 2 + sp.position.x) * 0.18);
            sp.scale.setScalar(2.2 + reveal * 0.6 + Math.sin(time * 2 + sp.position.y) * 0.12);
          }
          coreMat.opacity = morph * 0.1;

          // Project hub world positions -> screen, drive the DOM labels
          group.updateMatrixWorld(true);
          const cw = w();
          const ch = h();
          for (let k = 0; k < hubLocal.length; k++) {
            const el = hubRefs.current[k];
            if (!el) continue;
            tmp.copy(hubLocal[k]).applyMatrix4(group.matrixWorld);
            const facing = tmp.clone().sub(camera.position).normalize();
            // dot of point-normal vs camera dir ~ is the hub on the near side?
            const normal = tmp.clone().normalize();
            const near = normal.dot(facing) < -0.05;
            tmp.project(camera);
            const x = (tmp.x * 0.5 + 0.5) * cw;
            const y = (-tmp.y * 0.5 + 0.5) * ch;
            const vis = reveal * (near ? 1 : 0.18);
            el.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
            el.style.opacity = tmp.z < 1 ? String(vis) : "0";
          }

          renderer.render(scene, camera);
        };
        tick();

        cleanupExtra = () => {
          window.removeEventListener("resize", onResize);
          io.disconnect();
          sprite.dispose();
          pGeo.dispose();
          pMat.dispose();
          lGeo.dispose();
          lMat.dispose();
          hubSprites.forEach((s) => (s.material as THREE_NS.SpriteMaterial).dispose());
          coreMat.dispose();
        };
      })
      .catch(() => {
        /* keep CSS fallback */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      st?.kill();
      cleanupExtra?.();
      renderer?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={`${styles.outer} ${webglReady ? styles.live : ""}`}
      ref={outerRef}
      aria-label={t("Campus virtual — presentación", "Virtual campus — intro")}
    >
      <div className={styles.sticky} ref={stickyRef}>
        {/* CSS aurora — always-present base layer & reduced-motion / no-WebGL fallback */}
        <div className={styles.aurora} aria-hidden="true">
          <span className={`${styles.blob} ${styles.b1}`} />
          <span className={`${styles.blob} ${styles.b2}`} />
          <span className={`${styles.blob} ${styles.b3}`} />
          <span className={`${styles.blob} ${styles.b4}`} />
        </div>

        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

        <div className={styles.scrim} aria-hidden="true" />

        {/* Role labels that track the 3D hubs */}
        <div className={styles.hubs} aria-hidden="true">
          {HUB_KEYS.map((k, i) => (
            <div
              key={k}
              className={styles.hub}
              ref={(el) => {
                hubRefs.current[i] = el;
              }}
            >
              <span className={styles.hubDot} />
              {hubLabels[k]}
            </div>
          ))}
        </div>

        <div className={styles.overlay}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            <span>{t("Educación · Tiempo real", "Education · Real-time")}</span>
          </div>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: t("Un campus que <em>conecta</em> a todos.", "A campus that <em>connects</em> everyone."),
            }}
          />
          <p className={styles.lead}>
            {t(
              "Plataforma educativa avanzada — paneles por rol y comunicación en tiempo real entre docentes, alumnos, directivos y familias.",
              "Advanced educational platform — role-based panels and real-time communication between teachers, students, directors and families."
            )}
          </p>

          {/* Evolving narrative caption — the scroll tells the story */}
          <div className={styles.narrate} aria-live="off">
            {acts.map((a, i) => (
              <span key={i} className={`${styles.narrLine} ${act === i ? styles.narrOn : ""}`}>
                {a.line}
              </span>
            ))}
          </div>

          <div className={styles.cta}>
            <Link href="/contacto" className="btn btn-lg">
              {t("Iniciar proyecto", "Start project")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#roles" className="btn btn-lg btn-ghost">
              {t("Ver roles", "See roles")}
            </a>
          </div>
        </div>

        <div className={styles.progress} aria-hidden="true">
          {acts.map((a, i) => (
            <span key={i} className={`${styles.pDot} ${act === i ? styles.on : ""}`} />
          ))}
          <span className={styles.pLabel}>{acts[act]?.k}</span>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          {t("Scroll", "Scroll")}
        </div>
      </div>
    </section>
  );
}
