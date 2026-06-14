import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="yeni" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
