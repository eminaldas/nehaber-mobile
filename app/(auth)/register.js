import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AuthField from '../../components/auth/AuthField';
import GoogleButton from '../../components/auth/GoogleButton';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { register as registerApi } from '../../services/authService';

export default function RegisterScreen() {
  const { colors }  = useTheme();
  const { login }   = useAuth();
  const [form, setForm]       = useState({ email: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.email || !form.username || !form.password) {
      Alert.alert('Eksik bilgi', 'Tüm alanlar zorunlu.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi({
        email:          form.email.trim().toLowerCase(),
        username:       form.username.trim(),
        password:       form.password,
        terms_accepted: true,
      });
      await login(data.access_token, data.user);
      router.replace('/(tabs)/haberler');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join('\n')
        : (detail ?? 'Kayıt başarısız.');
      Alert.alert('Kayıt Hatası', msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    // TODO: expo-auth-session ile Google access_token al → googleLogin(token) → /auth/google.
    Alert.alert('Google ile kayıt', 'Google girişi yakında aktif olacak.');
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

        <Text style={[styles.title, { color: colors.text.primary }]}>Hesap oluştur</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Topluluğa katıl, sahte haberi birlikte yakalayalım.
        </Text>

        <AuthField
          label="E-posta"
          icon="mail-outline"
          placeholder="ornek@eposta.com"
          value={form.email}
          onChangeText={v => update('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={{ marginTop: spacing.lg }}
        />
        <AuthField
          label="Kullanıcı adı"
          icon="person-outline"
          placeholder="kullanici_adi"
          value={form.username}
          onChangeText={v => update('username', v)}
          autoCapitalize="none"
        />
        <AuthField
          label="Şifre"
          icon="lock-closed-outline"
          placeholder="En az 8 karakter"
          value={form.password}
          onChangeText={v => update('password', v)}
          secure
          autoCapitalize="none"
        />

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || loading) ? 0.85 : 1 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#06140d" />
            : <Text style={styles.btnText}>Kayıt Ol</Text>}
        </Pressable>

        <Text style={[styles.terms, { color: colors.text.muted }]}>
          Kayıt olarak <Text style={styles.termsLink}>Kullanım Koşulları</Text> ve{' '}
          <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul etmiş olursun.
        </Text>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.text.muted }]}>veya</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <GoogleButton onPress={handleGoogle} label="Google ile kayıt ol" />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.muted }]}>Zaten hesabın var mı? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </Pressable>
        </View>
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
  btn:         { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.lg, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:     { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  terms:       { fontFamily: fonts.regular, fontSize: 10.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.md },
  termsLink:   { fontFamily: fonts.semibold, color: palette.brand.bright },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  line:        { flex: 1, height: 1 },
  dividerText: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  footer:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  footerText:  { fontFamily: fonts.regular, fontSize: 12.5 },
  footerLink:  { fontFamily: fonts.semibold, fontSize: 12.5, color: palette.brand.bright },
});
