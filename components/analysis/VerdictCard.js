import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { alpha, fonts, getAnalysisTheme, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import ScoreRing from './ScoreRing';

export default function VerdictCard({ result }) {
  const { colors } = useTheme();
  const status = (result.ai_comment?.gemini_verdict || result.prediction || '').toUpperCase();
  const theme  = getAnalysisTheme(status);
  const isUrl  = result.truth_score != null;
  const score  = isUrl
    ? parseFloat(result.truth_score)
    : (() => { const r = parseFloat(result.confidence || 0); return r <= 1 ? r * 100 : r; })();
  const badge = isUrl ? 'URL Analizi'
    : (result.is_direct_match || result.isDirectMatch) ? 'Veritabanı Eşleşmesi'
    : result.ai_comment?.gemini_verdict ? 'Gemini AI Kararı'
    : 'Yapay Zeka Sınıflandırması';

  return (
    <View style={[styles.head, { borderBottomColor: alpha(theme.hex, 0.15) }]}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: alpha(theme.hex, 0.15) }]}>
          <Ionicons name={theme.icon} size={22} color={theme.hex} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.hex }]}>[ {theme.label} ]</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>{theme.mainTitle}</Text>
          <Text style={[styles.badge, { color: colors.text.muted }]}>{badge}</Text>
        </View>
      </View>
      <ScoreRing score={score} color={theme.hex} trackColor={alpha(theme.hex, 0.15)}
        textColor={colors.text.primary} label={isUrl ? 'Doğruluk' : 'Güven'} />
    </View>
  );
}

const styles = StyleSheet.create({
  head:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1 },
  left:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  iconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  label:   { fontFamily: fonts.extrabold, fontSize: 9, letterSpacing: 1.5, marginBottom: 2 },
  title:   { fontFamily: fonts.extrabold, fontSize: 16, letterSpacing: -0.3, lineHeight: 20 },
  badge:   { fontFamily: fonts.semibold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },
});
