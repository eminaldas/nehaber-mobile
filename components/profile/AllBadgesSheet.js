import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import BottomSheet from '../ui/BottomSheet';

const BADGE_ICON = { level: 'trophy', analiz: 'shield-checkmark', analysis: 'shield-checkmark', forum: 'chatbubble-ellipses', xp: 'flash', streak: 'flame' };

function BadgeCell({ b, earned, colors }) {
  return (
    <View style={styles.cell}>
      <View style={[styles.sq, {
        borderColor: earned ? palette.brand.primary : colors.border,
        backgroundColor: earned ? palette.brand.primary + '14' : colors.bg.surface,
      }]}>
        <Ionicons
          name={earned ? (BADGE_ICON[b.category] ?? 'ribbon') : 'lock-closed'}
          size={22}
          color={earned ? palette.brand.bright : colors.text.muted}
        />
      </View>
      <Text style={[styles.name, { color: earned ? colors.text.secondary : colors.text.muted }]} numberOfLines={2}>
        {b.name}
      </Text>
    </View>
  );
}

/**
 * Tüm rozetleri gösteren alttan açılır sheet (Seçenek C).
 * Üstte ilerleme çubuğu + "x / y KAZANILDI · %z", ardından KAZANILAN ve KİLİTLİ ızgaraları.
 */
export default function AllBadgesSheet({ visible, onClose, earned = [], locked = [] }) {
  const { colors } = useTheme();
  const total = earned.length + locked.length;
  const pct   = total > 0 ? Math.round((earned.length / total) * 100) : 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Rozetler">
      <View style={[styles.track, { backgroundColor: colors.bg.base }]}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={[styles.pct, { color: colors.text.muted }]}>
        {earned.length} / {total} KAZANILDI · %{pct}
      </Text>

      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.md }}>
        {earned.length > 0 && (
          <>
            <Text style={[styles.lab, { color: palette.brand.bright }]}>KAZANILAN</Text>
            <View style={styles.grid}>
              {earned.map(b => <BadgeCell key={b.key} b={b} earned colors={colors} />)}
            </View>
          </>
        )}
        {locked.length > 0 && (
          <>
            <Text style={[styles.lab, { color: colors.text.muted }]}>KİLİTLİ</Text>
            <View style={styles.grid}>
              {locked.map(b => <BadgeCell key={b.key} b={b} earned={false} colors={colors} />)}
            </View>
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.xs },
  fill:  { height: '100%', borderRadius: radius.full, backgroundColor: palette.brand.primary },
  pct:   { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.8, marginTop: 8, marginBottom: spacing.md },
  lab:   { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5, marginTop: spacing.md, marginBottom: spacing.sm },
  grid:  { flexDirection: 'row', flexWrap: 'wrap' },
  cell:  { width: '33.333%', alignItems: 'center', gap: 6, paddingVertical: spacing.sm, paddingHorizontal: 4 },
  sq:    { width: 50, height: 50, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  name:  { fontFamily: fonts.semibold, fontSize: 9.5, textAlign: 'center', lineHeight: 12 },
});
