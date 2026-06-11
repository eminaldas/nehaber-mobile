import Constants from 'expo-constants';

const API_PORT = 8000;

// Metro/Expo host'undan PC'nin LAN IP'sini türet — fiziksel cihazda IP değişse bile
// otomatik doğru adresi verir, .env'i elle güncellemeye gerek kalmaz.
function hostFromExpo() {
  const h =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.developer?.host ||
    Constants.manifest?.debuggerHost ||
    '';
  const ip = h.split(':')[0];
  return ip || null;
}

const host = hostFromExpo();

// Öncelik: açıkça verilen EXPO_PUBLIC_* (emulator/özel) > Metro host > emulator fallback
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (host ? `http://${host}:${API_PORT}` : 'http://10.0.2.2:8000');

export const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  (host ? `ws://${host}:${API_PORT}/api/v1/ws` : 'ws://10.0.2.2:8000/api/v1/ws');
