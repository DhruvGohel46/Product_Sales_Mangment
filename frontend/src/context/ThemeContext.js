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

    // Background colors
    root.style.setProperty('--bg-primary', themeObject.colors.background);
    root.style.setProperty('--bg-secondary', themeObject.colors.surface);
    root.style.setProperty('--bg-tertiary', themeObject.colors.card || themeObject.colors.surface);

    // Text colors
    root.style.setProperty('--text-primary', themeObject.colors.text.primary);
    root.style.setProperty('--text-secondary', themeObject.colors.text.secondary);
    root.style.setProperty('--text-muted', themeObject.colors.text.muted);
    root.style.setProperty('--text-inverse', themeObject.colors.text.inverse);

    // Border colors
    root.style.setProperty('--border-primary', themeObject.colors.border);
    root.style.setProperty('--border-secondary', themeObject.colors.border.secondary || themeObject.colors.border);
    root.style.setProperty('--border-tertiary', themeObject.colors.border.tertiary || themeObject.colors.border);

    // Surface colors
    root.style.setProperty('--surface-primary', themeObject.colors.surface);
    root.style.setProperty('--surface-secondary', themeObject.colors.surface.secondary);
    root.style.setProperty('--surface-tertiary', themeObject.colors.surface.tertiary);

    // Brand colors
    root.style.setProperty('--primary-50', themeObject.colors.primary[50]);
    root.style.setProperty('--primary-100', themeObject.colors.primary[100]);
    root.style.setProperty('--primary-500', themeObject.colors.primary[500]);
    root.style.setProperty('--primary-600', themeObject.colors.primary[600]);
    root.style.setProperty('--primary-700', themeObject.colors.primary[700]);

    // Semantic colors
    root.style.setProperty('--success-50', themeObject.colors.success[50]);
    root.style.setProperty('--success-500', themeObject.colors.success[500]);
    root.style.setProperty('--success-600', themeObject.colors.success[600]);
    
    root.style.setProperty('--warning-50', themeObject.colors.warning[50]);
    root.style.setProperty('--warning-500', themeObject.colors.warning[500]);
    root.style.setProperty('--warning-600', themeObject.colors.warning[600]);
    
    root.style.setProperty('--error-50', themeObject.colors.error[50]);
    root.style.setProperty('--error-500', themeObject.colors.error[500]);
    root.style.setProperty('--error-600', themeObject.colors.error[600]);
    
    root.style.setProperty('--info-50', themeObject.colors.info[50]);
    root.style.setProperty('--info-500', themeObject.colors.info[500]);
    root.style.setProperty('--info-600', themeObject.colors.info[600]);

    // Category colors
    root.style.setProperty('--category-cold', themeObject.colors.category.COLD);
    root.style.setProperty('--category-paan', themeObject.colors.category.PAN);
    root.style.setProperty('--category-snack', themeObject.colors.category.SNACK);
    root.style.setProperty('--category-food', themeObject.colors.category.FOOD);
    root.style.setProperty('--category-other', themeObject.colors.category.OTHER);

    // Focus and accent
    root.style.setProperty('--focus', themeObject.colors.focus);
    root.style.setProperty('--accent', themeObject.colors.primary[500]);
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
