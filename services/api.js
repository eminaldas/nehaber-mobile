import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../constants/config';

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

// Response: 401 → token sil (AuthContext logout yönetir)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('nehaber_token').catch(() => {});
      await SecureStore.deleteItemAsync('nehaber_user').catch(() => {});
    }
    return Promise.reject(error);
  },
);

export default api;
