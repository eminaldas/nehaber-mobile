import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getRiskColor, getTrustColor, palette, radius, spacing, typography } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { getNewsDetail } from '../../../services/newsService';

export default function HaberDetayScreen() {
  const { id }     = useLocalSearchParams();
  const { colors } = useTheme();

  const { data: haber, isLoading } = useQuery({
    queryKey: ['news-detail', id],
    queryFn:  () => getNewsDetail(id),
  });

  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg.base }]}>
        <ActivityIndicator color={palette.brand.primary} size="large" />
      </View>
    );
  }

  if (!haber) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.bg.base }]}>
        <Text style={{ color: colors.text.muted }}>Haber bulunamadı.</Text>
      </View>
    );
  }

  const riskPct    = haber.nlp_score != null ? Math.round(haber.nlp_score * 100) : null;
  const riskColor  = getRiskColor(haber.nlp_score ?? 0);
  const trustColor = getTrustColor(haber.trust_score ?? 0);

  return (
    <ScrollView style={{ flex:1, backgroundColor: colors.bg.base }} contentContainerStyle={styles.content}>
      {/* Geri butonu */}
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={{ color: palette.brand.primary, fontSize: typography.md }}>← Geri</Text>
      </Pressable>

      {/* Hero görsel */}
      {haber.image_url && (
        <Image source={{ uri: haber.image_url }} style={styles.hero} contentFit="cover" transition={300} />
      )}

      <View style={styles.body}>
        {/* Kaynak + güven */}
        <View style={styles.metaRow}>
          {haber.source_name && (
            <View style={[styles.trustBadge, { backgroundColor: trustColor + '22', borderColor: trustColor }]}>
              <Text style={[styles.trustText, { color: trustColor }]}>{haber.source_name}</Text>
            </View>
          )}
          {haber.pub_date && (
            <Text style={[styles.date, { color: colors.text.muted }]}>
              {new Date(haber.pub_date).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </View>

        {/* Başlık */}
        <Text style={[styles.title, { color: colors.text.primary }]}>{haber.title}</Text>

        {/* Risk bar */}
        {riskPct != null && (
          <View style={styles.riskSection}>
            <Text style={[styles.riskLabel, { color: colors.text.muted }]}>AI Risk Skoru</Text>
            <View style={styles.riskRow}>
              <View style={styles.riskTrack}>
                <View style={[styles.riskFill, { width: `${riskPct}%`, backgroundColor: riskColor }]} />
              </View>
              <Text style={[styles.riskPct, { color: riskColor }]}>{riskPct}%</Text>
            </View>
          </View>
        )}

        {/* Analiz et butonu */}
        {haber.source_url && (
          <Pressable
            style={[styles.analyzeBtn, { backgroundColor: palette.brand.primary }]}
            onPress={() => router.push({ pathname: '/(tabs)/analiz', params: { url: haber.source_url } })}
          >
            <Text style={styles.analyzeBtnText}>🔍 Bu Haberi Analiz Et</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader:       { flex:1, justifyContent:'center', alignItems:'center' },
  content:      { paddingBottom: spacing.xxl },
  back:         { paddingTop: 50, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  hero:         { width:'100%', height: 220 },
  body:         { padding: spacing.md },
  metaRow:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: spacing.sm },
  trustBadge:   { borderWidth:1, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  trustText:    { fontSize: typography.xs, fontWeight:'600' },
  date:         { fontSize: typography.xs },
  title:        { fontSize: typography.lg, fontWeight:'700', lineHeight: 26, marginBottom: spacing.md },
  riskSection:  { marginBottom: spacing.md },
  riskLabel:    { fontSize: typography.xs, marginBottom: spacing.xs },
  riskRow:      { flexDirection:'row', alignItems:'center', gap: spacing.sm },
  riskTrack:    { flex:1, height:6, backgroundColor:'#e5e7eb', borderRadius: radius.full, overflow:'hidden' },
  riskFill:     { height:'100%', borderRadius: radius.full },
  riskPct:      { fontSize: typography.sm, fontWeight:'700', width: 36 },
  analyzeBtn:   { borderRadius: radius.md, padding: spacing.md, alignItems:'center', marginTop: spacing.sm },
  analyzeBtnText:{ color:'#fff', fontWeight:'600', fontSize: typography.md },
});
