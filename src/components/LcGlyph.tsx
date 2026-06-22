import React from "react";

interface LcGlyphProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function LcGlyph({ className = "lc-glyph", width = 30, height = 30 }: LcGlyphProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3D38E0" />
          <stop offset=".4" stopColor="#7C5CFF" />
          <stop offset=".75" stopColor="#FB7A5B" />
          <stop offset="1" stopColor="#F4A93B" />
        </linearGradient>
      </defs>
      <path d="M16 3L29 10L16 17L3 10L16 3Z" fill="url(#lcg)" />
      <path d="M3 16L16 23L29 16" stroke="#15141A" strokeWidth="2" strokeLinejoin="round" opacity=".85" />
      <path d="M3 22L16 29L29 22" stroke="#15141A" strokeWidth="2" strokeLinejoin="round" opacity=".4" />
    </svg>
  );
}
