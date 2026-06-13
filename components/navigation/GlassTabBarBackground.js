import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';
import { palette } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const TAB_ORDER = ['haberler', 'analiz', 'forum', 'profil'];
const W   = Dimensions.get('window').width;
const ULW = 22;

// Camsı (blur) navbar zemini + aktif sekmenin altında akıcı kayan ince çizgi
export default function GlassTabBarBackground() {
  const segments = useSegments();
  const { isDark, colors } = useTheme();
  const tabW = W / TAB_ORDER.length;

  const active = Math.max(0, TAB_ORDER.indexOf(segments?.[1]));
  const x = useRef(new Animated.Value(active * tabW + tabW / 2 - ULW / 2)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: active * tabW + tabW / 2 - ULW / 2,
      duration: 300,
      easing: Easing.bezier(0.2, 0.9, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [active, tabW, x]);

  // iOS: native blur (stabil). Android: blur (dimezisBlurView) Fabric'te boş-ekran
  // hatasına yol açtığı için kullanılmıyor; yerine temiz yarı-opak bar.
  const isIOS = Platform.OS === 'ios';
  const fill = isDark
    ? (isIOS ? 'rgba(6,8,11,0.55)' : 'rgba(7,10,13,0.94)')
    : (isIOS ? 'rgba(248,255,254,0.6)' : 'rgba(248,255,254,0.97)');

  return (
    <View style={StyleSheet.absoluteFill}>
      {isIOS && (
        <BlurView intensity={55} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: fill,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
      }]} />
      <Animated.View style={[styles.underline, { transform: [{ translateX: x }] }]}>
        <LinearGradient
          colors={[palette.brand.primary, palette.brand.bright]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tint:      { backgroundColor: 'rgba(6,8,11,0.55)' },
  underline: { position: 'absolute', top: 47, left: 0, width: ULW, height: 2, borderRadius: 2, overflow: 'hidden' },
});
