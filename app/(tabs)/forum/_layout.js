import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      {/* Yeni gönderi: alttan açılan kompozisyon modalı */}
      <Stack.Screen name="yeni" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
