import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import CornerBrackets from './CornerBrackets';

const TABS = [
  { key: 'text', label: 'METİN', icon: 'document-text-outline' },
  { key: 'url',  label: 'LİNK',  icon: 'link-outline' },
];

export default function AnalysisForm({ mode, setMode, text, setText, url, setUrl, onSubmit, loading }) {
  const { colors } = useTheme();
  const filled = mode === 'text' ? text.length > 0 : url.length > 0;
  const disabled = loading || !filled;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
      <CornerBrackets />

      {/* Sekme switcher */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {TABS.map(t => {
          const active = mode === t.key;
          return (
            <Pressable key={t.key} onPress={() => !loading && setMode(t.key)} style={styles.tab}>
              <Ionicons name={t.icon} size={15} color={active ? palette.brand.bright : colors.text.muted} />
              <Text style={[styles.tabText, { color: active ? palette.brand.bright : colors.text.muted }]}>{t.label}</Text>
              {active && <View style={styles.tabUnderline} />}
            </Pressable>
          );
        })}
      </View>

      {/* Giriş */}
      <View style={styles.body}>
        {mode === 'text' ? (
          <>
            <View style={styles.rowBetween}>
              <Text style={[styles.mono, { color: colors.text.muted }]}>// HEDEF_VERİ_GİRİŞİ</Text>
              <Text style={[styles.mono, { color: colors.text.muted }]}>[{text.length}/5000 KAR]</Text>
            </View>
            <TextInput
              style={[styles.textarea, {
                color: colors.text.primary,
                borderColor: filled ? palette.brand.primary + '66' : colors.border,
                backgroundColor: colors.bg.base,
              }]}
              placeholder="> Şüpheli haberi buraya yapıştırın..."
              placeholderTextColor={colors.text.muted}
              value={text} onChangeText={setText} multiline maxLength={5000} textAlignVertical="top"
              editable={!loading}
            />
          </>
        ) : (
          <>
            <Text style={[styles.mono, { color: colors.text.muted, marginBottom: spacing.sm }]}>// URL_HEDEF_GİRİŞİ</Text>
            <View style={[styles.urlBox, { borderColor: filled ? palette.brand.primary + '66' : colors.border, backgroundColor: colors.bg.base }]}>
              <Ionicons name="link-outline" size={16} color={colors.text.muted} />
              <TextInput
                style={[styles.urlInput, { color: colors.text.primary }]}
                placeholder="https://ornek-haber.com/makale"
                placeholderTextColor={colors.text.muted}
                value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url"
                editable={!loading} onSubmitEditing={() => !disabled && onSubmit()}
              />
            </View>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.mono, { color: colors.text.muted }]}>
          {mode === 'text' ? `// ${text.length}_KAR` : '// HAZIR'}
        </Text>
        <Pressable onPress={onSubmit} disabled={disabled}
          style={[styles.btn, { backgroundColor: palette.brand.primary, opacity: disabled ? 0.4 : 1 }]}>
          {loading
            ? <ActivityIndicator color="#06140d" size="small" />
            : <Ionicons name="search" size={15} color="#06140d" />}
          <Text style={styles.btnText}>{loading ? 'GÖNDERİLİYOR…' : 'ANALİZ_BAŞLAT'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { borderWidth: 1, overflow: 'hidden' },
  tabs:        { flexDirection: 'row', borderBottomWidth: 1 },
  tab:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 14, position: 'relative' },
  tabText:     { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5 },
  tabUnderline:{ position: 'absolute', left: spacing.sm, right: spacing.sm, bottom: -1, height: 2, backgroundColor: palette.brand.bright },
  body:        { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  rowBetween:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mono:        { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1 },
  textarea:    { borderWidth: 1, minHeight: 170, padding: spacing.md, fontSize: 16, fontFamily: fonts.medium },
  urlBox:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 12 },
  urlInput:    { flex: 1, fontSize: 15, fontFamily: fonts.medium },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  btn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  btnText:     { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 1.5, color: '#06140d' },
});
