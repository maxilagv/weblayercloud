"use client";

import React, { useEffect, useRef, useState } from "react";

interface CounterProps {
  count: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function Counter({
  count,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1500,
  className = "",
}: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const target = count;
          const t0 = performance.now();

          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const e = 1 - Math.pow(1 - p, 3);
            setValue(target * e);
            if (p < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -15% 0px" }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
