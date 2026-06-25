import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useCategories } from '../../../hooks/useCategories';
import { useFeedPreferences, useSaveCategorySelection } from '../../../hooks/useFeedPreferences';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';

// Cam tab bar yüksekliği (60) + boşluk — footer butonu barın arkasında kalmasın
const TAB_BAR_CLEARANCE = 72;

export default function KategorilerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data: categories, isLoading } = useCategories();
  const { data: prefs } = useFeedPreferences();
  const save = useSaveCategorySelection();

  const all = categories ?? [];

  // Başlangıç seçimi = görünür olanlar (tüm − gizli), backend tercihlerinden
  const initial = useMemo(() => {
    const hc = new Set(prefs?.hiddenCategories ?? []);
    const hs = new Set(prefs?.hiddenSubcategories ?? []);
    const mains = new Set(all.filter(c => !hc.has(c.slug)).map(c => c.slug));
    const subs = new Set();
    all.forEach(c => (c.subcategories ?? []).forEach(s => {
      const pair = `${c.slug}/${s.slug}`;
      if (!hs.has(pair)) subs.add(pair);
    }));
    return { mains, subs };
  }, [all, prefs]);

  const [state, setState] = useState(null); // null = henüz dokunulmadı
  const sel = state ?? initial;
  const [expanded, setExpanded] = useState({});

  const toggleMain = (slug) => {
    const base = state ?? initial;
    const mains = new Set(base.mains);
    mains.has(slug) ? mains.delete(slug) : mains.add(slug);
    setState({ mains, subs: base.subs });
  };

  const toggleSub = (mainSlug, subSlug) => {
    const base = state ?? initial;
    const subs = new Set(base.subs);
    const pair = `${mainSlug}/${subSlug}`;
    subs.has(pair) ? subs.delete(pair) : subs.add(pair);
    setState({ mains: base.mains, subs });
  };

  const onDone = async () => {
    const allSubPairs = [];
    const selectedSubs = [];
    all.forEach(c => {
      if (!sel.mains.has(c.slug)) return; // kapalı ana → altlarını yönetme
      (c.subcategories ?? []).forEach(s => {
        const pair = `${c.slug}/${s.slug}`;
        allSubPairs.push(pair);
        if (sel.subs.has(pair)) selectedSubs.push(pair);
      });
    });
    try {
      await save.mutateAsync({
        allMainSlugs:      all.map(c => c.slug),
        selectedMains:     [...sel.mains],
        currentHiddenCats: prefs?.hiddenCategories ?? [],
        allSubPairs,
        selectedSubs,
        currentHiddenSubs: prefs?.hiddenSubcategories ?? [],
      });
      router.back();
    } catch {
      toast.error('Tercih kaydedilemedi.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Kapat">
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Kategorilerini Seç</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>Ana kategoriyi aç/kapat, oka basıp alt kategorileri seç</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand.primary} /></View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
          {all.map(cat => {
            const on = sel.mains.has(cat.slug);
            const subs = cat.subcategories ?? [];
            const isOpen = !!expanded[cat.slug];
            return (
              <View key={cat.slug} style={[styles.block, { borderColor: colors.border }]}>
                <View style={styles.row}>
                  <Pressable style={styles.rowMain} onPress={() => toggleMain(cat.slug)} hitSlop={6}>
                    <View style={[styles.check, { borderColor: on ? palette.brand.primary : colors.border, backgroundColor: on ? palette.brand.primary : 'transparent' }]}>
                      {on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                    </View>
                    <Text style={[styles.mainName, { color: on ? colors.text.primary : colors.text.muted }]}>{cat.name}</Text>
                  </Pressable>
                  {subs.length > 0 ? (
                    <Pressable onPress={() => setExpanded(p => ({ ...p, [cat.slug]: !isOpen }))} hitSlop={10} style={styles.chevron}>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.muted} />
                    </Pressable>
                  ) : null}
                </View>

                {isOpen && subs.length > 0 ? (
                  <View style={styles.subWrap}>
                    {subs.map(s => {
                      const pair = `${cat.slug}/${s.slug}`;
                      const subOn = on && sel.subs.has(pair);
                      return (
                        <Pressable
                          key={pair}
                          onPress={() => on && toggleSub(cat.slug, s.slug)}
                          disabled={!on}
                          style={[styles.chip, {
                            backgroundColor: subOn ? palette.brand.primary : 'transparent',
                            borderColor: subOn ? palette.brand.primary : colors.border,
                            opacity: on ? 1 : 0.4,
                          }]}
                        >
                          <Text style={[styles.chipText, { color: subOn ? '#fff' : colors.text.secondary }]}>{s.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE, backgroundColor: colors.bg.base, borderTopColor: colors.border }]}>
        <Pressable
          onPress={onDone}
          disabled={save.isPending}
          style={[styles.doneBtn, { backgroundColor: palette.brand.primary, opacity: save.isPending ? 0.6 : 1 }]}
        >
          <Text style={styles.doneText}>{save.isPending ? 'Kaydediliyor…' : `Bitti (${sel.mains.size})`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  title:     { fontFamily: fonts.extrabold, fontSize: 20 },
  sub:       { fontFamily: fonts.medium, fontSize: 13, marginTop: 2 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:    { flex: 1 },
  list:      { padding: spacing.md, gap: spacing.sm },
  block:     { borderWidth: 1, borderRadius: radius.md },
  row:       { flexDirection: 'row', alignItems: 'center' },
  rowMain:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  check:     { width: 22, height: 22, borderRadius: radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  mainName:  { fontFamily: fonts.bold, fontSize: 15 },
  chevron:   { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  subWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  chip:      { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  chipText:  { fontFamily: fonts.semibold, fontSize: 13 },
  footer:    { paddingHorizontal: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  doneBtn:   { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  doneText:  { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
});
