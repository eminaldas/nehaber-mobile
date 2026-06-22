import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { useFeedPreferences } from '../../hooks/useFeedPreferences';
import { useTheme } from '../../hooks/useTheme';

// GET /categories başarısızsa şerit bu listeye düşer (offline fallback).
const FALLBACK = [
  { slug: 'gündem', name: 'Gündem' }, { slug: 'ekonomi', name: 'Ekonomi' },
  { slug: 'spor', name: 'Spor' },     { slug: 'sağlık', name: 'Sağlık' },
  { slug: 'teknoloji', name: 'Teknoloji' }, { slug: 'kültür', name: 'Kültür' },
  { slug: 'yaşam', name: 'Yaşam' },
];

export default function CategoryBar({ selected, onSelect }) {
  const { colors } = useTheme();
  const { isAuth } = useAuth();
  const { data: categories, isError } = useCategories();
  const { data: prefs } = useFeedPreferences();

  const all = (isError || !categories?.length) ? FALLBACK : categories;
  const hidden = new Set(isAuth ? (prefs?.hiddenCategories ?? []) : []);
  const visible = all.filter(c => !hidden.has(c.slug));
  const chips = [{ slug: null, name: 'Sizin İçin' }, ...visible];

  return (
    <View style={[styles.bar, { backgroundColor: colors.bg.base, borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {chips.map(cat => {
          const active = selected === cat.slug;
          return (
            <Pressable key={String(cat.slug)} onPress={() => onSelect(cat.slug)} style={styles.tab} hitSlop={8}>
              <Text style={[styles.tabText, { color: active ? colors.text.primary : colors.text.muted }]}>{cat.name}</Text>
              <View style={[styles.underline, { backgroundColor: active ? palette.brand.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar:       { borderBottomWidth: 1 },
  row:       { paddingHorizontal: spacing.md, gap: spacing.lg, alignItems: 'flex-end' },
  tab:       { paddingVertical: spacing.sm, alignItems: 'center', gap: 6 },
  tabText:   { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.2 },
  underline: { height: 2, width: '100%', borderRadius: 2 },
});
