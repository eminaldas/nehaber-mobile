import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { formatValue } from '../../lib/leaderboard/format';
import BottomSheet from '../ui/BottomSheet';

const PERIOD_LABEL = { weekly: 'BU HAFTA', monthly: 'BU AY' };
const METRIC_LABEL = { xp: 'XP' };

function topThreshold(p) { return p.period_type === 'weekly' ? 3 : 5; }

function Stat({ v, l, colors }) {
  return (
    <View style={[styles.st, { borderColor: colors.border }]}>
      <Text style={[styles.stV, { color: palette.brand.bright }]}>{v}</Text>
      <Text style={[styles.stL, { color: colors.text.muted }]}>{l}</Text>
    </View>
  );
}

export default function RewardSheet({ reward, onClose }) {
  const { colors } = useTheme();
  const p = reward?.payload;
  const goLeaderboard = () => { onClose?.(); router.push('/(tabs)/profil/siralama'); };

  return (
    <BottomSheet visible={!!reward} onClose={onClose}>
      {p && (
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.trophy, { borderColor: palette.brand.bright, backgroundColor: palette.brand.primary + '1a' }]}>
            <Ionicons name="trophy" size={30} color={palette.brand.bright} />
          </View>
          <Text style={[styles.eyebrow, { color: palette.brand.bright }]}>
            // {PERIOD_LABEL[p.period_type] ?? 'DÖNEM'} · {METRIC_LABEL[p.metric] ?? 'SIRALAMA'} SIRALAMASI
          </Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Tebrikler, ilk {topThreshold(p)}'tesin!</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>Sıralamayı {p.rank}. bitirdin.</Text>

          <View style={styles.stats}>
            <Stat v={`${p.rank}.`} l="SIRA" colors={colors} />
            <Stat v={formatValue(p.value)} l={METRIC_LABEL[p.metric] ?? ''} colors={colors} />
          </View>

          <Pressable style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]} onPress={goLeaderboard}>
            <Text style={styles.ctaText}>Sıralamayı Gör</Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={8}><Text style={[styles.close, { color: colors.text.muted }]}>Kapat</Text></Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  trophy:  { width: 60, height: 60, borderRadius: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  eyebrow: { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 1.4, marginTop: 4 },
  title:   { fontFamily: fonts.extrabold, fontSize: 19, marginTop: 6, textAlign: 'center' },
  sub:     { fontFamily: fonts.medium, fontSize: 12.5, marginTop: 4, textAlign: 'center' },
  stats:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' },
  st:      { flex: 1, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center' },
  stV:     { fontFamily: fonts.extrabold, fontSize: 16 },
  stL:     { fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.8, marginTop: 3 },
  cta:     { alignSelf: 'stretch', backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: spacing.lg },
  ctaText: { fontFamily: fonts.bold, fontSize: 14, color: '#06140d' },
  close:   { fontFamily: fonts.medium, fontSize: 12, marginTop: spacing.md },
});
