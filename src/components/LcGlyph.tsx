import React from "react";

interface LcGlyphProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function LcGlyph({ className = "lc-glyph", width = 30, height = 30 }: LcGlyphProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lcg" x1="8" y1="5" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F6BFF" />
          <stop offset=".42" stopColor="#765CFF" />
          <stop offset="1" stopColor="#FB7A5B" />
        </linearGradient>
        <filter id="lcShadow" x="2" y="2" width="36" height="36" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#7C5CFF" floodOpacity=".18" />
        </filter>
      </defs>
      <g filter="url(#lcShadow)">
        <path d="M20 4.5L35 12.6L20 20.7L5 12.6L20 4.5Z" fill="url(#lcg)" />
        <path d="M20 16.3L34 23.9L20 31.5L6 23.9L20 16.3Z" fill="#2B2932" />
        <path d="M20 22.4L33.2 29.5L20 36.6L6.8 29.5L20 22.4Z" fill="#CFCBD5" />
        <path d="M20 4.5L35 12.6L20 20.7L5 12.6L20 4.5Z" stroke="rgba(255,255,255,.55)" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
