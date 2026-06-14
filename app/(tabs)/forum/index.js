import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import AppHeader from '../../../components/ui/AppHeader';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import ForumCard from '../../../components/forum/ForumCard';
import CreateThreadForm from '../../../components/forum/CreateThreadForm';
import { FORUM_TABS } from '../../../constants/forum';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useThreads, useBookmarkToggle, useCreateThread } from '../../../hooks/useForum';
import { searchThreads } from '../../../services/forumService';

const EMPTY = { postType: 'iddia', title: '', body: '', category: 'Gündem', tagNames: [], imageUrls: [] };

export default function ForumScreen() {
  const { colors } = useTheme();
  const { isAuth } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('hot');
  const [nudge, setNudge] = useState(false);
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useThreads(tab);
  const bookmark = useBookmarkToggle();
  const create = useCreateThread();
  const items = data?.pages.flatMap(p => p.items) ?? [];

  const query = q.trim();
  const searching = query.length > 0;
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['forum-search', query],
    queryFn: () => searchThreads(query),
    enabled: searching && !creating,
  });
  const searchItems = searchData?.items ?? [];

  const requireAuth = (fn) => (...a) => { if (!isAuth) return setNudge(true); fn(...a); };
  const onBookmark = requireAuth((id) => bookmark.mutate(id, { onError: () => toast.error('Kaydedilemedi') }));

  const closeCreate = () => { setCreating(false); setForm(EMPTY); };
  const valid = form.title.trim().length >= 5 && !!form.category;
  const submitCreate = () => {
    if (!valid) return toast.error('Başlık en az 5 karakter ve kategori gerekli');
    create.mutate(form, {
      onSuccess: (thread) => { closeCreate(); toast.success('Paylaşıldı'); router.push(`/(tabs)/forum/${thread.id}`); },
      onError: (e) => toast.error(e?.response?.data?.detail || 'Paylaşılamadı'),
    });
  };

  const renderCard = ({ item }) => (
    <ForumCard
      thread={item}
      onPress={() => router.push(`/(tabs)/forum/${item.id}`)}
      onVote={() => router.push(`/(tabs)/forum/${item.id}`)}
      onBookmark={() => onBookmark(item.id)}
    />
  );

  return (
    <View style={[styles.c, { backgroundColor: colors.bg.base }]}>
      <AppHeader
        sectionIcon="search"
        rightIcon="add"
        onRight={requireAuth(() => setCreating(true))}
        onSearch={setQ}
        searchPlaceholder="Tartışmalarda ara…"
        sub={creating ? { title: 'Yeni Gönderi', action: { label: 'Paylaş', onPress: submitCreate, disabled: !valid || create.isPending } } : null}
        onBack={closeCreate}
      />

      {creating ? (
        <CreateThreadForm value={form} onChange={setForm} />
      ) : searching ? (
        <FlatList
          data={searchItems}
          keyExtractor={i => String(i.id)}
          renderItem={renderCard}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={[styles.resCap, { color: colors.text.muted }]}>“{query}” · {searchData?.total ?? 0} sonuç</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              {searchLoading ? <ActivityIndicator color={palette.brand.primary} /> : <Text style={[styles.emptyT, { color: colors.text.muted }]}>Sonuç bulunamadı.</Text>}
            </View>
          }
        />
      ) : (
        <>
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
              renderItem={renderCard}
              onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
              onEndReachedThreshold={0.5}
              onRefresh={refetch}
              refreshing={isRefetching}
              ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyT, { color: colors.text.muted }]}>{tab === 'bookmarks' ? 'Henüz bir şey kaydetmedin.' : 'Henüz tartışma yok.'}</Text></View>}
            />
          )}
        </>
      )}

      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:            { flex: 1 },
  chipBar:      { borderBottomWidth: 1 },
  chipRow:      { paddingHorizontal: spacing.md, gap: spacing.lg, alignItems: 'flex-end' },
  tab:          { paddingVertical: spacing.sm, alignItems: 'center', gap: 6 },
  tabText:      { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.2 },
  tabUnderline: { height: 2, width: '100%', borderRadius: 1 },
  resCap:       { fontFamily: fonts.bold, fontSize: 12, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 2 },
  empty:        { alignItems: 'center', paddingTop: 80 },
  emptyT:       { fontFamily: fonts.medium, fontSize: 13 },
});
