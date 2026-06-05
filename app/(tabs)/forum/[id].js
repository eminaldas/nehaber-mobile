import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { getThreadDetail } from '../../../services/forumService';

export default function ForumDetayScreen() {
  const { id }               = useLocalSearchParams();
  const { colors }           = useTheme();
  const { isAuth }           = useAuth();
  const [nudge, setNudge]    = useState(false);

  const { data: thread, isLoading } = useQuery({
    queryKey: ['forum-thread', id],
    queryFn:  () => getThreadDetail(id),
  });

  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg.base }]}>
        <ActivityIndicator color={palette.brand.primary} size="large" />
      </View>
    );
  }

  const total = (thread?.vote_suspicious ?? 0) + (thread?.vote_authentic ?? 0) + (thread?.vote_investigate ?? 0);

  return (
    <>
      <ScrollView style={{ flex:1, backgroundColor: colors.bg.base }} contentContainerStyle={styles.content}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={{ color: palette.brand.primary }}>← Forum</Text>
        </Pressable>

        {thread?.category && (
          <View style={[styles.catBadge, { backgroundColor: palette.brand.accent }]}>
            <Text style={[styles.catText, { color: palette.brand.primary }]}>{thread.category}</Text>
          </View>
        )}

        <Text style={[styles.title, { color: colors.text.primary }]}>{thread?.title}</Text>

        <View style={styles.votesRow}>
          <Text style={{ color: colors.text.muted, fontSize: typography.xs }}>
            🚩 {thread?.vote_suspicious ?? 0} şüpheli  •  ✅ {thread?.vote_authentic ?? 0} doğru  •  🔍 {thread?.vote_investigate ?? 0} araştır
          </Text>
        </View>

        {thread?.body ? (
          <Text style={[styles.body, { color: colors.text.secondary }]}>{thread.body}</Text>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.commentsTitle, { color: colors.text.primary }]}>
          Yorumlar ({thread?.comment_count ?? 0})
        </Text>

        {(thread?.comments ?? []).map(comment => (
          <View key={String(comment.id)} style={[styles.comment, { backgroundColor: colors.bg.surface, borderLeftColor: palette.brand.primary }]}>
            <Text style={[styles.commentUser, { color: palette.brand.primary }]}>@{comment.username}</Text>
            <Text style={[styles.commentBody, { color: colors.text.secondary }]}>{comment.body}</Text>
          </View>
        ))}

        <Pressable
          style={[styles.replyBtn, { borderColor: palette.brand.primary }]}
          onPress={() => { if (!isAuth) setNudge(true); }}
        >
          <Text style={[styles.replyBtnText, { color: palette.brand.primary }]}>
            {isAuth ? 'Yorum Yaz (yakında)' : 'Yorum yazmak için giriş yap'}
          </Text>
        </Pressable>
      </ScrollView>

      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  loader:        { flex:1, justifyContent:'center', alignItems:'center' },
  content:       { paddingBottom: spacing.xxl },
  back:          { paddingTop:50, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  catBadge:      { alignSelf:'flex-start', marginHorizontal: spacing.md, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical:2, marginBottom: spacing.sm },
  catText:       { fontSize: typography.xs, fontWeight:'600' },
  title:         { fontSize: typography.lg, fontWeight:'700', paddingHorizontal: spacing.md, marginBottom: spacing.sm, lineHeight:26 },
  votesRow:      { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  body:          { paddingHorizontal: spacing.md, fontSize: typography.md, lineHeight:22, marginBottom: spacing.lg },
  divider:       { height:1, marginHorizontal: spacing.md, marginBottom: spacing.md },
  commentsTitle: { paddingHorizontal: spacing.md, fontWeight:'600', fontSize: typography.md, marginBottom: spacing.sm },
  comment:       { marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.sm, borderLeftWidth:3, borderRadius: radius.sm },
  commentUser:   { fontSize: typography.xs, fontWeight:'600', marginBottom:2 },
  commentBody:   { fontSize: typography.sm, lineHeight:18 },
  replyBtn:      { margin: spacing.md, borderRadius: radius.md, padding: spacing.md, alignItems:'center', borderWidth:1 },
  replyBtnText:  { fontWeight:'600', fontSize: typography.sm },
});
