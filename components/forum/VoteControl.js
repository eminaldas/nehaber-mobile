import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { alpha, fonts } from '../../constants/theme';

// thread: { post_type, vote_suspicious, vote_authentic, vote_investigate, current_user_vote }
// onVote(voteType); compact: kart içi küçük varyant
export default function VoteControl({ thread, onVote, compact = false }) {
  const { colors } = useTheme();
  const cur = thread.current_user_vote;

  const Chip = ({ vt, icon, count, onColor }) => {
    const on = cur === vt;
    return (
      <Pressable
        onPress={() => onVote?.(vt)}
        style={[
          styles.chip,
          { borderColor: colors.border, backgroundColor: colors.bg.solid },
          on && { borderColor: alpha(onColor, 0.55), backgroundColor: alpha(onColor, 0.1) },
          compact && styles.chipCompact,
        ]}
      >
        <Icon name={icon} size={compact ? 13 : 15} color={on ? onColor : colors.text.muted} />
        <Text style={[styles.count, { color: on ? onColor : colors.text.primary }]}>{count}</Text>
      </Pressable>
    );
  };

  if (thread.post_type === 'tartisma') return null;

  if (thread.post_type === 'soru') {
    return (
      <View style={styles.row}>
        <Chip vt="up"   icon="chevron-up"   count={thread.vote_authentic ?? thread.vote_up ?? 0}  onColor="#10b981" />
        <Chip vt="down" icon="chevron-down" count={thread.vote_suspicious ?? thread.vote_down ?? 0} onColor="#dc2626" />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Chip vt="suspicious"  icon="flag"   count={thread.vote_suspicious}  onColor="#dc2626" />
      <Chip vt="authentic"   icon="check"  count={thread.vote_authentic}   onColor="#10b981" />
      <Chip vt="investigate" icon="search" count={thread.vote_investigate} onColor="#f59e0b" />
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 7 },
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderRadius: 4 },
  chipCompact: { paddingHorizontal: 8, paddingVertical: 5 },
  count: { fontSize: 11, fontFamily: fonts.extrabold },
});
