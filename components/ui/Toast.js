import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const VARIANTS = {
  error:   { color: palette.verdict.fake,    icon: 'alert-circle',        title: 'Hata' },
  success: { color: palette.brand.bright,    icon: 'checkmark-circle',    title: 'Başarılı' },
  info:    { color: palette.brand.primary,   icon: 'information-circle',  title: 'Bilgi' },
};

const DEFAULT_DURATION = { error: 4000, success: 2800, info: 3400 };

/**
 * Tepeye yapışık, alt köşeleri yuvarlak, renk aksanı alt border olan toast.
 * ToastProvider tarafından render edilir. `toast` null değilse gösterilir,
 * süre sonunda veya dokununca otomatik kapanır.
 */
export default function Toast({ toast, onHide }) {
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const [render, setRender] = useState(null);
  const ty = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (!toast) return undefined;
    setRender(toast);
    ty.setValue(-200);
    Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 70, friction: 9 }).start();
    const ms = toast.duration ?? DEFAULT_DURATION[toast.type] ?? 3200;
    const timer = setTimeout(dismiss, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.key]);

  function dismiss() {
    Animated.timing(ty, { toValue: -220, duration: 220, useNativeDriver: true }).start(() => {
      setRender(null);
      onHide?.();
    });
  }

  if (!render) return null;

  const v = VARIANTS[render.type] ?? VARIANTS.info;
  const title = render.title ?? v.title;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: ty }] }]} pointerEvents="box-none">
      <Pressable
        onPress={dismiss}
        style={[styles.banner, {
          backgroundColor: colors.bg.solid,
          borderColor: colors.border,
          borderBottomColor: v.color,
          paddingTop: insets.top + 12,
        }]}
      >
        <Ionicons name={v.icon} size={21} color={v.color} style={styles.icon} />
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>{title}</Text>
          {!!render.message && (
            <Text style={[styles.message, { color: colors.text.muted }]} numberOfLines={2}>{render.message}</Text>
          )}
        </View>
        {!!render.actionLabel && (
          <Pressable
            hitSlop={8}
            onPress={() => { render.onAction?.(); dismiss(); }}
            style={[styles.action, { backgroundColor: v.color + '24' }]}
          >
            <Text style={[styles.actionText, { color: v.color }]}>{render.actionLabel}</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 12 },
  banner:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 15, paddingBottom: 13,
                borderWidth: 1, borderTopWidth: 0, borderBottomWidth: 3,
                borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
                shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
  icon:       { marginTop: 1 },
  textCol:    { flex: 1 },
  title:      { fontFamily: fonts.bold, fontSize: 13, letterSpacing: -0.1 },
  message:    { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 16, marginTop: 2 },
  action:     { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.sm },
  actionText: { fontFamily: fonts.bold, fontSize: 12 },
});
