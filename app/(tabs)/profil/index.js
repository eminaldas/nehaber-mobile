import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { palette, radius, spacing, typography } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import api from '../../../services/api';

const TIER_LABELS = {
  yeni_uye:    'Yeni Üye',
  dogrulayici: 'Doğrulayıcı',
  analist:     'Analist',
  dedektif:    'Dedektif',
};

function MenuItem({ emoji, label, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.menuItem, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, { color: colors.text.primary }]}>{label}</Text>
      <Text style={{ color: colors.text.muted }}>›</Text>
    </Pressable>
  );
}

export default function ProfilScreen() {
  const { colors }   = useTheme();
  const { isAuth, user, logout } = useAuth();

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
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={[styles.guestTitle, { color: colors.text.primary }]}>Hesabına giriş yap</Text>
        <Text style={[styles.guestSub, { color: colors.text.muted }]}>
          Analiz geçmişin, rozetlerin ve forum puanın burada görünür.
        </Text>
        <Pressable style={[styles.loginBtn, { backgroundColor: palette.brand.primary }]} onPress={() => router.push('/(auth)/login')}>
          <Text style={{ color:'#fff', fontWeight:'600', fontSize: typography.md }}>Giriş Yap</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={[styles.registerLink, { color: palette.brand.primary }]}>Kayıt ol</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor: colors.bg.base }} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: colors.bg.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: palette.brand.accent, borderColor: palette.brand.primary }]}>
          <Text style={{ fontSize: 32 }}>👤</Text>
        </View>
        <Text style={[styles.username, { color: colors.text.primary }]}>@{user?.username ?? '...'}</Text>
        {user?.forum_trust_tier && (
          <View style={[styles.tierBadge, { backgroundColor: palette.brand.accent }]}>
            <Text style={[styles.tierText, { color: palette.brand.primary }]}>
              {TIER_LABELS[user.forum_trust_tier] ?? user.forum_trust_tier}
            </Text>
          </View>
        )}
      </View>

      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: 'Toplam Analiz', val: stats.total_analyzed ?? 0 },
            { label: 'Sahte Tespit',  val: stats.total_fake ?? 0 },
            { label: 'Bu Hafta',      val: stats.week_analyzed ?? 0 },
          ].map(s => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: palette.brand.primary }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.text.muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.menu}>
        <MenuItem emoji="🔔" label="Bildirimler"      onPress={() => {}} />
        <MenuItem emoji="📋" label="Analiz Geçmişim" onPress={() => {}} />
        <MenuItem emoji="⚙️" label="Ayarlar"          onPress={() => {}} />
        <MenuItem emoji="🚪" label="Çıkış Yap"
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
  guestContainer: { flex:1, justifyContent:'center', alignItems:'center', padding: spacing.xl },
  guestTitle:     { fontSize: typography.xl, fontWeight:'700', marginTop: spacing.md },
  guestSub:       { fontSize: typography.sm, textAlign:'center', marginTop: spacing.sm, lineHeight:20 },
  loginBtn:       { marginTop: spacing.lg, borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl },
  registerLink:   { marginTop: spacing.md, fontSize: typography.sm },
  header:         { paddingTop:60, paddingBottom: spacing.lg, alignItems:'center', borderBottomWidth:1 },
  avatar:         { width:80, height:80, borderRadius:40, borderWidth:3, justifyContent:'center', alignItems:'center', marginBottom: spacing.sm },
  username:       { fontSize: typography.lg, fontWeight:'700' },
  tierBadge:      { marginTop: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical:3 },
  tierText:       { fontSize: typography.xs, fontWeight:'600' },
  statsRow:       { flexDirection:'row', padding: spacing.md, gap: spacing.sm },
  statBox:        { flex:1, borderRadius: radius.md, borderWidth:1, padding: spacing.sm, alignItems:'center' },
  statVal:        { fontSize: typography.xl, fontWeight:'800' },
  statLabel:      { fontSize: typography.xs, textAlign:'center', marginTop:2 },
  menu:           { padding: spacing.md, gap: spacing.sm },
  menuItem:       { flexDirection:'row', alignItems:'center', padding: spacing.md, borderRadius: radius.md, borderWidth:1, gap: spacing.sm },
  menuEmoji:      { fontSize: 18, width: 28 },
  menuLabel:      { flex:1, fontSize: typography.md },
});
