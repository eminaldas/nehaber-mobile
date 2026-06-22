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

export default function KategorilerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data: categories, isLoading } = useCategories();
  const { data: prefs } = useFeedPreferences();
  const save = useSaveCategorySelection();

  const all = categories ?? [];
  const initialSel = useMemo(() => {
    const hidden = new Set(prefs?.hiddenCategories ?? []);
    return all.filter(c => !hidden.has(c.slug)).map(c => c.slug);
  }, [all, prefs]);

  const [touched, setTouched] = useState(null); // null = henüz dokunulmadı
  const sel = touched ?? initialSel;

  const toggle = (slug) => {
    const base = touched ?? initialSel;
    setTouched(base.includes(slug) ? base.filter(s => s !== slug) : [...base, slug]);
  };

  const onDone = async () => {
    try {
      await save.mutateAsync({
        allSlugs: all.map(c => c.slug),
        selected: sel,
        currentHidden: prefs?.hiddenCategories ?? [],
      });
      router.back();
    } catch {
      toast.error('Tercih kaydedilemedi.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Kategorilerini Seç</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>Görmek istediklerini seç</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {all.map(cat => {
            const on = sel.includes(cat.slug);
            return (
              <Pressable
                key={cat.slug}
                onPress={() => toggle(cat.slug)}
                style={[styles.card, {
                  backgroundColor: on ? palette.brand.primary : 'transparent',
                  borderColor: on ? palette.brand.primary : colors.border,
                }]}
              >
                {on ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
                <Text style={[styles.cardText, { color: on ? '#fff' : colors.text.secondary }]}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: colors.bg.base, borderTopColor: colors.border }]}>
        <Pressable
          onPress={onDone}
          disabled={save.isPending}
          style={[styles.doneBtn, { backgroundColor: palette.brand.primary, opacity: save.isPending ? 0.6 : 1 }]}
        >
          <Text style={styles.doneText}>{save.isPending ? 'Kaydediliyor…' : `Bitti (${sel.length})`}</Text>
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
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md },
  card:      { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  cardText:  { fontFamily: fonts.semibold, fontSize: 14 },
  footer:    { paddingHorizontal: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  doneBtn:   { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  doneText:  { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
});
