import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../constants/theme';

const GRADS = [
  ['#3fff8b', '#10b981'], ['#60a5fa', '#3b82f6'], ['#c084fc', '#a855f7'],
  ['#fbbf24', '#d97706'], ['#34d399', '#10b981'], ['#f87171', '#dc2626'],
];

function gradFor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % GRADS.length;
  return GRADS[h];
}

export default function Avatar({ username = '?', uri = null, size = 26 }) {
  const r = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={r} />;
  const letter = (username || '?').charAt(0).toUpperCase();
  return (
    <LinearGradient colors={gradFor(username)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[r, styles.c]}>
      <Text style={[styles.t, { fontSize: size * 0.42 }]}>{letter}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center' },
  t: { color: '#06080b', fontFamily: fonts.extrabold },
});
