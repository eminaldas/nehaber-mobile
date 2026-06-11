import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { alpha, fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function AICommentCard({ aiComment, hex, temporalAnalysis, sourceBiasSummary }) {
  const { colors } = useTheme();
  if (!aiComment) return null;
  const recycled = temporalAnalysis?.freshness_flag === 'recycled';
  const gapYears = temporalAnalysis?.temporal_gap_days
    ? Math.round((temporalAnalysis.temporal_gap_days / 365) * 10) / 10 : null;

  return (
    <View style={[styles.box, { backgroundColor: alpha(hex, 0.06), borderLeftColor: alpha(hex, 0.4) }]}>
      <View style={styles.head}>
        <Ionicons name="sparkles" size={14} color={hex} />
        <Text style={[styles.headText, { color: hex }]}>YAPAY ZEKA YORUMU</Text>
      </View>

      {recycled && (
        <View style={[styles.temporal, { backgroundColor: '#f59e0b22', borderColor: '#f59e0b55' }]}>
          <Ionicons name="time-outline" size={12} color="#f59e0b" />
          <Text style={styles.temporalText}>
            Eski bilgi yeniden dolaşımda{gapYears ? ` · ${gapYears} yıl önce yayınlandı` : ''}
          </Text>
        </View>
      )}

      {!!aiComment.reason_type && (
        <View style={[styles.pill, { backgroundColor: alpha(hex, 0.1), borderColor: alpha(hex, 0.2) }]}>
          <Text style={[styles.pillText, { color: hex }]}>{aiComment.reason_type}</Text>
        </View>
      )}

      {!!aiComment.news_summary && (
        <View style={[styles.sub, { backgroundColor: alpha(hex, 0.15) }]}>
          <Text style={[styles.subLabel, { color: colors.text.muted }]}>HABER ÖZETİ</Text>
          <Text style={[styles.body, { color: colors.text.secondary }]}>{aiComment.news_summary}</Text>
        </View>
      )}

      {!!aiComment.summary && (
        <Text style={[styles.verdict, { color: hex }]}>"{aiComment.summary}"</Text>
      )}

      {!!sourceBiasSummary?.bias_summary && (
        <View style={[styles.bias, { borderTopColor: alpha(hex, 0.3) }]}>
          <Ionicons name="warning-outline" size={12} color={colors.text.muted} />
          <Text style={[styles.biasText, { color: colors.text.muted }]}>{sourceBiasSummary.bias_summary}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box:        { borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm },
  head:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headText:   { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1.5 },
  temporal:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  temporalText:{ color: '#f59e0b', fontFamily: fonts.bold, fontSize: 10, flex: 1 },
  pill:       { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  pillText:   { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' },
  sub:        { padding: spacing.sm, gap: 4 },
  subLabel:   { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
  body:       { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  verdict:    { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  bias:       { flexDirection: 'row', gap: 6, borderTopWidth: 1, paddingTop: spacing.sm },
  biasText:   { fontFamily: fonts.regular, fontSize: 10, lineHeight: 15, flex: 1 },
});
