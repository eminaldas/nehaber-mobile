import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import CornerBrackets from './CornerBrackets';

const STEPS = [
  { label: 'Metin analiz ediliyor',     icon: 'scan-outline' },
  { label: 'NLP sinyalleri hesaplandı', icon: 'hardware-chip-outline' },
  { label: 'Kaynaklar taranıyor',       icon: 'globe-outline' },
  { label: 'Gemini değerlendiriyor',    icon: 'sparkles-outline' },
  { label: 'Sonuç hazırlanıyor',        icon: 'shield-checkmark-outline' },
];
const TIPS = [
  'Koordineli yayılan haberler gerçeklere göre 6× daha hızlı yayılır.',
  '"Şok", "Bomba", "Flaş" gibi kelimeler clickbait\'in en güçlü göstergesidir.',
  'Anonim kaynaklı haberler gerçek olma ihtimalini %40 düşürür.',
  'Haberin tarihini kontrol edin — eski haberler yeni gibi sunulabilir.',
  'Resmi kaynak referansı veren haberler daha güvenilirdir.',
  'Paylaşmadan önce en az bir bağımsız kaynaktan doğrulayın.',
];
// analysisStage -> tamamlanmış minimum adım indeksi (web stageMinStep)
function minStep(stage) {
  if (stage === 'gemini') return 3;
  if (stage === 'source_discovery') return 2;
  if (stage === 'nlp') return 1;
  return 0;
}
const PCT_BY_DONE = [18, 30, 48, 75, 90, 95];

export default function LoadingStepper({ analysisStage }) {
  const { colors } = useTheme();
  const [active, setActive] = useState(0);   // şu an çalışan adım
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));

  // analysisStage geldikçe adımı ileri sar; yoksa zamanlayıcıyla otomatik ilerlet
  useEffect(() => {
    const m = minStep(analysisStage);
    setActive(a => Math.max(a, m));
  }, [analysisStage]);

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a < STEPS.length - 1 ? a + 1 : a)), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTip(t => (t + 1) % TIPS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const pct = PCT_BY_DONE[active] ?? 90;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg.surface, borderColor: colors.border, borderTopColor: palette.brand.primary }]}>
      <CornerBrackets />
      <View style={[styles.head, { borderBottomColor: colors.border }]}>
        <ActivityIndicator color={palette.brand.primary} size="small" />
        <Text style={[styles.headText, { color: palette.brand.primary }]}>// ANALİZ DEVAM EDİYOR</Text>
        <Text style={[styles.pct, { color: palette.brand.primary }]}>%{pct}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: palette.brand.primary }]} />
      </View>

      <View style={styles.steps}>
        {STEPS.map((s, i) => {
          const done = i < active, current = i === active;
          if (i > active) return null;
          return (
            <View key={i} style={styles.step}>
              {done
                ? <Ionicons name="checkmark-circle" size={16} color={palette.brand.primary} />
                : <ActivityIndicator color={palette.brand.primary} size="small" />}
              <Ionicons name={s.icon} size={13} color={palette.brand.primary} style={{ opacity: done ? 0.45 : 1 }} />
              <Text style={[styles.stepText, { color: colors.text.primary, opacity: done ? 0.55 : 1, fontFamily: current ? fonts.bold : fonts.regular }]}>
                {s.label}{current ? '…' : ''}
              </Text>
              {done && <Text style={[styles.ok, { color: palette.brand.primary }]}>OK</Text>}
            </View>
          );
        })}
      </View>

      <View style={[styles.tipBox, { borderColor: colors.border }]}>
        <Text style={[styles.tip, { color: colors.text.secondary }]}>"{TIPS[tip]}"</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { borderWidth: 1, borderTopWidth: 3, overflow: 'hidden' },
  head:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1 },
  headText: { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 2, flex: 1 },
  pct:      { fontFamily: fonts.extrabold, fontSize: 14 },
  track:    { height: 3 },
  fill:     { height: '100%' },
  steps:    { padding: spacing.md, gap: spacing.md },
  step:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepText: { fontSize: 13, flex: 1 },
  ok:       { fontFamily: fonts.bold, fontSize: 9, opacity: 0.6 },
  tipBox:   { marginHorizontal: spacing.md, marginBottom: spacing.md, borderWidth: 1, padding: spacing.md },
  tip:      { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
});
