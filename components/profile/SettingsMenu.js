import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const ITEMS = [
  { icon: 'person-outline',           label: 'Hesap',       to: '/(tabs)/profil/hesap' },
  { icon: 'phone-portrait-outline',   label: 'Görünüm',     to: '/(tabs)/profil/gorunum' },
  { icon: 'shield-checkmark-outline', label: 'Güvenlik',    to: '/(tabs)/profil/guvenlik' },
  { icon: 'notifications-outline',    label: 'Bildirimler', to: '/(tabs)/profil/bildirimler' },
];

export default function SettingsMenu() {
  const { colors, isDark } = useTheme();
  const { logout } = useAuth();
  const accent = isDark ? palette.brand.bright : colors.text.primary;
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[styles.menuHead, { color: colors.text.muted }]}>MENÜ</Text>
        {ITEMS.map((it, i) => (
          <Pressable
            key={it.label}
            onPress={() => router.push(it.to)}
            style={({ pressed }) => [styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, pressed && { backgroundColor: colors.bg.surface }]}
          >
            <Ionicons name={it.icon} size={19} color={accent} />
            <Text style={[styles.rowLabel, { color: colors.text.primary }]}>{it.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={accent} />
          </Pressable>
        ))}

        <Pressable
          onPress={() => setLogoutOpen(true)}
          style={({ pressed }) => [styles.logoutBtn, { borderColor: palette.fake.fill + '55', backgroundColor: pressed ? palette.fake.fill + '14' : 'transparent' }]}
        >
          <Ionicons name="log-out-outline" size={19} color={palette.fake.fill} />
          <Text style={[styles.logoutText, { color: palette.fake.fill }]}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>

      <BottomSheet visible={logoutOpen} onClose={() => setLogoutOpen(false)} title="Çıkış yap">
        <Text style={[styles.sheetMsg, { color: colors.text.muted }]}>Hesabından çıkış yapmak istediğine emin misin?</Text>
        <Pressable style={({ pressed }) => [styles.dangerBtn, { backgroundColor: palette.fake.fill, opacity: pressed ? 0.9 : 1 }]} onPress={() => { setLogoutOpen(false); logout(); }}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.dangerText}>Çıkış Yap</Text>
        </Pressable>
        <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setLogoutOpen(false)}>
          <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Vazgeç</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  menuHead:  { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: spacing.xs },
  row:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 16, paddingHorizontal: spacing.sm },
  rowLabel:  { flex: 1, fontFamily: fonts.bold, fontSize: 14.5 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 14 },
  logoutText:{ fontFamily: fonts.bold, fontSize: 14 },
  sheetMsg:  { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.sm, paddingVertical: 15 },
  dangerText:{ fontFamily: fonts.bold, fontSize: 14.5, color: '#fff' },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.sm, paddingVertical: 14, marginTop: spacing.sm },
  cancelText:{ fontFamily: fonts.semibold, fontSize: 14 },
});
