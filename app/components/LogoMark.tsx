interface LogoMarkProps {
  size?: number;
  variant?: 'full' | 'icon' | 'mono';
  theme?: 'light' | 'dark';
  className?: string;
}

function LayerSVG({ size = 64, theme = 'light' }: { size: number; theme: 'light' | 'dark' }) {
  const ink = theme === 'dark' ? '#FFFFFF' : '#0A0A0A';
  const dim = theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(10,10,10,0.18)';
  const mid = theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,10,0.45)';

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 44 L32 52 L56 44 L32 36 Z" fill={dim} />
      <path d="M8 44 L32 52 L56 44 L32 36 Z" fill="none" stroke={mid} strokeWidth="1" />
      <path d="M8 34 L32 42 L56 34 L32 26 Z" fill={mid} />
      <path d="M8 34 L32 42 L56 34 L32 26 Z" fill="none" stroke={ink} strokeWidth="1" opacity="0.7" />
      <path d="M8 24 L32 32 L56 24 L32 16 Z" fill={ink} opacity="0.85" />
      <path d="M8 24 L32 32 L56 24 L32 16 Z" fill="none" stroke={ink} strokeWidth="1.5" />
      <line x1="8" y1="24" x2="8" y2="44" stroke={ink} strokeWidth="1" opacity="0.2" />
      <line x1="56" y1="24" x2="56" y2="44" stroke={ink} strokeWidth="1" opacity="0.2" />
      <line x1="32" y1="32" x2="32" y2="52" stroke={ink} strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

export default function LogoMark({
  size = 64,
  variant = 'full',
  theme = 'light',
  className = '',
}: LogoMarkProps) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0A0A0A';

  if (variant === 'icon') {
    return (
      <div className={className}>
        <LayerSVG size={size} theme={theme} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ gap: '10px' }}>
      <LayerSVG size={size} theme={theme} />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: `${size * 0.64}px`,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: textColor,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        Motor<span style={{ fontStyle: 'italic' }}>Cloud</span>
      </span>
    </div>
  );
}
