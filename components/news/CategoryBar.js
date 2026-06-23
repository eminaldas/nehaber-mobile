import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { useFeedPreferences } from '../../hooks/useFeedPreferences';
import { useTheme } from '../../hooks/useTheme';

// GET /categories başarısızsa şerit bu listeye düşer (offline fallback).
const FALLBACK = [
  { slug: 'gündem', name: 'Gündem', subcategories: [] }, { slug: 'ekonomi', name: 'Ekonomi', subcategories: [] },
  { slug: 'spor', name: 'Spor', subcategories: [] },     { slug: 'sağlık', name: 'Sağlık', subcategories: [] },
  { slug: 'teknoloji', name: 'Teknoloji', subcategories: [] }, { slug: 'kültür', name: 'Kültür', subcategories: [] },
  { slug: 'yaşam', name: 'Yaşam', subcategories: [] },
];

export default function CategoryBar({ selected, onSelect, subcategory, onSelectSub, onCustomize }) {
  const { colors } = useTheme();
  const { isAuth } = useAuth();
  const { data: categories, isError } = useCategories();
  const { data: prefs } = useFeedPreferences();

  const all = (isError || !categories?.length) ? FALLBACK : categories;
  const hidden = new Set(isAuth ? (prefs?.hiddenCategories ?? []) : []);
  const hiddenSubs = new Set(isAuth ? (prefs?.hiddenSubcategories ?? []) : []);
  const visible = all.filter(c => !hidden.has(c.slug));
  const chips = [{ slug: null, name: 'Sizin İçin' }, ...visible];

  // Aktif ana kategorinin gizli olmayan alt kategorileri (ikincil şerit)
  const activeCat = selected ? all.find(c => c.slug === selected) : null;
  const subChips = (activeCat?.subcategories ?? []).filter(s => !hiddenSubs.has(`${selected}/${s.slug}`));

  return (
    <View style={{ backgroundColor: colors.bg.base }}>
      <View style={[styles.bar, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
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
        {/* Özelleştir: şeritten ayrı, sağda sabit kalır */}
        <Pressable onPress={onCustomize} style={[styles.gear, { borderLeftColor: colors.border }]} hitSlop={8}>
          <Ionicons name="options-outline" size={18} color={colors.text.muted} />
        </Pressable>
      </View>

      {/* Alt kategori şeridi — aktif ana kategorinin altları */}
      {subChips.length > 0 ? (
        <View style={[styles.subBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            {[{ slug: null, name: 'Tümü' }, ...subChips].map(s => {
              const active = (subcategory ?? null) === s.slug;
              return (
                <Pressable
                  key={String(s.slug)}
                  onPress={() => onSelectSub?.(s.slug)}
                  style={[styles.subChip, {
                    backgroundColor: active ? palette.brand.primary : 'transparent',
                    borderColor: active ? palette.brand.primary : colors.border,
                  }]}
                  hitSlop={6}
                >
                  <Text style={[styles.subChipText, { color: active ? '#fff' : colors.text.muted }]}>{s.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar:       { borderBottomWidth: 1, flexDirection: 'row', alignItems: 'stretch' },
  scroll:    { flex: 1 },
  row:       { paddingHorizontal: spacing.md, gap: spacing.lg, alignItems: 'flex-end' },
  tab:       { paddingVertical: spacing.sm, alignItems: 'center', gap: 6 },
  tabText:   { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.2 },
  underline: { height: 2, width: '100%', borderRadius: 2 },
  gear:      { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.md, borderLeftWidth: 1 },
  subBar:    { borderBottomWidth: 1 },
  subRow:    { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  subChip:   { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 5 },
  subChipText: { fontFamily: fonts.semibold, fontSize: 12 },
});
