import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function LoginNudgeSheet({ visible, onClose }) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.bg.surface }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Bu özellik için giriş gerekiyor
        </Text>
        <Text style={[styles.sub, { color: colors.text.muted }]}>
          Haber analiz etmek, forum'a yorum yapmak ve daha fazlası için üye ol.
        </Text>
        <Pressable
          style={[styles.btn, { backgroundColor: palette.brand.primary }]}
          onPress={() => { onClose?.(); router.push('/(auth)/login'); }}
        >
          <Text style={styles.btnText}>Giriş Yap</Text>
        </Pressable>
        <Pressable
          style={[styles.btnOutline, { borderColor: palette.brand.primary }]}
          onPress={() => { onClose?.(); router.push('/(auth)/register'); }}
        >
          <Text style={[styles.btnOutlineText, { color: palette.brand.primary }]}>Kayıt Ol</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:          { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 48, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  handle:         { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  title:          { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.sm },
  sub:            { fontSize: typography.sm, lineHeight: 20, marginBottom: spacing.lg },
  btn:            { borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  btnText:        { color: '#fff', fontWeight: '600', fontSize: typography.md },
  btnOutline:     { borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  btnOutlineText: { fontWeight: '600', fontSize: typography.md },
});
