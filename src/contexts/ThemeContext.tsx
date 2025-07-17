import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import Storage from '../utils/storage';

export type ThemeType = 'dark' | 'light';

interface ThemeContextData {
  theme: ThemeColors;
  themeType: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('dark');
  const [theme, setTheme] = useState<ThemeColors>(darkColors);

  useEffect(() => {
    (async () => {
      const storedTheme = await Storage.getItem('@TDAHService:theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeType(storedTheme);
        setTheme(storedTheme === 'dark' ? darkColors : lightColors);
      }
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newType = themeType === 'dark' ? 'light' : 'dark';
    setThemeType(newType);
    setTheme(newType === 'dark' ? darkColors : lightColors);
    await Storage.setItem('@TDAHService:theme', newType);
  }, [themeType]);

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 