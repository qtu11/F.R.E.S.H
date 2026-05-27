'use client';

import { useGlobal } from '@/app/providers';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Mini settings widget for Auth pages (Login, Register, Forgot Password).
 * Positioned at top-right, provides theme and language toggle.
 */
export function AuthSettings() {
  const { theme, setTheme, lang, setLang } = useGlobal();

  return (
    <div className="fixed top-6 right-6 z-[55] flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-full border border-gray-200/60 dark:border-slate-800/60 shadow-lg shadow-black/5 dark:shadow-black/20">
      {/* Language Toggle */}
      <div className="flex items-center bg-gray-100/80 dark:bg-slate-950/80 rounded-full p-0.5 relative">
        <button 
          onClick={() => setLang('vi')}
          className={`relative px-2 py-0.5 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
            lang === 'vi' ? 'text-white' : 'text-gray-400 dark:text-gray-500'
          }`}
          title="Tiếng Việt"
        >
          VI
          <AnimatePresence>
            {lang === 'vi' && (
              <motion.div
                layoutId="authActiveLang"
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`relative px-2 py-0.5 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
            lang === 'en' ? 'text-white' : 'text-gray-400 dark:text-gray-500'
          }`}
          title="English"
        >
          EN
          <AnimatePresence>
            {lang === 'en' && (
              <motion.div
                layoutId="authActiveLang"
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </button>
      </div>
      
      {/* Divider */}
      <div className="w-[1px] h-3.5 bg-gray-300/50 dark:bg-slate-700/50"></div>
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gray-100/80 dark:bg-slate-950/80 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer overflow-hidden"
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
              <Moon className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
