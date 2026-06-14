import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import PostTypeBadge from './PostTypeBadge';
import AIChip from './AIChip';
import VoteControl from './VoteControl';
import { useTheme } from '../../hooks/useTheme';
import { timeAgo, voteDistribution } from '../../lib/forum/format';
import { VOTE_COLORS } from '../../constants/forum';

function accentColor(thread) {
  const { sPct, aPct, iPct } = voteDistribution(thread);
  if (thread.status === 'resolved') return '#3b82f6';
  const max = Math.max(sPct, aPct, iPct);
  if (!max) return '#2a323b';
  if (max === sPct) return VOTE_COLORS.suspicious;
  if (max === aPct) return VOTE_COLORS.authentic;
  return VOTE_COLORS.investigate;
}

export default function ForumCard({ thread, onPress, onVote, onBookmark }) {
  const { colors } = useTheme();
  const { total } = voteDistribution(thread);
  const isNews = thread.article_id != null;

  return (
    <Pressable onPress={onPress}
      style={[styles.item, { borderTopColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: accentColor(thread) }]} />
      <View style={styles.top}>
        <Avatar username={thread.author?.username} uri={thread.author?.avatar_url} size={26} />
        <Text style={[styles.who, { color: colors.text.secondary }]}>{thread.author?.username}</Text>
        <Text style={[styles.dot, { color: colors.text.muted }]}>·</Text>
        <Text style={[styles.time, { color: colors.text.muted }]}>{timeAgo(thread.created_at)}</Text>
        <View style={{ marginLeft: 'auto' }}><PostTypeBadge type={thread.post_type} /></View>
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{thread.title}</Text>

      {isNews && thread.article ? <AIChip verdict={thread.article.ai_verdict} confidence={thread.article.confidence} /> : null}

      {thread.post_type !== 'tartisma' && (
        <View style={{ marginTop: 9 }}>
          <VoteControl thread={thread} onVote={onVote} compact />
        </View>
      )}

      <View style={styles.foot}>
        <View style={styles.f}><Icon name="message" size={14} color={colors.text.muted} /><Text style={[styles.ft, { color: colors.text.muted }]}>{thread.comment_count ?? 0}</Text></View>
        <View style={styles.f}><Text style={[styles.ft, { color: colors.text.muted }]}>{total} oy</Text></View>
        <Pressable onPress={onBookmark} style={{ marginLeft: 'auto' }} hitSlop={8}>
          <Icon name="bookmark" size={15} color={thread.is_bookmarked ? '#3fff8b' : colors.text.muted} fill={thread.is_bookmarked ? 'rgba(63,255,139,0.15)' : 'none'} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item:  { paddingVertical: 14, paddingLeft: 18, paddingRight: 16, borderTopWidth: 1, position: 'relative' },
  accent:{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 2, borderRadius: 2 },
  top:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  who:   { fontSize: 12, fontWeight: '700' },
  dot:   { fontSize: 11 },
  time:  { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 14.5, fontWeight: '700', lineHeight: 20, marginBottom: 9 },
  foot:  { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 11 },
  f:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ft:    { fontSize: 11, fontWeight: '700' },
});
