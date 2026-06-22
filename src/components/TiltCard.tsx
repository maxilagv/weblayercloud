"use client";

import React, { useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** Lift toward the viewer on hover (px of translateZ). */
  lift?: number;
  as?: "div" | "li" | "article";
}

/**
 * TiltCard — gives any card real 3D depth that follows the cursor.
 *
 * It only writes CSS custom properties (--rx/--ry/--mx/--my/--tz) and a class,
 * so the actual look lives in CSS and animation stays on the compositor
 * (transform/opacity only). Pointer tilt is disabled for reduced-motion and
 * coarse-pointer (touch) users, where a flat, fully legible card is better.
 */
export default function TiltCard({
  children,
  className = "",
  style,
  max = 7,
  lift = 16,
  as = "div",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${(px - 0.5) * (max * 2)}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * (max * 2)}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.setProperty("--tz", `${lift}px`);
      el.dataset.tilt = "on";
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tz", "0px");
    el.dataset.tilt = "off";
  };

  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </Tag>
  );
}
