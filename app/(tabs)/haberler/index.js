import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import HaberCard from '../../../components/cards/HaberCard';
import HeroCard from '../../../components/cards/HeroCard';
import TrendRail from '../../../components/cards/TrendRail';
import DailySummaryCard from '../../../components/digest/DailySummaryCard';
import DailySummarySheet from '../../../components/digest/DailySummarySheet';
import AppHeader from '../../../components/ui/AppHeader';
import CategoryBar from '../../../components/news/CategoryBar';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useNewsFeed } from '../../../hooks/useNewsFeed';
import { usePopularNews } from '../../../hooks/usePopularNews';
import { useTheme } from '../../../hooks/useTheme';
import { searchNews } from '../../../services/newsService';

export default function HaberlerScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState(null);
  const [q, setQ] = useState('');
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useNewsFeed(category);
  const { data: trending } = usePopularNews();
  const [digestOpen, setDigestOpen] = useState(false);

  const items = data?.pages.flatMap(p => p.items) ?? [];
  const hero  = items[0];
  const rest  = items.slice(1);
  const open = (id) => router.push(`/(tabs)/haberler/${id}`);

  const query = q.trim();
  const searching = query.length > 0;
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['news-search', query],
    queryFn: () => searchNews(query),
    enabled: searching,
  });
  const searchItems = searchData?.items ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <AppHeader sectionIcon="search" onSearch={setQ} searchPlaceholder="Haberlerde ara…" />

      {searching ? (
        <FlatList
          data={searchItems}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <HaberCard item={item} onPress={() => open(item.id)} />}
          contentContainerStyle={{ paddingBottom: 96 }}
          ListHeaderComponent={<Text style={[styles.resCap, { color: colors.text.muted }]}>“{query}” · {searchData?.total ?? 0} sonuç</Text>}
          ListEmptyComponent={
            <View style={styles.empty}>
              {searchLoading ? <ActivityIndicator color={palette.brand.primary} /> : <Text style={[styles.emptyText, { color: colors.text.muted }]}>Sonuç bulunamadı.</Text>}
            </View>
          }
        />
      ) : isLoading ? (
        <>
          <CategoryBar selected={category} onSelect={setCategory} />
          <View style={{ paddingTop: spacing.sm }}>{[1, 2, 3, 4, 5].map(i => <ShimmerCard key={i} />)}</View>
        </>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <HaberCard item={item} onPress={() => open(item.id)} />}
          ListHeaderComponent={
            <>
              <CategoryBar selected={category} onSelect={setCategory} />
              {hero ? <HeroCard item={hero} onPress={() => open(hero.id)} /> : null}
              {category === null ? <TrendRail items={trending} onOpen={open} /> : null}
              <DailySummaryCard onPress={() => setDigestOpen(true)} />
            </>
          }
          contentContainerStyle={{ paddingBottom: 96 }}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            !hero ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="newspaper-variant-outline" size={40} color={colors.text.muted} />
                <Text style={[styles.emptyText, { color: colors.text.muted }]}>Haber bulunamadı.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={isFetchingNextPage ? <View style={{ paddingTop: spacing.sm }}><ShimmerCard /></View> : null}
        />
      )}

      <DailySummarySheet open={digestOpen} onClose={() => setDigestOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  resCap:    { fontFamily: fonts.bold, fontSize: 12, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 2 },
  empty:     { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 14 },
});
