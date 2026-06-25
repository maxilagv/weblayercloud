"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
}

export default function ScrollReveal({ children, delay = 0, className = "", style = {}, ...props }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const raf = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    // Add reveal-armed class to document if it doesn't have it
    if (!document.documentElement.classList.contains("reveal-armed")) {
      document.documentElement.classList.add("reveal-armed");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      className={`${className} ${isVisible ? "in" : ""}`}
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
