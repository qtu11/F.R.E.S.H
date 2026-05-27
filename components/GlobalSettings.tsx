'use client';

import { useGlobal } from '@/app/providers';
import { Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalSettings() {
  const { theme, setTheme, lang, setLang } = useGlobal();
  const pathname = usePathname();

  // Hide on the homepage (landing page already has its own controls)
  // and on all auth pages (login, register, forgot-password)
  if (pathname === '/' || pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
    return null;
  }

  return (
    <div className="fixed top-16 md:top-4 right-4 z-[55] flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-full border border-gray-200/80 dark:border-slate-800/80 shadow-xl shadow-black/5 dark:shadow-black/30">
      {/* Language Toggle: Sliding Pill (VI / EN) */}
      <div className="flex items-center bg-gray-100 dark:bg-slate-950/80 rounded-full p-0.5 relative">
        <button 
          onClick={() => setLang('vi')}
          className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
            lang === 'vi' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
          title="Tiếng Việt"
        >
          VI
          <AnimatePresence>
            {lang === 'vi' && (
              <motion.div
                layoutId="gsActiveLang"
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
            lang === 'en' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
          title="English"
        >
          EN
          <AnimatePresence>
            {lang === 'en' && (
              <motion.div
                layoutId="gsActiveLang"
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </button>
      </div>
      
      {/* Divider */}
      <div className="w-[1px] h-4 bg-gray-300/60 dark:bg-slate-700/60"></div>
      
      {/* Theme Toggle: Animated Sun/Moon */}
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-950/80 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer overflow-hidden"
        title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
