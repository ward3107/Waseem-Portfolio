import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { safeSetItem } from '@/lib/safeStorage';

const darkTheme = { theme: 'dark' as const };
const ThemeContext = createContext(darkTheme);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    safeSetItem('vibe_theme', 'dark');
  }, []);
  return <ThemeContext.Provider value={darkTheme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
