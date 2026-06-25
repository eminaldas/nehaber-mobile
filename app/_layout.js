import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold,
  Manrope_700Bold, Manrope_800ExtraBold, useFonts,
} from '@expo-google-fonts/manrope';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedSplash from '../components/ui/AnimatedSplash';
import RewardWatcher from '../components/profile/RewardWatcher';
import { AnalysisNotifierProvider } from '../context/AnalysisNotifierContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useAuth } from '../hooks/useAuth';

// Native splash'ı (yeşil) JS hazır olana kadar açık tut.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   60_000,
      gcTime:      300_000,
      retry:       2,
      networkMode: 'offlineFirst',
    },
  },
});

function WsWrapper({ children }) {
  const { token } = useAuth();
  return <WebSocketProvider token={token}>{children}</WebSocketProvider>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold,
    Manrope_700Bold, Manrope_800ExtraBold, Pacifico_400Regular,
  });
  const [splashDone, setSplashDone] = useState(false);

  // Fontlar gelince native (yeşil) splash'ı kapat — altında aynı yeşil JS katmanı var, kesintisiz.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // native yeşil splash görünmeye devam eder

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <AnalysisNotifierProvider>
                <WsWrapper>
                  <StatusBar style="auto" />
                  <Stack screenOptions={{ headerShown: false }} />
                  <RewardWatcher />
                </WsWrapper>
              </AnalysisNotifierProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </GestureHandlerRootView>
  );
}
