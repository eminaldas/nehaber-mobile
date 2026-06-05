import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { getThreads } from '../../../services/forumService';

function ForumCard({ item, onPress }) {
  const { colors } = useTheme();
  const total = (item.vote_suspicious ?? 0) + (item.vote_authentic ?? 0) + (item.vote_investigate ?? 0);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      {item.category && (
        <View style={[styles.catBadge, { backgroundColor: palette.brand.accent }]}>
          <Text style={[styles.catText, { color: palette.brand.primary }]}>{item.category}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{item.title}</Text>
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: colors.text.muted }]}>
          @{item.author?.username ?? '?'}
        </Text>
        <Text style={[styles.metaText, { color: colors.text.muted }]}>
          💬 {item.comment_count ?? 0}  •  🗳 {total}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ForumScreen() {
  const { colors } = useTheme();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey:         ['forum-threads'],
      queryFn:          ({ pageParam = 1 }) => getThreads({ page: pageParam }),
      getNextPageParam: (last) => {
        const loaded = last.page * last.size;
        return loaded < last.total ? last.page + 1 : undefined;
      },
      initialPageParam: 1,
    });

  const items = data?.pages.flatMap(p => p.items) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
        {[1,2,3].map(i => <ShimmerCard key={i} />)}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <View style={[styles.header, { backgroundColor: colors.bg.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Forum</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ForumCard item={item} onPress={() => router.push(`/(tabs)/forum/${item.id}`)} />
        )}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.text.muted }}>Henüz thread yok.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1 },
  header:      { paddingTop:50, paddingBottom: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth:1 },
  headerTitle: { fontSize: typography.xl, fontWeight:'700' },
  card:        { margin: spacing.md, marginBottom:0, padding: spacing.md, borderRadius: radius.lg, borderWidth:1 },
  catBadge:    { alignSelf:'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical:2, marginBottom: spacing.xs },
  catText:     { fontSize: typography.xs, fontWeight:'600' },
  title:       { fontSize: typography.md, fontWeight:'600', lineHeight:22, marginBottom: spacing.sm },
  meta:        { flexDirection:'row', justifyContent:'space-between' },
  metaText:    { fontSize: typography.xs },
  empty:       { flex:1, alignItems:'center', paddingTop:80 },
});
