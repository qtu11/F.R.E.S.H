'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({ value, max = 100, color = 'bg-[#057A42]', bgColor = 'bg-gray-200 dark:bg-slate-700', height = 'md', showLabel = false, label, animated = true }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heightClasses = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{label}</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`${heightClasses[height]} ${bgColor} rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
