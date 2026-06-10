import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Dimensions, Modal, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useDigest } from '../../hooks/useDigest';
import { parseDigest, relSlot } from '../../services/digestService';
import FadeInView from '../ui/FadeInView';

const { height: SCREEN_H } = Dimensions.get('window');

export default function DailySummarySheet({ open, onClose }) {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const { data, isLoading, isError } = useDigest();

  const [mounted, setMounted] = useState(open);
  const y       = useRef(new Animated.Value(SCREEN_H)).current;
  const fade    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(y, { toValue: SCREEN_H, duration: 240, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const parsed = data?.summary_text ? parseDigest(data.summary_text) : null;
  const hasContent = parsed && (parsed.summary || parsed.sections?.length);

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, {
            backgroundColor: colors.bg.surface,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.lg,
            transform: [{ translateY: y }],
          }]}
        >
          {/* üst emerald aksan + handle */}
          <View style={styles.topAccent} />
          <View style={styles.handle} />

          {/* başlık */}
          <View style={styles.header}>
            <View style={styles.headLeft}>
              <View style={styles.iconBox}><Ionicons name="sparkles" size={16} color="#06140d" /></View>
              <View>
                <Text style={[styles.title, { color: colors.text.primary }]}>Günün Özeti</Text>
                {data?.slot ? (
                  <Text style={[styles.subtitle, { color: colors.text.muted }]}>
                    {data.slot} · {data.article_count} haber analiz edildi
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={[styles.closeBtn, { borderColor: colors.border }]}>
              <Ionicons name="close" size={18} color={colors.text.secondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.state}><ActivityIndicator color={palette.brand.primary} size="large" /></View>
          ) : !hasContent || isError ? (
            <View style={styles.state}>
              <Ionicons name="sparkles-outline" size={42} color={colors.text.muted} />
              <Text style={[styles.stateTitle, { color: colors.text.primary }]}>Özet henüz hazır değil</Text>
              <Text style={[styles.stateText, { color: colors.text.muted }]}>İlk özet 09:00'da gelir. Gün içinde 4 kez güncellenir.</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: SCREEN_H * 0.62 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              {parsed.summary ? (
                <FadeInView style={styles.lead}>
                  <View style={styles.leadBar} />
                  <Text style={[styles.leadText, { color: colors.text.primary }]}>{parsed.summary}</Text>
                </FadeInView>
              ) : null}

              {parsed.sections?.map((sec, i) => (
                <FadeInView key={i} delay={80 + i * 70} style={styles.section}>
                  <View style={styles.secTitleRow}>
                    <View style={styles.secBar} />
                    <Text style={styles.secTitle}>{(sec.title || '').toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.secText, { color: colors.text.secondary }]}>{sec.text}</Text>
                </FadeInView>
              ))}

              {data.topics?.length > 0 && (
                <FadeInView delay={140} style={styles.topics}>
                  {data.topics.map((t, i) => (
                    <View key={i} style={styles.topic}>
                      <Text style={[styles.topicText, { color: colors.text.secondary }]}>#{t}</Text>
                    </View>
                  ))}
                </FadeInView>
              )}

              <Text style={[styles.footer, { color: colors.text.muted }]}>{relSlot(data.slot)}</Text>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, justifyContent: 'flex-end' },
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:       { borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  topAccent:   { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: palette.brand.primary },
  handle:      { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: '#3a434d', marginBottom: spacing.md },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headLeft:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox:     { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brand.primary },
  title:       { fontFamily: fonts.extrabold, fontSize: 20, letterSpacing: -0.3 },
  subtitle:    { fontFamily: fonts.medium, fontSize: 11, marginTop: 1 },
  closeBtn:    { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  state:       { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  stateTitle:  { fontFamily: fonts.bold, fontSize: 16 },
  stateText:   { fontFamily: fonts.medium, fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: spacing.lg },
  scroll:      { paddingBottom: spacing.md },
  lead:        { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  leadBar:     { width: 3, backgroundColor: palette.brand.primary },
  leadText:    { flex: 1, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 25 },
  section:     { marginBottom: spacing.lg, gap: 6 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  secBar:      { width: 14, height: 3, backgroundColor: palette.brand.primary },
  secTitle:    { fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 1, color: palette.brand.primary },
  secText:     { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  topics:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs, marginBottom: spacing.md },
  topic:       { borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)', paddingHorizontal: 9, paddingVertical: 4 },
  topicText:   { fontFamily: fonts.semibold, fontSize: 12 },
  footer:      { fontFamily: fonts.medium, fontSize: 12, textAlign: 'center', marginTop: spacing.xs },
});
