'use client';

import { Clock } from 'lucide-react';
import { useGlobal } from '@/app/providers';

interface ExpiryBarProps {
  hours: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ExpiryBar({ hours, size = 'md', showLabel = true }: ExpiryBarProps) {
  const { t } = useGlobal();
  const pct = Math.min((hours / 24) * 100, 100);
  const isUrgent = hours <= 3;
  const isWarning = hours <= 6 && hours > 3;
  const color = isUrgent ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500';
  const textColor = isUrgent ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400';
  const bgColor = isUrgent ? 'bg-red-100 dark:bg-red-900/30' : isWarning ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30';
  const barHeight = size === 'sm' ? 'h-1' : 'h-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const labelSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className="flex items-center gap-2">
      <Clock className={`${iconSize} ${textColor}`} />
      <div className="flex-1">
        <div className={`w-full ${bgColor} rounded-full ${barHeight} overflow-hidden`}>
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {showLabel && (
        <span className={`${labelSize} font-bold ${textColor} whitespace-nowrap`}>
          {hours <= 1 ? `<1h` : `${hours}h`}
        </span>
      )}
    </div>
  );
}
