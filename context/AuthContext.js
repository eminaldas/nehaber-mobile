import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'nehaber_token';
const USER_KEY  = 'nehaber_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch (_) {
        // SecureStore okunamazsa temiz başla
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (accessToken, userData) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
    ]);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, isAuth: !!token, login, logout }),
    [token, user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthContext_ = AuthContext;
