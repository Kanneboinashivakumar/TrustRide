import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Theme } from '@/types/common';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('trustride-theme');
    return (stored as Theme) || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('trustride-theme', newTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme() {
      let resolved: 'light' | 'dark' = 'light';
      if (theme === 'dark') {
        resolved = 'dark';
      } else if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', resolved);
      setResolvedTheme(resolved);
    }

    applyTheme();

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
