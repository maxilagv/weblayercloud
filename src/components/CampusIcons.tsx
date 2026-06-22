import React from "react";

/**
 * Lucide-style 24x24 stroke icons for the Campus page — replacing emojis with
 * crisp, consistently-sized SVGs (a baseline UI-quality rule). Stroke uses
 * currentColor so tiles can theme them via color.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type CampusIconKey =
  | "video"
  | "report"
  | "bell"
  | "calendar"
  | "attendance"
  | "vote"
  | "certificate"
  | "analytics"
  | "student"
  | "teacher"
  | "director"
  | "family"
  | "web"
  | "crm"
  | "ai"
  | "layers"
  | "gauge"
  | "route"
  | "compass"
  | "wrench";

const paths: Record<CampusIconKey, React.ReactNode> = {
  video: (
    <>
      <rect x="2.5" y="5" width="14" height="14" rx="2.5" />
      <path d="M16.5 9.5l5-2.5v10l-5-2.5" />
      <path d="M7.5 9.7v4.6l3.8-2.3z" />
    </>
  ),
  report: (
    <>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M7.5 13h3v3h-3z" />
    </>
  ),
  attendance: (
    <>
      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M3.5 20c0-3 2.6-5 5.5-5 1.5 0 2.9.5 4 1.4" />
      <path d="M15.5 18.5l2 2 3.5-4" />
    </>
  ),
  vote: (
    <>
      <path d="M5 21h14a1 1 0 0 0 1-1v-2.5l-2.5-6.5H7.5L5 17.5V20a1 1 0 0 0 1 1z" />
      <path d="M4 17.5h16" />
      <path d="M9.5 7.5l2 2 4-4.5" />
    </>
  ),
  certificate: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9.5 13.5L8 21l4-2 4 2-1.5-7.5" />
      <path d="M12 6.5l.9 1.8 2 .3-1.45 1.4.35 2L12 11.3l-1.8 1 .35-2L9.1 8.9l2-.3z" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <path d="M7.5 16v-3M11.5 16v-6M15.5 16v-4M19 16V8" />
    </>
  ),
  student: (
    <>
      <path d="M12 3L2.5 8 12 13l9.5-5z" />
      <path d="M6.5 10.5V15c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.5" />
      <path d="M21.5 8v5" />
    </>
  ),
  teacher: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v3M8.5 21h7" />
      <path d="M7 11l2.5-2.5L12 11l4-4" />
    </>
  ),
  director: (
    <>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M3 21h18" />
      <path d="M9 21v-5h6v5" />
      <path d="M9.5 11h5" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="16" cy="8.5" r="2.2" />
      <path d="M3.5 19c0-2.6 2-4.4 4.5-4.4S12.5 16.4 12.5 19" />
      <path d="M13.5 19c.2-2.2 1.6-3.6 3.4-3.6 2 0 3.6 1.6 3.6 3.9" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3z" />
    </>
  ),
  crm: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9h18M9 9v12" />
      <path d="M12.5 13h5M12.5 16.5h5" />
    </>
  ),
  ai: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
      <path d="M10 10.5l1.4 1.4M14 10l-2.5 2.5" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-5" />
      <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.5 6a3.8 3.8 0 0 1 5 4.6l-9 9a2.1 2.1 0 0 1-3-3l9-9A3.8 3.8 0 0 1 14.5 6z" />
      <path d="M14.5 6l3.5 3.5" />
    </>
  ),
};

export default function CampusIcon({ name, className }: { name: CampusIconKey; className?: string } & IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
