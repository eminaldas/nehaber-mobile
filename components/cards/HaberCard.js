import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRiskColor, palette, radius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

function RiskBar({ score }) {
  const color = getRiskColor(score ?? 0);
  const pct   = Math.round((score ?? 0) * 100);
  return (
    <View style={styles.riskTrack}>
      <View style={[styles.riskFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function HaberCard({ item, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: palette.brand.accent }]}>
          <Text style={{ fontSize: 32 }}>📰</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={[styles.source, { color: palette.brand.primary }]} numberOfLines={1}>
            {item.source_name ?? 'Bilinmeyen Kaynak'}
          </Text>
          <Text style={[styles.time, { color: colors.text.muted }]}>
            {item.pub_date ? new Date(item.pub_date).toLocaleDateString('tr-TR') : ''}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>
          {item.title}
        </Text>

        {item.nlp_score != null && (
          <View style={styles.riskRow}>
            <Text style={[styles.riskLabel, { color: colors.text.muted }]}>Risk</Text>
            <RiskBar score={item.nlp_score} />
            <Text style={[styles.riskPct, { color: getRiskColor(item.nlp_score) }]}>
              {Math.round(item.nlp_score * 100)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:            { borderRadius: radius.lg, borderWidth: 1, marginHorizontal: spacing.md, marginBottom: spacing.md, overflow: 'hidden' },
  image:           { width: '100%', height: 180 },
  imagePlaceholder:{ width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' },
  body:            { padding: spacing.md },
  meta:            { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  source:          { fontSize: typography.xs, fontWeight: '600', flex: 1 },
  time:            { fontSize: typography.xs },
  title:           { fontSize: typography.md, fontWeight: '600', lineHeight: 22, marginBottom: spacing.sm },
  riskRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  riskLabel:       { fontSize: typography.xs, width: 28 },
  riskTrack:       { flex: 1, height: 4, backgroundColor: '#e5e7eb', borderRadius: radius.full, overflow: 'hidden' },
  riskFill:        { height: '100%', borderRadius: radius.full },
  riskPct:         { fontSize: typography.xs, width: 30, textAlign: 'right', fontWeight: '600' },
});
