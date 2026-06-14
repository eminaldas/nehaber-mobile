import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../../components/ui/AppHeader';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import ForumCard from '../../../components/forum/ForumCard';
import { FORUM_TABS } from '../../../constants/forum';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useThreads, useBookmarkToggle } from '../../../hooks/useForum';

export default function ForumScreen() {
  const { colors } = useTheme();
  const { isAuth } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('hot');
  const [nudge, setNudge] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useThreads(tab);
  const bookmark = useBookmarkToggle();
  const items = data?.pages.flatMap(p => p.items) ?? [];

  const requireAuth = (fn) => (...a) => { if (!isAuth) return setNudge(true); fn(...a); };
  const onBookmark = requireAuth((id) => bookmark.mutate(id, { onError: () => toast.error('Kaydedilemedi') }));

  return (
    <View style={[styles.c, { backgroundColor: colors.bg.base }]}>
      <AppHeader
        sectionIcon="chatbubbles-outline"
        rightIcon="add"
        onRight={requireAuth(() => router.push('/(tabs)/forum/yeni'))}
      />

      <View style={[styles.chipBar, { backgroundColor: colors.bg.base, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {FORUM_TABS.map(t => {
            const active = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab} hitSlop={8}>
                <Text style={[styles.tabText, { color: active ? colors.text.primary : colors.text.muted }]}>{t.label}</Text>
                <View style={[styles.tabUnderline, { backgroundColor: active ? palette.brand.primary : 'transparent' }]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.md }}>{[1, 2, 3].map(i => <ShimmerCard key={i} />)}</View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <ForumCard
              thread={item}
              onPress={() => router.push(`/(tabs)/forum/${item.id}`)}
              onVote={() => router.push(`/(tabs)/forum/${item.id}`)}
              onBookmark={() => onBookmark(item.id)}
            />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyT, { color: colors.text.muted }]}>{tab === 'bookmarks' ? 'Henüz bir şey kaydetmedin.' : 'Henüz tartışma yok.'}</Text></View>}
        />
      )}

      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:            { flex: 1 },
  topbar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  logo:         { fontFamily: fonts.logo, fontSize: 24, letterSpacing: 0.5 },
  chipBar:      { borderBottomWidth: 1 },
  chipRow:      { paddingHorizontal: spacing.md, gap: spacing.lg, alignItems: 'flex-end' },
  tab:          { paddingVertical: spacing.sm, alignItems: 'center', gap: 6 },
  tabText:      { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.2 },
  tabUnderline: { height: 2, width: '100%', borderRadius: 1 },
  empty:        { alignItems: 'center', paddingTop: 80 },
  emptyT:       { fontFamily: fonts.medium, fontSize: 13 },
});
