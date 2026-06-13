import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Modal, PanResponder, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const SCREEN_H = Dimensions.get('window').height;

/**
 * Alttan açılan modal sheet.
 * - Backdrop'a dokununca KAPANMAZ (yalnızca karartma).
 * - Üstteki tutamaçtan aşağı sürüklenebilir; ~110px aşağı çekilince veya hızlı bırakılınca kapanır.
 * - Tema seçici gibi "değiştirip hisset" senaryoları için kapanmadan seçim yapılabilir.
 */
export default function BottomSheet({ visible, onClose, title, children }) {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);

  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const sheetH     = useRef(SCREEN_H * 0.5);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(sheetH.current);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 5, speed: 13 }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: sheetH.current, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 110 || g.vy > 0.6) {
        onClose?.();   // parent visible=false → effect mevcut konumdan akışkan kapatır
      } else {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 5, speed: 13 }).start();
      }
    },
  })).current;

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.anchor} pointerEvents="box-none">
        <Animated.View
          onLayout={e => { sheetH.current = e.nativeEvent.layout.height; }}
          style={[styles.sheet, {
            backgroundColor: colors.bg.surface,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.lg,
            transform: [{ translateY }],
          }]}
        >
          <View {...pan.panHandlers} style={styles.handleZone}>
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
            {!!title && <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>}
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  anchor:     { flex: 1, justifyContent: 'flex-end' },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, paddingHorizontal: spacing.xl },
  handleZone: { paddingTop: spacing.sm, paddingBottom: spacing.md, marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  grabber:    { alignSelf: 'center', width: 40, height: 4.5, borderRadius: radius.full, marginBottom: spacing.md },
  title:      { fontFamily: fonts.bold, fontSize: 18, letterSpacing: -0.3 },
});
