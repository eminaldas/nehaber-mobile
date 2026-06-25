import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import OtpInput from '../../components/auth/OtpInput';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { sendEmailVerifyCode, verifyEmailWithCode } from '../../services/authService';

const RESEND_SECS = 60;

export default function EpostaDogrulaScreen() {
  const { colors } = useTheme();
  const toast      = useToast();
  const { user, logout, refreshUser } = useAuth();
  const { email: emailParam, next }   = useLocalSearchParams();
  const email = String(emailParam ?? user?.email ?? '');

  const [code, setCode]       = useState('');
  const [left, setLeft]       = useState(RESEND_SECS);
  const [loading, setLoading] = useState(false);
  const sentRef = useRef(false);

  // İlk açılışta kodu otomatik gönder (bir kez).
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    sendEmailVerifyCode()
      .then((data) => { if (data?.dev_code) toast.info(`DEV kod: ${data.dev_code}`, { title: 'Geliştirme' }); })
      .catch(() => {}); // 429 (cooldown) vb. sessiz geç
  }, [toast]);

  useEffect(() => {
    if (left <= 0) return undefined;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  async function verify(value) {
    const c = value ?? code;
    if (c.length !== 6) { toast.error('6 haneli kodu gir.', { title: 'Eksik kod' }); return; }
    setLoading(true);
    try {
      await verifyEmailWithCode(c);
      await refreshUser();
      toast.success('E-postan doğrulandı!', { title: 'Tamamlandı' });
      router.replace(next === 'onboarding' ? '/onboarding' : '/(tabs)/haberler');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Kod doğrulanamadı.';
      toast.error(msg, { title: 'Hata' });
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (left > 0) return;
    try {
      const data = await sendEmailVerifyCode();
      if (data?.dev_code) toast.info(`DEV kod: ${data.dev_code}`, { title: 'Geliştirme' });
      toast.success('Kod tekrar gönderildi.', { title: 'Gönderildi' });
      setLeft(RESEND_SECS);
    } catch (err) {
      const retry = err.response?.data?.detail?.retry_after;
      if (retry) setLeft(Number(retry));
      toast.error('Çok sık denedin, biraz bekle.', { title: 'Hata' });
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.seal, { borderColor: palette.brand.primary }]}>
          <Ionicons name="mail-outline" size={34} color={palette.brand.bright} />
        </View>

        <Text style={[styles.eyebrow, { color: palette.brand.bright }]}>// HESABINI_DOĞRULA</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>E-postanı doğrula</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          {email ? <Text style={{ color: colors.text.secondary, fontFamily: fonts.bold }}>{email}</Text> : 'E-postana'} adresine 6 haneli bir kod gönderdik. Devam etmek için kodu gir.
        </Text>

        <View style={{ marginTop: spacing.xl, width: '100%' }}>
          <OtpInput value={code} onChange={setCode} onComplete={verify} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || loading || code.length !== 6) ? 0.7 : 1 }]}
          onPress={() => verify()}
          disabled={loading || code.length !== 6}
        >
          {loading ? <ActivityIndicator color="#06140d" /> : <Text style={styles.btnText}>Doğrula ve Devam Et</Text>}
        </Pressable>

        <View style={styles.row}>
          <Pressable onPress={resend} disabled={left > 0} hitSlop={8}>
            <Text style={[styles.rowText, { color: left > 0 ? colors.text.muted : palette.brand.bright }]}>
              {left > 0 ? `Tekrar gönder (0:${String(left).padStart(2, '0')})` : 'Kodu tekrar gönder'}
            </Text>
          </Pressable>
          <Pressable onPress={handleLogout} hitSlop={8}>
            <Text style={[styles.rowText, { color: palette.brand.bright }]}>Çıkış yap</Text>
          </Pressable>
        </View>

        <View style={[styles.gate, { borderColor: palette.verdict.iddia + '4d', backgroundColor: palette.verdict.iddia + '0f' }]}>
          <Ionicons name="lock-closed" size={12} color={palette.verdict.iddia} />
          <Text style={[styles.gateText, { color: palette.verdict.iddia }]}>DOĞRULANMADAN UYGULAMAYA GİRİLEMEZ</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  seal:      { width: 78, height: 78, borderRadius: radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  eyebrow:   { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6, textAlign: 'center' },
  title:     { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5, marginTop: spacing.sm, textAlign: 'center' },
  subtitle:  { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: spacing.sm, textAlign: 'center', maxWidth: 290 },
  btn:       { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.xl, alignSelf: 'stretch', shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:   { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: spacing.lg, paddingHorizontal: 4 },
  rowText:   { fontFamily: fonts.medium, fontSize: 12.5 },
  gate:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 12, marginTop: spacing.xl, alignSelf: 'stretch' },
  gateText:  { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 },
});
