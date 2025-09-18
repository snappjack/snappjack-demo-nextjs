'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get initial theme from localStorage or default to 'system'
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme;
      }
    }
    return 'system';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Function to apply theme to the document
  const applyTheme = useCallback((themeToApply: Theme) => {
    let newResolvedTheme: 'light' | 'dark';

    if (themeToApply === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      newResolvedTheme = themeToApply;
    }

    setResolvedTheme(newResolvedTheme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);
    console.log(`Theme applied: ${newResolvedTheme}, HTML classes:`, root.classList.toString());
  }, []);

  // Effect to apply theme when `theme` state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, applyTheme]);

  // Effect to listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}