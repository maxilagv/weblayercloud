import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

// ── Visual Illustrations ───────────────────────────────────────────────────

/** Servicios — stacked floating service layers */
function VisualServicios() {
  return (
    <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '340px', height: 'auto', overflow: 'visible' }}
      aria-hidden="true">
      <defs>
        <linearGradient id="lg-s1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF3B00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF3B00" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="lg-s2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>

      {/* Layer 3 — bottom */}
      <rect x="20" y="175" width="280" height="64" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="36" y="191" width="80" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="36" y="203" width="120" height="4" rx="2" fill="rgba(255,255,255,0.07)" />
      <circle cx="280" cy="207" r="12" fill="rgba(255,59,0,0.1)" stroke="rgba(255,59,0,0.25)" strokeWidth="1" />
      <text x="280" y="211" textAnchor="middle" fill="rgba(255,59,0,0.7)" fontSize="8" style={{ fontFamily: 'monospace' }}>RP</text>

      {/* Layer 2 — middle */}
      <rect x="20" y="104" width="280" height="64" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="36" y="120" width="100" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="36" y="132" width="60" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
      <circle cx="280" cy="136" r="12" fill="rgba(255,59,0,0.14)" stroke="rgba(255,59,0,0.35)" strokeWidth="1" />
      <text x="280" y="140" textAnchor="middle" fill="rgba(255,59,0,0.85)" fontSize="8" style={{ fontFamily: 'monospace' }}>ERP</text>

      {/* Layer 1 — top (highlighted) */}
      <rect x="20" y="33" width="280" height="64" rx="3" fill="url(#lg-s1)" stroke="rgba(255,59,0,0.35)" strokeWidth="1" />
      <rect x="36" y="49" width="120" height="6" rx="2" fill="rgba(255,255,255,0.55)" />
      <rect x="36" y="61" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="280" cy="65" r="12" fill="#FF3B00" />
      <text x="280" y="69" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" style={{ fontFamily: 'monospace' }}>EC</text>

      {/* Connection dots between layers */}
      {[152, 168].map((y, i) => (
        <circle key={i} cx="160" cy={y} r="2.5" fill="rgba(255,59,0,0.4)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Labels */}
      {[
        { x: 310, y: 69, t: 'E-commerce' },
        { x: 310, y: 140, t: 'ERP' },
        { x: 310, y: 211, t: 'Reportes' },
      ].map((l) => (
        <text key={l.t} x={l.x} y={l.y} textAnchor="start" fill="rgba(255,255,255,0.35)" fontSize="9" letterSpacing="0.5"
          style={{ fontFamily: 'monospace' }}>
          {l.t}
        </text>
      ))}

      {/* Glow accent */}
      <ellipse cx="160" cy="65" rx="80" ry="16" fill="#FF3B00" fillOpacity="0.04">
        <animate attributeName="fillOpacity" values="0.04;0.1;0.04" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

/** ERP — concentric module rings */
function VisualERP() {
  const MODULES = [
    { r: 118, label: 'Contabilidad', angle: -90 },
    { r: 118, label: 'Inventario',   angle: -30 },
    { r: 118, label: 'Ventas',       angle:  30 },
    { r: 118, label: 'Compras',      angle:  90 },
    { r: 118, label: 'RRHH',         angle: 150 },
    { r: 118, label: 'Reportes',     angle: 210 },
  ];

  const toRad = (d: number) => (d * Math.PI) / 180;
  const cx = 150, cy = 150;

  return (
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '300px', height: 'auto', overflow: 'visible' }}
      aria-hidden="true">
      <defs>
        <radialGradient id="erp-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4D15" />
          <stop offset="100%" stopColor="#CC2E00" />
        </radialGradient>
      </defs>

      {/* Concentric rings */}
      {[130, 98, 66].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r}
          stroke="rgba(255,59,0,0.1)"
          strokeWidth="1"
          strokeDasharray={i === 0 ? '4 6' : '2 4'}
          fill="none">
          {i === 0 && (
            <animateTransform attributeName="transform" type="rotate"
              values={`0 ${cx} ${cy};360 ${cx} ${cy}`} dur="40s" repeatCount="indefinite" />
          )}
        </circle>
      ))}

      {/* Module nodes */}
      {MODULES.map((m) => {
        const x = cx + m.r * Math.cos(toRad(m.angle));
        const y = cy + m.r * Math.sin(toRad(m.angle));
        const lx = cx + (m.r + 28) * Math.cos(toRad(m.angle));
        const ly = cy + (m.r + 28) * Math.sin(toRad(m.angle)) + 4;
        const anchor =
          m.angle < -60 || m.angle > 120 ? 'end' :
          m.angle > -60 && m.angle < 60 ? (m.angle < 0 ? 'middle' : 'middle') :
          'start';
        return (
          <g key={m.label}>
            <line x1={x} y1={y} x2={cx} y2={cy} stroke="rgba(255,59,0,0.12)" strokeWidth="1" />
            <circle cx={x} cy={y} r="12" fill="#111" stroke="rgba(255,59,0,0.5)" strokeWidth="1" />
            <text x={x} y={y + 4} textAnchor="middle" fill="rgba(255,59,0,0.8)" fontSize="7"
              fontWeight="700" style={{ fontFamily: 'monospace' }}>
              {m.label.slice(0, 3).toUpperCase()}
            </text>
            <text x={lx} y={ly} textAnchor={anchor} fill="rgba(255,255,255,0.35)" fontSize="8"
              style={{ fontFamily: 'monospace' }}>
              {m.label}
            </text>
          </g>
        );
      })}

      {/* Core */}
      <circle cx={cx} cy={cy} r="40" fill="url(#erp-core)" />
      <circle cx={cx} cy={cy} r="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="12" fontWeight="800"
        style={{ fontFamily: 'var(--font-display, Georgia)' }}>
        ERP
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7"
        letterSpacing="1.5" style={{ fontFamily: 'monospace' }}>
        MODULAR
      </text>

      {/* Pulse */}
      <circle cx={cx} cy={cy} r="44" stroke="#FF3B00" strokeWidth="1" fill="none" strokeOpacity="0.3">
        <animate attributeName="r" values="44;56;44" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** E-commerce — shopping flow pipeline */
function VisualEcommerce() {
  const STEPS = [
    { label: 'Catálogo', icon: '◻', x: 30  },
    { label: 'Carrito',  icon: '◻', x: 110 },
    { label: 'Pago',     icon: '◻', x: 190 },
    { label: 'Entrega',  icon: '◻', x: 270 },
  ];

  return (
    <svg viewBox="0 0 330 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '360px', height: 'auto', overflow: 'visible' }}
      aria-hidden="true">
      <defs>
        <linearGradient id="ec-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF3B00" />
          <stop offset="100%" stopColor="#FF3B00" stopOpacity="0.3" />
        </linearGradient>
        {/* Arrow marker */}
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6" stroke="rgba(255,59,0,0.6)" strokeWidth="1" fill="none" />
        </marker>
      </defs>

      {/* Progress bar */}
      <rect x="30" y="82" width="270" height="2" fill="rgba(255,255,255,0.06)" />
      <rect x="30" y="82" width="270" height="2" fill="url(#ec-bar)">
        <animate attributeName="width" values="0;270" dur="2.5s" fill="freeze" />
      </rect>

      {/* Connection arrows */}
      {[75, 155, 235].map((x, i) => (
        <line key={i} x1={x} y1={83} x2={x + 20} y2={83}
          stroke="rgba(255,59,0,0.4)" strokeWidth="1"
          markerEnd="url(#arr)" />
      ))}

      {/* Step nodes */}
      {STEPS.map((s, i) => (
        <g key={s.label}>
          <circle cx={s.x + 20} cy={83} r="20"
            fill={i === 0 ? '#FF3B00' : i < 3 ? 'rgba(255,59,0,0.2)' : 'rgba(255,59,0,0.08)'}
            stroke={i === 0 ? 'transparent' : 'rgba(255,59,0,0.35)'}
            strokeWidth="1">
            {i > 0 && (
              <animate attributeName="fill"
                values={`rgba(255,59,0,0.08);rgba(255,59,0,0.3);rgba(255,59,0,0.08)`}
                dur="2.5s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
            )}
          </circle>
          {/* Step number */}
          <text x={s.x + 20} y={s.label === 'Pago' ? 87 : 88} textAnchor="middle"
            fill={i === 0 ? 'white' : 'rgba(255,255,255,0.6)'}
            fontSize="11" fontWeight="700" style={{ fontFamily: 'monospace' }}>
            {i + 1}
          </text>
          {/* Label below */}
          <text x={s.x + 20} y="120" textAnchor="middle"
            fill="rgba(255,255,255,0.45)" fontSize="9" letterSpacing="0.5"
            style={{ fontFamily: 'monospace' }}>
            {s.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* KPI cards below */}
      {[
        { x: 20,  label: 'Ventas hoy', val: '+127' },
        { x: 120, label: 'Ticket prom.', val: '$8.4k' },
        { x: 220, label: 'Conversión', val: '3.8%' },
      ].map((k) => (
        <g key={k.label}>
          <rect x={k.x} y="145" width="85" height="38" rx="2"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x={k.x + 9} y="162" fill="rgba(255,255,255,0.3)" fontSize="7"
            style={{ fontFamily: 'monospace' }}>
            {k.label.toUpperCase()}
          </text>
          <text x={k.x + 9} y="176" fill="rgba(255,59,0,0.9)" fontSize="12" fontWeight="700"
            style={{ fontFamily: 'var(--font-display, Georgia)' }}>
            {k.val}
          </text>
        </g>
      ))}

      {/* Live dot */}
      <circle cx="310" cy="20" r="4" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="300" y="24" textAnchor="end" fill="rgba(34,197,94,0.6)" fontSize="8"
        style={{ fontFamily: 'monospace' }}>
        LIVE
      </text>
    </svg>
  );
}

/** Tech — node network diagram (microservices / integrations) */
function VisualTech() {
  const NODES = [
    { id: 'a', x: 160, y: 65  },
    { id: 'b', x: 260, y: 110 },
    { id: 'c', x: 270, y: 205 },
    { id: 'd', x: 160, y: 250 },
    { id: 'e', x: 60,  y: 205 },
    { id: 'f', x: 50,  y: 110 },
    { id: 'g', x: 160, y: 155 }, // center
  ];

  const EDGES = [
    ['a', 'g'], ['b', 'g'], ['c', 'g'], ['d', 'g'], ['e', 'g'], ['f', 'g'],
    ['a', 'b'], ['c', 'd'], ['e', 'f'],
  ];

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const LABELS = [
    { id: 'a', label: 'API',    tx: 160, ty: 40  },
    { id: 'b', label: 'Orders', tx: 284, ty: 106 },
    { id: 'c', label: 'Payments', tx: 296, ty: 209 },
    { id: 'd', label: 'CRM',   tx: 160, ty: 276 },
    { id: 'e', label: 'Stock',  tx: 36,  ty: 209 },
    { id: 'f', label: 'Auth',   tx: 26,  ty: 106 },
  ];

  return (
    <svg viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '320px', height: 'auto', overflow: 'visible' }}
      aria-hidden="true">
      <defs>
        <radialGradient id="tc-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4D15" />
          <stop offset="100%" stopColor="#CC2E00" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {EDGES.map(([a, b], i) => {
        const na = nodeMap[a], nb = nodeMap[b];
        return (
          <line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke="rgba(255,59,0,0.2)"
            strokeWidth="1"
            strokeDasharray={a === 'g' || b === 'g' ? '2 3' : '4 6'}
          />
        );
      })}

      {/* Peripheral nodes */}
      {NODES.filter(n => n.id !== 'g').map((n, i) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="14" fill="#111"
            stroke="rgba(255,59,0,0.45)" strokeWidth="1" />
          <circle cx={n.x} cy={n.y} r="20" fill="none"
            stroke="rgba(255,59,0,0.1)" strokeWidth="1">
            <animate attributeName="r" values="16;22;16" dur="3s"
              begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.15;0;0.15" dur="3s"
              begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Center hub */}
      <circle cx={nodeMap['g'].x} cy={nodeMap['g'].y} r="24" fill="url(#tc-core)" />
      <circle cx={nodeMap['g'].x} cy={nodeMap['g'].y} r="24"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
      <text x={nodeMap['g'].x} y={nodeMap['g'].y + 5} textAnchor="middle"
        fill="white" fontSize="9" fontWeight="700" letterSpacing="0.5"
        style={{ fontFamily: 'monospace' }}>
        CORE
      </text>

      {/* Pulse rings on center */}
      <circle cx={nodeMap['g'].x} cy={nodeMap['g'].y} r="28"
        stroke="#FF3B00" strokeWidth="1" fill="none" strokeOpacity="0.3">
        <animate attributeName="r" values="28;44;28" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Labels */}
      {LABELS.map(l => (
        <text key={l.id} x={l.tx} y={l.ty}
          textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="8.5"
          letterSpacing="0.8" style={{ fontFamily: 'monospace' }}>
          {l.label.toUpperCase()}
        </text>
      ))}
    </svg>
  );
}

/** Platform — abstract grid with highlighted data paths */
function VisualPlatform() {
  const COLS = 7, ROWS = 6;
  const W = 290, H = 220;
  const cellW = W / COLS, cellH = H / ROWS;

  // Highlighted cells forming an "S"-curve path
  const HIGHLIGHT = new Set([
    '0-1','1-1','2-1','2-2','2-3','3-3','4-3','4-4','5-4','6-4',
  ]);

  return (
    <svg viewBox="0 0 320 250" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '340px', height: 'auto', overflow: 'visible' }}
      aria-hidden="true">
      <defs>
        <linearGradient id="pl-hg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF3B00" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF3B00" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Grid cells */}
      {Array.from({ length: COLS }).map((_, col) =>
        Array.from({ length: ROWS }).map((_, row) => {
          const key = `${col}-${row}`;
          const isHl = HIGHLIGHT.has(key);
          const x = 15 + col * cellW;
          const y = 15 + row * cellH;
          return (
            <rect key={key}
              x={x + 1} y={y + 1}
              width={cellW - 2} height={cellH - 2}
              rx="2"
              fill={isHl ? 'rgba(255,59,0,0.15)' : 'rgba(255,255,255,0.03)'}
              stroke={isHl ? 'rgba(255,59,0,0.4)' : 'rgba(255,255,255,0.06)'}
              strokeWidth="1">
              {isHl && (
                <animate attributeName="fill"
                  values="rgba(255,59,0,0.1);rgba(255,59,0,0.22);rgba(255,59,0,0.1)"
                  dur={`${2 + col * 0.3}s`} repeatCount="indefinite" />
              )}
            </rect>
          );
        })
      )}

      {/* Data pulse moving along the path */}
      {Array.from(HIGHLIGHT).map((key, i) => {
        const [col, row] = key.split('-').map(Number);
        const x = 15 + col * cellW + cellW / 2;
        const y = 15 + row * cellH + cellH / 2;
        return (
          <circle key={key} cx={x} cy={y} r="5" fill="#FF3B00" fillOpacity="0">
            <animate attributeName="fill-opacity"
              values="0;0.9;0"
              dur="2.2s"
              begin={`${i * 0.22}s`}
              repeatCount="indefinite" />
          </circle>
        );
      })}

      {/* Corner labels */}
      {[
        { x: 15,  y: 244, t: 'ENTRADA' },
        { x: 305, y: 244, t: 'SALIDA', anchor: 'end' },
      ].map((l) => (
        <text key={l.t} x={l.x} y={l.y}
          textAnchor={(l as {anchor?: string}).anchor ?? 'start'}
          fill="rgba(255,255,255,0.2)" fontSize="8" letterSpacing="1.5"
          style={{ fontFamily: 'monospace' }}>
          {l.t}
        </text>
      ))}

      {/* "Processing" badge */}
      <rect x="106" y="108" width="108" height="26" rx="2"
        fill="rgba(255,59,0,0.08)" stroke="rgba(255,59,0,0.3)" strokeWidth="1" />
      <circle cx="120" cy="121" r="3.5" fill="#FF3B00">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <text x="130" y="125" fill="rgba(255,255,255,0.55)" fontSize="8.5" letterSpacing="0.5"
        style={{ fontFamily: 'monospace' }}>
        PROCESANDO...
      </text>
    </svg>
  );
}

// ── Visual map ─────────────────────────────────────────────────────────────
const VISUALS = {
  servicios:  VisualServicios,
  erp:        VisualERP,
  ecommerce:  VisualEcommerce,
  tech:       VisualTech,
  platform:   VisualPlatform,
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export type PageHeroVariant = keyof typeof VISUALS;

interface PageHeroProps {
  eyebrow:  string;
  title:    ReactNode;
  sub:      string;
  cta?:     { label: string; to: string };
  variant?: PageHeroVariant;
  breadcrumb?: { label: string; to: string };
}

export default function PageHero({
  eyebrow,
  title,
  sub,
  cta,
  variant,
  breadcrumb,
}: PageHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const vizRef  = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  useEffect(() => {
    if (prefersReducedMotion || !wrapRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(wrapRef.current.querySelector('.ph-eyebrow'),
      { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 })
      .fromTo(wrapRef.current.querySelector('.ph-title'),
        { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.3')
      .fromTo(wrapRef.current.querySelector('.ph-sub'),
        { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.45')
      .fromTo(wrapRef.current.querySelector('.ph-cta'),
        { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.35');

    if (vizRef.current) {
      gsap.fromTo(vizRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0, ease: 'power3.out', delay: 0.35 },
      );
    }
  }, [prefersReducedMotion]);

  const Visual = variant ? VISUALS[variant] : null;
  const hasSplit = !!Visual && !isSmallViewport;

  return (
    <section
      style={{
        /* Left half light, right half dark — gradient split aligned to centered container midpoint */
        background: hasSplit
          ? 'linear-gradient(105deg, var(--color-bg) 0%, var(--color-bg) 56%, #101010 56%, #101010 100%)'
          : 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dark-side decorations (right half only) */}
      {hasSplit && (
        <>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, bottom: 0, right: 0, left: '50%',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute',
            width: '480px', height: '480px',
            background: 'radial-gradient(circle, rgba(255,59,0,0.11) 0%, transparent 65%)',
            top: '-60px', right: '5%',
            pointerEvents: 'none',
            animation: 'orb-drift 14s ease-in-out infinite',
          }} />
        </>
      )}

      {/* Light-side subtle texture (no visual only) */}
      {!hasSplit && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse 60% 60% at 85% 50%, black, transparent)',
        }} />
      )}

      <div style={{
        maxWidth: '1200px', marginInline: 'auto',
        paddingInline: 'clamp(20px, 6vw, 80px)',
        position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: hasSplit ? '1fr 1fr' : '1fr',
        gap: 0,
        alignItems: 'center',
      }}>

        {/* ── TEXT — left column, light background ── */}
        <div ref={wrapRef} style={{
          paddingTop: 'clamp(120px, 14vw, 200px)',
          paddingBottom: 'clamp(72px, 9vw, 120px)',
          paddingRight: hasSplit ? 'clamp(24px, 4vw, 56px)' : 0,
          color: 'var(--color-text)',
        }}>
          {breadcrumb && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none' }}>
                Inicio
              </Link>
              <span style={{ color: 'var(--color-border)', fontSize: '10px' }}>/</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--color-text)' }}>
                {breadcrumb.label}
              </span>
            </div>
          )}

          <div className="ph-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF3B00',
              boxShadow: '0 0 8px rgba(255,59,0,0.6)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              {eyebrow}
            </span>
          </div>

          <h1 className="ph-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(38px, 5.5vw, 88px)',
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 0.98,
            color: 'var(--color-text)',
            marginBottom: '28px',
          }}>
            {title}
          </h1>

          <p className="ph-sub" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(15px, 1.5vw, 17px)',
            lineHeight: 1.75,
            color: 'var(--color-muted)',
            fontWeight: 300,
            maxWidth: '500px',
            marginBottom: cta ? '40px' : '0',
          }}>
            {sub}
          </p>

          {cta && (
            <div className="ph-cta">
              <Link to={cta.to} className="btn-primary-accent"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {cta.label} <ArrowRight size={15} strokeWidth={2.2} />
              </Link>
            </div>
          )}
        </div>

        {/* ── ILLUSTRATION — right column, dark background ── */}
        {hasSplit && (
          <div
            ref={vizRef}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              position: 'relative',
              minHeight: '420px',
              paddingBlock: 'clamp(40px, 6vw, 80px)',
              paddingLeft: 'clamp(24px, 4vw, 56px)',
            }}
          >
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,59,0,0.06), transparent)',
              pointerEvents: 'none',
            }} />
            <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <Visual />
            </div>
          </div>
        )}

        {/* ── Mobile illustration strip ── */}
        {Visual && isSmallViewport && (
          <div style={{
            background: 'var(--color-dark)',
            marginInline: 'clamp(-20px, -6vw, -80px)',
            overflow: 'hidden',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            paddingBlock: '32px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,59,0,0.08), transparent)',
              pointerEvents: 'none',
            }} />
            <div style={{ transform: 'scale(0.72)', transformOrigin: 'center center', width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Visual />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
