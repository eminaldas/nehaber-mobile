import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

function TrendCard({ item, rank, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, {
        backgroundColor: colors.bg.surface,
        borderColor: pressed ? palette.brand.primary : colors.border,
      }]}
    >
      {/* köşe aksanı */}
      <View style={[styles.corner, { backgroundColor: palette.brand.primary }]} />
      <View style={[styles.cornerV, { backgroundColor: palette.brand.primary }]} />

      {/* büyük sıra numarası (arkada, soluk) */}
      <Text style={[styles.bigNum, { color: palette.brand.primary }]}>{rank}</Text>

      <Text style={[styles.source, { color: palette.brand.primary }]} numberOfLines={1}>
        [{(item.source_domain || item.source_name || 'TREND').toUpperCase()}]
      </Text>
      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>
        {item.title}
      </Text>
    </Pressable>
  );
}

export default function TrendRail({ items, onOpen }) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Ionicons name="flame" size={15} color={palette.brand.primary} />
        <Text style={[styles.headText, { color: colors.text.primary }]}>TRENDLER</Text>
        <View style={[styles.liveDot, { backgroundColor: palette.brand.primary }]} />
        <Text style={[styles.live, { color: palette.brand.primary }]}>CANLI</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((item, i) => (
          <TrendCard key={String(item.id)} item={item} rank={i + 1} onPress={() => onOpen(item.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_W = 168;

const styles = StyleSheet.create({
  wrap:    { paddingTop: spacing.md, paddingBottom: spacing.sm },
  head:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  headText:{ fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginLeft: spacing.xs },
  live:    { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5 },
  row:     { paddingHorizontal: spacing.md, gap: spacing.sm },
  card:    { width: CARD_W, minHeight: 118, borderWidth: 1, padding: spacing.sm, paddingTop: 10, justifyContent: 'flex-start', overflow: 'hidden' },
  corner:  { position: 'absolute', top: 0, left: 0, width: 14, height: 2 },
  cornerV: { position: 'absolute', top: 0, left: 0, width: 2, height: 14 },
  bigNum:  { position: 'absolute', top: -10, right: 2, fontFamily: fonts.extrabold, fontSize: 64, opacity: 0.12, lineHeight: 70 },
  source:  { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.6, marginBottom: 6 },
  title:   { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
});
