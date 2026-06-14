import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/ui/Icon';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import ForumCard from '../../../components/forum/ForumCard';
import { FORUM_TABS } from '../../../constants/forum';
import { palette } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useThreads, useBookmarkToggle } from '../../../hooks/useForum';

export default function ForumScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.hdr, { paddingTop: insets.top + 6, backgroundColor: colors.bg.deepest, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.text.primary }]}>ne<Text style={{ color: palette.brand.primary }}>haber</Text></Text>
        <Pressable onPress={requireAuth(() => router.push('/(tabs)/forum/yeni'))}
          style={[styles.add, { borderColor: colors.border }]} hitSlop={6}>
          <Icon name="plus" size={16} color={palette.brand.bright} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {FORUM_TABS.map(t => (
          <Pressable key={t.key} onPress={() => setTab(t.key)}>
            <Text style={[styles.tab, { color: tab === t.key ? colors.text.primary : colors.text.muted }]}>{t.label}</Text>
            {tab === t.key && <View style={[styles.ind, { backgroundColor: palette.brand.bright }]} />}
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>{[1, 2, 3].map(i => <ShimmerCard key={i} />)}</View>
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
          ListEmptyComponent={<View style={styles.empty}><Text style={{ color: colors.text.muted }}>{tab === 'bookmarks' ? 'Henüz bir şey kaydetmedin.' : 'Henüz tartışma yok.'}</Text></View>}
        />
      )}

      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:    { flex: 1 },
  hdr:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  logo: { fontSize: 18, fontWeight: '800' },
  add:  { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', gap: 18, paddingHorizontal: 16, paddingVertical: 10 },
  tab:  { fontSize: 12, fontWeight: '700' },
  ind:  { height: 2, borderRadius: 2, marginTop: 6 },
  empty:{ alignItems: 'center', paddingTop: 80 },
});
