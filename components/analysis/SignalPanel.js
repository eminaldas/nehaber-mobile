import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { alpha, fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const LABELS = {
  clickbait_score:   'Tıklama Tuzağı',
  exclamation_ratio: 'Ünlem',
  uppercase_ratio:   'Büyük Harf',
  hedge_ratio:       'Belirsizlik',
  question_density:  'Soru İşareti',
  number_density:    'Rakam Yoğunluğu',
  source_score:      'Kaynak Güveni',
  avg_word_length:   'Ortalama Kelime',
};
// avg_word_length 0–1'e normalize (web /10)
function norm(key, v) { return key === 'avg_word_length' ? Math.min((v || 0) / 10, 1) : (v || 0); }

export default function SignalPanel({ signals, hex }) {
  const { colors } = useTheme();
  if (!signals) return null;
  const keys = Object.keys(LABELS).filter(k => signals[k] != null);
  if (keys.length === 0) return null;

  return (
    <View style={[styles.box, { backgroundColor: alpha(hex, 0.06), borderLeftColor: alpha(hex, 0.4) }]}>
      {keys.map(k => {
        const pct = Math.round(norm(k, signals[k]) * 100);
        return (
          <View key={k} style={styles.row}>
            <Text style={[styles.label, { color: colors.text.muted }]} numberOfLines={1}>{LABELS[k]}</Text>
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: hex }]} />
            </View>
            <Text style={[styles.pct, { color: colors.text.secondary }]}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box:   { borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm },
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: 11, width: 104 },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 3 },
  pct:   { fontFamily: fonts.semibold, fontSize: 11, width: 34, textAlign: 'right' },
});
