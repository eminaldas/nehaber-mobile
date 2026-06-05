import { useContext } from 'react';
import { AuthContext_ } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext_);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
