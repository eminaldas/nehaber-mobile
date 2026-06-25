import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AuthField from '../../components/auth/AuthField';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { sendPasswordResetCode } from '../../services/authService';

export default function SifremiUnuttumScreen() {
  const { colors } = useTheme();
  const toast      = useToast();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const e = email.trim().toLowerCase();
    if (!e) {
      toast.error('E-posta gerekli.', { title: 'Eksik bilgi' });
      return;
    }
    setLoading(true);
    try {
      const data = await sendPasswordResetCode(e);
      // Dev modda (e-posta sağlayıcısı yoksa) kod yanıt içinde gelir — kolaylık için göster.
      if (data?.dev_code) toast.info(`DEV kod: ${data.dev_code}`, { title: 'Geliştirme' });
      toast.success('Kod e-postana gönderildi.', { title: 'Gönderildi' });
      router.push({ pathname: '/(auth)/kod-dogrula', params: { email: e } });
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Kod gönderilemedi.';
      toast.error(typeof msg === 'string' ? msg : 'Kod gönderilemedi.', { title: 'Hata' });
    } finally {
      setLoading(false);
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
          <Text style={[styles.backText, { color: colors.text.muted }]}>GİRİŞE DÖN</Text>
        </Pressable>

        <View style={styles.brandRow}>
          <Ionicons name="shield-checkmark" size={22} color={palette.brand.bright} />
          <Text style={styles.logo}>NeHaber</Text>
        </View>

        <Text style={[styles.eyebrow, { color: palette.brand.bright }]}>// HESAP_KURTARMA</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Şifreni mi unuttun?</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          E-posta adresini gir — hesabına 6 haneli bir doğrulama kodu göndereceğiz.
        </Text>

        <AuthField
          label="E-posta"
          icon="mail-outline"
          placeholder="ornek@eposta.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={{ marginTop: spacing.xl }}
        />

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || loading) ? 0.85 : 1 }]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#06140d" /> : <Text style={styles.btnText}>Kodu Gönder</Text>}
        </Pressable>

        <Text style={[styles.hint, { color: colors.text.muted }]}>Kod 15 dakika geçerli olacak.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  back:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xl },
  backText:  { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.2 },
  brandRow:  { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logo:      { fontFamily: fonts.logo, fontSize: 23, color: palette.brand.bright },
  eyebrow:   { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6, marginTop: spacing.lg },
  title:     { fontFamily: fonts.bold, fontSize: 25, letterSpacing: -0.5, marginTop: spacing.sm },
  subtitle:  { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  btn:       { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.lg, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:   { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  hint:      { fontFamily: fonts.medium, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
});
