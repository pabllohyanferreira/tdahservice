import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { darkColors, lightColors, purpleTheme, ThemeColors } from '../theme/colors';
import Storage from '../utils/storage';

export type ThemeType = 'dark' | 'light' | 'purple';

interface ThemeContextData {
  theme: ThemeColors;
  themeType: ThemeType;
  toggleTheme: () => void;
  setTheme: (themeType: ThemeType) => void;
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
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'purple') {
        setThemeType(storedTheme);
        setTheme(
          storedTheme === 'dark' ? darkColors : 
          storedTheme === 'light' ? lightColors : 
          purpleTheme
        );
      }
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newType = themeType === 'dark' ? 'light' : themeType === 'light' ? 'purple' : 'dark';
    setThemeType(newType);
    setTheme(
      newType === 'dark' ? darkColors : 
      newType === 'light' ? lightColors : 
      purpleTheme
    );
    await Storage.setItem('@TDAHService:theme', newType);
  }, [themeType]);

  const setThemeDirectly = useCallback(async (newThemeType: ThemeType) => {
    setThemeType(newThemeType);
    setTheme(
      newThemeType === 'dark' ? darkColors : 
      newThemeType === 'light' ? lightColors : 
      purpleTheme
    );
    await Storage.setItem('@TDAHService:theme', newThemeType);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme, setTheme: setThemeDirectly }}>
      {children}
    </ThemeContext.Provider>
  );
}; 