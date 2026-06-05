import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput,
} from 'react-native';
import { palette, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { register as registerApi } from '../../services/authService';

export default function RegisterScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email:'', username:'', password:'' });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.email || !form.username || !form.password) {
      Alert.alert('Hata', 'Tüm alanlar zorunlu.');
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

  return (
    <KeyboardAvoidingView
      style={{ flex:1, backgroundColor:'#0d1f12' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kayıt Ol</Text>

        {['email','username','password'].map(field => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={field === 'email' ? 'Email' : field === 'username' ? 'Kullanıcı adı' : 'Şifre (min. 8 karakter)'}
            placeholderTextColor="#7aad8a"
            value={form[field]}
            onChangeText={v => update(field, v)}
            secureTextEntry={field === 'password'}
            autoCapitalize="none"
            keyboardType={field === 'email' ? 'email-address' : 'default'}
          />
        ))}

        <Pressable style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Kayıt Ol</Text>
          }
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, justifyContent:'center', paddingHorizontal: spacing.xl },
  title:     { fontSize: typography.xl, fontWeight:'700', color:'#e8f5ee', textAlign:'center', marginBottom: spacing.xl },
  input:     { backgroundColor:'#1a2e1f', borderWidth:1, borderColor:'#2e4a35', borderRadius: radius.md, padding: spacing.md, color:'#e8f5ee', marginBottom: spacing.sm, fontSize: typography.md },
  btn:       { backgroundColor: palette.brand.primary, borderRadius: radius.md, padding: spacing.md, alignItems:'center', marginTop: spacing.sm },
  btnText:   { color:'#fff', fontWeight:'600', fontSize: typography.md },
  link:      { color: palette.brand.primary, textAlign:'center', marginTop: spacing.md, fontSize: typography.sm },
});
