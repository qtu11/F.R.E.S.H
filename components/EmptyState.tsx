'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, iconColor = 'text-gray-300 dark:text-slate-600' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className={`w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4 ${iconColor}`}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="bg-[#057A42] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#046034] transition-colors">
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
