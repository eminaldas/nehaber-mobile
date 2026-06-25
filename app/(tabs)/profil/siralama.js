import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import LeaderboardRow from '../../../components/leaderboard/LeaderboardRow';
import PeriodSegment from '../../../components/leaderboard/PeriodSegment';
import TypeChips from '../../../components/leaderboard/TypeChips';
import AppHeader from '../../../components/ui/AppHeader';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useLeaderboard } from '../../../hooks/useLeaderboard';
import { useTheme } from '../../../hooks/useTheme';
import { TYPES } from '../../../lib/leaderboard/format';

export default function SiralamaScreen() {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const [period, setPeriod] = useState('weekly');
  const [type, setType]     = useState('xp');
  const { data, isLoading } = useLeaderboard(period, type);

  const entries = data?.entries ?? [];
  const unit    = TYPES.find((t) => t.key === type)?.unit ?? '';
  const myId    = user?.id;
  const me      = entries.find((e) => e.user_id === myId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <AppHeader sectionIcon="trophy-outline" sub={{ title: 'Sıralama' }} onBack={() => router.back()} />
      <PeriodSegment value={period} onChange={setPeriod} />
      <TypeChips value={type} onChange={setType} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand.primary} /></View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e, i) => `${e.user_id}-${i}`}
          renderItem={({ item }) => <LeaderboardRow entry={item} unit={unit} isMe={item.user_id === myId} />}
          contentContainerStyle={{ paddingBottom: me ? 80 : 24, paddingTop: spacing.sm }}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.text.muted }]}>Bu dönemde sıralama yok.</Text>}
        />
      )}
      {me ? (
        <View style={[styles.meBar, { backgroundColor: colors.bg.surface, borderTopColor: palette.brand.primary }]}>
          <LeaderboardRow entry={me} unit={unit} isMe />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { paddingTop: 60, alignItems: 'center' },
  empty:  { fontFamily: fonts.medium, fontSize: 13, textAlign: 'center', paddingTop: 40 },
  meBar:  { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1 },
});
