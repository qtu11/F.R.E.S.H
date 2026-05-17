'use client';

import { motion } from 'framer-motion';
import { pageTransition, useSafeReducedMotion } from '@/lib/animation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useSafeReducedMotion();

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="enter"
      exit="exit"
      transition={reduced ? { duration: 0.1 } : undefined}
    >
      {children}
    </motion.div>
  );
}
