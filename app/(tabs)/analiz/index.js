import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnalysisForm from '../../../components/analysis/AnalysisForm';
import HotAnalysesCard from '../../../components/analysis/HotAnalysesCard';
import TrendingToAnalyze from '../../../components/analysis/TrendingToAnalyze';
import AuroraGlow from '../../../components/ui/AuroraGlow';
import { fonts, palette, spacing } from '../../../constants/theme';
import { useAnalyzeMutation } from '../../../hooks/useAnalysis';
import { useTheme } from '../../../hooks/useTheme';
import { useTrending } from '../../../hooks/useTrending';

export default function AnalizScreen() {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const params     = useLocalSearchParams();
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [url,  setUrl]  = useState('');
  const { mutate, isPending } = useAnalyzeMutation();
  const { data: trending } = useTrending();

  useEffect(() => {
    if (params.url) { setMode('url'); setUrl(String(params.url)); }
  }, [params.url]);

  function handleSubmit() {
    const payload = mode === 'url' ? url.trim() : text.trim();
    if (!payload) return;
    mutate({ type: mode, payload }, {
      onSuccess: (data) => { if (data.task_id) router.push(`/(tabs)/analiz/${data.task_id}`); },
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg.base }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Üst bar — NeHaber + aurora + analiz geçmişi */}
      <View style={[styles.topbar, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.bg.base, borderBottomColor: 'rgba(255,255,255,0.14)' }]}>
        <AuroraGlow baseColor={colors.bg.base} />
        <Ionicons name="search" size={22} color={colors.text.muted} />
        <Text style={[styles.logo, { color: colors.text.primary }]}>NeHaber</Text>
        <Pressable onPress={() => router.push('/(tabs)/analiz/gecmis')} hitSlop={8}>
          <Ionicons name="time-outline" size={23} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Analiz Et</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>Şüpheli bir haberi yapıştır ya da linkini ver.</Text>
        </View>
        <View style={{ paddingHorizontal: spacing.md }}>
          <AnalysisForm mode={mode} setMode={setMode} text={text} setText={setText}
            url={url} setUrl={setUrl} onSubmit={handleSubmit} loading={isPending} />
        </View>

        <HotAnalysesCard />

        <TrendingToAnalyze
          items={trending}
          onPick={(item) => { setMode('text'); setText(item.title); }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, overflow: 'hidden' },
  logo:   { fontFamily: fonts.logo, fontSize: 24, letterSpacing: 0.5 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 2 },
  title:  { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5 },
  sub:    { fontFamily: fonts.medium, fontSize: 13 },
});
