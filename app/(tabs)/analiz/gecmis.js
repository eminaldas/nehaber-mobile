import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { fonts, palette, spacing, getAnalysisTheme } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { timeAgo } from '../../../lib/forum/format';

const SHORT = { authentic: 'GÜVENİLİR', fake: 'RİSKLİ', iddia: 'İDDİA', neutral: 'ANALİZ' };

export default function AnalizGecmisScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuth } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['analiz-gecmis'],
    queryFn: async () => (await api.get('/users/me/history?page=1&size=50')).data,
    enabled: isAuth,
  });
  const items = data?.items ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.nav, { paddingTop: insets.top + spacing.sm, borderBottomColor: 'rgba(255,255,255,0.14)' }]}>
        <Pressable style={styles.bk} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          <Text style={[styles.bkt, { color: colors.text.primary }]}>Analiz</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text.primary }]}>Geçmiş</Text>
        <View style={styles.side} />
      </View>

      {!isAuth ? (
        <View style={styles.empty}><Text style={[styles.emptyT, { color: colors.text.muted }]}>Geçmişini görmek için giriş yap.</Text></View>
      ) : isLoading ? (
        <View style={styles.empty}><ActivityIndicator color={palette.brand.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.task_id)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
          renderItem={({ item }) => {
            const t = getAnalysisTheme(item.prediction);
            return (
              <Pressable style={styles.row} onPress={() => router.push(`/(tabs)/analiz/rapor/${item.task_id}`)}>
                <View style={[styles.icon, { backgroundColor: t.hex + '1a' }]}>
                  <Ionicons name={t.icon} size={18} color={t.hex} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{item.title || 'Başlıksız analiz'}</Text>
                  <Text style={[styles.meta, { color: colors.text.muted }]}>{timeAgo(item.created_at)}</Text>
                </View>
                <Text style={[styles.tag, { color: t.hex }]}>{SHORT[t.kind] ?? 'ANALİZ'}</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyT, { color: colors.text.muted }]}>Henüz analiz yok.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  bk:       { flexDirection: 'row', alignItems: 'center', gap: 2, width: 90 },
  bkt:      { fontSize: 15, fontFamily: fonts.bold },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: fonts.extrabold },
  side:     { width: 90 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon:     { width: 38, height: 38, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: 14, fontFamily: fonts.bold, lineHeight: 19 },
  meta:     { fontSize: 11, fontFamily: fonts.semibold, marginTop: 3 },
  tag:      { fontSize: 10, fontFamily: fonts.extrabold, letterSpacing: 0.3 },
  sep:      { height: 1 },
  empty:    { alignItems: 'center', paddingTop: 80 },
  emptyT:   { fontSize: 13, fontFamily: fonts.medium },
});
