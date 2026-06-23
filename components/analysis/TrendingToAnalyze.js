import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// Google Trends RSS başlıkları — dokununca analiz formuna başlık metnini doldurur
export default function TrendingToAnalyze({ items, onPick }) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Ionicons name="flame" size={14} color={palette.brand.primary} />
        <Text style={[styles.headText, { color: colors.text.primary }]}>GÜNDEMDEN ANALİZ ET</Text>
      </View>
      <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.bg.surface }]}>
        {items.map((item, i) => (
          <Pressable
            key={`${item.id}-${i}`}
            onPress={() => onPick(item)}
            style={({ pressed }) => [
              styles.row,
              { borderBottomColor: colors.border, borderBottomWidth: i < items.length - 1 ? 1 : 0,
                backgroundColor: pressed ? colors.bg.base : 'transparent' },
            ]}
          >
            <Text style={[styles.rank, { color: palette.brand.primary }]}>{i + 1}</Text>
            <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{item.title}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.text.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:    { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  head:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  headText:{ fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 1.5 },
  list:    { borderWidth: 1 },
  row:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rank:    { fontFamily: fonts.extrabold, fontSize: 15, width: 18, textAlign: 'center' },
  title:   { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, flex: 1 },
});
