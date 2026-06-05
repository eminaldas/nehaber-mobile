import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ShimmerCard() {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const base      = isDark ? '#1a2e1f' : '#e2e8f0';
  const highlight = isDark ? '#243d28' : '#cbd5e1';

  return (
    <Animated.View style={[styles.card, { backgroundColor: base, opacity }]}>
      <View style={[styles.image, { backgroundColor: highlight }]} />
      <View style={styles.body}>
        <View style={[styles.line, { width: '60%', backgroundColor: highlight }]} />
        <View style={[styles.line, { width: '100%', backgroundColor: highlight }]} />
        <View style={[styles.line, { width: '80%', backgroundColor: highlight }]} />
        <View style={[styles.lineShort, { width: '40%', backgroundColor: highlight }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card:      { marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  image:     { height: 180, width: '100%' },
  body:      { padding: spacing.md, gap: spacing.sm },
  line:      { height: 14, borderRadius: radius.sm },
  lineShort: { height: 10, borderRadius: radius.sm },
});
