import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette, radius, spacing, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import FadeInView from '../ui/FadeInView';

function formatTime(pubDate) {
  if (!pubDate) return '';
  const diffH = Math.floor((Date.now() - new Date(pubDate).getTime()) / 3.6e6);
  if (diffH < 1)  return 'az önce';
  if (diffH < 24) return `${diffH}sa önce`;
  return new Date(pubDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export default function HaberCard({ item, onPress }) {
  const { colors } = useTheme();

  return (
    <FadeInView>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { borderColor: pressed ? palette.brand.primary : 'transparent',
            backgroundColor: pressed ? colors.bg.surface : 'transparent' },
        ]}
      >
        <View style={[styles.thumbWrap, { borderColor: colors.border, backgroundColor: colors.bg.solid }]}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.thumb} contentFit="cover" transition={250} />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Text style={{ fontSize: 24, opacity: 0.4 }}>📰</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={[styles.meta, { color: palette.brand.primary }]} numberOfLines={1}>
            {(item.source_name ?? 'NeHaber').toUpperCase()}
            <Text style={{ color: colors.text.muted }}>  ·  {formatTime(item.pub_date)}</Text>
          </Text>

          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={3}>
            {item.title}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>
      </Pressable>
    </FadeInView>
  );
}

const THUMB = 92;

const styles = StyleSheet.create({
  card:            { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderRadius: radius.none },
  thumbWrap:       { width: THUMB, height: THUMB, borderWidth: 1, borderRadius: radius.none, overflow: 'hidden' },
  thumb:           { width: '100%', height: '100%' },
  thumbPlaceholder:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  body:            { flex: 1, justifyContent: 'center', paddingVertical: 2, gap: spacing.xs },
  meta:            { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.6 },
  title:           { fontFamily: fonts.bold, fontSize: typography.md, lineHeight: 21 },
  divider:         { height: 1, marginTop: spacing.xs, opacity: 0.6 },
});
