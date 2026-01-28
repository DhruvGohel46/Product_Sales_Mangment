import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('pos_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [currentTheme, setCurrentTheme] = useState(theme === 'dark' ? darkTheme : lightTheme);

  const applyThemeTokensToCSS = (themeObject) => {
    const root = document.documentElement;

    root.style.setProperty('--bg-primary', themeObject.colors.background);
    root.style.setProperty('--bg-secondary', themeObject.colors.surface);
    root.style.setProperty('--surface', themeObject.colors.card || themeObject.colors.surface);

    root.style.setProperty('--text-primary', themeObject.colors.text.primary);
    root.style.setProperty('--text-secondary', themeObject.colors.text.secondary);
    root.style.setProperty('--text-muted', themeObject.colors.text.muted);

    root.style.setProperty('--border-subtle', themeObject.colors.border);
    root.style.setProperty('--accent', themeObject.colors.primary[600]);
    root.style.setProperty('--focus', themeObject.colors.focus);
  };

  useEffect(() => {
    const nextTheme = theme === 'dark' ? darkTheme : lightTheme;
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(nextTheme);
    localStorage.setItem('pos_theme', theme);
    applyThemeTokensToCSS(nextTheme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    currentTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
