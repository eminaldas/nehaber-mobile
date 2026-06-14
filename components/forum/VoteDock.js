import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoteDistributionBar from './VoteDistributionBar';
import VoteControl from './VoteControl';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { VERDICT_MAP } from '../../constants/forum';

export default function VoteDock({ thread, onVote, onComment }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'}
      style={[styles.dock, { paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
      {thread.verdict ? (
        <View style={styles.resolved}>
          <Icon name="shield-check" size={16} color={VERDICT_MAP[thread.verdict]?.color || colors.text.muted} />
          <Text style={[styles.resolvedT, { color: colors.text.secondary }]}>
            Sonuçlandı: {VERDICT_MAP[thread.verdict]?.label || thread.verdict}
          </Text>
        </View>
      ) : (
        <>
          {thread.post_type === 'iddia' && <VoteDistributionBar thread={thread} />}
          <View style={styles.row}>
            <View style={{ flex: 1 }}><VoteControl thread={thread} onVote={onVote} /></View>
            <Pressable onPress={onComment} style={[styles.cbtn, { borderColor: colors.border }]} hitSlop={6}>
              <Icon name="message" size={16} color={colors.text.secondary} />
            </Pressable>
          </View>
        </>
      )}
    </BlurView>
  );
}
const styles = StyleSheet.create({
  dock:     { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  cbtn:     { width: 42, height: 40, borderWidth: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  resolved: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  resolvedT:{ fontSize: 12, fontWeight: '700' },
});
