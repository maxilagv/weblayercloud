import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SERVICES = [
  { name: 'Identity & Access', latency: '12ms', ok: true },
  { name: 'Catalog',           latency: '8ms',  ok: true },
  { name: 'Orders',            latency: '24ms', ok: true },
  { name: 'Payments',          latency: '18ms', ok: true },
  { name: 'Inventory',         latency: '11ms', ok: true },
  { name: 'Integrations',      latency: '31ms', ok: true },
  { name: 'CRM',               latency: '9ms',  ok: true },
  { name: 'Analytics',         latency: '45ms', ok: false },
  { name: 'Notifications',     latency: '7ms',  ok: true },
  { name: 'Workflow',          latency: '22ms', ok: true },
] as const;

// Sparkline polyline points (viewBox 0 0 180 68)
const SPARKLINE = '0,58 18,42 36,52 54,28 72,38 90,18 108,32 126,22 144,38 162,12 180,28';

export default function HeroVisual({ prefersReducedMotion = false }: { prefersReducedMotion?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current || !rowsRef.current) return;

    // Gentle float
    gsap.to(cardRef.current, {
      y: -14,
      duration: 4.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Staggered row entrance
    const rows = rowsRef.current.querySelectorAll<HTMLElement>('.hv-row');
    gsap.fromTo(
      rows,
      { x: 18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, stagger: 0.055, ease: 'power2.out', delay: 1.1 },
    );

    return () => {
      gsap.killTweensOf(cardRef.current);
      gsap.killTweensOf(rows);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={cardRef}
      style={{
        width: '100%',
        maxWidth: '370px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(8,8,8,0.97)',
        boxShadow:
          '0 48px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,59,0,0.07), inset 0 1px 0 rgba(255,255,255,0.055)',
        overflow: 'hidden',
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {(['#FF5F57', '#FEBC2E', '#28C840'] as const).map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
        ))}
        <span
          style={{
            marginLeft: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
          }}
        >
          MotorCloud · Platform
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.1em',
            color: '#22C55E',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 6px #22C55E',
              animation: 'blink 2s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          live
        </span>
      </div>

      {/* Sparkline chart */}
      <div
        style={{
          padding: '12px 14px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}
          >
            Requests / min
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.06em',
              color: '#FF3B00',
              fontWeight: 500,
            }}
          >
            2.4k
          </span>
        </div>
        <svg
          viewBox="0 0 180 68"
          style={{ width: '100%', height: '42px', display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hv-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3B00" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FF3B00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,68 ${SPARKLINE} 180,68`} fill="url(#hv-grad)" />
          <polyline
            points={SPARKLINE}
            fill="none"
            stroke="#FF3B00"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Last point pulse */}
          <circle cx="180" cy="28" r="2.5" fill="#FF3B00" />
          <circle cx="180" cy="28" r="6" fill="#FF3B00" fillOpacity="0.18" style={{ animation: 'blink 1.8s ease-in-out infinite' }} />
        </svg>
      </div>

      {/* Service rows */}
      <div ref={rowsRef}>
        {SERVICES.map((svc, i) => (
          <div
            key={svc.name}
            className="hv-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 14px',
              gap: '10px',
              borderBottom: i < SERVICES.length - 1 ? '1px solid rgba(255,255,255,0.035)' : 'none',
              cursor: 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
          >
            {/* Status dot */}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: svc.ok ? '#22C55E' : '#F59E0B',
                boxShadow: svc.ok ? '0 0 5px rgba(34,197,94,0.6)' : '0 0 5px rgba(245,158,11,0.6)',
                flexShrink: 0,
                animation: 'blink 2s ease-in-out infinite',
                animationDelay: `${i * 0.28}s`,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                letterSpacing: '0.05em',
                color: svc.ok ? 'rgba(255,255,255,0.62)' : 'rgba(245,158,11,0.88)',
                flexGrow: 1,
              }}
            >
              {svc.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: svc.ok ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              {svc.latency}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          10 microservicios · 99.9% uptime
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.08em',
          }}
        >
          v4.2.1
        </span>
      </div>
    </div>
  );
}
