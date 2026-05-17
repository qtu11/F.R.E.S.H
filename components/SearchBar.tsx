'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useGlobal } from '@/app/providers';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  suggestions?: string[];
}

export function SearchBar({ value, onChange, placeholder, onClear, suggestions = [] }: SearchBarProps) {
  const { t } = useGlobal();
  const [focused, setFocused] = useState(false);
  const ph = placeholder || t('search_placeholder');

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 bg-gray-50 dark:bg-slate-800 border ${focused ? 'border-[#057A42] dark:border-emerald-500 ring-2 ring-[#057A42]/10 dark:ring-emerald-500/10' : 'border-gray-200 dark:border-slate-700'} rounded-2xl px-4 py-3 transition-all`}>
        <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={ph}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none"
        />
        {value && (
          <button onClick={() => { onChange(''); onClear?.(); }} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && value && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden z-50">
          {suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 5).map((s, i) => (
            <button
              key={i}
              onMouseDown={() => onChange(s)}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
