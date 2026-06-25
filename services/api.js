import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { refreshSession, notifyExpired } from './sessionManager';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request: her isteğe token ekle
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('nehaber_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

// Response: 401 → bir kez token yenilemeyi dene, başarılıysa isteği tekrarla.
// Yenileme de başarısızsa oturumu kapat (AuthContext logout'u yönetir).
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const isAuthEndpoint =
      url.includes('/auth/refresh') || url.includes('/auth/login');

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const newToken = await refreshSession();
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original); // aynı isteği yeni token'la tekrarla
      } catch (_) {
        // Yenileme başarısız → token gerçekten ölü
        await SecureStore.deleteItemAsync('nehaber_token').catch(() => {});
        await SecureStore.deleteItemAsync('nehaber_user').catch(() => {});
        notifyExpired();
      }
    } else if (status === 401 && !isAuthEndpoint) {
      // Retry edilmiş ama yine 401 → oturum kapat
      await SecureStore.deleteItemAsync('nehaber_token').catch(() => {});
      await SecureStore.deleteItemAsync('nehaber_user').catch(() => {});
      notifyExpired();
    }

    return Promise.reject(error);
  },
);

export default api;
