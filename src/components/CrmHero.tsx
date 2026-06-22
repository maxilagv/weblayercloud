"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import styles from "./CrmHero.module.css";

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

export default function CrmHero() {
  const { t } = useLang();
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(0);
  const [live, setLive] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { n: "01", label: t("Captura", "Capture"), detail: t("leads y clientes", "leads and clients") },
    { n: "02", label: t("Gestión", "Manage"), detail: t("pipeline y tareas", "pipeline and tasks") },
    { n: "03", label: t("Automatiza", "Automate"), detail: t("flujos y reglas", "flows and rules") },
    { n: "04", label: t("Mide", "Measure"), detail: t("reportes y control", "reports and control") },
  ];

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
        scene.fog = new THREE.FogExp2(0x06050e, 0.045);

        const camera = new THREE.PerspectiveCamera(46, w() / h(), 0.1, 100);
        camera.position.set(0, 0, 15.5);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w(), h(), false);

        const root = new THREE.Group();
        root.position.set(isMobile() ? 0 : 2.45, isMobile() ? 1.3 : 0.05, 0);
        root.rotation.set(-0.14, -0.24, 0.03);
        root.scale.setScalar(isMobile() ? 0.74 : 1);
        scene.add(root);

        const makeSprite = () => {
          const c = document.createElement("canvas");
          c.width = 96;
          c.height = 96;
          const ctx = c.getContext("2d");
          if (!ctx) throw new Error("No canvas context");
          const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(0.28, "rgba(255,255,255,.82)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 96, 96);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };

        const sprite = makeSprite();
        disposables.push(sprite);

        const stageXs = [-5.1, -1.7, 1.7, 5.1];
        const laneYs = [-2.05, -0.82, 0.45, 1.67];

        const planeGeo = new THREE.PlaneGeometry(2.25, 5.85, 1, 1);
        const edgeGeo = new THREE.EdgesGeometry(planeGeo);
        disposables.push(planeGeo, edgeGeo);

        stageXs.forEach((x, i) => {
          const c = sampleGradient(i / 3);
          const planeMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(c[0], c[1], c[2]),
            transparent: true,
            opacity: 0.035,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const edgeMat = new THREE.LineBasicMaterial({
            color: new THREE.Color(c[0], c[1], c[2]),
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
          });
          disposables.push(planeMat, edgeMat);

          const plane = new THREE.Mesh(planeGeo, planeMat);
          plane.position.set(x, 0, -0.35 + i * 0.08);
          plane.rotation.y = -0.08;
          root.add(plane);

          const edges = new THREE.LineSegments(edgeGeo, edgeMat);
          edges.position.copy(plane.position);
          edges.rotation.copy(plane.rotation);
          root.add(edges);
        });

        const railPos: number[] = [];
        laneYs.forEach((y) => {
          railPos.push(-6.55, y, -0.18, 6.55, y, -0.18);
        });
        stageXs.forEach((x) => {
          railPos.push(x, -2.85, -0.22, x, 2.85, -0.22);
        });
        const railGeo = new THREE.BufferGeometry();
        railGeo.setAttribute("position", new THREE.Float32BufferAttribute(railPos, 3));
        const railMat = new THREE.LineBasicMaterial({
          color: 0x9c90ff,
          transparent: true,
          opacity: 0.14,
          depthWrite: false,
        });
        const rails = new THREE.LineSegments(railGeo, railMat);
        root.add(rails);
        disposables.push(railGeo, railMat);

        const ringGroup = new THREE.Group();
        root.add(ringGroup);

        const ringGeo = new THREE.TorusGeometry(2.28, 0.012, 8, 160);
        const ringMatA = new THREE.MeshBasicMaterial({
          color: 0x7c5cff,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const ringMatB = new THREE.MeshBasicMaterial({
          color: 0xfb7a5b,
          transparent: true,
          opacity: 0.24,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        disposables.push(ringGeo, ringMatA, ringMatB);

        const ringA = new THREE.Mesh(ringGeo, ringMatA);
        const ringB = new THREE.Mesh(ringGeo, ringMatB);
        const ringC = new THREE.Mesh(ringGeo, ringMatA.clone());
        ringA.rotation.x = Math.PI / 2;
        ringB.rotation.y = Math.PI / 2;
        ringC.rotation.set(Math.PI / 2, Math.PI / 3, 0);
        ringC.scale.setScalar(0.68);
        ringGroup.add(ringA, ringB, ringC);
        disposables.push(ringC.material as THREE_NS.Material);

        const coreMat = new THREE.SpriteMaterial({
          map: sprite,
          color: 0x7c5cff,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const core = new THREE.Sprite(coreMat);
        core.scale.setScalar(5.2);
        ringGroup.add(core);
        disposables.push(coreMat);

        const count = isMobile() ? 300 : 760;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const linePos = new Float32Array(count * 6);
        const lineCol = new Float32Array(count * 6);
        const progress = new Float32Array(count);
        const speed = new Float32Array(count);
        const lane = new Float32Array(count);
        const phase = new Float32Array(count);
        const depth = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          progress[i] = Math.random();
          speed[i] = 0.035 + Math.random() * 0.05;
          lane[i] = Math.floor(Math.random() * laneYs.length);
          phase[i] = Math.random() * Math.PI * 2;
          depth[i] = (Math.random() - 0.5) * 0.7;
          const c = sampleGradient((progress[i] + lane[i] * 0.18) % 1);
          col[i * 3] = c[0];
          col[i * 3 + 1] = c[1];
          col[i * 3 + 2] = c[2];
          lineCol[i * 6] = c[0];
          lineCol[i * 6 + 1] = c[1];
          lineCol[i * 6 + 2] = c[2];
          lineCol[i * 6 + 3] = c[0];
          lineCol[i * 6 + 4] = c[1];
          lineCol[i * 6 + 5] = c[2];
        }

        const pointAt = (p: number, ln: number, ph: number, d: number, time: number): [number, number, number] => {
          const wrapped = ((p % 1) + 1) % 1;
          const x = lerp(-6.4, 6.4, wrapped);
          const yBase = laneYs[ln] ?? 0;
          const stagePulse = Math.sin(wrapped * Math.PI * 8);
          const y = yBase + Math.sin(wrapped * Math.PI * 2 + ph + time * 0.32) * 0.13;
          const z = d + Math.cos(wrapped * Math.PI * 4 + ph) * 0.42 + stagePulse * 0.08;
          return [x, y, z];
        };

        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new THREE.BufferAttribute(pos, 3);
        particlePos.setUsage(THREE.DynamicDrawUsage);
        particleGeo.setAttribute("position", particlePos);
        particleGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
        const particleMat = new THREE.PointsMaterial({
          size: isMobile() ? 0.16 : 0.13,
          map: sprite,
          vertexColors: true,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        root.add(particles);
        disposables.push(particleGeo, particleMat);

        const traceGeo = new THREE.BufferGeometry();
        const traceAttr = new THREE.BufferAttribute(linePos, 3);
        traceAttr.setUsage(THREE.DynamicDrawUsage);
        traceGeo.setAttribute("position", traceAttr);
        traceGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
        const traceMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.33,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const traces = new THREE.LineSegments(traceGeo, traceMat);
        root.add(traces);
        disposables.push(traceGeo, traceMat);

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const onPointerMove = (event: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        const onPointerLeave = () => {
          pointer.tx = 0;
          pointer.ty = 0;
        };
        host.addEventListener("pointermove", onPointerMove);
        host.addEventListener("pointerleave", onPointerLeave);

        const applyLayout = () => {
          if (!renderer) return;
          const mobile = isMobile();
          camera.aspect = w() / h();
          camera.fov = mobile ? 53 : 46;
          camera.position.z = mobile ? 18 : 15.5;
          camera.updateProjectionMatrix();
          root.position.set(mobile ? 0 : 2.45, mobile ? 1.3 : 0.05, 0);
          root.scale.setScalar(mobile ? 0.74 : 1);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(w(), h(), false);
        };
        window.addEventListener("resize", applyLayout);

        let visible = true;
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        io.observe(host);

        setLive(true);

        const clock = new THREE.Clock();
        let elapsed = 0;

        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!renderer || !visible) return;

          const dt = Math.min(clock.getDelta(), 0.045);
          elapsed += dt;
          pointer.x += (pointer.tx - pointer.x) * 0.055;
          pointer.y += (pointer.ty - pointer.y) * 0.055;

          const active = Math.floor(((elapsed * 0.34) % 1) * 4);
          if (active !== activeRef.current) {
            activeRef.current = active;
            setActiveStage(active);
          }

          const pa = particleGeo.attributes.position.array as Float32Array;
          const la = traceGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < count; i++) {
            progress[i] = (progress[i] + speed[i] * dt) % 1;
            const current = pointAt(progress[i], lane[i], phase[i], depth[i], elapsed);
            const previous = pointAt(progress[i] - 0.034, lane[i], phase[i], depth[i], elapsed);
            const pi = i * 3;
            const li = i * 6;
            pa[pi] = current[0];
            pa[pi + 1] = current[1];
            pa[pi + 2] = current[2];
            la[li] = previous[0];
            la[li + 1] = previous[1];
            la[li + 2] = previous[2];
            la[li + 3] = current[0];
            la[li + 4] = current[1];
            la[li + 5] = current[2];
          }
          particleGeo.attributes.position.needsUpdate = true;
          traceGeo.attributes.position.needsUpdate = true;

          ringGroup.rotation.x = elapsed * 0.18;
          ringGroup.rotation.y = elapsed * 0.26;
          ringGroup.rotation.z = Math.sin(elapsed * 0.32) * 0.18;
          root.rotation.y = -0.24 + pointer.x * 0.11 + Math.sin(elapsed * 0.12) * 0.025;
          root.rotation.x = -0.14 - pointer.y * 0.055;
          root.rotation.z = 0.03 + pointer.x * 0.018;
          camera.position.x += (pointer.x * 0.58 - camera.position.x) * 0.06;
          camera.position.y += (-pointer.y * 0.36 - camera.position.y) * 0.06;
          camera.lookAt(root.position.x * 0.35, 0, 0);

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          host.removeEventListener("pointermove", onPointerMove);
          host.removeEventListener("pointerleave", onPointerLeave);
          window.removeEventListener("resize", applyLayout);
          io.disconnect();
          disposables.forEach((d) => d.dispose());
        };
      })
      .catch(() => {
        /* CSS fallback remains visible. */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanup?.();
      renderer?.dispose();
    };
  }, []);

  return (
    <section className={`${styles.hero} ${live ? styles.live : ""}`} ref={hostRef} aria-label="CRM / ERP">
      <div className={styles.ambient} aria-hidden="true">
        <span className={`${styles.blob} ${styles.b1}`} />
        <span className={`${styles.blob} ${styles.b2}`} />
        <span className={`${styles.blob} ${styles.b3}`} />
        <span className={styles.grid} />
      </div>

      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.layout}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            <span>{t("CRM / ERP · Sistemas a medida", "CRM / ERP · Custom systems")}</span>
          </div>
          <h1
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: t(
                "Tu operación, conectada <em>de punta a punta.</em>",
                "Your operation, connected <em>end to end.</em>"
              ),
            }}
          />
          <p className={styles.lead}>
            {t(
              "Diseñamos CRM y ERP propios para centralizar clientes, procesos, datos y decisiones en una arquitectura clara, escalable y medible.",
              "We design custom CRM and ERP platforms to centralize customers, processes, data and decisions in a clear, scalable and measurable architecture."
            )}
          </p>

          <div className={styles.cta}>
            <Link href="/contacto" className="btn btn-lg btn-on-dark">
              {t("Iniciar proyecto", "Start project")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#crm-modulos" className="btn btn-lg btn-ghost btn-on-dark">
              {t("Ver módulos", "See modules")}
            </a>
          </div>

          <div className={styles.signals} aria-label={t("Alcance del sistema", "System scope")}>
            <span>{t("Pipeline comercial", "Sales pipeline")}</span>
            <span>{t("Procesos ERP", "ERP processes")}</span>
            <span>{t("Reportes en vivo", "Live reports")}</span>
          </div>
        </div>
      </div>

      <div className={styles.stageHud} aria-hidden="true">
        {stages.map((stage, index) => (
          <div key={stage.n} className={`${styles.stage} ${activeStage === index ? styles.active : ""}`}>
            <span className={styles.stageNum}>{stage.n}</span>
            <span className={styles.stageText}>
              <b>{stage.label}</b>
              <small>{stage.detail}</small>
            </span>
          </div>
        ))}
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}
