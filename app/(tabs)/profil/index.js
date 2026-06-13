import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { getMe } from '../../../services/authService';
import api from '../../../services/api';

const TIER_LABELS = {
  yeni_uye:    'Yeni Üye',
  dogrulayici: 'Doğrulayıcı',
  analist:     'Analist',
  dedektif:    'Dedektif',
};

function MenuItem({ icon, label, onPress, danger }) {
  const { colors } = useTheme();
  const tint = danger ? palette.fake.fill : colors.text.secondary;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: colors.bg.surface, borderColor: danger ? palette.fake.fill + '40' : colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={19} color={tint} />
      <Text style={[styles.menuLabel, { color: danger ? palette.fake.text : colors.text.primary }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />}
    </Pressable>
  );
}

export default function ProfilScreen() {
  const { colors, toggleTheme } = useTheme();
  const { isAuth, user, logout } = useAuth();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn:  getMe,
    enabled:  isAuth,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn:  async () => {
      const { data } = await api.get('/users/me/stats');
      return data;
    },
    enabled:  isAuth,
  });

  if (!isAuth) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: colors.bg.base }]}>
        <View style={[styles.guestIcon, { backgroundColor: palette.brand.primary + '14', borderColor: palette.brand.bright + '55' }]}>
          <Ionicons name="shield-checkmark" size={34} color={palette.brand.bright} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.text.primary }]}>Hesabına giriş yap</Text>
        <Text style={[styles.guestSub, { color: colors.text.muted }]}>
          Analiz geçmişin, rozetlerin ve forum puanın burada görünür.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.loginBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginBtnText}>Giriş Yap</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLink}>Hesabın yok mu? Kayıt ol</Text>
        </Pressable>
      </View>
    );
  }

  const username = me?.username ?? user?.username;
  const tier     = me?.forum_trust_tier;
  const hygiene  = stats?.hygiene_score ?? 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.base }} contentContainerStyle={styles.content}>
      {/* Başlık */}
      <View style={styles.header}>
        <View style={[styles.avatar, { borderColor: palette.brand.primary }]}>
          {me?.avatar_url
            ? <Image source={{ uri: me.avatar_url }} style={styles.avatarImg} contentFit="cover" />
            : <Ionicons name="person" size={34} color={palette.brand.bright} />}
        </View>
        <Text style={[styles.username, { color: colors.text.primary }]}>@{username ?? '...'}</Text>
        {tier && (
          <View style={[styles.tierChip, { backgroundColor: palette.brand.primary + '1f', borderColor: palette.brand.bright + '4d' }]}>
            <Ionicons name="shield-checkmark" size={11} color={palette.brand.bright} />
            <Text style={styles.tierText}>{TIER_LABELS[tier] ?? tier}</Text>
          </View>
        )}
      </View>

      {/* Doğruluk hijyeni (gerçek hygiene_score) */}
      {stats && stats.total_analyzed > 0 && (
        <View style={[styles.hygiene, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
          <View style={styles.hygieneTop}>
            <Text style={[styles.hygieneLabel, { color: colors.text.secondary }]}>Doğruluk hijyeni</Text>
            <Text style={[styles.hygieneVal, { color: palette.brand.bright }]}>%{hygiene}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.bg.base }]}>
            <View style={[styles.fill, { width: `${Math.min(hygiene, 100)}%` }]} />
          </View>
        </View>
      )}

      {/* İstatistikler */}
      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: 'Toplam Analiz', val: stats.total_analyzed ?? 0 },
            { label: 'Sahte Tespit',  val: stats.total_fake ?? 0 },
            { label: 'Bu Hafta',      val: stats.week_analyzed ?? 0 },
          ].map(s => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.text.primary }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Menü */}
      <View style={styles.menu}>
        <MenuItem icon="notifications-outline" label="Bildirimler"
          onPress={() => Alert.alert('Bildirimler', 'Bildirimler yakında eklenecek.')} />
        <MenuItem icon="document-text-outline" label="Analiz Geçmişim"
          onPress={() => router.push('/(tabs)/analiz')} />
        <MenuItem icon="contrast-outline" label="Temayı Değiştir" onPress={toggleTheme} />
        <MenuItem icon="log-out-outline" label="Çıkış Yap" danger
          onPress={() => Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
          ])}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:        { paddingBottom: spacing.xxl },

  // Misafir
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  guestIcon:      { width: 76, height: 76, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  guestTitle:     { fontFamily: fonts.bold, fontSize: 20, marginTop: spacing.sm },
  guestSub:       { fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20, maxWidth: 280 },
  loginBtn:       { backgroundColor: palette.brand.primary, marginTop: spacing.lg, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: spacing.xxl },
  loginBtnText:   { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d' },
  registerLink:   { fontFamily: fonts.semibold, color: palette.brand.bright, marginTop: spacing.md, fontSize: 13 },

  // Başlık
  header:         { paddingTop: 60, paddingBottom: spacing.lg, alignItems: 'center' },
  avatar:         { width: 84, height: 84, borderRadius: radius.full, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: palette.brand.accent },
  avatarImg:      { width: '100%', height: '100%' },
  username:       { fontFamily: fonts.bold, fontSize: 19, marginTop: spacing.sm },
  tierChip:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  tierText:       { fontFamily: fonts.semibold, fontSize: 11, color: palette.brand.bright },

  // Hijyen
  hygiene:        { marginHorizontal: spacing.md, padding: spacing.md, borderWidth: 1, borderRadius: radius.md },
  hygieneTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hygieneLabel:   { fontFamily: fonts.medium, fontSize: 12 },
  hygieneVal:     { fontFamily: fonts.extrabold, fontSize: 14 },
  track:          { height: 7, borderRadius: radius.full, overflow: 'hidden' },
  fill:           { height: '100%', borderRadius: radius.full, backgroundColor: palette.brand.primary },

  // İstatistik
  statsRow:       { flexDirection: 'row', padding: spacing.md, gap: spacing.sm },
  statBox:        { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: spacing.md, alignItems: 'center' },
  statVal:        { fontFamily: fonts.extrabold, fontSize: 22 },
  statLabel:      { fontFamily: fonts.medium, fontSize: 10.5, textAlign: 'center', marginTop: 3 },

  // Menü
  menu:           { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
  menuItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, gap: spacing.md },
  menuLabel:      { flex: 1, fontFamily: fonts.medium, fontSize: 14 },
});
