import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AICommentCard from '../../../components/analysis/AICommentCard';
import CornerBrackets from '../../../components/analysis/CornerBrackets';
import FalseClaimsCard from '../../../components/analysis/FalseClaimsCard';
import FeedbackBar from '../../../components/analysis/FeedbackBar';
import FullReportSheet from '../../../components/analysis/FullReportSheet';
import LoadingStepper from '../../../components/analysis/LoadingStepper';
import SignalPanel from '../../../components/analysis/SignalPanel';
import VerdictCard from '../../../components/analysis/VerdictCard';
import { alpha, fonts, getAnalysisTheme, palette, spacing } from '../../../constants/theme';
import { useAnalysisResult } from '../../../hooks/useAnalysis';
import { useTheme } from '../../../hooks/useTheme';

export default function AnalizSonucScreen() {
  const { taskId } = useLocalSearchParams();
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const { data }   = useAnalysisResult(taskId);
  const [reportOpen, setReportOpen] = useState(false);

  const result = data?.result;
  const done   = data?.status === 'SUCCESS';
  const failed = data?.status === 'FAILED';
  const status = (result?.ai_comment?.gemini_verdict || result?.prediction || '').toUpperCase();
  const theme  = getAnalysisTheme(status);
  const isUrl  = result?.truth_score != null;
  const sourceUrl = result?.source_url || result?.url;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.topbar, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.bg.deepest, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Analiz Sonucu</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120, gap: spacing.md }}>
        {!done && !failed && <LoadingStepper analysisStage={result?.analysis_stage} />}

        {failed && (
          <View style={styles.errBox}>
            <Text style={styles.errText}>[ ERR ] Analiz başarısız oldu.</Text>
            <Pressable onPress={() => router.back()}><Text style={[styles.retry, { color: palette.brand.primary }]}>Yeniden dene</Text></Pressable>
          </View>
        )}

        {done && result && (
          <View style={[styles.card, { backgroundColor: colors.bg.surface, borderColor: alpha(theme.hex, 0.3), borderTopColor: theme.hex }]}>
            <CornerBrackets color={theme.hex} />
            <VerdictCard result={result} />

            <View style={{ padding: spacing.md, gap: spacing.md }}>
              {isUrl && !!result.scraped_title && (
                <Text style={[styles.scraped, { color: theme.hex }]} numberOfLines={2}>{result.scraped_title}</Text>
              )}
              {isUrl && !!sourceUrl && (
                <Pressable style={[styles.srcLink, { borderColor: alpha(theme.hex, 0.4), backgroundColor: alpha(theme.hex, 0.05) }]} onPress={() => Linking.openURL(sourceUrl)}>
                  <Ionicons name="open-outline" size={13} color={theme.hex} />
                  <Text style={[styles.srcLinkText, { color: theme.hex }]}>Haber Linki</Text>
                </Pressable>
              )}

              {!isUrl && <SignalPanel signals={result.signals} hex={theme.hex} />}

              {!(result.is_direct_match || result.isDirectMatch) && (
                <AICommentCard aiComment={result.ai_comment} hex={theme.hex}
                  temporalAnalysis={result.temporal_analysis} sourceBiasSummary={result.source_bias_summary} />
              )}
              {!(result.is_direct_match || result.isDirectMatch) && (
                <FalseClaimsCard falseClaims={result.ai_comment?.false_claims} />
              )}
            </View>

            <FeedbackBar taskId={taskId} />

            <Pressable style={[styles.reportBtn, { borderTopColor: colors.border }]} onPress={() => setReportOpen(true)}>
              <Ionicons name="document-text-outline" size={16} color={colors.text.secondary} />
              <Text style={[styles.reportText, { color: colors.text.secondary }]}>Tam Raporu Gör →</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <FullReportSheet visible={reportOpen} taskId={taskId} onClose={() => setReportOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  iconBtn:    { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle:   { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 15 },
  card:       { borderWidth: 1, borderTopWidth: 3, overflow: 'hidden' },
  scraped:    { fontFamily: fonts.semibold, fontSize: 13 },
  srcLink:    { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  srcLinkText:{ fontFamily: fonts.semibold, fontSize: 12 },
  reportBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  reportText: { fontFamily: fonts.bold, fontSize: 14 },
  errBox:     { borderWidth: 1, borderColor: '#ff735150', backgroundColor: 'rgba(255,115,81,0.06)', padding: spacing.md, gap: spacing.sm },
  errText:    { color: '#ff7351', fontFamily: fonts.bold, fontSize: 14 },
  retry:      { fontFamily: fonts.bold, fontSize: 13 },
});
