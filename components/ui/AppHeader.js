import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuroraGlow from './AuroraGlow';
import { fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

/**
 * Tüm sekmelerde paylaşılan üst bar: NeHaber markası + aurora gradyen.
 * Yan buton (sectionIcon solda, rightIcon sağda) bölüme göre değişir; bar dili sabit.
 * `sub` verilince morph animasyonu: aurora solar, NeHaber yukarı kaybolur,
 * alttan `sub.title` gelir, kart kısalır, sol ikon geri-oka döner.
 */
export default function AppHeader({ sectionIcon = 'newspaper-outline', rightIcon, onRight, sub = null, onBack }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const m = useRef(new Animated.Value(sub ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(m, {
      toValue: sub ? 1 : 0,
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [sub, m]);

  const HOME_H = insets.top + 104;
  const SUB_H  = insets.top + 48;

  const height   = m.interpolate({ inputRange: [0, 1], outputRange: [HOME_H, SUB_H] });
  const auroraOp = m.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const brandT   = m.interpolate({ inputRange: [0, 1], outputRange: [0, -34] });
  const brandO   = m.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' });
  const subT     = m.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
  const subO     = m.interpolate({ inputRange: [0.45, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const searchO  = m.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const backO    = m.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const rightO   = m.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <Animated.View style={[styles.hdr, { height, backgroundColor: colors.bg.base, borderBottomColor: 'rgba(255,255,255,0.14)' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: auroraOp }]} pointerEvents="none">
        <AuroraGlow baseColor={colors.bg.base} />
      </Animated.View>

      <View style={[styles.toprow, { top: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => sub && onBack?.()} style={styles.side}>
          <Animated.View style={[styles.abs, { opacity: searchO }]}>
            <Ionicons name={sectionIcon} size={22} color={colors.text.muted} />
          </Animated.View>
          <Animated.View style={[styles.abs, { opacity: backO }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Animated.View>
        </Pressable>

        {rightIcon ? (
          <Animated.View style={{ opacity: rightO }}>
            <Pressable hitSlop={12} onPress={onRight} disabled={!!sub}>
              <Ionicons name={rightIcon} size={23} color={colors.text.secondary} />
            </Pressable>
          </Animated.View>
        ) : <View style={styles.side} />}
      </View>

      <View style={styles.titles} pointerEvents="none">
        <Animated.Text style={[styles.brand, { color: colors.text.primary, opacity: brandO, transform: [{ translateY: brandT }] }]}>NeHaber</Animated.Text>
        <Animated.Text numberOfLines={1} style={[styles.sub, { color: colors.text.primary, opacity: subO, transform: [{ translateY: subT }] }]}>{sub?.title ?? ''}</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hdr:    { borderBottomWidth: 1, overflow: 'hidden' },
  toprow: { position: 'absolute', left: 0, right: 0, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
  side:   { width: 40, height: 26, justifyContent: 'center' },
  abs:    { position: 'absolute' },
  titles: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48, zIndex: 2 },
  brand:  { position: 'absolute', left: 0, right: 0, bottom: 12, textAlign: 'center', fontFamily: fonts.logo, fontSize: 26, letterSpacing: 0.5 },
  sub:    { position: 'absolute', left: 0, right: 0, bottom: 13, textAlign: 'center', fontFamily: fonts.extrabold, fontSize: 19 },
});
