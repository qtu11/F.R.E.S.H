'use client';

import { useGlobal } from '@/app/providers';
import { Moon, Sun } from 'lucide-react';

export function GlobalSettings() {
  const { theme, setTheme, lang, setLang } = useGlobal();

  return (
    <div className="fixed top-16 md:top-4 right-4 z-[55] flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-gray-200 dark:border-slate-800 shadow-lg">
      <button 
        onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        title="Toggle Language"
      >
        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{lang === 'vi' ? 'VN' : 'US'}</span>
      </button>
      
      <div className="w-[1px] h-4 bg-gray-300 dark:bg-slate-700"></div>
      
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-800 dark:text-gray-200"
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
    </div>
  );
}
