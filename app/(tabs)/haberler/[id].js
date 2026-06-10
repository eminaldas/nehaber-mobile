import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Dimensions, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { getCachedSummary, getNewsDetail, summarizeNews } from '../../../services/newsService';

const { height: SCREEN_H } = Dimensions.get('window');

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

export default function HaberWebScreen() {
  const { id }     = useLocalSearchParams();
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();

  const { data: haber, isLoading } = useQuery({
    queryKey: ['news-detail', id],
    queryFn:  () => getNewsDetail(id),
  });

  const [webLoading, setWebLoading] = useState(true);

  // Özet bottom-sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [summary, setSummary]     = useState(null);
  const [sumState, setSumState]   = useState('idle'); // idle | loading | error
  const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
  const fade   = useRef(new Animated.Value(0)).current;

  // Hazır (cache'li) özet var mı? — üretmeden kontrol et
  const { data: cached } = useQuery({
    queryKey: ['news-summary-cache', id],
    queryFn:  () => getCachedSummary(id),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (cached?.exists && cached.summary) setSummary(cached.summary);
  }, [cached]);

  useEffect(() => {
    if (sheetOpen) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(sheetY, { toValue: SCREEN_H, duration: 240, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [sheetOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  async function openSummary() {
    setSheetOpen(true);
    if (summary || sumState === 'loading') return;   // zaten varsa tekrar üretme
    setSumState('loading');
    try {
      const data = await summarizeNews(id);
      setSummary(data.summary);
      setSumState('idle');
    } catch {
      setSumState('error');
    }
  }

  const hasSummary = !!summary;

  const url = haber?.source_url;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      {/* Üst bar */}
      <View style={[styles.topbar, {
        paddingTop: insets.top + spacing.sm,
        backgroundColor: colors.bg.deepest,
        borderBottomColor: colors.border,
      }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.topbarCenter}>
          <Text style={[styles.topbarTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {haber?.source_name ?? 'NeHaber'}
          </Text>
          {url ? (
            <Text style={[styles.topbarUrl, { color: colors.text.muted }]} numberOfLines={1}>
              {domainOf(url)}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={() => url && Linking.openURL(url)} hitSlop={8} style={styles.iconBtn} disabled={!url}>
          <Ionicons name="open-outline" size={20} color={url ? colors.text.muted : 'transparent'} />
        </Pressable>
      </View>

      {/* İçerik */}
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={palette.brand.primary} size="large" /></View>
      ) : !url ? (
        <View style={styles.center}>
          <Ionicons name="link-outline" size={40} color={colors.text.muted} />
          <Text style={[styles.muted, { color: colors.text.muted }]}>Bu haberin kaynak linki yok.</Text>
          <Text style={[styles.mutedTitle, { color: colors.text.secondary }]}>{haber?.title}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: url }}
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => setWebLoading(false)}
            style={{ flex: 1, backgroundColor: colors.bg.base }}
            startInLoadingState={false}
          />
          {webLoading && (
            <View style={[styles.webLoader, { backgroundColor: colors.bg.base }]}>
              <ActivityIndicator color={palette.brand.primary} size="large" />
            </View>
          )}
        </View>
      )}

      {/* Özetle FAB */}
      {!isLoading && (
        <Pressable
          onPress={openSummary}
          style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 76, opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name={hasSummary ? 'document-text' : 'sparkles'} size={18} color="#06140d" />
          <Text style={styles.fabText}>{hasSummary ? 'Özeti Gör' : 'Özetle'}</Text>
        </Pressable>
      )}

      {/* Özet bottom-sheet — Modal (WebView üstünde garantili) */}
      <Modal transparent visible={mounted} animationType="none" onRequestClose={() => setSheetOpen(false)} statusBarTranslucent>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: fade }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetOpen(false)} />
          </Animated.View>

          <Animated.View
            style={[styles.sheet, {
              backgroundColor: colors.bg.surface,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY: sheetY }],
            }]}
          >
            <View style={styles.topAccent} />
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHead}>
              <View style={styles.sheetHeadLeft}>
                <View style={styles.sheetIcon}><Ionicons name="sparkles" size={15} color="#06140d" /></View>
                <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>AI Özet</Text>
              </View>
              <Pressable onPress={() => setSheetOpen(false)} hitSlop={10} style={[styles.sheetClose, { borderColor: colors.border }]}>
                <Ionicons name="close" size={18} color={colors.text.secondary} />
              </Pressable>
            </View>

            {sumState === 'loading' ? (
              <View style={styles.sheetLoading}>
                <ActivityIndicator color={palette.brand.primary} size="large" />
                <Text style={[styles.muted, { color: colors.text.muted }]}>Özetleniyor…</Text>
              </View>
            ) : sumState === 'error' ? (
              <View style={styles.sheetLoading}>
                <Text style={[styles.muted, { color: palette.fake.fill }]}>Özet oluşturulamadı.</Text>
                <Pressable onPress={openSummary}><Text style={[styles.retry, { color: palette.brand.primary }]}>Tekrar dene</Text></Pressable>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: SCREEN_H * 0.55 }} contentContainerStyle={{ paddingBottom: spacing.sm }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.summaryText, { color: colors.text.secondary }]}>{summary}</Text>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, gap: spacing.xs },
  iconBtn:      { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topbarCenter: { flex: 1, alignItems: 'center' },
  topbarTitle:  { fontFamily: fonts.bold, fontSize: 15 },
  topbarUrl:    { fontFamily: fonts.medium, fontSize: 11, marginTop: 1 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  muted:        { fontFamily: fonts.medium, fontSize: 14 },
  mutedTitle:   { fontFamily: fonts.bold, fontSize: 16, textAlign: 'center', lineHeight: 22 },
  webLoader:    { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fab:          { position: 'absolute', right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.brand.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  fabText:      { fontFamily: fonts.extrabold, fontSize: 14, color: '#06140d', letterSpacing: 0.3 },
  modalRoot:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:        { borderTopWidth: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  topAccent:    { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: palette.brand.primary },
  sheetHandle:  { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: '#3a434d', marginBottom: spacing.md },
  sheetHead:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sheetHeadLeft:{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sheetIcon:    { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brand.primary },
  sheetTitle:   { fontFamily: fonts.extrabold, fontSize: 18, letterSpacing: -0.2 },
  sheetClose:   { width: 32, height: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sheetLoading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  retry:        { fontFamily: fonts.bold, fontSize: 14, marginTop: spacing.xs },
  summaryText:  { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25 },
});
