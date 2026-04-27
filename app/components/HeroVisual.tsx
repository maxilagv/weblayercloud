import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// ── Business automation hub ───────────────────────────────────────────────
// Center platform node + 6 business-function satellites
// SVG animateMotion drives data-flow dots along each connection line

const CX = 180, CY = 185; // hub center
const R  = 118;            // orbit radius

// Hexagonal layout — starting at top (−90°), clockwise
const NODES = [
  { label: 'Ventas',     nx: 180, ny: 67,  lx: 180, ly: 37,  anchor: 'middle', begin: '0s'     },
  { label: 'Pedidos',    nx: 282, ny: 126, lx: 310, ly: 122, anchor: 'start',  begin: '0.37s'  },
  { label: 'Pagos',      nx: 282, ny: 244, lx: 310, ly: 248, anchor: 'start',  begin: '0.74s'  },
  { label: 'Clientes',   nx: 180, ny: 303, lx: 180, ly: 332, anchor: 'middle', begin: '1.11s'  },
  { label: 'Inventario', nx: 78,  ny: 244, lx: 50,  ly: 248, anchor: 'end',    begin: '1.48s'  },
  { label: 'Reportes',   nx: 78,  ny: 126, lx: 50,  ly: 122, anchor: 'end',    begin: '1.85s'  },
] as const;

const DUR = '2.4s'; // dot travel time

export default function HeroVisual({ prefersReducedMotion = false }: { prefersReducedMotion?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !wrapRef.current) return;
    // Gentle vertical float for the whole diagram
    gsap.to(wrapRef.current, {
      y: -14, duration: 4.8,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
    return () => { gsap.killTweensOf(wrapRef.current); };
  }, [prefersReducedMotion]);

  return (
    <div ref={wrapRef} style={{ width: '100%', maxWidth: '360px', position: 'relative' }}>
      <svg
        viewBox="0 0 360 370"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          {/* Motion paths — one per node */}
          {NODES.map((n, i) => (
            <path
              key={`mp${i}`}
              id={`mp${i}`}
              d={`M ${n.nx} ${n.ny} L ${CX} ${CY}`}
            />
          ))}
          {/* Hub glow */}
          <radialGradient id="hglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FF3B00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF3B00" stopOpacity="0"    />
          </radialGradient>
          {/* Hub fill */}
          <radialGradient id="hfill" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#FF5520" />
            <stop offset="100%" stopColor="#CC2E00" />
          </radialGradient>
          {/* Node fill */}
          <radialGradient id="nfill" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#1A1A1A" />
            <stop offset="100%" stopColor="#0D0D0D" />
          </radialGradient>
        </defs>

        {/* ── Ambient glow ── */}
        <circle cx={CX} cy={CY} r="110" fill="url(#hglow)">
          <animate attributeName="r"       values="95;115;95"  dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* ── Orbit ring (dashed, rotating) ── */}
        <circle
          cx={CX} cy={CY} r="118"
          stroke="rgba(255,59,0,0.14)"
          strokeWidth="1"
          strokeDasharray="4 8"
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`0 ${CX} ${CY};360 ${CX} ${CY}`}
            dur="28s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ── Connection lines ── */}
        {NODES.map((n, i) => (
          <line
            key={`ln${i}`}
            x1={n.nx} y1={n.ny} x2={CX} y2={CY}
            stroke="rgba(255,59,0,0.18)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {/* ── Node outer pulse rings ── */}
        {NODES.map((n, i) => (
          <circle
            key={`pr${i}`}
            cx={n.nx} cy={n.ny} r="20"
            stroke="#FF3B00"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            fill="none"
          >
            <animate
              attributeName="r"
              values="20;27;20"
              dur="3.6s"
              begin={`${i * 0.6}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values="0.2;0;0.2"
              dur="3.6s"
              begin={`${i * 0.6}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Node circles ── */}
        {NODES.map((n, i) => (
          <g key={`nd${i}`}>
            <circle
              cx={n.nx} cy={n.ny} r="16"
              fill="url(#nfill)"
              stroke="rgba(255,59,0,0.5)"
              strokeWidth="1"
            />
            {/* 2-letter label inside node */}
            <text
              x={n.nx} y={n.ny + 4}
              textAnchor="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.5"
              style={{ fontFamily: 'var(--font-mono, monospace)' }}
            >
              {n.label.slice(0, 2).toUpperCase()}
            </text>
          </g>
        ))}

        {/* ── Flow dots (animateMotion along each path) ── */}
        {NODES.map((_, i) => (
          <circle key={`fd${i}`} r="3" fill="#FF3B00">
            <animateMotion
              dur={DUR}
              begin={NODES[i].begin}
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.3 0 0.7 1"
            >
              <mpath href={`#mp${i}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.95;0.95;0"
              keyTimes="0;0.08;0.82;1"
              dur={DUR}
              begin={NODES[i].begin}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Hub outer ring ── */}
        <circle
          cx={CX} cy={CY} r="50"
          stroke="rgba(255,59,0,0.3)"
          strokeWidth="1"
          fill="none"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.2;0.5;0.2"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ── Hub fill ── */}
        <circle cx={CX} cy={CY} r="42" fill="url(#hfill)" />
        <circle cx={CX} cy={CY} r="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />

        {/* ── Hub text ── */}
        <text
          x={CX} y={CY - 5}
          textAnchor="middle"
          fill="white"
          fontSize="15"
          fontWeight="800"
          letterSpacing="-0.5"
          style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
        >
          Layer
        </text>
        <text
          x={CX} y={CY + 11}
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="13"
          fontWeight="400"
          fontStyle="italic"
          style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}
        >
          Cloud
        </text>
        <text
          x={CX} y={CY + 25}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="6"
          letterSpacing="2"
          style={{ fontFamily: 'var(--font-mono, monospace)' }}
        >
          PLATFORM
        </text>

        {/* ── Node outer labels ── */}
        {NODES.map((n, i) => (
          <text
            key={`lbl${i}`}
            x={n.lx} y={n.ly}
            textAnchor={n.anchor}
            fill="rgba(255,255,255,0.42)"
            fontSize="9"
            letterSpacing="1.2"
            style={{ fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase' }}
          >
            {n.label.toUpperCase()}
          </text>
        ))}

        {/* ── Live indicator ── */}
        <circle cx="330" cy="26" r="4" fill="#22C55E">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text
          x="320" y="30"
          textAnchor="end"
          fill="rgba(34,197,94,0.7)"
          fontSize="8"
          letterSpacing="1"
          style={{ fontFamily: 'var(--font-mono, monospace)' }}
        >
          LIVE
        </text>
      </svg>
    </div>
  );
}
