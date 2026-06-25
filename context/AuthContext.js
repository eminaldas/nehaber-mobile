import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getTokenExpMs } from '../lib/jwt';
import { getMe } from '../services/authService';
import { refreshSession, setSessionHandlers } from '../services/sessionManager';

const TOKEN_KEY = 'nehaber_token';
const USER_KEY  = 'nehaber_user';
const SKEW_MS   = 5 * 60 * 1000; // token bitiminden 5 dk önce yenile

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(null);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const tokenRef = useRef(null);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // Oturumun gerçekten öldüğü durum: state'i temizle + login'e düşür.
  const handleExpire = useCallback(() => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    setToken(null);
    setUser(null);
    setSessionExpired(true);
  }, []);

  // sessionManager köprüsü: interceptor/refresh sonuçlarını state'e yansıt.
  useEffect(() => {
    setSessionHandlers({
      onToken: (t) => setToken(t),       // yenilenen token'ı state'e al (SecureStore zaten yazıldı)
      onExpire: handleExpire,
    });
  }, [handleExpire]);

  // İlk açılış: SecureStore'dan token+user yükle
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

  // Tam kullanıcıyı hidrate et (is_email_verified vb.) — gate kararları buna dayanır.
  // E-posta girişinde sadece { email } saklandığından doğrulama durumunu buradan tazeliyoruz.
  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled || !me) return;
        setUser(me);
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(me)).catch(() => {});
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  // Proaktif yenileme: token bitiminden ~5 dk önce arka planda yenile.
  useEffect(() => {
    if (!token) return undefined;
    const expMs = getTokenExpMs(token);
    if (!expMs) return undefined;
    const fireIn = Math.max(0, expMs - Date.now() - SKEW_MS);
    const id = setTimeout(() => { refreshSession().catch(() => {}); }, fireIn);
    return () => clearTimeout(id);
  }, [token]);

  // Uygulama öne geldiğinde: süresi dolduysa düş, dolmak üzereyse yenile.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const t = tokenRef.current;
      if (!t) return;
      const expMs = getTokenExpMs(t);
      if (!expMs) return;
      if (expMs <= Date.now()) { handleExpire(); return; }
      if (expMs - Date.now() < SKEW_MS) refreshSession().catch(() => {});
    });
    return () => sub.remove();
  }, [handleExpire]);

  const login = useCallback(async (accessToken, userData) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
    ]);
    setSessionExpired(false);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setSessionExpired(false);
    setToken(null);
    setUser(null);
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      if (me) {
        setUser(me);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(me)).catch(() => {});
      }
      return me;
    } catch (_) {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, isAuth: !!token, sessionExpired, login, logout, clearSessionExpired, refreshUser }),
    [token, user, loading, sessionExpired, login, logout, clearSessionExpired, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthContext_ = AuthContext;
