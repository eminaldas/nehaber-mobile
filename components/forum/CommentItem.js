import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { timeAgo } from '../../lib/forum/format';
import { TRUST_BADGE } from '../../constants/forum';

export default function CommentItem({ comment, isAuthor, onReply, onHelpful, onReport, depth = 0 }) {
  const { colors } = useTheme();
  const removed = comment.moderation_status === 'removed';
  const flagged = comment.moderation_status?.startsWith('flagged');
  const trust = comment.trust_tier ? TRUST_BADGE[comment.trust_tier] : null;
  const hasSource = (comment.evidence_urls || []).length > 0;

  if (removed) return null;

  return (
    <View style={[styles.c, depth > 0 && { marginLeft: 16, paddingLeft: 11, borderLeftWidth: 1, borderLeftColor: colors.border }]}>
      <View style={styles.head}>
        <Avatar username={comment.username} uri={comment.avatar_url} size={22} />
        <Text style={[styles.nm, { color: colors.text.secondary }]}>{comment.username}</Text>
        {isAuthor ? <Text style={[styles.badge, { color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)' }]}>Yazar</Text> : null}
        {trust ? <Text style={[styles.badge, { color: trust.color, borderColor: trust.color + '66' }]}>{trust.label}</Text> : null}
        <Text style={[styles.dt, { color: colors.text.muted }]}>{timeAgo(comment.created_at)}</Text>
      </View>

      <Text style={[styles.tx, { color: colors.text.secondary }]}>{comment.body}</Text>
      {flagged ? <Text style={styles.flag}>İncelemede</Text> : null}

      {hasSource ? (
        <Pressable onPress={() => Linking.openURL(comment.evidence_urls[0])} style={[styles.src, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
          <Icon name="link" size={12} color="#60a5fa" />
          <Text style={styles.srcT} numberOfLines={1}>{comment.evidence_urls[0]}</Text>
        </Pressable>
      ) : null}

      <View style={styles.acts}>
        <Pressable style={styles.a} onPress={() => onHelpful(comment)} hitSlop={6}>
          <Icon name="heart" size={13} color={comment.current_user_helpful ? '#6ee7b7' : colors.text.muted} fill={comment.current_user_helpful ? '#6ee7b7' : 'none'} />
          <Text style={[styles.at, { color: comment.current_user_helpful ? '#6ee7b7' : colors.text.muted }]}>{comment.helpful_count || 0}</Text>
        </Pressable>
        {depth < 3 ? (
          <Pressable style={styles.a} onPress={() => onReply(comment)} hitSlop={6}>
            <Icon name="reply" size={13} color={colors.text.muted} /><Text style={[styles.at, { color: colors.text.muted }]}>Yanıtla</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.a} onPress={() => onReport(comment)} hitSlop={6}>
          <Icon name="flag" size={13} color={colors.text.muted} /><Text style={[styles.at, { color: colors.text.muted }]}>Bildir</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  c:     { paddingVertical: 12 },
  head:  { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  nm:    { fontSize: 11.5, fontWeight: '700' },
  badge: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', borderWidth: 1, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  dt:    { fontSize: 10, fontWeight: '600', marginLeft: 'auto' },
  tx:    { fontSize: 12.5, lineHeight: 19, marginBottom: 8 },
  flag:  { fontSize: 10, color: '#f59e0b', marginBottom: 8 },
  src:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, marginBottom: 9, maxWidth: '90%' },
  srcT:  { color: '#60a5fa', fontSize: 10, fontWeight: '700', flexShrink: 1 },
  acts:  { flexDirection: 'row', gap: 16 },
  a:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  at:    { fontSize: 10.5, fontWeight: '700' },
});
