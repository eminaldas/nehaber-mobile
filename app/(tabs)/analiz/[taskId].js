import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useAnalysisResult } from '../../../hooks/useAnalysis';
import { useTheme } from '../../../hooks/useTheme';

function VerdictCard({ prediction, confidence }) {
  const isFake = prediction === 'FAKE';
  const cfg    = isFake
    ? { bg:'#fee2e2', border:'#dc2626', text:'#b91c1c', label:'SAHTE', emoji:'⛔' }
    : { bg:'#dcfce7', border:'#16a34a', text:'#15803d', label:'DOĞRU',  emoji:'✅' };

  return (
    <View style={[styles.verdict, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={styles.verdictEmoji}>{cfg.emoji}</Text>
      <Text style={[styles.verdictLabel, { color: cfg.text }]}>{cfg.label}</Text>
      {confidence != null && (
        <Text style={[styles.verdictConf, { color: cfg.text }]}>
          %{Math.round(confidence * 100)} güven
        </Text>
      )}
    </View>
  );
}

function SignalRow({ label, value }) {
  const { colors } = useTheme();
  const pct        = Math.round((value ?? 0) * 100);
  return (
    <View style={styles.signalRow}>
      <Text style={[styles.signalLabel, { color: colors.text.muted }]} numberOfLines={1}>{label}</Text>
      <View style={styles.signalTrack}>
        <View style={[styles.signalFill, { width: `${pct}%`, backgroundColor: palette.brand.primary }]} />
      </View>
      <Text style={[styles.signalPct, { color: colors.text.secondary }]}>{pct}%</Text>
    </View>
  );
}

const SIGNAL_LABELS = {
  clickbait_score:   'Tıklama Tuzağı',
  exclamation_ratio: 'Ünlem',
  uppercase_ratio:   'Büyük Harf',
  hedge_ratio:       'Belirsizlik',
  question_density:  'Soru İşareti',
  number_density:    'Rakam Yoğunluğu',
  source_score:      'Kaynak Güveni',
  avg_word_length:   'Ortalama Kelime',
};

export default function AnalizSonucScreen() {
  const { taskId }  = useLocalSearchParams();
  const { colors }  = useTheme();
  const { data, isLoading } = useAnalysisResult(taskId);

  const result = data?.result;
  const done   = data?.status === 'SUCCESS';
  const failed = data?.status === 'FAILED';

  return (
    <ScrollView style={{ flex:1, backgroundColor: colors.bg.base }} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={{ color: palette.brand.primary }}>← Geri</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text.primary }]}>Analiz Sonucu</Text>

      {(isLoading || (!done && !failed)) && (
        <View style={styles.pendingWrap}>
          <ActivityIndicator color={palette.brand.primary} size="large" />
          <Text style={[styles.pendingText, { color: colors.text.muted }]}>
            Analiz devam ediyor...
          </Text>
        </View>
      )}

      {failed && (
        <View style={styles.errorWrap}>
          <Text style={{ color:'#dc2626', fontSize: typography.md }}>Analiz başarısız oldu.</Text>
        </View>
      )}

      {done && result && (
        <>
          <VerdictCard prediction={result.prediction} confidence={result.confidence} />

          {result.signals && Object.keys(SIGNAL_LABELS).some(k => result.signals[k] != null) && (
            <View style={[styles.section, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>NLP Sinyalleri</Text>
              {Object.entries(SIGNAL_LABELS).map(([key, label]) =>
                result.signals[key] != null
                  ? <SignalRow key={key} label={label} value={result.signals[key]} />
                  : null
              )}
            </View>
          )}

          {result.ai_comment?.summary && (
            <View style={[styles.section, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Yapay Zeka Yorumu</Text>
              <Text style={[styles.aiText, { color: colors.text.secondary }]}>{result.ai_comment.summary}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:      { paddingBottom: spacing.xxl },
  back:         { paddingTop:50, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  title:        { fontSize: typography.xl, fontWeight:'700', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  pendingWrap:  { alignItems:'center', paddingVertical: spacing.xxl, gap: spacing.md },
  pendingText:  { fontSize: typography.md },
  errorWrap:    { alignItems:'center', paddingVertical: spacing.xl },
  verdict:      { margin: spacing.md, padding: spacing.xl, borderRadius: radius.lg, borderWidth:2, alignItems:'center' },
  verdictEmoji: { fontSize: 48, marginBottom: spacing.sm },
  verdictLabel: { fontSize: typography.xxl, fontWeight:'800' },
  verdictConf:  { fontSize: typography.md, marginTop: spacing.xs, fontWeight:'500' },
  section:      { margin: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth:1 },
  sectionTitle: { fontSize: typography.md, fontWeight:'700', marginBottom: spacing.md },
  signalRow:    { flexDirection:'row', alignItems:'center', marginBottom: spacing.sm, gap: spacing.sm },
  signalLabel:  { fontSize: typography.xs, width: 110 },
  signalTrack:  { flex:1, height:5, backgroundColor:'#e5e7eb', borderRadius: radius.full, overflow:'hidden' },
  signalFill:   { height:'100%', borderRadius: radius.full },
  signalPct:    { fontSize: typography.xs, width: 32, textAlign:'right' },
  aiText:       { fontSize: typography.sm, lineHeight: 20 },
});
