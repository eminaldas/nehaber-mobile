import { useContext } from 'react';
import { ToastContext_ } from '../context/ToastContext';

export function useToast() {
  const ctx = useContext(ToastContext_);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
