import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { TYPES } from '../../lib/leaderboard/format';

export default function TypeChips({ value, onChange }) {
  const { colors } = useTheme();
  // Yatay ScrollView'ı sarmalayıcı View içerik yüksekliğine sabitler
  // (flex-column içinde dikeyde esneyip çipleri uzatmasını önler).
  return (
    <View style={styles.wrap}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { flexGrow: 0, flexShrink: 0 },
  row:   { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: 6, alignItems: 'center' },
  chip:  { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  label: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.3 },
});
