import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import AuthField from '../../components/auth/AuthField';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { resetPasswordWithCode } from '../../services/authService';

function validate(pw) {
  if (pw.length < 8) return 'Şifre en az 8 karakter olmalı.';
  if (!/[0-9]/.test(pw)) return 'Şifre en az bir rakam içermeli.';
  if (!/[a-zA-Z]/.test(pw)) return 'Şifre en az bir harf içermeli.';
  return null;
}

export default function YeniSifreScreen() {
  const { colors }       = useTheme();
  const toast            = useToast();
  const { email, code }  = useLocalSearchParams();
  const [pw, setPw]      = useState('');
  const [pw2, setPw2]    = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const err = validate(pw);
    if (err) { toast.error(err, { title: 'Geçersiz şifre' }); return; }
    if (pw !== pw2) { toast.error('Şifreler eşleşmiyor.', { title: 'Hata' }); return; }
    setLoading(true);
    try {
      await resetPasswordWithCode(String(email), String(code), pw);
      toast.success('Şifren güncellendi. Giriş yapabilirsin.', { title: 'Başarılı' });
      router.replace('/(auth)/login');
    } catch (err2) {
      const detail = err2.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Şifre güncellenemedi.';
      toast.error(msg, { title: 'Hata' });
      // Kod hatalıysa kullanıcı geri dönüp tekrar girebilsin
      if (err2.response?.status === 400) router.back();
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
          <Text style={[styles.backText, { color: colors.text.muted }]}>GERİ</Text>
        </Pressable>

        <Text style={[styles.eyebrow, { color: palette.brand.bright }]}>// YENİ_ŞİFRE</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Yeni şifreni belirle</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Kod doğrulandı. Artık yeni bir şifre oluşturabilirsin.
        </Text>

        <AuthField
          label="Yeni şifre"
          icon="lock-closed-outline"
          placeholder="En az 8 karakter"
          value={pw}
          onChangeText={setPw}
          secure
          autoCapitalize="none"
          style={{ marginTop: spacing.xl }}
        />
        <AuthField
          label="Yeni şifre (tekrar)"
          icon="lock-closed-outline"
          placeholder="Şifreyi tekrar gir"
          value={pw2}
          onChangeText={setPw2}
          secure
          autoCapitalize="none"
        />

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: (pressed || loading) ? 0.85 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#06140d" /> : <Text style={styles.btnText}>Şifreyi Kaydet</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  back:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xl },
  backText:  { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.2 },
  eyebrow:   { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.6 },
  title:     { fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.5, marginTop: spacing.sm },
  subtitle:  { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  btn:       { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.lg, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  btnText:   { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
});
