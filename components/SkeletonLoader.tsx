'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, useSafeReducedMotion } from '@/lib/animation';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'avatar' | 'text' | 'image';
  count?: number;
  className?: string;
}

function Shimmer({ className }: { className?: string }) {
  const reduced = useSafeReducedMotion();
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-slate-700 rounded-lg ${className || ''}`}
      initial={reduced ? {} : { backgroundPosition: '200% 0' }}
      animate={reduced ? {} : { backgroundPosition: '-200% 0' }}
      transition={reduced ? {} : { duration: 1.5, repeat: Infinity, ease: 'linear' }}
      style={reduced ? {} : {
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const content = Array.from({ length: count }, (_, i) => {
    switch (type) {
      case 'card':
        return <Shimmer key={i} className={`h-48 rounded-2xl ${className}`} />;
      case 'list':
        return (
          <motion.div key={i} className="flex items-center gap-4 p-4">
            <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          </motion.div>
        );
      case 'table':
        return (
          <motion.div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-slate-700">
            <Shimmer className="h-4 flex-1" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-8 w-20 rounded-lg" />
          </motion.div>
        );
      case 'avatar':
        return <Shimmer key={i} className={`w-10 h-10 rounded-full ${className}`} />;
      case 'text':
        return <Shimmer key={i} className={`h-4 w-full ${className}`} />;
      case 'image':
        return <Shimmer key={i} className={`w-full h-48 rounded-2xl ${className}`} />;
      default:
        return <Shimmer key={i} className={`h-4 w-full ${className}`} />;
    }
  });

  if (count > 1) {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {content.map((el, i) => (
          <motion.div key={i} variants={staggerItem}>
            {el}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return <>{content}</>;
}
