import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import FadeInView from '../ui/FadeInView';

function formatTime(pubDate) {
  if (!pubDate) return '';
  const diffH = Math.floor((Date.now() - new Date(pubDate).getTime()) / 3.6e6);
  if (diffH < 1)  return 'AZ ÖNCE';
  if (diffH < 24) return `${diffH}SA ÖNCE`;
  return new Date(pubDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }).toUpperCase();
}

// Köşe HUD parantezleri (web HeroFrame dili)
function CornerBrackets({ color }) {
  const s = [
    [styles.tl, styles.tlV], [styles.tr, styles.trV],
    [styles.bl, styles.blV], [styles.br, styles.brV],
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {s.flat().map((st, i) => (
        <View key={i} style={[st, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

export default function HeroCard({ item, onPress }) {
  const { colors } = useTheme();

  return (
    <FadeInView offset={14} duration={420}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.92 : 1 }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg.solid }]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(15,20,25,0.55)', colors.bg.base]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />

        <CornerBrackets color={palette.brand.primary} />

        <View style={styles.content}>
          <View style={styles.meta}>
            {item.category ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.category.toUpperCase()}</Text>
              </View>
            ) : null}
            <Text style={[styles.source, { color: colors.text.secondary }]} numberOfLines={1}>
              {(item.source_name ?? 'NEHABER').toUpperCase()} • {formatTime(item.pub_date)}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>
            {item.title}
          </Text>

          <View style={[styles.rule, { backgroundColor: palette.brand.primary }]} />
        </View>
      </Pressable>
    </FadeInView>
  );
}

const B = 3;   // bracket kalınlığı
const L = 22;  // bracket uzunluğu

const styles = StyleSheet.create({
  wrap:      { width: '100%', aspectRatio: 3 / 4, marginBottom: spacing.md, overflow: 'hidden', justifyContent: 'flex-end' },
  content:   { padding: spacing.lg, gap: spacing.xs },
  meta:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  tag:       { borderRadius: radius.none, paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: palette.brand.primary },
  tagText:   { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1, color: '#06140d' },
  source:    { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8, flexShrink: 1 },
  title:     { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  rule:      { width: 44, height: 3, marginTop: spacing.sm },

  // köşe parantezleri
  tl:  { position: 'absolute', top: 12, left: 12,  height: B, width: L },
  tlV: { position: 'absolute', top: 12, left: 12,  width: B, height: L },
  tr:  { position: 'absolute', top: 12, right: 12, height: B, width: L },
  trV: { position: 'absolute', top: 12, right: 12, width: B, height: L },
  bl:  { position: 'absolute', bottom: 12, left: 12,  height: B, width: L },
  blV: { position: 'absolute', bottom: 12, left: 12,  width: B, height: L },
  br:  { position: 'absolute', bottom: 12, right: 12, height: B, width: L },
  brV: { position: 'absolute', bottom: 12, right: 12, width: B, height: L },
});
