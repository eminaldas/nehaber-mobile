import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';

// Düz metin paragrafı (overall_assessment, domain_context, source_credibility, verdict_explanation)
export function TextSection({ text }) {
  const { colors } = useTheme();
  if (!text) return null;
  return <Text style={[styles.p, { color: colors.text.secondary }]}>{text}</Text>;
}

// Kredibilite / hijyen segment bar (web MetricBar + CredibilityScore karşılığı)
export function MetricBar({ score, label }) {
  const { colors } = useTheme();
  if (score == null) return null;
  const s = Math.round(score);
  const color = s >= 60 ? palette.verdict.authentic : s >= 35 ? palette.verdict.iddia : palette.verdict.fake;
  const SEGS = 16, filled = Math.round((s / 100) * SEGS);
  return (
    <View>
      <Text style={[styles.bigScore, { color }]}>{s}<Text style={[styles.scoreMax, { color: colors.text.muted }]}> / 100</Text></Text>
      <View style={styles.segRow}>
        {Array.from({ length: SEGS }).map((_, i) => (
          <View key={i} style={[styles.seg, { backgroundColor: i < filled ? color : colors.border }]} />
        ))}
      </View>
      {!!label && <Text style={[styles.segLabel, { color: colors.text.secondary }]}>{label}</Text>}
    </View>
  );
}

// Madde listesi (decisive_factors, numeric_claims, precedent_cases, propaganda_techniques)
export function BulletList({ items, accent = palette.brand.primary }) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((it, i) => {
        const text = typeof it === 'string' ? it
          : it.text || it.label || it.factor || it.claim || it.technique || it.title || JSON.stringify(it);
        return (
          <View key={i} style={styles.bullet}>
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <Text style={[styles.bulletText, { color: colors.text.secondary }]}>{text}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Doğrulama bulguları (fact_checks: [{claim, verdict, explanation, source_url, source_title}])
export function FactChecks({ items }) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((f, i) => {
        const v = (f.verdict || '').toUpperCase();
        const color = v.includes('DOĞRU') || v.includes('TRUE') ? palette.verdict.authentic
          : v.includes('YANLIŞ') || v.includes('FALSE') ? palette.verdict.fake : palette.verdict.iddia;
        return (
          <View key={i} style={[styles.fact, { borderColor: colors.border }]}>
            {!!f.verdict && <Text style={[styles.factVerdict, { color }]}>{f.verdict}</Text>}
            <Text style={[styles.factClaim, { color: colors.text.primary }]}>{f.claim || f.text}</Text>
            {!!f.explanation && <Text style={[styles.p, { color: colors.text.secondary }]}>{f.explanation}</Text>}
            {!!f.source_url && (
              <Pressable style={styles.factSrc} onPress={() => Linking.openURL(f.source_url)}>
                <Ionicons name="open-outline" size={11} color={palette.brand.primary} />
                <Text style={[styles.factSrcText, { color: palette.brand.primary }]} numberOfLines={1}>{f.source_title || f.source_url}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  p:          { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  bigScore:   { fontFamily: fonts.extrabold, fontSize: 40 },
  scoreMax:   { fontFamily: fonts.medium, fontSize: 14 },
  segRow:     { flexDirection: 'row', gap: 3, marginTop: spacing.sm },
  seg:        { flex: 1, height: 8 },
  segLabel:   { fontFamily: fonts.medium, fontSize: 12, marginTop: spacing.sm },
  bullet:     { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot:        { width: 6, height: 6, marginTop: 7 },
  bulletText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, flex: 1 },
  fact:       { borderWidth: 1, padding: spacing.sm, gap: 4 },
  factVerdict:{ fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  factClaim:  { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  factSrc:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  factSrcText:{ fontFamily: fonts.medium, fontSize: 11, flex: 1 },
});
