import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthField from '../../../components/auth/AuthField';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { updateProfile } from '../../../services/authService';

export default function GuvenlikScreen() {
  const { colors } = useTheme();
  const toast      = useToast();
  const insets     = useSafeAreaInsets();

  const [current, setCurrent] = useState('');
  const [next, setNext]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!current || !next) { toast.error('Mevcut ve yeni şifre gerekli.', { title: 'Eksik bilgi' }); return; }
    if (next.length < 8)   { toast.error('Yeni şifre en az 8 karakter olmalı.', { title: 'Geçersiz' }); return; }
    if (next !== confirm)  { toast.error('Yeni şifreler eşleşmiyor.', { title: 'Eşleşmiyor' }); return; }
    setLoading(true);
    try {
      await updateProfile({ current_password: current, new_password: next });
      toast.success('Şifren güncellendi.', { title: 'Tamam' });
      router.back();
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Şifre güncellenemedi.';
      toast.error(typeof msg === 'string' ? msg : 'Şifre güncellenemedi.', { title: 'Hata' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg.base }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.bg.deepest }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ width: 24 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Güvenlik</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
        <Text style={[styles.section, { color: colors.text.muted }]}>ŞİFRE DEĞİŞTİR</Text>
        <AuthField label="Mevcut şifre" icon="lock-closed-outline" placeholder="••••••••" value={current} onChangeText={setCurrent} secure autoCapitalize="none" />
        <AuthField label="Yeni şifre" icon="key-outline" placeholder="En az 8 karakter" value={next} onChangeText={setNext} secure autoCapitalize="none" />
        <AuthField label="Yeni şifre (tekrar)" icon="key-outline" placeholder="••••••••" value={confirm} onChangeText={setConfirm} secure autoCapitalize="none" />

        <Pressable style={({ pressed }) => [styles.saveBtn, { opacity: (pressed || loading) ? 0.85 : 1 }]} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color="#06140d" /> : <Text style={styles.saveText}>Şifreyi Güncelle</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topbar:   { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 17 },
  section:  { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, marginTop: spacing.sm, marginBottom: spacing.xs, marginLeft: 3 },
  saveBtn:  { backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.xl },
  saveText: { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d' },
});
