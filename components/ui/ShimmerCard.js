import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ShimmerCard() {
  const { isDark } = useTheme();
  const colorMode  = isDark ? 'dark' : 'light';

  return (
    <MotiView style={styles.card}>
      <Skeleton colorMode={colorMode} width="100%" height={180} radius={radius.md} />
      <View style={styles.body}>
        <Skeleton colorMode={colorMode} width="60%" height={12} radius={radius.sm} />
        <View style={{ height: spacing.xs }} />
        <Skeleton colorMode={colorMode} width="100%" height={16} radius={radius.sm} />
        <View style={{ height: spacing.xs }} />
        <Skeleton colorMode={colorMode} width="80%"  height={16} radius={radius.sm} />
        <View style={{ height: spacing.sm }} />
        <Skeleton colorMode={colorMode} width="40%"  height={10} radius={radius.sm} />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom:     spacing.md,
    borderRadius:     radius.lg,
    overflow:         'hidden',
  },
  body: {
    padding: spacing.md,
  },
});
