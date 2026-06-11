import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { checkSimilarReport, requestFullReport } from '../../services/analysisService';

export default function FullReportSheet({ visible, taskId, onClose }) {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const [checking, setChecking] = useState(true);
  const [similar,  setSimilar]  = useState(null);
  const [note,     setNote]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setChecking(true); setSimilar(null); setNote('');
    checkSimilarReport(taskId)
      .then(setSimilar).catch(() => setSimilar({ found: false }))
      .finally(() => setChecking(false));
  }, [visible, taskId]);

  function goReport(id) { onClose(); router.push(`/(tabs)/analiz/rapor/${id}`); }

  async function createNew() {
    if (submitting) return;
    setSubmitting(true);
    try { await requestFullReport(taskId, note); } catch {}
    goReport(taskId);
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.bg.surface, borderTopColor: palette.brand.primary, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Tam Rapor İste</Text>
          <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close" size={20} color={colors.text.secondary} /></Pressable>
        </View>

        {checking ? (
          <View style={styles.center}><ActivityIndicator color={palette.brand.primary} /><Text style={[styles.muted, { color: colors.text.muted }]}>Benzer raporlar kontrol ediliyor…</Text></View>
        ) : similar?.found ? (
          <View style={[styles.similar, { borderColor: '#f59e0b55', backgroundColor: '#f59e0b14' }]}>
            <Text style={styles.simTitle}>%{similar.similarity} benzer bir rapor mevcut</Text>
            <Text style={[styles.simSub, { color: colors.text.secondary }]} numberOfLines={2}>{similar.title || 'Benzer haber'}</Text>
            <View style={styles.simBtns}>
              <Pressable style={[styles.simBtn, { borderColor: '#f59e0b88' }]} onPress={() => goReport(similar.task_id)}>
                <Text style={[styles.simBtnText, { color: '#f59e0b' }]}>Mevcut Raporu Gör</Text>
              </Pressable>
              <Pressable style={[styles.simBtn, { borderColor: colors.border }]} onPress={() => setSimilar({ found: false })}>
                <Text style={[styles.simBtnText, { color: colors.text.secondary }]}>Yeni Oluştur</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.label, { color: colors.text.muted }]}>Gemini'ye Ekstra İstek (opsiyonel)</Text>
            <TextInput value={note} onChangeText={setNote} maxLength={500} multiline
              placeholder="Örn: Ekonomik boyutunu özellikle incele…" placeholderTextColor={colors.text.muted}
              style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.bg.base }]} />
            <Pressable style={[styles.create, { backgroundColor: palette.brand.primary, opacity: submitting ? 0.6 : 1 }]} onPress={createNew} disabled={submitting}>
              <Text style={styles.createText}>{submitting ? 'Hazırlanıyor…' : 'Tam Raporu Oluştur'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet:     { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 3, padding: spacing.lg, gap: spacing.md },
  head:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:     { fontFamily: fonts.extrabold, fontSize: 18 },
  center:    { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  muted:     { fontFamily: fonts.medium, fontSize: 13 },
  similar:   { borderWidth: 1, padding: spacing.md, gap: 6 },
  simTitle:  { color: '#f59e0b', fontFamily: fonts.bold, fontSize: 13 },
  simSub:    { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  simBtns:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  simBtn:    { flex: 1, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  simBtnText:{ fontFamily: fonts.bold, fontSize: 12 },
  label:     { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  input:     { borderWidth: 1, minHeight: 80, padding: spacing.md, fontFamily: fonts.regular, fontSize: 14 },
  create:    { paddingVertical: 14, alignItems: 'center' },
  createText:{ fontFamily: fonts.extrabold, fontSize: 14, color: '#06140d' },
});
