import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { formatValue, MEDALS } from '../../lib/leaderboard/format';

export default function LeaderboardRow({ entry, unit, isMe }) {
  const { colors } = useTheme();
  const medal = MEDALS[entry.rank];
  const initials = (entry.username || '?').slice(0, 2).toUpperCase();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }, isMe && { backgroundColor: palette.brand.primary + '12' }]}>
      <Text style={[styles.rank, { color: isMe ? palette.brand.bright : colors.text.muted }]}>
        {medal ?? entry.rank}
      </Text>
      <View style={[styles.av, { borderColor: colors.border, backgroundColor: palette.brand.accent }]}>
        {entry.avatar_url
          ? <Image source={{ uri: entry.avatar_url }} style={styles.avImg} contentFit="cover" />
          : <Text style={styles.avTxt}>{initials}</Text>}
      </View>
      <View style={styles.mid}>
        <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>{isMe ? 'Sen' : `@${entry.username}`}</Text>
        <Text style={[styles.lvl, { color: colors.text.muted }]}>Sv. {entry.level ?? 1}</Text>
      </View>
      <Text style={[styles.val, { color: palette.brand.bright }]}>
        {formatValue(entry.value)}<Text style={[styles.unit, { color: colors.text.muted }]}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: spacing.md, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  rank:  { width: 22, textAlign: 'center', fontFamily: fonts.extrabold, fontSize: 12 },
  av:    { width: 30, height: 30, borderRadius: 15, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avImg: { width: '100%', height: '100%' },
  avTxt: { fontFamily: fonts.bold, fontSize: 10, color: palette.brand.bright },
  mid:   { flex: 1, minWidth: 0 },
  name:  { fontFamily: fonts.bold, fontSize: 12.5 },
  lvl:   { fontFamily: fonts.medium, fontSize: 9, marginTop: 2 },
  val:   { fontFamily: fonts.extrabold, fontSize: 13 },
  unit:  { fontFamily: fonts.bold, fontSize: 8 },
});
