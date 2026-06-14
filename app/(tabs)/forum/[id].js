import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../../components/forum/Avatar';
import Icon from '../../../components/ui/Icon';
import PostTypeBadge from '../../../components/forum/PostTypeBadge';
import StatusChip from '../../../components/forum/StatusChip';
import AIChip from '../../../components/forum/AIChip';
import LinkedArticleCard from '../../../components/forum/LinkedArticleCard';
import VoteDock from '../../../components/forum/VoteDock';
import CommentComposer from '../../../components/forum/CommentComposer';
import CommentTree from '../../../components/forum/CommentTree';
import FeaturedEvidence from '../../../components/forum/FeaturedEvidence';
import ForumActionSheet, { shareThread } from '../../../components/forum/ForumActionSheet';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import { palette, fonts } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import {
  useThread, useVote, useAddComment, useHelpful,
  useReportComment, useReportThread, useDeleteThread,
} from '../../../hooks/useForum';
import { timeAgo } from '../../../lib/forum/format';
import ws from '../../../services/wsService';

export default function ForumDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuth, user } = useAuth();
  const toast = useToast();

  const { data: thread, isLoading, refetch: refetchThread } = useThread(id);
  const vote = useVote(id);
  const addComment = useAddComment(id);
  const helpful = useHelpful(id);
  const reportComment = useReportComment();
  const reportThreadM = useReportThread();
  const deleteThreadM = useDeleteThread();

  const [nudge, setNudge] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const unsub = ws.subscribe('forum.new_comment', (msg) => {
      if (msg?.payload?.thread_id === String(id)) refetchThread();
    });
    return unsub;
  }, [id, refetchThread]);

  if (isLoading || !thread) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg.base }]}>
        <ActivityIndicator color={palette.brand.primary} size="large" />
      </View>
    );
  }

  const isNews = thread.article_id != null;
  const isOwner = isAuth && user?.id === thread.author?.id;

  const onVote = (vt) => {
    if (!isAuth) return setNudge(true);
    vote.mutate(vt, {
      onError: (e) => toast.error(e?.response?.status === 409 ? 'Tartışma sonuçlandı, oy verilemez' : 'Oy gönderilemedi'),
    });
  };
  const submitComment = (body) => {
    if (!isAuth) return setNudge(true);
    addComment.mutate({ body, parentId: replyTo?.id }, {
      onSuccess: ({ flagged }) => { setReplyTo(null); if (flagged) toast.info('Yorumun incelemeye alındı'); },
      onError: (e) => toast.error(e?.response?.status === 422 ? 'İçerik politikalara aykırı' : 'Yorum gönderilemedi'),
    });
  };
  const onHelpful = (c) => { if (!isAuth) return setNudge(true); helpful.mutate(c.id); };
  const onReport = (c) => {
    if (!isAuth) return setNudge(true);
    reportComment.mutate({ id: c.id, reason: 'spam' }, {
      onSuccess: () => toast.success('Bildirimin alındı'),
      onError: () => toast.error('Gönderilemedi'),
    });
  };

  const menuActions = isOwner
    ? [{ key: 'delete', label: 'Sil', icon: 'x', danger: true, onPress: () =>
        deleteThreadM.mutate(id, { onSuccess: () => { toast.success('Silindi'); router.back(); }, onError: () => toast.error('Silinemedi') }) }]
    : [{ key: 'report', label: 'Bildir', icon: 'flag', onPress: () =>
        reportThreadM.mutate({ id, reason: 'spam' }, { onSuccess: () => toast.success('Bildirimin alındı'), onError: () => toast.error('Gönderilemedi') }) }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.nav, { paddingTop: insets.top + 4, borderBottomColor: colors.border }]}>
        <Pressable style={styles.bk} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow-left" size={16} color={colors.text.secondary} strokeWidth={2.2} />
          <Text style={[styles.bkt, { color: colors.text.secondary }]}>Forum</Text>
        </Pressable>
        <View style={styles.sp}>
          <Pressable onPress={() => shareThread(thread)} hitSlop={8}><Icon name="share" size={17} color={colors.text.muted} /></Pressable>
          <Pressable onPress={() => setMenu(true)} hitSlop={8}><Icon name="dots" size={17} color={colors.text.muted} /></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        <View style={styles.metaRow}>
          <PostTypeBadge type={thread.post_type} />
          <View style={{ marginLeft: 'auto' }}><StatusChip status={thread.status} /></View>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>{thread.title}</Text>

        <View style={styles.auth}>
          <Avatar username={thread.author?.username} uri={thread.author?.avatar_url} size={26} />
          <Text style={[styles.nm, { color: colors.text.secondary }]}>{thread.author?.username}</Text>
          <Text style={[styles.dt, { color: colors.text.muted }]}>· {timeAgo(thread.created_at)}</Text>
          {isNews && thread.article ? <View style={{ marginLeft: 'auto' }}><AIChip verdict={thread.article.ai_verdict} confidence={thread.article.confidence} /></View> : null}
        </View>

        {thread.body ? <Text style={[styles.body, { color: colors.text.secondary, borderLeftColor: 'rgba(16,185,129,0.4)' }]}>{thread.body}</Text> : null}

        {thread.tags?.length ? (
          <View style={styles.tags}>
            {thread.tags.map(t => <Text key={t.id} style={[styles.tag, { color: colors.text.muted, backgroundColor: colors.bg.surface }]}>#{t.name}</Text>)}
          </View>
        ) : null}

        <LinkedArticleCard article={thread.article} />

        <Text style={[styles.section, { color: colors.text.primary }]}>Tartışma · {thread.comment_count} yorum</Text>

        <View style={{ marginTop: 12 }}>
          <CommentComposer
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSubmit={submitComment}
            submitting={addComment.isPending}
          />
          {thread.featured_evidence ? <FeaturedEvidence comment={thread.featured_evidence} /> : null}
          <CommentTree
            comments={thread.comments ?? []}
            authorId={thread.author?.id}
            onReply={(c) => setReplyTo({ id: c.id, username: c.username })}
            onHelpful={onHelpful}
            onReport={onReport}
          />
        </View>
      </ScrollView>

      <VoteDock thread={thread} onVote={onVote} onComment={() => {}} />
      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
      <ForumActionSheet visible={menu} onClose={() => setMenu(false)} actions={menuActions} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nav:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  bk:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bkt:     { fontSize: 12, fontFamily: fonts.bold },
  sp:      { flexDirection: 'row', gap: 16, marginLeft: 'auto' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title:   { fontSize: 19, fontFamily: fonts.extrabold, lineHeight: 25, marginBottom: 12 },
  auth:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  nm:      { fontSize: 12, fontFamily: fonts.bold },
  dt:      { fontSize: 11, fontFamily: fonts.semibold },
  body:    { fontSize: 13, lineHeight: 21, borderLeftWidth: 2, paddingLeft: 11, marginBottom: 14 },
  tags:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  tag:     { fontSize: 10, fontFamily: fonts.semibold, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3 },
  section: { fontSize: 13, fontFamily: fonts.extrabold, marginTop: 4 },
});
