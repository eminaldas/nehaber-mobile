import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HaberCard from '../../../components/cards/HaberCard';
import HeroCard from '../../../components/cards/HeroCard';
import DailySummaryCard from '../../../components/digest/DailySummaryCard';
import DailySummarySheet from '../../../components/digest/DailySummarySheet';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useNewsFeed } from '../../../hooks/useNewsFeed';
import { useTheme } from '../../../hooks/useTheme';

const CATEGORIES = [
  { label: 'Sizin İçin', value: null },
  { label: 'Gündem',     value: 'gündem' },
  { label: 'Ekonomi',    value: 'ekonomi' },
  { label: 'Spor',       value: 'spor' },
  { label: 'Sağlık',     value: 'sağlık' },
  { label: 'Teknoloji',  value: 'teknoloji' },
  { label: 'Kültür',     value: 'kültür' },
  { label: 'Yaşam',      value: 'yaşam' },
];

function TopBar() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topbar, {
      paddingTop: insets.top + spacing.sm,
      backgroundColor: colors.bg.base,
      borderBottomColor: 'rgba(255,255,255,0.14)',
    }]}>
      <MaterialCommunityIcons name="newspaper-variant-outline" size={22} color={colors.text.muted} />
      <Text style={[styles.logo, { color: colors.text.primary }]}>NeHaber</Text>
      <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
    </View>
  );
}

function FilterChips({ selected, onSelect }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.chipBar, { backgroundColor: colors.bg.base, borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CATEGORIES.map(cat => {
          const active = selected === cat.value;
          return (
            <Pressable key={String(cat.value)} onPress={() => onSelect(cat.value)} style={styles.tab} hitSlop={8}>
              <Text style={[styles.tabText, { color: active ? colors.text.primary : colors.text.muted }]}>
                {cat.label}
              </Text>
              <View style={[styles.tabUnderline, { backgroundColor: active ? palette.brand.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function HaberlerScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState(null);
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useNewsFeed(category);

  const items = data?.pages.flatMap(p => p.items) ?? [];
  const hero  = items[0];
  const rest  = items.slice(1);

  const open = (id) => router.push(`/(tabs)/haberler/${id}`);

  const [digestOpen, setDigestOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base }]}>
      <TopBar />
      <FilterChips selected={category} onSelect={setCategory} />

      {isLoading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {[1, 2, 3, 4, 5].map(i => <ShimmerCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <HaberCard item={item} onPress={() => open(item.id)} />}
          ListHeaderComponent={
            <>
              {hero ? <HeroCard item={hero} onPress={() => open(hero.id)} /> : null}
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
  topbar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  logo:      { fontFamily: fonts.logo, fontSize: 24, letterSpacing: 0.5 },
  chipBar:     { borderBottomWidth: 1 },
  chipRow:     { paddingHorizontal: spacing.md, gap: spacing.lg, alignItems: 'flex-end' },
  tab:         { paddingVertical: spacing.sm, alignItems: 'center', gap: 6 },
  tabText:     { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.2 },
  tabUnderline:{ height: 2, width: '100%', borderRadius: 2 },
  empty:     { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.sm },
  emptyText: { fontFamily: fonts.medium, fontSize: 14 },
});
