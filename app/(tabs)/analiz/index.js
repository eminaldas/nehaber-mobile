import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnalysisForm from '../../../components/analysis/AnalysisForm';
import TrendingToAnalyze from '../../../components/analysis/TrendingToAnalyze';
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
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={[styles.kicker, { color: palette.brand.primary }]}>// DOĞRULUK_MOTORU</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Analiz Et</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>Şüpheli bir haberi yapıştır ya da linkini ver.</Text>
        </View>
        <View style={{ paddingHorizontal: spacing.md }}>
          <AnalysisForm mode={mode} setMode={setMode} text={text} setText={setText}
            url={url} setUrl={setUrl} onSubmit={handleSubmit} loading={isPending} />
        </View>

        <TrendingToAnalyze
          items={trending}
          onPick={(item) => { setMode('text'); setText(item.title); }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: 2 },
  kicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.5 },
  title:  { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5 },
  sub:    { fontFamily: fonts.medium, fontSize: 13 },
});
