import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../hooks/useTheme';

export default function Layout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 300, contentStyle: { backgroundColor: colors.bg.base } }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      {/* Yeni gönderi: alttan açılan kompozisyon modalı */}
      <Stack.Screen name="yeni" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
