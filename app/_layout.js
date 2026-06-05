import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useAuth } from '../hooks/useAuth';

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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <WsWrapper>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }} />
            </WsWrapper>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
