import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { alpha } from '../../constants/theme';

// article.ai_verdict 'FAKE' | 'AUTHENTIC'; confidence 0..1
export default function AIChip({ verdict, confidence }) {
  if (!verdict) return null;
  const fake = String(verdict).toUpperCase() === 'FAKE';
  const color = fake ? '#f87171' : '#34d399';
  const pct = confidence != null ? Math.round(confidence * 100) : null;
  return (
    <View style={[styles.b, { backgroundColor: alpha(color, 0.1) }]}>
      <Icon name={fake ? 'shield-alert' : 'shield-check'} size={13} color={color} />
      <Text style={[styles.t, { color }]}>
        AI{pct != null ? `: %${pct}` : ''} {fake ? 'yanıltıcı olabilir' : 'güvenilir'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  t: { fontSize: 10, fontWeight: '700' },
});
