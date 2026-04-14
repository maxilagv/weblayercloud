import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useAdaptiveExperience } from '../hooks/useAdaptiveExperience';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const { prefersReducedMotion, isSmallViewport } = useAdaptiveExperience();

  if (prefersReducedMotion || isSmallViewport) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
