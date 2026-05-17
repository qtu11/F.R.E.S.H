'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export function RatingStars({ rating, maxRating = 5, size = 'md', interactive = false, onChange, showValue = false }: RatingStarsProps) {
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${filled ? 'fill-yellow-400 text-yellow-400' : half ? 'fill-yellow-400/50 text-yellow-400' : 'fill-gray-200 dark:fill-slate-700 text-gray-200 dark:text-slate-700'}`}
            />
          </button>
        );
      })}
      {showValue && <span className="ml-1 text-xs font-bold text-gray-600 dark:text-slate-400">{rating.toFixed(1)}</span>}
    </div>
  );
}
