import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import OtpInput from '../../components/auth/OtpInput';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { sendPasswordResetCode } from '../../services/authService';

const RESEND_SECS = 60;

export default function KodDogrulaScreen() {
  const { colors } = useTheme();
  const toast      = useToast();
  const { email }  = useLocalSearchParams();
  const [code, setCode]       = useState('');
  const [left, setLeft]       = useState(RESEND_SECS);

  useEffect(() => {
    if (left <= 0) return undefined;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  function proceed(value) {
    const c = value ?? code;
    if (c.length !== 6) {
      toast.error('6 haneli kodu gir.', { title: 'Eksik kod' });
      return;
    }
    // Kod sunucuda yeni şifre adımında doğrulanır.
    router.push({ pathname: '/(auth)/yeni-sifre', params: { email, code: c } });
  }

  async function resend() {
    if (left > 0) return;
    try {
      const data = await sendPasswordResetCode(String(email));
      if (data?.dev_code) toast.info(`DEV kod: ${data.dev_code}`, { title: 'Geliştirme' });
      toast.success('Kod tekrar gönderildi.', { title: 'Gönderildi' });
      setLeft(RESEND_SECS);
    } catch {
      toast.error('Kod gönderilemedi.', { title: 'Hata' });
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={18} color={colors.text.muted} />
          <Text style={[styles.backText, { color: colors.text.muted }]}>GERİ</Text>
        </Pressable>

        <Text style={[styles.eyebrow, { color: palette.brand.bright }]}>// KOD_DOĞRULAMA</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>6 haneli kodu gir</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          <Text style={{ color: colors.text.secondary, fontFamily: fonts.bold }}>{String(email)}</Text> adresine gönderdiğimiz kodu yaz.
        </Text>

        <View style={{ marginTop: spacing.xl }}>
          <OtpInput value={code} onChange={setCode} onComplete={proceed} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || code.length !== 6) ? 0.6 : 1 }]}
          onPress={() => proceed()}
          disabled={code.length !== 6}
        >
          <Text style={styles.btnText}>Doğrula</Text>
        </Pressable>

        <Pressable onPress={resend} disabled={left > 0} style={styles.resend} hitSlop={8}>
          <Text style={[styles.resendText, { color: left > 0 ? colors.text.muted : palette.brand.bright }]}>
            {left > 0 ? `Kod gelmedi mi? Tekrar gönder (0:${String(left).padStart(2, '0')})` : 'Kodu tekrar gönder'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  back:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xl },
  backText:   { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.2 },
  eyebrow:    { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6 },
  title:      { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5, marginTop: spacing.sm },
  subtitle:   { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  btn:        { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.xl, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:    { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  resend:     { alignItems: 'center', marginTop: spacing.lg },
  resendText: { fontFamily: fonts.medium, fontSize: 12.5 },
});
