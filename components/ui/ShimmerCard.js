import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ShimmerCard() {
  const { colors } = useTheme();
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

  const base      = colors.skeleton.base;
  const highlight = colors.skeleton.highlight;

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.thumb, { backgroundColor: base }]} />
      <View style={styles.body}>
        <View style={[styles.line, { width: '50%', backgroundColor: highlight }]} />
        <View style={[styles.line, { width: '100%', backgroundColor: base }]} />
        <View style={[styles.line, { width: '85%', backgroundColor: base }]} />
        <View style={[styles.lineShort, { width: '35%', backgroundColor: highlight }]} />
      </View>
    </Animated.View>
  );
}

const THUMB = 92;

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  thumb:     { width: THUMB, height: THUMB, borderRadius: radius.none },
  body:      { flex: 1, justifyContent: 'center', gap: spacing.sm },
  line:      { height: 13, borderRadius: radius.none },
  lineShort: { height: 9, borderRadius: radius.none },
});
