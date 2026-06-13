import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportBlock from '../../../../components/analysis/report/ReportBlock';
import { BulletList, FactChecks, MetricBar, TextSection } from '../../../../components/analysis/report/ReportSections';
import { fonts, palette, spacing } from '../../../../constants/theme';
import { useReport } from '../../../../hooks/useReport';
import { useTheme } from '../../../../hooks/useTheme';

export default function RaporScreen() {
  const { taskId } = useLocalSearchParams();
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const { report, confidence, error } = useReport(taskId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.topbar, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.bg.deepest, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Tam Rapor</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 120, gap: spacing.md }}>
        {!report && !error && (
          <View style={styles.center}>
            <ActivityIndicator color={palette.brand.primary} size="large" />
            <Text style={[styles.muted, { color: colors.text.muted }]}>Derin rapor hazırlanıyor… (~45-90 sn)</Text>
            <Text style={[styles.muted2, { color: colors.text.muted }]}>Beklemek zorunda değilsin; hazır olunca burada görünür.</Text>
          </View>
        )}
        {error && <Text style={styles.err}>[ ERR ] {error}</Text>}

        {report && (
          <>
            {!!report.title && (
              <Text style={[styles.newsTitle, { color: colors.text.primary }]}>{report.title}</Text>
            )}
            {(report.credibility_score != null || confidence != null) && (
              <ReportBlock title="Güvenilirlik" icon="speedometer-outline">
                <MetricBar score={report.credibility_score ?? Math.round((confidence || 0) * 100)}
                  label={confidence != null ? `Güven skoru %${Math.round(confidence * 100)}` : null} />
              </ReportBlock>
            )}
            {report.decisive_factors?.length > 0 && (
              <ReportBlock title="Kararı Belirleyen Faktörler" icon="git-compare-outline">
                <BulletList items={report.decisive_factors} />
              </ReportBlock>
            )}
            {!!report.overall_assessment && (
              <ReportBlock title="Genel Değerlendirme" icon="document-text-outline">
                <TextSection text={report.overall_assessment} />
              </ReportBlock>
            )}
            {!report.decisive_factors?.length && !!report.verdict_explanation && (
              <ReportBlock title="Karar Gerekçesi" icon="git-compare-outline">
                <TextSection text={report.verdict_explanation} />
              </ReportBlock>
            )}
            {report.fact_checks?.length > 0 && (
              <ReportBlock title="Doğrulama Bulguları" icon="search-outline" subtitle="İddiaların kaynaklı doğrulaması">
                <FactChecks items={report.fact_checks} />
              </ReportBlock>
            )}
            {!!report.domain_context && (
              <ReportBlock title="Alana Özel Bağlam" icon="flask-outline"><TextSection text={report.domain_context} /></ReportBlock>
            )}
            {report.numeric_claims?.length > 0 && (
              <ReportBlock title="Sayısal İddialar" icon="grid-outline"><BulletList items={report.numeric_claims} /></ReportBlock>
            )}
            {report.precedent_cases?.length > 0 && (
              <ReportBlock title="Emsal Vakalar" icon="time-outline"><BulletList items={report.precedent_cases} /></ReportBlock>
            )}
            {report.propaganda_techniques?.length > 0 && (
              <ReportBlock title="Propaganda Analizi" icon="megaphone-outline"><BulletList items={report.propaganda_techniques} accent={palette.verdict.fake} /></ReportBlock>
            )}
            {report.source_analysis?.sources_found?.length > 0 && (
              <ReportBlock title="Kaynak Yanlılığı" icon="git-network-outline"><BulletList items={report.source_analysis.sources_found} /></ReportBlock>
            )}
            {!!report.source_credibility && (
              <ReportBlock title="Kaynak Güvenilirliği" icon="book-outline"><TextSection text={report.source_credibility} /></ReportBlock>
            )}
            {!!report.linguistic && (
              <ReportBlock title="Dilbilimsel Analiz" icon="text-outline">
                <MetricBar score={report.linguistic.manipulation_density != null ? Math.round((1 - report.linguistic.manipulation_density) * 100) : null}
                  label="Dil hijyeni" />
              </ReportBlock>
            )}
            {(!!report.model || !!report.generated_at) && (
              <Text style={[styles.footer, { color: colors.text.muted }]}>
                {report.model}{report.generated_at ? ` · ${new Date(report.generated_at).toLocaleString('tr-TR')}` : ''}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  iconBtn:   { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle:  { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 15 },
  center:    { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  muted:     { fontFamily: fonts.semibold, fontSize: 14, textAlign: 'center' },
  muted2:    { fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', paddingHorizontal: spacing.lg },
  err:       { color: '#ff7351', fontFamily: fonts.bold, fontSize: 14 },
  newsTitle: { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 24 },
  footer:    { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1, textAlign: 'center', marginTop: spacing.md },
});
