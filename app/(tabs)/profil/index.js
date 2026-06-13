import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CornerBrackets from '../../../components/analysis/CornerBrackets';
import BottomSheet from '../../../components/ui/BottomSheet';
import { fonts, getAnalysisTheme, palette, radius, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { getMe } from '../../../services/authService';
import { getFullReport } from '../../../services/analysisService';
import api from '../../../services/api';

const TIER_LABELS = { yeni_uye: 'YENİ ÜYE', dogrulayici: 'DOĞRULAYICI', analist: 'ANALİST', dedektif: 'DEDEKTİF' };
const BADGE_ICON  = { level: 'trophy', analiz: 'shield-checkmark', analysis: 'shield-checkmark', forum: 'chatbubble-ellipses', xp: 'flash', streak: 'flame' };
const SHORT = { authentic: 'DOĞRU', fake: 'SAHTE', iddia: 'İDDİA', neutral: 'ANALİZ' };

function relDate(iso) {
  if (!iso) return '';
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return 'BUGÜN';
  if (d < 2) return 'DÜN';
  if (d < 7) return `${Math.floor(d)}G ÖNCE`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }).toUpperCase();
}

function verdictOf(prediction) {
  const t = getAnalysisTheme(prediction);
  return { hex: t.hex, icon: t.icon, short: SHORT[t.kind] ?? 'ANALİZ' };
}

export default function ProfilScreen() {
  const { colors } = useTheme();
  const { isAuth, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  const { data: me }    = useQuery({ queryKey: ['me'], queryFn: getMe, enabled: isAuth });
  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: async () => (await api.get('/users/me/stats')).data, enabled: isAuth });
  const { data: badges } = useQuery({ queryKey: ['my-badges'], queryFn: async () => (await api.get('/gamification/me/badges')).data, enabled: isAuth });
  const { data: history } = useQuery({ queryKey: ['my-history'], queryFn: async () => (await api.get('/users/me/history?page=1&size=10')).data, enabled: isAuth });
  const { data: xp }    = useQuery({ queryKey: ['xp-stats'], queryFn: async () => (await api.get('/gamification/me/stats')).data, enabled: isAuth });
  const { data: trust } = useQuery({ queryKey: ['my-trust'], queryFn: async () => (await api.get('/users/me/trust')).data, enabled: isAuth });

  // Seçili analizin tam raporu gerçekten var mı? (lazy)
  const { data: reportInfo } = useQuery({
    queryKey: ['full-report-exists', selected?.task_id],
    queryFn:  async () => { try { return await getFullReport(selected.task_id); } catch { return { status: 'none' }; } },
    enabled:  !!selected?.task_id,
  });
  const hasFullReport = reportInfo?.status === 'cached';

  if (!isAuth) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: colors.bg.base }]}>
        <View style={[styles.guestIcon, { backgroundColor: palette.brand.primary + '14', borderColor: palette.brand.bright + '55' }]}>
          <Ionicons name="shield-checkmark" size={34} color={palette.brand.bright} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.text.primary }]}>Hesabına giriş yap</Text>
        <Text style={[styles.guestSub, { color: colors.text.muted }]}>Analiz geçmişin, rozetlerin ve forum puanın burada görünür.</Text>
        <Pressable style={({ pressed }) => [styles.loginBtn, { opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push('/(auth)/login')}>
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
  const earned   = badges?.earned ?? [];
  const locked   = badges?.locked ?? [];
  const badgeList = [...earned.map(b => ({ ...b, earned: true })), ...locked.map(b => ({ ...b, earned: false }))].slice(0, 8);
  const items    = history?.items ?? [];

  const sel = selected ? verdictOf(selected.prediction) : null;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.base }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Üst bar */}
        <View style={[styles.topbar, { paddingTop: insets.top + 10 }]}>
          <View style={styles.titleRow}>
            <Ionicons name="shield-checkmark" size={20} color={palette.brand.bright} />
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Profil</Text>
          </View>
          <Pressable hitSlop={10} onPress={() => router.push('/(tabs)/profil/ayarlar')}>
            <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
          </Pressable>
        </View>

        {/* Odaklanma kutusu */}
        <View style={styles.focusWrap}>
          <View style={[styles.focus, { backgroundColor: palette.brand.primary + '07' }]}>
            <CornerBrackets color={palette.brand.bright} size={16} thickness={2} />
            <View style={[styles.avatar, { borderColor: palette.brand.primary }]}>
              {me?.avatar_url
                ? <Image source={{ uri: me.avatar_url }} style={styles.avatarImg} contentFit="cover" />
                : <Ionicons name="person" size={34} color={palette.brand.bright} />}
            </View>
            <Text style={[styles.username, { color: colors.text.primary }]}>@{username ?? '...'}</Text>
            {trust && (
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Ionicons
                    key={n}
                    name={n <= (trust.stars || 0) ? 'star' : 'star-outline'}
                    size={12}
                    color={n <= (trust.stars || 0) ? palette.brand.bright : colors.text.muted}
                  />
                ))}
              </View>
            )}
            <View style={[styles.tier, { borderColor: palette.brand.bright + '4d', backgroundColor: palette.brand.primary + '14' }]}>
              <Text style={styles.tierText}>
                {(trust?.display_label ?? TIER_LABELS[tier] ?? 'YENİ ÜYE').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Minimal istatistik */}
        {stats && (
          <View style={styles.mstats}>
            {[
              { v: stats.total_analyzed ?? 0, l: 'ANALİZ' },
              { v: stats.total_fake ?? 0, l: 'SAHTE' },
              { v: `%${hygiene}`, l: 'HİJYEN', g: true },
            ].map((s, i) => (
              <View key={s.l} style={[styles.ms, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                <Text style={[styles.msV, { color: s.g ? palette.brand.bright : colors.text.primary }]}>{s.v}</Text>
                <Text style={[styles.msL, { color: colors.text.muted }]}>{s.l}</Text>
              </View>
            ))}
          </View>
        )}

        {/* XP / Seviye */}
        {xp && (
          <View style={[styles.xpCard, { borderColor: colors.border, backgroundColor: colors.bg.surface }]}>
            <View style={styles.xpTop}>
              <Text style={[styles.xpLevel, { color: colors.text.primary }]}>SEVİYE {xp.level}</Text>
              <Text style={[styles.xpVal, { color: colors.text.muted }]}>{xp.total_xp} XP</Text>
            </View>
            <View style={[styles.xpTrack, { backgroundColor: colors.bg.base }]}>
              <View style={[styles.xpFill, { width: `${Math.min(xp.xp_progress_pct ?? 0, 100)}%` }]} />
            </View>
            <Text style={[styles.xpNext, { color: colors.text.muted }]}>
              Sonraki seviyeye {xp.xp_to_next_level} XP kaldı
            </Text>
          </View>
        )}

        {/* Rozetler */}
        {badgeList.length > 0 && (
          <>
            <View style={styles.secRow}>
              <Text style={[styles.secLabel, { color: colors.text.secondary }]}>ROZETLER</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges}>
              {badgeList.map(b => (
                <View key={b.key} style={styles.badge}>
                  <View style={[styles.badgeSq, {
                    borderColor: b.earned ? palette.brand.primary : colors.border,
                    backgroundColor: b.earned ? palette.brand.primary + '14' : colors.bg.surface,
                  }]}>
                    <Ionicons
                      name={b.earned ? (BADGE_ICON[b.category] ?? 'ribbon') : 'lock-closed'}
                      size={19}
                      color={b.earned ? palette.brand.bright : colors.text.muted}
                    />
                  </View>
                  <Text style={[styles.badgeName, { color: b.earned ? colors.text.secondary : colors.text.muted }]} numberOfLines={1}>
                    {b.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Son analizler */}
        <View style={styles.secRow}>
          <Text style={[styles.secLabel, { color: colors.text.secondary }]}>SON ANALİZLER</Text>
        </View>
        <View style={{ paddingHorizontal: spacing.md }}>
          {items.length === 0 ? (
            <Text style={[styles.empty, { color: colors.text.muted }]}>Henüz analiz yok. İlk haberini analiz et!</Text>
          ) : items.map((it, i) => {
            const v = verdictOf(it.prediction);
            return (
              <Pressable
                key={it.id}
                onPress={() => setSelected(it)}
                style={({ pressed }) => [
                  styles.aitem,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.vbar, { backgroundColor: v.hex }]} />
                <View style={styles.abody}>
                  <Text style={[styles.atitle, { color: colors.text.primary }]} numberOfLines={2}>{it.title || 'Başlıksız analiz'}</Text>
                  <Text style={[styles.ameta, { color: colors.text.muted }]}>{relDate(it.created_at)}</Text>
                </View>
                <Text style={[styles.vtag, { color: v.hex }]}>{v.short}</Text>
                <Ionicons name="chevron-forward" size={15} color={colors.text.muted} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Analiz detay sheet */}
      <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
        {selected && sel && (
          <>
            <View style={styles.sHead}>
              <View style={[styles.sIcon, { borderColor: sel.hex + '5a', backgroundColor: sel.hex + '1a' }]}>
                <Ionicons name={sel.icon} size={20} color={sel.hex} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sVerdict, { color: sel.hex }]}>
                  [ {sel.short}{selected.confidence != null ? ` · %${Math.round(selected.confidence * 100)}` : ''} ]
                </Text>
                <Text style={[styles.sDate, { color: colors.text.muted }]}>{relDate(selected.created_at)}</Text>
              </View>
            </View>
            <Text style={[styles.sTitle, { color: colors.text.primary }]}>{selected.title || 'Başlıksız analiz'}</Text>
            {!!selected.source_url && (
              <Text style={[styles.sUrl, { color: colors.text.muted }]} numberOfLines={1}>{selected.source_url}</Text>
            )}
            {hasFullReport && (
              <Pressable
                style={({ pressed }) => [styles.fullBtn, { opacity: pressed ? 0.9 : 1 }]}
                onPress={() => { const tid = selected.task_id; setSelected(null); router.push(`/(tabs)/analiz/rapor/${tid}`); }}
              >
                <Ionicons name="document-text-outline" size={16} color="#06140d" />
                <Text style={styles.fullText}>Tam Raporu Gör</Text>
              </Pressable>
            )}
          </>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  // Misafir
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  guestIcon:      { width: 76, height: 76, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  guestTitle:     { fontFamily: fonts.bold, fontSize: 20, marginTop: spacing.sm },
  guestSub:       { fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20, maxWidth: 280 },
  loginBtn:       { backgroundColor: palette.brand.primary, marginTop: spacing.lg, borderRadius: radius.sm, paddingVertical: 14, paddingHorizontal: spacing.xxl },
  loginBtnText:   { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d' },
  registerLink:   { fontFamily: fonts.semibold, color: palette.brand.bright, marginTop: spacing.md, fontSize: 13 },

  // Üst bar
  topbar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  titleRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageTitle:      { fontFamily: fonts.extrabold, fontSize: 18 },

  // Odaklanma kutusu
  focusWrap:      { alignItems: 'center', marginTop: spacing.sm },
  focus:          { width: 220, paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm },
  avatar:         { width: 82, height: 82, borderRadius: radius.full, borderWidth: 2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: palette.brand.accent },
  avatarImg:      { width: '100%', height: '100%' },
  username:       { fontFamily: fonts.extrabold, fontSize: 17, marginTop: 4 },
  stars:          { flexDirection: 'row', gap: 2 },
  tier:           { borderWidth: 1, borderRadius: 2, paddingHorizontal: 9, paddingVertical: 3 },
  tierText:       { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 1.2, color: palette.brand.bright },

  // Minimal istatistik
  mstats:         { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  ms:             { paddingHorizontal: spacing.lg, alignItems: 'center' },
  msV:            { fontFamily: fonts.extrabold, fontSize: 15 },
  msL:            { fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1, marginTop: 3 },

  // XP / Seviye
  xpCard:         { marginHorizontal: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md },
  xpTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpLevel:        { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  xpVal:          { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.5 },
  xpTrack:        { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  xpFill:         { height: '100%', borderRadius: radius.full, backgroundColor: palette.brand.primary },
  xpNext:         { fontFamily: fonts.medium, fontSize: 9.5, letterSpacing: 0.3, marginTop: 7 },

  // Bölüm
  secRow:         { paddingHorizontal: spacing.md, marginTop: spacing.xl, marginBottom: spacing.sm },
  secLabel:       { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.5 },

  // Rozetler
  badges:         { paddingHorizontal: spacing.md, gap: spacing.md },
  badge:          { alignItems: 'center', gap: 6, width: 58 },
  badgeSq:        { width: 46, height: 46, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badgeName:      { fontFamily: fonts.semibold, fontSize: 9, textAlign: 'center' },

  // Analiz listesi (borderless)
  empty:          { fontFamily: fonts.regular, fontSize: 13, paddingVertical: spacing.lg, textAlign: 'center' },
  aitem:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 13 },
  vbar:           { width: 3, height: 38, borderRadius: 2 },
  abody:          { flex: 1, minWidth: 0 },
  atitle:         { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 17 },
  ameta:          { fontFamily: fonts.medium, fontSize: 9, letterSpacing: 0.5, marginTop: 4 },
  vtag:           { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 0.5 },

  // Detay sheet
  sHead:          { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sIcon:          { width: 44, height: 44, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sVerdict:       { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 },
  sDate:          { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 0.5, marginTop: 3 },
  sTitle:         { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, marginTop: spacing.md },
  sUrl:           { fontFamily: fonts.regular, fontSize: 11.5, marginTop: spacing.sm },
  fullBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: palette.brand.primary, borderRadius: radius.sm, paddingVertical: 12, marginTop: spacing.lg },
  fullText:       { fontFamily: fonts.bold, fontSize: 13, color: '#06140d' },
});
