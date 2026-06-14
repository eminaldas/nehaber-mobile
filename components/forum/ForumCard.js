import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import PostTypeBadge from './PostTypeBadge';
import AIChip from './AIChip';
import VoteControl from './VoteControl';
import VoteDistributionBar from './VoteDistributionBar';
import { shareThread } from './ForumActionSheet';
import { useTheme } from '../../hooks/useTheme';
import { timeAgo, voteDistribution } from '../../lib/forum/format';
import { VOTE_COLORS } from '../../constants/forum';
import { fonts } from '../../constants/theme';

function accentColor(thread) {
  if (thread.status === 'resolved') return '#3b82f6';
  const { sPct, aPct, iPct } = voteDistribution(thread);
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
  const tags = (thread.tags || []).slice(0, 3);

  return (
    <Pressable onPress={onPress} style={[styles.item, { borderTopColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: accentColor(thread) }]} />

      <View style={styles.head}>
        <Avatar username={thread.author?.username} uri={thread.author?.avatar_url} size={34} />
        <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>{thread.author?.username}</Text>
        <PostTypeBadge type={thread.post_type} />
        <Text style={[styles.time, { color: colors.text.muted }]}>· {timeAgo(thread.created_at)}</Text>
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>{thread.title}</Text>

      {thread.body ? (
        <Text style={[styles.body, { color: colors.text.muted }]} numberOfLines={2}>{thread.body}</Text>
      ) : null}

      {isNews && thread.article ? (
        <View style={{ marginBottom: 11 }}>
          <AIChip verdict={thread.article.ai_verdict} confidence={thread.article.confidence} />
        </View>
      ) : null}

      {tags.length ? (
        <View style={styles.tags}>
          {tags.map(t => <Text key={t.id} style={styles.tag}>#{t.name}</Text>)}
        </View>
      ) : null}

      {thread.post_type === 'iddia' ? (
        <View style={styles.pulse}>
          <Text style={[styles.pcap, { color: colors.text.muted }]}>TOPLULUK · {total} oy</Text>
          <View style={{ marginBottom: 9 }}><VoteDistributionBar thread={thread} height={3} /></View>
          <VoteControl thread={thread} onVote={onVote} compact />
        </View>
      ) : thread.post_type === 'soru' ? (
        <View style={styles.pulse}><VoteControl thread={thread} onVote={onVote} compact /></View>
      ) : null}

      <View style={styles.eng}>
        <View style={styles.e}>
          <Icon name="message" size={16} color={colors.text.muted} />
          <Text style={[styles.et, { color: colors.text.muted }]}>{thread.comment_count ?? 0}</Text>
        </View>
        <Pressable style={styles.e} onPress={() => shareThread(thread)} hitSlop={6}>
          <Icon name="external" size={16} color={colors.text.muted} />
          <Text style={[styles.et, { color: colors.text.muted }]}>Paylaş</Text>
        </Pressable>
        <Pressable onPress={onBookmark} style={{ marginLeft: 'auto' }} hitSlop={8}>
          <Icon name="bookmark" size={16} color={thread.is_bookmarked ? '#3fff8b' : colors.text.muted} fill={thread.is_bookmarked ? 'rgba(63,255,139,0.18)' : 'none'} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item:   { paddingVertical: 14, paddingLeft: 17, paddingRight: 16, borderTopWidth: 1, position: 'relative' },
  accent: { position: 'absolute', left: 0, top: 16, bottom: 16, width: 3 },
  head:   { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  name:   { fontSize: 14, fontFamily: fonts.extrabold, flexShrink: 1 },
  time:   { fontSize: 12, fontFamily: fonts.semibold },
  title:  { fontSize: 16, fontFamily: fonts.extrabold, lineHeight: 22, marginBottom: 7 },
  body:   { fontSize: 13, fontFamily: fonts.regular, lineHeight: 19, marginBottom: 11 },
  tags:   { flexDirection: 'row', gap: 10, marginBottom: 12 },
  tag:    { fontSize: 11, fontFamily: fonts.bold, color: '#5fb0ff' },
  pulse:  { marginBottom: 12 },
  pcap:   { fontSize: 9, fontFamily: fonts.bold, letterSpacing: 0.6, marginBottom: 7 },
  eng:    { flexDirection: 'row', alignItems: 'center', gap: 22 },
  e:      { flexDirection: 'row', alignItems: 'center', gap: 7 },
  et:     { fontSize: 12, fontFamily: fonts.bold },
});
