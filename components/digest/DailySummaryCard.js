import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useDigest } from '../../hooks/useDigest';
import { parseDigest } from '../../services/digestService';
import FadeInView from '../ui/FadeInView';

export default function DailySummaryCard({ onPress }) {
  const { colors } = useTheme();
  const { data, isError } = useDigest();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const parsed  = data?.summary_text ? parseDigest(data.summary_text) : null;
  const teaser  = parsed?.summary
    ? parsed.summary
    : isError ? 'Bugünün özeti hazırlanıyor — birazdan burada.' : 'Yapay zeka ile günün özeti hazırlanıyor…';

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] });
  const dotScale    = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });

  return (
    <FadeInView offset={12} duration={420}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.wrap, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        <LinearGradient
          colors={['rgba(16,185,129,0.20)', 'rgba(16,185,129,0.05)', colors.bg.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: 'rgba(16,185,129,0.35)' }]}
        >
          {/* sol emerald aksan */}
          <View style={styles.accent} />

          {/* ikon + glow */}
          <View style={styles.iconCol}>
            <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
            <View style={styles.iconBox}>
              <Ionicons name="sparkles" size={20} color="#06140d" />
            </View>
          </View>

          {/* metin */}
          <View style={styles.body}>
            <View style={styles.labelRow}>
              <Animated.View style={[styles.liveDot, { transform: [{ scale: dotScale }] }]} />
              <Text style={styles.label}>GÜNÜN ÖZETİ</Text>
              {data?.slot ? <Text style={[styles.slot, { color: colors.text.muted }]}>· {data.slot}</Text> : null}
            </View>
            <Text style={[styles.teaser, { color: colors.text.secondary }]} numberOfLines={2}>
              {teaser}
            </Text>
          </View>

          {/* ok */}
          <View style={[styles.arrow, { borderColor: 'rgba(16,185,129,0.4)' }]}>
            <Ionicons name="arrow-forward" size={16} color={palette.brand.primary} />
          </View>
        </LinearGradient>
      </Pressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap:     { marginHorizontal: spacing.md, marginBottom: spacing.md },
  card:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, overflow: 'hidden' },
  accent:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: palette.brand.primary },
  iconCol:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  glow:     { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.45)' },
  iconBox:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brand.primary },
  body:     { flex: 1, gap: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.brand.primary },
  label:    { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 1.2, color: palette.brand.primary },
  slot:     { fontFamily: fonts.semibold, fontSize: 11 },
  teaser:   { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  arrow:    { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
