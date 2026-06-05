import { useContext } from 'react';
import { ThemeContext_ } from '../context/ThemeContext';

export function useTheme() {
  const ctx = useContext(ThemeContext_);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
