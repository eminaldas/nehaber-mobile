import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = system, 'dark' | 'light' = manual

  const isDark = override ? override === 'dark' : systemScheme === 'dark';
  const colors = isDark ? dark : light;

  const toggleTheme = useCallback(() => {
    setOverride(prev => {
      if (prev === null) return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const value = useMemo(() => ({ isDark, colors, toggleTheme }), [isDark, colors, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const ThemeContext_ = ThemeContext;
