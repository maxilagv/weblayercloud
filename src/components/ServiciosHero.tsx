"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";
import styles from "./ServiciosHero.module.css";

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

export default function ServiciosHero() {
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

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xf4efe6, 0.035);

        const camera = new THREE.PerspectiveCamera(46, w() / h(), 0.1, 100);
        camera.position.set(0, 0, 18);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w(), h(), false);
        renderer.setClearColor(0x000000, 0);

        const root = new THREE.Group();
        scene.add(root);

        const makeSpriteTexture = () => {
          const c = document.createElement("canvas");
          c.width = 96;
          c.height = 96;
          const ctx = c.getContext("2d");
          if (!ctx) throw new Error("No canvas context");
          const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.32, "rgba(255,255,255,.78)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 96, 96);
          const texture = new THREE.CanvasTexture(c);
          texture.colorSpace = THREE.SRGBColorSpace;
          return texture;
        };

        const sprite = makeSpriteTexture();
        disposables.push(sprite);

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
          return new THREE.ShapeGeometry(shape, 20);
        };

        const panelGeo = roundedRectGeometry(2.75, 1.62, 0.18);
        const panelInnerGeo = roundedRectGeometry(2.2, 0.82, 0.12);
        const barGeo = roundedRectGeometry(0.72, 0.08, 0.04);
        const edgeGeo = new THREE.EdgesGeometry(panelGeo);
        const ringGeo = new THREE.TorusGeometry(0.46, 0.012, 8, 120);
        disposables.push(panelGeo, panelInnerGeo, barGeo, edgeGeo, ringGeo);

        const anchors = [
          { key: "web", x: -5.7, y: 2.18, z: -0.35, color: 0x7c5cff, t: 0.22, phase: 0.2 },
          { key: "crm", x: 5.35, y: 1.35, z: -0.18, color: 0x3d38e0, t: 0.02, phase: 1.7 },
          { key: "campus", x: -4.65, y: -2.05, z: 0.22, color: 0xfb7a5b, t: 0.72, phase: 3.1 },
          { key: "ia", x: 4.75, y: -2.32, z: 0.36, color: 0xf4a93b, t: 0.96, phase: 4.4 },
        ];

        const panels: Array<{ group: THREE_NS.Group; baseY: number; baseZ: number; phase: number }> = [];

        anchors.forEach((anchor, index) => {
          const group = new THREE.Group();
          group.position.set(anchor.x, anchor.y, anchor.z);
          group.rotation.set(-0.08, anchor.x > 0 ? -0.22 : 0.22, anchor.x > 0 ? -0.035 : 0.035);
          root.add(group);
          panels.push({ group, baseY: anchor.y, baseZ: anchor.z, phase: anchor.phase });

          const fill = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const edge = new THREE.LineBasicMaterial({
            color: anchor.color,
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
          });
          const inner = new THREE.MeshBasicMaterial({
            color: anchor.color,
            transparent: true,
            opacity: 0.065,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          disposables.push(fill, edge, inner);

          const panel = new THREE.Mesh(panelGeo, fill);
          group.add(panel);

          const panelEdge = new THREE.LineSegments(edgeGeo, edge);
          panelEdge.position.z = 0.018;
          group.add(panelEdge);

          const innerPanel = new THREE.Mesh(panelInnerGeo, inner);
          innerPanel.position.set(0.16, -0.1, 0.032);
          group.add(innerPanel);

          for (let i = 0; i < 3; i += 1) {
            const c = sampleGradient((anchor.t + i * 0.14) % 1);
            const barMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color(c[0], c[1], c[2]),
              transparent: true,
              opacity: i === 0 ? 0.52 : 0.23,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
            const bar = new THREE.Mesh(barGeo, barMat);
            bar.position.set(-0.74 + i * 0.58, 0.46 - i * 0.22, 0.052);
            bar.scale.x = i === 1 ? 1.32 : 1;
            group.add(bar);
            disposables.push(barMat);
          }

          const nodeMat = new THREE.SpriteMaterial({
            map: sprite,
            color: anchor.color,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const node = new THREE.Sprite(nodeMat);
          node.position.set(index % 2 === 0 ? -0.92 : 0.92, -0.38, 0.12);
          node.scale.setScalar(0.74);
          group.add(node);
          disposables.push(nodeMat);
        });

        const core = new THREE.Group();
        root.add(core);

        const coreMats = [
          new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }),
          new THREE.MeshBasicMaterial({ color: 0xfb7a5b, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }),
          new THREE.MeshBasicMaterial({ color: 0xf4a93b, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
        ];
        coreMats.forEach((m) => disposables.push(m));

        const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.015, 8, 160), coreMats[0]);
        const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.012, 8, 160), coreMats[1]);
        const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.012, 8, 140), coreMats[2]);
        ringA.rotation.x = Math.PI / 2;
        ringB.rotation.y = Math.PI / 2.2;
        ringC.rotation.set(Math.PI / 2, 0.75, 0.16);
        core.add(ringA, ringB, ringC);
        disposables.push(ringA.geometry, ringB.geometry, ringC.geometry);

        const coreGlowMat = new THREE.SpriteMaterial({
          map: sprite,
          color: 0xffffff,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coreGlow = new THREE.Sprite(coreGlowMat);
        coreGlow.scale.setScalar(5.2);
        core.add(coreGlow);
        disposables.push(coreGlowMat);

        const curves = anchors.map((anchor, index) => {
          const midY = anchor.y * 0.24 + Math.sin(index) * 0.42;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(anchor.x, anchor.y, anchor.z),
            new THREE.Vector3(anchor.x * 0.48, midY, 0.78),
            new THREE.Vector3(0, 0, 0.28),
          ]);
          const points = curve.getPoints(96);
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const c = sampleGradient(anchor.t);
          const mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(c[0], c[1], c[2]),
            transparent: true,
            opacity: 0.28,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const line = new THREE.Line(geo, mat);
          root.add(line);
          disposables.push(geo, mat);
          return curve;
        });

        const gridPositions: number[] = [];
        for (let i = -9; i <= 9; i += 1) {
          gridPositions.push(-8.5, i * 0.62, -1.15, 8.5, i * 0.62, -1.15);
          gridPositions.push(i * 0.62, -5.4, -1.15, i * 0.62, 5.4, -1.15);
        }
        const gridGeo = new THREE.BufferGeometry();
        gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
        const gridMat = new THREE.LineBasicMaterial({
          color: 0x7c5cff,
          transparent: true,
          opacity: 0.065,
          depthWrite: false,
        });
        const grid = new THREE.LineSegments(gridGeo, gridMat);
        grid.rotation.z = -0.08;
        root.add(grid);
        disposables.push(gridGeo, gridMat);

        const particleCount = isMobile() ? 170 : 420;
        const particlePos = new Float32Array(particleCount * 3);
        const particleCol = new Float32Array(particleCount * 3);
        const particleBase = new Float32Array(particleCount * 3);
        const particlePhase = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i += 1) {
          const radius = 2.7 + Math.random() * 5.2;
          const angle = Math.random() * Math.PI * 2;
          const y = (Math.random() - 0.5) * 5.4;
          particleBase[i * 3] = Math.cos(angle) * radius;
          particleBase[i * 3 + 1] = y;
          particleBase[i * 3 + 2] = Math.sin(angle) * radius * 0.32 - 0.5;
          particlePhase[i] = Math.random() * Math.PI * 2;
          const c = sampleGradient(Math.random());
          particleCol[i * 3] = c[0];
          particleCol[i * 3 + 1] = c[1];
          particleCol[i * 3 + 2] = c[2];
        }
        particlePos.set(particleBase);
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3).setUsage(THREE.DynamicDrawUsage));
        pGeo.setAttribute("color", new THREE.BufferAttribute(particleCol, 3));
        const pMat = new THREE.PointsMaterial({
          size: isMobile() ? 0.072 : 0.058,
          vertexColors: true,
          transparent: true,
          opacity: 0.48,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        });
        const particles = new THREE.Points(pGeo, pMat);
        root.add(particles);
        disposables.push(pGeo, pMat);

        const pulses = Array.from({ length: isMobile() ? 7 : 12 }, (_, i) => {
          const anchor = anchors[i % anchors.length];
          const mat = new THREE.SpriteMaterial({
            map: sprite,
            color: anchor.color,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const pulse = new THREE.Sprite(mat);
          pulse.scale.setScalar(i % 3 === 0 ? 0.46 : 0.34);
          root.add(pulse);
          disposables.push(mat);
          return { pulse, curve: curves[i % curves.length], offset: i / 12, speed: 0.055 + (i % 4) * 0.01 };
        });

        let targetX = 0;
        let targetY = 0;
        let pointerX = 0;
        let pointerY = 0;

        const onPointerMove = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        const onPointerLeave = () => {
          targetX = 0;
          targetY = 0;
        };
        host.addEventListener("pointermove", onPointerMove);
        host.addEventListener("pointerleave", onPointerLeave);

        const applyLayout = () => {
          if (!renderer) return;
          const mobile = isMobile();
          camera.aspect = w() / h();
          camera.fov = mobile ? 52 : 46;
          camera.position.z = mobile ? 20.5 : 18;
          camera.updateProjectionMatrix();
          root.position.set(0, mobile ? 1.26 : 0.08, 0);
          root.scale.setScalar(mobile ? 0.72 : 1);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w(), h(), false);
        };
        applyLayout();
        window.addEventListener("resize", applyLayout);

        let visible = true;
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        io.observe(host);

        setLive(true);

        const clock = new THREE.Clock();

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!renderer || !visible) return;

          const elapsed = clock.getElapsedTime();
          pointerX += (targetX - pointerX) * 0.055;
          pointerY += (targetY - pointerY) * 0.055;

          root.rotation.y = Math.sin(elapsed * 0.12) * 0.08 + pointerX * 0.08;
          root.rotation.x = -0.02 - pointerY * 0.045;
          root.rotation.z = Math.sin(elapsed * 0.1) * 0.02;

          panels.forEach((panel, index) => {
            panel.group.position.y = panel.baseY + Math.sin(elapsed * 0.52 + panel.phase) * (0.07 + index * 0.006);
            panel.group.position.z = panel.baseZ + Math.cos(elapsed * 0.42 + panel.phase) * 0.06;
          });

          core.rotation.x = elapsed * 0.12;
          core.rotation.y = elapsed * 0.18;
          core.rotation.z = Math.sin(elapsed * 0.24) * 0.18;
          coreGlow.scale.setScalar(4.8 + Math.sin(elapsed * 1.2) * 0.22);

          pulses.forEach((item) => {
            const p = (elapsed * item.speed + item.offset) % 1;
            const point = item.curve.getPoint(p);
            item.pulse.position.copy(point);
            item.pulse.scale.setScalar(0.28 + Math.sin(p * Math.PI) * 0.42);
          });

          const arr = pGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i += 1) {
            const ix = i * 3;
            arr[ix] = particleBase[ix] + Math.sin(elapsed * 0.25 + particlePhase[i]) * 0.14;
            arr[ix + 1] = particleBase[ix + 1] + Math.cos(elapsed * 0.3 + particlePhase[i]) * 0.13;
            arr[ix + 2] = particleBase[ix + 2] + Math.sin(elapsed * 0.22 + particlePhase[i]) * 0.16;
          }
          pGeo.attributes.position.needsUpdate = true;
          particles.rotation.y = elapsed * 0.018;

          camera.position.x = lerp(camera.position.x, pointerX * 0.42, 0.06);
          camera.position.y = lerp(camera.position.y, -pointerY * 0.26, 0.06);
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("resize", applyLayout);
          io.disconnect();
          disposables.forEach((item) => item.dispose());
        };
      })
      .catch(() => {
        renderer = null;
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
      renderer?.dispose();
    };
  }, []);

  return (
    <section className={`${styles.hero} ${live ? styles.live : ""}`} ref={hostRef} aria-label={t("Soluciones LayerCloud", "LayerCloud solutions")}>
      <div className={styles.aurora} aria-hidden="true">
        <span className={`${styles.blob} ${styles.b1}`} />
        <span className={`${styles.blob} ${styles.b2}`} />
        <span className={`${styles.blob} ${styles.b3}`} />
        <span className={`${styles.blob} ${styles.b4}`} />
      </div>

      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />

      <div className={styles.fallback} aria-hidden="true">
        <span className={`${styles.fNode} ${styles.fnWeb}`} />
        <span className={`${styles.fNode} ${styles.fnCrm}`} />
        <span className={`${styles.fNode} ${styles.fnCampus}`} />
        <span className={`${styles.fNode} ${styles.fnIa}`} />
        <span className={styles.fCore} />
        <span className={styles.fLineA} />
        <span className={styles.fLineB} />
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          <span>{t("Soluciones · LayerCloud", "Solutions · LayerCloud")}</span>
        </div>
        <h1 className={styles.title}>
          {t("Una arquitectura para", "One architecture to")}
          <em>{t("operar, vender y escalar.", "operate, sell and scale.")}</em>
        </h1>
        <p className={styles.lead}>
          {t(
            "Webs, CRM/ERP, campus virtuales y automatizaciones con IA, diseñados como un sistema conectado desde el primer día.",
            "Websites, CRM/ERP, virtual campuses and AI automations, designed as one connected system from day one."
          )}
        </p>
        <div className={styles.cta}>
          <Link href="/contacto" className="btn btn-lg">
            {t("Iniciar proyecto", "Start project")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a href="#explorador" className="btn btn-lg btn-ghost">
            {t("Explorar soluciones", "Explore solutions")}
          </a>
        </div>
        <div className={styles.signals} aria-label={t("Capas de servicio", "Service layers")}>
          <span>Web</span>
          <span>CRM / ERP</span>
          <span>{t("Campus virtual", "Virtual campus")}</span>
          <span>{t("IA aplicada", "Applied AI")}</span>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
