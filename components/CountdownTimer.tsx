'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useGlobal } from '@/app/providers';

interface CountdownTimerProps {
  targetDate: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  expiredText?: string;
}

export function CountdownTimer({ targetDate, size = 'md', showLabel = true, expiredText }: CountdownTimerProps) {
  const { t } = useGlobal();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const expiredLabel = expiredText || t('expired');

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(expiredLabel);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };

  if (isExpired) {
    return (
      <span className={`${sizeClasses[size]} bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-full flex items-center gap-1 w-fit`}>
        <Clock className={iconSizes[size]} />
        {timeLeft}
      </span>
    );
  }

  const isUrgent = timeLeft.includes('m') && parseInt(timeLeft, 10) < 30;

  return (
    <span className={`${sizeClasses[size]} ${isUrgent ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 animate-pulse' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'} font-bold rounded-full flex items-center gap-1 w-fit`}>
      <Clock className={iconSizes[size]} />
      {showLabel && t('ends_in') + ' '}
      {timeLeft}
    </span>
  );
}
