import { useEffect, useRef } from 'react';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

export default function MouseBlob() {
  const blobRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const { allowPointerEffects } = useAdaptiveExperience();

  useEffect(() => {
    if (!allowPointerEffects) {
      return;
    }

    const blob = blobRef.current;
    if (!blob) {
      return;
    }

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;
      blob.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX - blob.clientWidth / 2;
      targetRef.current.y = event.clientY - blob.clientHeight / 2;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [allowPointerEffects]);

  if (!allowPointerEffects) {
    return null;
  }

  return (
    <div
      ref={blobRef}
      className="pointer-events-none fixed top-0 left-0 z-0 mix-blend-screen"
      style={{
        width: '360px',
        height: '360px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        willChange: 'transform',
        opacity: 0.9,
        background:
          'radial-gradient(circle, rgba(0,212,255,0.08) 0%, rgba(0,255,136,0.035) 55%, transparent 76%)',
        transform: 'translate3d(-200px, -200px, 0)',
      }}
    />
  );
}
