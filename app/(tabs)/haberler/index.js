import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import HaberCard from '../../../components/cards/HaberCard';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useNewsFeed } from '../../../hooks/useNewsFeed';
import { useTheme } from '../../../hooks/useTheme';

const CATEGORIES = [
  { label: 'Tümü',       value: null },
  { label: 'Haberler',   value: 'haberler' },
  { label: 'Teknoloji',  value: 'teknoloji' },
  { label: 'Spor',       value: 'spor' },
  { label: 'Ekonomi',    value: 'ekonomi' },
  { label: 'Bilim',      value: 'bilim' },
];

function FilterChips({ selected, onSelect }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
      {CATEGORIES.map(cat => {
        const active = selected === cat.value;
        return (
          <Pressable
            key={String(cat.value)}
            style={[styles.chip, { backgroundColor: active ? palette.brand.primary : colors.bg.surface, borderColor: active ? palette.brand.primary : colors.border }]}
            onPress={() => onSelect(cat.value)}
          >
            <Text style={[styles.chipText, { color: active ? '#fff' : colors.text.muted }]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function HaberlerScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState(null);
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useNewsFeed(category);

  const items = data?.pages.flatMap(p => p.items) ?? [];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
        <FilterChips selected={category} onSelect={setCategory} />
        {[1,2,3,4,5].map(i => <ShimmerCard key={i} />)}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <View style={[styles.header, { backgroundColor: colors.bg.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>NeHaber</Text>
      </View>

      <FilterChips selected={category} onSelect={setCategory} />

      <FlashList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <HaberCard
            item={item}
            onPress={() => router.push(`/(tabs)/haberler/${item.id}`)}
          />
        )}
        estimatedItemSize={280}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.text.muted }}>Haber bulunamadı.</Text>
          </View>
        }
        ListFooterComponent={isFetchingNextPage
          ? <View style={{ paddingVertical: spacing.md }}><ShimmerCard /></View>
          : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingTop: 50, paddingBottom: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1 },
  headerTitle: { fontSize: typography.xl, fontWeight: '700' },
  chips:       { maxHeight: 48, marginVertical: spacing.sm },
  chip:        { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1 },
  chipText:    { fontSize: typography.sm, fontWeight: '500' },
  empty:       { flex:1, alignItems:'center', justifyContent:'center', paddingTop: 80 },
});
