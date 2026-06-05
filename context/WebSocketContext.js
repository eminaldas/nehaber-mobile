import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import wsService from '../services/wsService';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ token, children }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token) {
      wsService.connect(token);
    } else {
      wsService.disconnect();
      setConnected(false);
    }

    const unsubConn = wsService.subscribe('connected',    () => setConnected(true));
    const unsubDisc = wsService.subscribe('disconnected', () => setConnected(false));

    return () => {
      unsubConn();
      unsubDisc();
    };
  }, [token]);

  const value = useMemo(() => ({
    connected,
    subscribe: wsService.subscribe.bind(wsService),
  }), [connected]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
}
