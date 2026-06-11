import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { submitAnalysisFeedback } from '../../services/analysisService';

export default function FeedbackBar({ taskId }) {
  const { colors } = useTheme();
  const [state, setState] = useState('idle'); // idle | asking | sent
  const [reason, setReason] = useState('');

  async function send(label) {
    setState('sent');
    try { await submitAnalysisFeedback(taskId, label); } catch {}
  }

  if (state === 'sent') return (
    <View style={[styles.bar, { borderTopColor: colors.border }]}>
      <Ionicons name="checkmark-circle" size={16} color={palette.brand.primary} />
      <Text style={[styles.msg, { color: colors.text.muted }]}>Geri bildirim alındı, teşekkürler.</Text>
    </View>
  );

  if (state === 'asking') return (
    <View style={[styles.barCol, { borderTopColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text.muted }]}>Neyi eksik buldun? (opsiyonel)</Text>
      <TextInput value={reason} onChangeText={setReason} placeholder="Yazabilirsin…" multiline
        placeholderTextColor={colors.text.muted}
        style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.bg.base }]} />
      <Pressable style={[styles.submit, { borderColor: palette.brand.primary }]} onPress={() => send('negative')}>
        <Text style={[styles.submitText, { color: palette.brand.primary }]}>GÖNDER</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.bar, { borderTopColor: colors.border }]}>
      <Text style={[styles.q, { color: colors.text.secondary }]}>Bu sonuç doğru mu?</Text>
      <View style={styles.btns}>
        <Pressable style={[styles.btn, { borderColor: colors.border }]} onPress={() => setState('asking')}>
          <Ionicons name="thumbs-down-outline" size={14} color={colors.text.secondary} />
          <Text style={[styles.btnText, { color: colors.text.secondary }]}>Hayır</Text>
        </Pressable>
        <Pressable style={[styles.btn, { borderColor: palette.brand.primary, backgroundColor: palette.brand.primary + '22' }]} onPress={() => send('positive')}>
          <Ionicons name="thumbs-up-outline" size={14} color={palette.brand.primary} />
          <Text style={[styles.btnText, { color: palette.brand.primary }]}>Evet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, borderTopWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  barCol:    { borderTopWidth: 1, padding: spacing.md, gap: spacing.sm },
  q:         { fontFamily: fonts.medium, fontSize: 14 },
  msg:       { fontFamily: fonts.medium, fontSize: 13 },
  btns:      { flexDirection: 'row', gap: spacing.sm },
  btn:       { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 8 },
  btnText:   { fontFamily: fonts.bold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  label:     { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  input:     { borderWidth: 1, minHeight: 60, padding: spacing.sm, fontFamily: fonts.regular, fontSize: 14 },
  submit:    { alignSelf: 'flex-end', borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 8 },
  submitText:{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
});
