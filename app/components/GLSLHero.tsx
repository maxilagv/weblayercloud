import type { ReactNode } from 'react';
import { GLSLHills } from './ui/glsl-hills';

interface GLSLHeroProps {
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  description: ReactNode;
  trackSection?: string;
}

export default function GLSLHero({
  eyebrow,
  title,
  accent,
  description,
  trackSection,
}: GLSLHeroProps) {
  return (
    <section
      data-track-section={trackSection}
      className="relative flex h-screen min-h-[680px] w-full flex-col items-center justify-center overflow-hidden bg-[#050505] text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,59,0,0.16),transparent_34%),linear-gradient(to_bottom,rgba(5,5,5,0.12),#050505_92%)]" />
      <GLSLHills />
      <div className="pointer-events-none absolute z-10 max-w-[980px] space-y-6 px-6 text-center">
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#ff6a3a]">
            {eyebrow}
          </p>
        )}
        <h1 className="whitespace-pre-wrap font-sans text-[clamp(48px,7vw,88px)] font-semibold leading-[0.98] tracking-normal">
          {accent && (
            <>
              <span className="font-serif text-[clamp(34px,5vw,68px)] font-thin italic text-white/70">
                {accent}
              </span>
              <br />
            </>
          )}
          {title}
        </h1>
        <p className="mx-auto max-w-[620px] text-sm leading-7 text-white/60 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
