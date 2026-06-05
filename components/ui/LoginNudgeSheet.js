import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { palette, radius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function LoginNudgeSheet({ visible, onClose }) {
  const { colors } = useTheme();
  const ref        = useRef(null);
  const snapPoints = useMemo(() => ['35%'], []);

  const handleSheetChange = useCallback((index) => {
    if (index === -1) onClose?.();
  }, [onClose]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleSheetChange}
      backgroundStyle={{ backgroundColor: colors.bg.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.container}>
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
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title:          { fontSize: typography.lg, fontWeight:'700', marginBottom: spacing.sm },
  sub:            { fontSize: typography.sm, lineHeight: 20, marginBottom: spacing.lg },
  btn:            { borderRadius: radius.md, padding: spacing.md, alignItems:'center', marginBottom: spacing.sm },
  btnText:        { color:'#fff', fontWeight:'600', fontSize: typography.md },
  btnOutline:     { borderRadius: radius.md, padding: spacing.md, alignItems:'center', borderWidth:1 },
  btnOutlineText: { fontWeight:'600', fontSize: typography.md },
});
