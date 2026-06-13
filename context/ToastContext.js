import React, { createContext, useCallback, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback((cfg) => {
    setToast({ ...cfg, key: Date.now() });
  }, []);

  const api = useMemo(() => ({
    show,
    hide,
    error:   (message, opts = {}) => show({ type: 'error',   message, ...opts }),
    success: (message, opts = {}) => show({ type: 'success', message, ...opts }),
    info:    (message, opts = {}) => show({ type: 'info',    message, ...opts }),
  }), [show, hide]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast toast={toast} onHide={hide} />
    </ToastContext.Provider>
  );
}

export const ToastContext_ = ToastContext;
