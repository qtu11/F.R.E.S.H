'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Language, TranslationKey, getTranslation } from '@/utils/i18n';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ToastContainer } from '@/components/Toast';

type Theme = 'light' | 'dark';

interface GlobalState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [lang, setLangState] = useState<Language>('vi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('fresh_theme') as Theme;
    const savedLang = localStorage.getItem('fresh_lang') as Language;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
    
    if (savedLang) {
      setLangState(savedLang);
    }
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('fresh_theme', theme);
  }, [theme, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('fresh_lang', l);
  };

  const t = useMemo(() => (key: TranslationKey) => getTranslation(lang, key), [lang]);

  return (
    <GlobalContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      <AuthProvider>
        <div className={mounted ? '' : 'invisible'}>
          {children}
        </div>
        <ToastContainer />
      </AuthProvider>
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within Providers');
  return context;
}
