import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AuthField from '../../components/auth/AuthField';
import GoogleButton from '../../components/auth/GoogleButton';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { login as loginApi } from '../../services/authService';

export default function LoginScreen() {
  const { colors }    = useTheme();
  const { login }     = useAuth();
  const toast         = useToast();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      toast.error('E-posta ve şifre gerekli.', { title: 'Eksik bilgi' });
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(email.trim().toLowerCase(), password);
      await login(data.access_token, { email: email.trim().toLowerCase() });
      toast.success('Giriş başarılı, yönlendiriliyorsun…', { title: 'Hoş geldin!' });
      router.replace('/(tabs)/haberler');
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Giriş başarısız.';
      toast.error(msg, { title: 'Giriş yapılamadı' });
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    // TODO: expo-auth-session ile Google access_token al → googleLogin(token) → /auth/google.
    // Gerçek akış için Google Cloud OAuth client ID'leri gerekli.
    toast.info('Google ile giriş çok yakında aktif olacak.', { title: 'Yakında' });
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <Ionicons name="shield-checkmark" size={22} color={palette.brand.bright} />
          <Text style={styles.logo}>NeHaber</Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>Tekrar hoş geldin</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Hesabına giriş yap — analiz geçmişin ve rozetlerin seni bekliyor.
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
        <AuthField
          label="Şifre"
          icon="lock-closed-outline"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secure
          autoCapitalize="none"
        />

        <Pressable onPress={() => toast.info('Şifre sıfırlama yakında eklenecek.', { title: 'Yakında' })}>
          <Text style={[styles.forgot, { color: colors.text.muted }]}>Şifreni mi unuttun?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || loading) ? 0.85 : 1 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#06140d" />
            : <Text style={styles.btnText}>Giriş Yap</Text>}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.text.muted }]}>veya</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <GoogleButton onPress={handleGoogle} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.muted }]}>Hesabın yok mu? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Kayıt ol</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace('/(tabs)/haberler')} style={styles.guestBtn}>
          <Text style={[styles.guest, { color: colors.text.muted }]}>Misafir olarak devam et</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  scroll:      { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  brandRow:    { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logo:        { fontFamily: fonts.logo, fontSize: 23, color: palette.brand.bright },
  title:       { fontFamily: fonts.bold, fontSize: 25, letterSpacing: -0.5, marginTop: spacing.lg },
  subtitle:    { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  forgot:      { fontFamily: fonts.medium, fontSize: 12, textAlign: 'right', marginTop: spacing.md },
  btn:         { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.lg, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:     { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  line:        { flex: 1, height: 1 },
  dividerText: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  footer:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  footerText:  { fontFamily: fonts.regular, fontSize: 12.5 },
  footerLink:  { fontFamily: fonts.semibold, fontSize: 12.5, color: palette.brand.bright },
  guestBtn:    { marginTop: spacing.md, alignItems: 'center' },
  guest:       { fontFamily: fonts.regular, fontSize: 11.5 },
});
