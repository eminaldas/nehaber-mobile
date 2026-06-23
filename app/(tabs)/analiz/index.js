import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnalysisForm from '../../../components/analysis/AnalysisForm';
import HotAnalysesCard from '../../../components/analysis/HotAnalysesCard';
import TrendingToAnalyze from '../../../components/analysis/TrendingToAnalyze';
import AnalizHistoryList from '../../../components/analysis/AnalizHistoryList';
import AppHeader from '../../../components/ui/AppHeader';
import { fonts, spacing } from '../../../constants/theme';
import { useAnalyzeMutation } from '../../../hooks/useAnalysis';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { useTrending } from '../../../hooks/useTrending';
import { useAnalysisNotifier } from '../../../context/AnalysisNotifierContext';

export default function AnalizScreen() {
  const { colors } = useTheme();
  const params     = useLocalSearchParams();
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [url,  setUrl]  = useState('');
  const [sub,  setSub]  = useState(null); // null = ana | { title } = geçmiş morph
  const { mutate, isPending } = useAnalyzeMutation();
  const { data: trending } = useTrending();
  const toast = useToast();
  const { track } = useAnalysisNotifier();

  useEffect(() => {
    if (params.url) { setMode('url'); setUrl(String(params.url)); }
  }, [params.url]);

  function handleSubmit() {
    const raw = (mode === 'url' ? url : text).trim();
    if (!raw) return;
    // Boşluksuz + alan adı gibi görünen girdi = URL → scrape et (metin kutusuna
    // yapıştırılsa bile). Şema yoksa https:// ekle.
    const looksLikeUrl = !/\s/.test(raw) && /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\S*$/i.test(raw);
    const type = mode === 'url' || looksLikeUrl ? 'url' : 'text';
    const payload = type === 'url' && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
    mutate({ type, payload }, {
      onSuccess: (data) => {
        if (!data.task_id) return;
        if (data.is_direct_match) {
          // Sonuç hazır → doğrudan göster
          router.push(`/(tabs)/analiz/${data.task_id}`);
        } else {
          // Async → kullanıcı beklemesin; arka planda takip et, bitince toast gelir
          track(data.task_id);
          if (mode === 'text') setText('');
          if (mode === 'url')  setUrl('');
          toast.info('Hazır olunca üstten haber vereceğiz.', { title: 'Analiz başladı' });
        }
      },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <AppHeader
        sectionIcon="search"
        rightIcon="time-outline"
        onRight={() => setSub({ title: 'Geçmiş' })}
        sub={sub}
        onBack={() => setSub(null)}
      />

      {sub ? (
        <AnalizHistoryList />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 2 },
  title:  { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5 },
  sub:    { fontFamily: fonts.medium, fontSize: 13 },
});
