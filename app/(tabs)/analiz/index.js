import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useAnalyzeMutation } from '../../../hooks/useAnalysis';
import { useTheme } from '../../../hooks/useTheme';

export default function AnalizScreen() {
  const { colors }             = useTheme();
  const params                 = useLocalSearchParams();
  const [mode, setMode]        = useState('text'); // 'text' | 'url'
  const [text, setText]        = useState('');
  const [url, setUrl]          = useState('');
  const { mutate, isPending }  = useAnalyzeMutation();

  // Haber detayından deep link ile URL gelebilir
  useEffect(() => {
    if (params.url) {
      setMode('url');
      setUrl(params.url);
    }
  }, [params.url]);

  function handleSubmit() {
    const payload = mode === 'url' ? url.trim() : text.trim();
    if (!payload) return;
    mutate(
      { type: mode, payload },
      {
        onSuccess: (data) => {
          router.push(`/(tabs)/analiz/${data.task_id}`);
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.bg.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Analiz Et</Text>
      </View>

      {/* Mode toggle */}
      <View style={[styles.toggle, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
        {['text','url'].map(m => (
          <Pressable
            key={m}
            style={[styles.toggleBtn, mode === m && { backgroundColor: palette.brand.primary }]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.toggleText, { color: mode === m ? '#fff' : colors.text.muted }]}>
              {m === 'text' ? '📝 Metin' : '🔗 URL'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputWrap}>
        {mode === 'text' ? (
          <>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.bg.surface, borderColor: colors.border, color: colors.text.primary }]}
              placeholder="Analiz etmek istediğin haber metnini yapıştır..."
              placeholderTextColor={colors.text.muted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
            <Text style={[styles.counter, { color: colors.text.muted }]}>{text.length}/5000</Text>
          </>
        ) : (
          <TextInput
            style={[styles.urlInput, { backgroundColor: colors.bg.surface, borderColor: colors.border, color: colors.text.primary }]}
            placeholder="https://..."
            placeholderTextColor={colors.text.muted}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        )}
      </View>

      <Pressable
        style={[styles.btn, { backgroundColor: palette.brand.primary, opacity: isPending ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={isPending}
      >
        {isPending
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Analiz Et</Text>
        }
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1 },
  header:      { paddingTop:50, paddingBottom: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth:1 },
  headerTitle: { fontSize: typography.xl, fontWeight:'700' },
  toggle:      { flexDirection:'row', margin: spacing.md, borderRadius: radius.md, borderWidth:1, overflow:'hidden' },
  toggleBtn:   { flex:1, padding: spacing.sm, alignItems:'center' },
  toggleText:  { fontSize: typography.sm, fontWeight:'600' },
  inputWrap:   { paddingHorizontal: spacing.md, flex:1 },
  textarea:    { borderWidth:1, borderRadius: radius.md, padding: spacing.md, height:200, fontSize: typography.md, marginTop: spacing.sm },
  counter:     { textAlign:'right', fontSize: typography.xs, marginTop: spacing.xs },
  urlInput:    { borderWidth:1, borderRadius: radius.md, padding: spacing.md, fontSize: typography.md, marginTop: spacing.sm },
  btn:         { margin: spacing.md, borderRadius: radius.md, padding: spacing.md, alignItems:'center' },
  btnText:     { color:'#fff', fontWeight:'600', fontSize: typography.md },
});
