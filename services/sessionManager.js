import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const TOKEN_KEY = 'nehaber_token';

// AuthContext bu handler'ları kaydeder; interceptor & zamanlayıcı buradan haberleşir.
let handlers = { onToken: null, onExpire: null };
let inflight = null; // eşzamanlı refresh'leri tek promise'te birleştir

export function setSessionHandlers(h) {
  handlers = { ...handlers, ...h };
}

async function readToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

/**
 * Mevcut geçerli token ile yeni token alır.
 * - Ham axios kullanır: api.js interceptor'ına girmez (401→refresh→401 döngüsü olmaz).
 * - Tek uçuş: aynı anda çağrılırsa aynı promise döner.
 * Başarılıysa yeni token'ı SecureStore'a yazar ve onToken'ı tetikler.
 */
export function refreshSession() {
  if (inflight) return inflight;
  inflight = (async () => {
    const current = await readToken();
    if (!current) throw new Error('no-token');
    const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${current}` },
      timeout: 15000,
    });
    const newToken = data?.access_token;
    if (!newToken) throw new Error('no-token-in-response');
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } catch (_) {}
    handlers.onToken?.(newToken, data.expires_in);
    return newToken;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function notifyExpired() {
  handlers.onExpire?.();
}
