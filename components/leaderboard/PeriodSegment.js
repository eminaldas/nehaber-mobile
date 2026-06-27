import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { PERIODS } from '../../lib/leaderboard/format';

export default function PeriodSegment({ value, onChange }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { borderColor: colors.border }]}>
      {PERIODS.map((p) => {
        const on = p.key === value;
        return (
          <Pressable key={p.key} onPress={() => onChange(p.key)} style={[styles.seg, on && { backgroundColor: palette.brand.primary }]}>
            <Text style={[styles.label, { color: on ? '#04130b' : colors.text.muted }]}>{p.label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flexDirection: 'row', marginHorizontal: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderRadius: radius.sm, overflow: 'hidden' },
  seg:   { flex: 1, paddingVertical: 8, alignItems: 'center' },
  label: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.6 },
});
