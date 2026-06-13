import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

const THEME_OPTIONS = [
  { id: 'system', icon: 'phone-portrait-outline', label: 'Sistem' },
  { id: 'light',  icon: 'sunny-outline',          label: 'Açık' },
  { id: 'dark',   icon: 'moon-outline',           label: 'Koyu' },
];

function SectionHead({ title, accent, color }) {
  return (
    <View style={styles.sec}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={[styles.secTitle, { color }]}>{title}</Text>
    </View>
  );
}

export default function GorunumScreen() {
  const { colors, isDark, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const accent = isDark ? palette.brand.bright : colors.text.primary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.bg.deepest }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ width: 24 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Görünüm</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        {/* Tema */}
        <View style={styles.secWrap}>
          <SectionHead title="Tema" color={accent} />
          <View style={styles.cardRow}>
            {THEME_OPTIONS.map(opt => {
              const active = mode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setMode(opt.id)}
                  style={[styles.tcard, { borderColor: active ? accent : colors.border, backgroundColor: active ? accent + '14' : 'transparent' }]}
                >
                  <Ionicons name={opt.icon} size={20} color={active ? accent : colors.text.muted} />
                  <Text style={[styles.tname, { color: active ? accent : colors.text.secondary }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Önizleme */}
        <View style={styles.secWrap}>
          <SectionHead title="Önizleme" color={accent} />
          <View style={[styles.preview, { borderColor: colors.border }]}>
            <View style={styles.pvHead}>
              <View style={[styles.pvBadge, { backgroundColor: palette.fake.fill + '1a', borderColor: palette.fake.fill + '4d' }]}>
                <Text style={[styles.pvBadgeText, { color: palette.fake.fill }]}>YANILTICI</Text>
              </View>
              <Text style={[styles.pvTitle, { color: colors.text.primary }]}>Başlık Örneği</Text>
            </View>
            <Text style={[styles.pvBody, { color: colors.text.secondary }]}>Analiz açıklaması metni burada görünür ve seçtiğin boyuta göre ölçeklenir.</Text>
            <Text style={[styles.pvMeta, { color: colors.text.muted }]}>meta · kaynak · 2sa önce</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:    { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle:  { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 17 },

  secWrap:   { marginTop: spacing.lg },
  sec:       { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: spacing.sm },
  bar:       { width: 3, height: 15, borderRadius: 2 },
  secTitle:  { fontFamily: fonts.extrabold, fontSize: 13, letterSpacing: 0.2 },
  note:      { fontFamily: fonts.medium, fontSize: 11.5, marginBottom: spacing.md },

  cardRow:   { flexDirection: 'row', gap: spacing.sm },
  fcard:     { flex: 1, borderWidth: 1.5, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center', gap: 6 },
  aa:        { fontFamily: fonts.extrabold },
  fname:     { fontFamily: fonts.extrabold, fontSize: 9, letterSpacing: 0.6 },
  tcard:     { flex: 1, borderWidth: 1.5, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center', gap: 7 },
  tname:     { fontFamily: fonts.bold, fontSize: 12 },

  preview:   { borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, gap: 8 },
  pvHead:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pvBadge:   { borderWidth: 1, borderRadius: 2, paddingHorizontal: 7, paddingVertical: 2 },
  pvBadgeText: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5 },
  pvTitle:   { fontFamily: fonts.extrabold, fontSize: 16, flex: 1 },
  pvBody:    { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  pvMeta:    { fontFamily: fonts.medium, fontSize: 11 },
});
