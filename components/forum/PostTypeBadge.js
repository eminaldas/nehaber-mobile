import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { POST_TYPE_MAP } from '../../constants/forum';
import { alpha, fonts } from '../../constants/theme';

export default function PostTypeBadge({ type }) {
  const t = POST_TYPE_MAP[type] || POST_TYPE_MAP.iddia;
  return (
    <View style={[styles.b, { backgroundColor: alpha(t.color, 0.13) }]}>
      <Text style={[styles.t, { color: t.color }]}>{t.label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  t: { fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.3 },
});
