import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

export default function ReportBlock({ title, icon, subtitle, children }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.block, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
      <View style={styles.head}>
        {!!icon && <Ionicons name={icon} size={16} color={palette.brand.primary} />}
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {!!subtitle && <Text style={[styles.sub, { color: colors.text.muted }]}>{subtitle}</Text>}
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderWidth: 1, padding: spacing.md },
  head:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.extrabold, fontSize: 15, letterSpacing: -0.2 },
  sub:   { fontFamily: fonts.medium, fontSize: 11, marginTop: 2 },
});
