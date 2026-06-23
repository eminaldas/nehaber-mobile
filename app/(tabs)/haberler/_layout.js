import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom', animationDuration: 260 }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      {/* Kategori seçimi: modal gibi alttan girer ve alttan çıkar */}
      <Stack.Screen name="kategoriler" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
