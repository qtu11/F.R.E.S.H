'use client';

interface ImagePlaceholderProps {
  emoji?: string;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ImagePlaceholder({ emoji, gradient = 'from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800', size = 'md', className = '' }: ImagePlaceholderProps) {
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
    xl: 'w-48 h-48 text-6xl',
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center ${className}`}>
      {emoji && <span>{emoji}</span>}
    </div>
  );
}
