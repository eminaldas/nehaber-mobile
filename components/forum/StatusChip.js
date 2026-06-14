import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATUS_MAP } from '../../constants/forum';
import { alpha, fonts } from '../../constants/theme';

export default function StatusChip({ status }) {
  const s = STATUS_MAP[status];
  if (!s || status === 'active') return null;
  return (
    <View style={[styles.b, { borderColor: alpha(s.color, 0.5) }]}>
      <Text style={[styles.t, { color: s.color }]}>{s.label.toUpperCase()}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3, borderWidth: 1 },
  t: { fontSize: 9, fontFamily: fonts.bold, letterSpacing: 0.4 },
});
