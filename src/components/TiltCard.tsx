import React, { type ReactNode, useRef } from 'react';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  key?: React.Key;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { allowPointerEffects } = useAdaptiveExperience();

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!allowPointerEffects) {
      return;
    }

    const card = cardRef.current;
    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) * 2 - 1) * -5.5;
    const rotateY = ((x / rect.width) * 2 - 1) * 5.5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  };

  const handleMouseLeave = () => {
    if (!allowPointerEffects) {
      return;
    }

    const card = cardRef.current;
    if (!card) {
      return;
    }

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: allowPointerEffects ? 'transform 180ms ease-out' : undefined,
      }}
    >
      {children}
    </div>
  );
}
