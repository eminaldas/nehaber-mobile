import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import api from '../../../services/api';

const PREFS = [
  { key: 'high_risk_alert', icon: 'warning-outline', label: 'Yüksek risk uyarısı', desc: 'Takip ettiğin konularda sahte içerik tespit edilince bildir.' },
  { key: 'email_digest',    icon: 'mail-outline',    label: 'E-posta özeti',        desc: 'Haftalık analiz ve gündem özetini e-posta ile al.' },
];

export default function BildirimlerScreen() {
  const { colors } = useTheme();
  const toast      = useToast();
  const insets     = useSafeAreaInsets();
  const qc         = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ['notif-prefs'],
    queryFn:  async () => (await api.get('/notifications/prefs')).data,
  });

  async function toggle(key, value) {
    qc.setQueryData(['notif-prefs'], (old) => ({ ...(old ?? {}), [key]: value }));
    try {
      await api.patch('/notifications/prefs', { [key]: value });
    } catch {
      qc.setQueryData(['notif-prefs'], (old) => ({ ...(old ?? {}), [key]: !value }));
      toast.error('Tercih kaydedilemedi.', { title: 'Hata' });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.bg.deepest }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ width: 24 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Bildirimler</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={[styles.group, { backgroundColor: colors.bg.surface, borderColor: colors.border }]}>
          {PREFS.map((p, i) => (
            <View key={p.key} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: palette.brand.primary + '1a' }]}>
                <Ionicons name={p.icon} size={17} color={palette.brand.bright} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{p.label}</Text>
                <Text style={[styles.rowDesc, { color: colors.text.muted }]}>{p.desc}</Text>
              </View>
              <Switch
                value={!!prefs?.[p.key]}
                onValueChange={(v) => toggle(p.key, v)}
                trackColor={{ false: colors.bg.solid, true: palette.brand.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:   { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 17 },
  group:    { borderWidth: 1, borderRadius: radius.sm, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowIcon:  { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 14 },
  rowDesc:  { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, marginTop: 3 },
});
