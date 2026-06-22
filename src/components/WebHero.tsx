"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";
import styles from "./WebHero.module.css";

import type * as THREE_NS from "three";

const STOPS: [number, number, number][] = [
  [0x3d / 255, 0x38 / 255, 0xe0 / 255],
  [0x7c / 255, 0x5c / 255, 0xff / 255],
  [0xfb / 255, 0x7a / 255, 0x5b / 255],
  [0xf4 / 255, 0xa9 / 255, 0x3b / 255],
];

function sampleGradient(t: number): [number, number, number] {
  const x = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  const f = x - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function WebHero() {
  const { t } = useLang();
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (prefersReduced || !host || !canvas) return;

    let renderer: THREE_NS.WebGLRenderer | null = null;
    let raf = 0;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    import("three")
      .then((THREE) => {
        if (disposed) return;

        try {
          renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          });
          if (!renderer.getContext()) throw new Error("No WebGL context");
        } catch {
          renderer = null;
          return;
        }

        const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
        const w = () => Math.max(1, host.clientWidth);
        const h = () => Math.max(1, host.clientHeight);
        const disposables: Array<{ dispose: () => void }> = [];
        const animatedPanels: Array<{ group: THREE_NS.Group; y: number; z: number; phase: number }> = [];

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050409, 0.035);

        const camera = new THREE.PerspectiveCamera(44, w() / h(), 0.1, 100);
        camera.position.set(0, 0, 15.6);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w(), h(), false);
        renderer.setClearColor(0x000000, 0);

        const root = new THREE.Group();
        const mobile = isMobile();
        root.position.set(mobile ? 0.42 : 2.55, mobile ? 1.32 : 0.02, 0);
        root.rotation.set(-0.12, mobile ? -0.18 : -0.36, 0.035);
        root.scale.setScalar(mobile ? 0.68 : 1);
        scene.add(root);

        const roundedRectGeometry = (width: number, height: number, radius: number) => {
          const x = -width / 2;
          const y = -height / 2;
          const r = Math.min(radius, width / 2, height / 2);
          const shape = new THREE.Shape();
          shape.moveTo(x + r, y);
          shape.lineTo(x + width - r, y);
          shape.quadraticCurveTo(x + width, y, x + width, y + r);
          shape.lineTo(x + width, y + height - r);
          shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
          shape.lineTo(x + r, y + height);
          shape.quadraticCurveTo(x, y + height, x, y + height - r);
          shape.lineTo(x, y + r);
          shape.quadraticCurveTo(x, y, x + r, y);
          return new THREE.ShapeGeometry(shape, 18);
        };

        const makeSpriteTexture = () => {
          const c = document.createElement("canvas");
          c.width = 96;
          c.height = 96;
          const ctx = c.getContext("2d");
          if (!ctx) throw new Error("No canvas context");
          const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.32, "rgba(255,255,255,.76)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 96, 96);
          const texture = new THREE.CanvasTexture(c);
          texture.colorSpace = THREE.SRGBColorSpace;
          return texture;
        };

        const sprite = makeSpriteTexture();
        disposables.push(sprite);

        const panelGeoCache = new Map<string, THREE_NS.BufferGeometry>();
        const getPanelGeo = (width: number, height: number, radius = 0.13) => {
          const key = `${width}:${height}:${radius}`;
          const existing = panelGeoCache.get(key);
          if (existing) return existing;
          const geo = roundedRectGeometry(width, height, radius);
          panelGeoCache.set(key, geo);
          disposables.push(geo);
          return geo;
        };

        const addBar = (
          parent: THREE_NS.Group,
          width: number,
          height: number,
          x: number,
          y: number,
          z: number,
          color: THREE_NS.ColorRepresentation,
          opacity: number,
        ) => {
          const geo = getPanelGeo(width, height, Math.min(height / 2, 0.08));
          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x, y, z);
          parent.add(mesh);
          disposables.push(mat);
          return mesh;
        };

        const addPanel = (
          width: number,
          height: number,
          x: number,
          y: number,
          z: number,
          rotationY: number,
          accent: THREE_NS.ColorRepresentation,
          phase: number,
        ) => {
          const group = new THREE.Group();
          group.position.set(x, y, z);
          group.rotation.set(0.02, rotationY, 0.015 * Math.sin(phase));
          root.add(group);
          animatedPanels.push({ group, y, z, phase });

          const bgGeo = getPanelGeo(width, height, 0.16);
          const bgMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.096,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const bg = new THREE.Mesh(bgGeo, bgMat);
          group.add(bg);

          const edgeGeo = new THREE.EdgesGeometry(bgGeo);
          const edgeMat = new THREE.LineBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.44,
            depthWrite: false,
          });
          const edges = new THREE.LineSegments(edgeGeo, edgeMat);
          edges.position.z = 0.012;
          group.add(edges);

          const washGeo = getPanelGeo(width * 0.92, height * 0.74, 0.11);
          const washMat = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.052,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const wash = new THREE.Mesh(washGeo, washMat);
          wash.position.set(0, -0.1, 0.018);
          group.add(wash);

          disposables.push(bgMat, edgeGeo, edgeMat, washMat);
          return group;
        };

        const landing = addPanel(5.4, 3.3, -0.75, 0.02, 0.15, 0.02, 0x7c5cff, 0.1);
        addBar(landing, 4.74, 0.12, 0, 1.34, 0.035, 0xffffff, 0.18);
        addBar(landing, 1.36, 0.13, -1.58, 0.76, 0.04, 0xffffff, 0.52);
        addBar(landing, 2.74, 0.09, -0.88, 0.42, 0.04, 0xffffff, 0.22);
        addBar(landing, 2.06, 0.09, -1.22, 0.18, 0.04, 0xffffff, 0.16);
        addBar(landing, 0.88, 0.26, -1.82, -0.37, 0.045, 0xfb7a5b, 0.52);
        addBar(landing, 1.2, 0.98, 1.58, 0.1, 0.04, 0x7c5cff, 0.16);
        addBar(landing, 0.86, 0.09, 1.58, -0.58, 0.05, 0xffffff, 0.18);

        const commerce = addPanel(3.35, 2.38, 2.4, -1.2, 0.78, -0.1, 0xfb7a5b, 1.7);
        addBar(commerce, 1.05, 0.13, -0.76, 0.72, 0.04, 0xffffff, 0.42);
        for (let row = 0; row < 2; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            const cx = -1.02 + col * 1.02;
            const cy = 0.12 - row * 0.72;
            addBar(commerce, 0.72, 0.46, cx, cy, 0.045, col === 1 ? 0x7c5cff : 0xffffff, col === 1 ? 0.18 : 0.09);
            addBar(commerce, 0.52, 0.055, cx, cy - 0.33, 0.055, 0xffffff, 0.2);
          }
        }

        const analytics = addPanel(3.62, 2.12, 1.62, 1.48, -0.58, -0.06, 0xf4a93b, 2.8);
        addBar(analytics, 1.22, 0.12, -0.86, 0.62, 0.04, 0xffffff, 0.38);
        [0.42, 0.78, 0.58, 0.96, 0.68, 1.18].forEach((height, i) => {
          addBar(analytics, 0.17, height, -1.04 + i * 0.4, -0.52 + height / 2, 0.05, i === 3 ? 0xfb7a5b : 0x7c5cff, i === 3 ? 0.58 : 0.28);
        });
        addBar(analytics, 0.82, 0.62, 1.08, -0.18, 0.045, 0xffffff, 0.1);
        addBar(analytics, 0.42, 0.42, 1.08, -0.18, 0.055, 0xf4a93b, 0.22);

        const mobilePanel = addPanel(1.26, 2.76, -3.25, -1.18, 0.7, 0.14, 0x3d38e0, 4.1);
        addBar(mobilePanel, 0.78, 0.1, 0, 1.04, 0.04, 0xffffff, 0.34);
        addBar(mobilePanel, 0.78, 0.86, 0, 0.26, 0.04, 0x7c5cff, 0.16);
        addBar(mobilePanel, 0.58, 0.08, 0, -0.56, 0.05, 0xffffff, 0.2);
        addBar(mobilePanel, 0.64, 0.2, 0, -0.98, 0.05, 0xfb7a5b, 0.48);

        const gridPositions: number[] = [];
        for (let i = -8; i <= 8; i += 1) {
          gridPositions.push(-7, i * 0.56, -1.22, 7, i * 0.56, -1.22);
          gridPositions.push(i * 0.56, -4.6, -1.22, i * 0.56, 4.6, -1.22);
        }
        const gridGeo = new THREE.BufferGeometry();
        gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
        const gridMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.055,
          depthWrite: false,
        });
        const grid = new THREE.LineSegments(gridGeo, gridMat);
        root.add(grid);
        disposables.push(gridGeo, gridMat);

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-3.25, -1.05, 0.95),
          new THREE.Vector3(-1.65, 0.15, 0.54),
          new THREE.Vector3(0.88, 0.32, 0.54),
          new THREE.Vector3(2.35, -0.84, 1.04),
          new THREE.Vector3(1.6, 1.46, -0.18),
        ]);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(180));
        const curveMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.34,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const path = new THREE.Line(curveGeo, curveMat);
        root.add(path);
        disposables.push(curveGeo, curveMat);

        const pulseMat = new THREE.SpriteMaterial({
          map: sprite,
          color: 0xffffff,
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const pulse = new THREE.Sprite(pulseMat);
        pulse.scale.setScalar(0.58);
        root.add(pulse);
        disposables.push(pulseMat);

        const nodeCount = mobile ? 90 : 190;
        const nodeBase = new Float32Array(nodeCount * 3);
        const nodePos = new Float32Array(nodeCount * 3);
        const nodeCol = new Float32Array(nodeCount * 3);
        const nodePhase = new Float32Array(nodeCount);
        for (let i = 0; i < nodeCount; i += 1) {
          nodeBase[i * 3] = (Math.random() - 0.42) * 10;
          nodeBase[i * 3 + 1] = (Math.random() - 0.5) * 5.8;
          nodeBase[i * 3 + 2] = -1.4 + Math.random() * 2.2;
          nodePhase[i] = Math.random() * Math.PI * 2;
          const c = sampleGradient(Math.random());
          nodeCol[i * 3] = c[0];
          nodeCol[i * 3 + 1] = c[1];
          nodeCol[i * 3 + 2] = c[2];
        }
        nodePos.set(nodeBase);
        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3).setUsage(THREE.DynamicDrawUsage));
        nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeCol, 3));
        const nodeMat = new THREE.PointsMaterial({
          size: mobile ? 0.036 : 0.028,
          vertexColors: true,
          transparent: true,
          opacity: 0.62,
          depthWrite: false,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending,
        });
        const nodes = new THREE.Points(nodeGeo, nodeMat);
        root.add(nodes);
        disposables.push(nodeGeo, nodeMat);

        let mx = 0;
        let my = 0;
        let tx = 0;
        let ty = 0;
        const onPointerMove = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          mx = ((event.clientX - rect.left) / rect.width - 0.5) * 0.55;
          my = ((event.clientY - rect.top) / rect.height - 0.5) * 0.38;
        };
        const onPointerLeave = () => {
          mx = 0;
          my = 0;
        };
        host.addEventListener("pointermove", onPointerMove);
        host.addEventListener("pointerleave", onPointerLeave);

        const onResize = () => {
          const mobileNow = isMobile();
          renderer?.setSize(w(), h(), false);
          camera.aspect = w() / h();
          camera.updateProjectionMatrix();
          root.position.set(mobileNow ? 0.42 : 2.55, mobileNow ? 1.32 : 0.02, 0);
          root.scale.setScalar(mobileNow ? 0.68 : 1);
        };
        window.addEventListener("resize", onResize);

        const clock = new THREE.Clock();
        setLive(true);

        const animate = () => {
          if (disposed || !renderer) return;
          raf = requestAnimationFrame(animate);
          const time = clock.getElapsedTime();

          tx = lerp(tx, mx, 0.045);
          ty = lerp(ty, my, 0.045);
          root.rotation.y = (isMobile() ? -0.18 : -0.36) + Math.sin(time * 0.23) * 0.025 + tx * 0.12;
          root.rotation.x = -0.12 + Math.sin(time * 0.19) * 0.018 - ty * 0.09;

          animatedPanels.forEach((panel, index) => {
            panel.group.position.y = panel.y + Math.sin(time * 0.58 + panel.phase) * (0.045 + index * 0.006);
            panel.group.position.z = panel.z + Math.cos(time * 0.45 + panel.phase) * 0.045;
          });

          const p = curve.getPoint((time * 0.075) % 1);
          pulse.position.copy(p);
          pulse.scale.setScalar(0.46 + Math.sin(time * 3.8) * 0.06);

          const arr = nodeGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < nodeCount; i += 1) {
            arr[i * 3] = nodeBase[i * 3] + Math.sin(time * 0.42 + nodePhase[i]) * 0.035;
            arr[i * 3 + 1] = nodeBase[i * 3 + 1] + Math.cos(time * 0.36 + nodePhase[i]) * 0.035;
            arr[i * 3 + 2] = nodeBase[i * 3 + 2];
          }
          nodeGeo.attributes.position.needsUpdate = true;
          nodes.rotation.y = Math.sin(time * 0.08) * 0.045;

          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(raf);
          panelGeoCache.clear();
          disposables.forEach((item) => item.dispose());
          renderer?.dispose();
          renderer = null;
        };
      })
      .catch(() => {
        renderer = null;
      });

    return () => {
      disposed = true;
      setLive(false);
      cleanup?.();
    };
  }, []);

  return (
    <section className={`${styles.hero} ${live ? styles.live : ""}`} ref={hostRef} aria-label={t("Webs y comercio", "Web and commerce")}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

      <div className={styles.fallback} aria-hidden="true">
        <div className={`${styles.fallbackPanel} ${styles.panelA}`} />
        <div className={`${styles.fallbackPanel} ${styles.panelB}`} />
        <div className={`${styles.fallbackPanel} ${styles.panelC}`} />
        <div className={styles.fallbackPath} />
      </div>

      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.layout}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}>
            <span className={styles.dot}></span>
            {t("Webs · E-commerce · Conversión", "Websites · E-commerce · Conversion")}
          </div>
          <h1 className={styles.title}>
            {t("Webs que convierten", "Websites that convert")}
            <em>{t("sin perder elegancia.", "without losing elegance.")}</em>
          </h1>
          <p className={styles.lead}>
            {t(
              "Diseñamos sitios, landings y e-commerce con performance, analítica e integraciones para que cada visita tenga un próximo paso claro.",
              "We design websites, landing pages and e-commerce experiences with performance, analytics and integrations so every visit has a clear next step.",
            )}
          </p>
          <div className={styles.cta}>
            <Link href="/contacto" className="btn btn-lg btn-on-dark">
              {t("Iniciar proyecto", "Start project")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a
              href="#soluciones"
              className={styles.secondaryCta}
              style={{ color: "#fff", background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)" }}
            >
              {t("Ver soluciones", "See solutions")}
            </a>
          </div>
          <div className={styles.signals} aria-label={t("Capacidades clave", "Key capabilities")}>
            <span>{t("UX a medida", "Custom UX")}</span>
            <span>Core Web Vitals</span>
            <span>{t("Analítica conectada", "Connected analytics")}</span>
            <span>{t("Integraciones reales", "Real integrations")}</span>
          </div>
        </div>
      </div>

      <div className={styles.hud} aria-hidden="true">
        <span>01 / Landing</span>
        <span>02 / Commerce</span>
        <span>03 / Analytics</span>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
