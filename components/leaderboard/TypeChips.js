import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { TYPES } from '../../lib/leaderboard/format';

export default function TypeChips({ value, onChange }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {TYPES.map((t) => {
        const on = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.chip, { borderColor: on ? palette.brand.primary : colors.border, backgroundColor: on ? palette.brand.primary + '1a' : 'transparent' }]}
          >
            <Text style={[styles.label, { color: on ? palette.brand.bright : colors.text.muted }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:   { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: 6 },
  chip:  { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  label: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.3 },
});
