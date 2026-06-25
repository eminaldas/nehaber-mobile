import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useHotAnalyses } from '../../hooks/useHotAnalyses';
import { useTheme } from '../../hooks/useTheme';

const STATUS = {
  FAKE:      { color: palette.verdict.fake,      label: 'Şüpheli' },
  AUTHENTIC: { color: palette.verdict.authentic, label: 'Güvenilir' },
  UNCERTAIN: { color: palette.verdict.iddia,     label: 'Belirsiz' },
  IDDIA:     { color: palette.verdict.iddia,     label: 'Belirsiz' },
};

function Row({ item, last }) {
  const { colors } = useTheme();
  const cfg = STATUS[(item.status || '').toUpperCase()] || STATUS.UNCERTAIN;
  const pct = item.confidence != null ? Math.round(item.confidence * 100) : null;

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/analiz/${item.task_id}`)}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, borderBottomWidth: last ? 0 : 1,
          borderLeftColor: cfg.color, backgroundColor: pressed ? colors.bg.base : 'transparent' },
      ]}
    >
      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{item.title}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.count, { color: colors.text.muted }]}>{item.request_count}× analiz edildi</Text>
        <Text style={[styles.status, { color: cfg.color }]}>{cfg.label}{pct != null ? ` %${pct}` : ''}</Text>
      </View>
      {pct != null && (
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: cfg.color }]} />
        </View>
      )}
    </Pressable>
  );
}

export default function HotAnalysesCard() {
  const { colors } = useTheme();
  const [hours, setHours] = useState(24);
  const { data, isLoading } = useHotAnalyses(hours);
  const items = data?.items ?? [];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Ionicons name="flame" size={14} color={palette.brand.primary} />
        <Text style={[styles.headText, { color: colors.text.primary }]}>EN ÇOK ANALİZ EDİLEN</Text>
      </View>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.bg.surface }]}>
        {/* Saat filtresi */}
        <View style={[styles.filter, { borderBottomColor: colors.border }]}>
          {[12, 24].map(h => {
            const active = hours === h;
            return (
              <Pressable key={h} onPress={() => setHours(h)}
                style={[styles.chip, { borderColor: active ? palette.brand.primary : 'transparent' }]}>
                <Text style={[styles.chipText, { color: active ? palette.brand.primary : colors.text.muted }]}>[ {h}S ]</Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator color={palette.brand.primary} /></View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="sparkles-outline" size={22} color={palette.brand.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Bu alanı sen doldurabilirsin</Text>
            <Text style={[styles.emptySub, { color: colors.text.muted }]}>Şüpheli bir haberi analiz et — burada ilk sırada görünsün.</Text>
          </View>
        ) : (
          items.map((item, i) => <Row key={`${item.task_id}-${i}`} item={item} last={i === items.length - 1} />)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:      { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  head:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  headText:  { fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 1.5 },
  card:      { borderWidth: 1 },
  filter:    { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  chip:      { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  chipText:  { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  center:    { paddingVertical: spacing.xl, alignItems: 'center' },
  empty:     { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  emptyTitle:{ fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' },
  emptySub:  { fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  row:       { borderLeftWidth: 2, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 6 },
  title:     { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  count:     { fontFamily: fonts.medium, fontSize: 11 },
  status:    { fontFamily: fonts.bold, fontSize: 11 },
  track:     { height: 2, overflow: 'hidden' },
  fill:      { height: '100%' },
});
