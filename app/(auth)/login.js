import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { palette, spacing, typography, radius } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../services/authService';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'Email ve şifre gerekli.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginApi(email.trim().toLowerCase(), password);
      // Token'ı önce kaydet; getMe Axios interceptor'ı üzerinden token'ı otomatik ekler
      await login(data.access_token, { email: email.trim().toLowerCase() });
      router.replace('/(tabs)/haberler');
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Giriş başarısız.';
      Alert.alert('Giriş Hatası', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>NeHaber</Text>
      <Text style={styles.subtitle}>Sahte haberi birlikte tespit edelim.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7aad8a"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#7aad8a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Giriş Yap</Text>
        }
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Hesabın yok mu? Kayıt ol</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/(tabs)/haberler')}>
        <Text style={styles.guest}>Misafir olarak devam et</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:'#0d1f12', justifyContent:'center', paddingHorizontal: spacing.xl },
  title:      { fontSize: typography.xxl, fontWeight:'700', color:'#e8f5ee', textAlign:'center', marginBottom: spacing.xs },
  subtitle:   { fontSize: typography.sm, color:'#7aad8a', textAlign:'center', marginBottom: spacing.xl },
  input:      { backgroundColor:'#1a2e1f', borderWidth:1, borderColor:'#2e4a35', borderRadius: radius.md, padding: spacing.md, color:'#e8f5ee', marginBottom: spacing.sm, fontSize: typography.md },
  btn:        { backgroundColor: palette.brand.primary, borderRadius: radius.md, padding: spacing.md, alignItems:'center', marginTop: spacing.sm },
  btnText:    { color:'#fff', fontWeight:'600', fontSize: typography.md },
  link:       { color: palette.brand.primary, textAlign:'center', marginTop: spacing.md, fontSize: typography.sm },
  guest:      { color:'#7aad8a', textAlign:'center', marginTop: spacing.sm, fontSize: typography.xs },
});
