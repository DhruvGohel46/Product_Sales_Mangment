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
  const [theme, setTheme] = useState('light');
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('pos_theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Apply theme to document and update current theme object
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('pos_theme', theme);
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
