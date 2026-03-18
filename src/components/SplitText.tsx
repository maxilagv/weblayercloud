import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function SplitText({ text, className = '', delay = 0 }: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll('.word');
    
    gsap.fromTo(
      words,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power4.out',
        delay: delay,
      }
    );
  }, [delay, text]);

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={`inline-block overflow-hidden ${className}`}>
      {words.map((word, index) => (
        <span key={index} className="word inline-block mr-[0.25em] pb-1">
          {word}
        </span>
      ))}
    </div>
  );
}
