'use client';

import { motion } from 'framer-motion';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', children, dot = false, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 font-bold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-emerald-500' : variant === 'warning' ? 'bg-yellow-500' : variant === 'error' ? 'bg-red-500' : variant === 'info' ? 'bg-blue-500' : 'bg-gray-500'} ${variant === 'success' ? 'animate-pulse' : ''}`} />}
      {children}
    </motion.span>
  );
}
