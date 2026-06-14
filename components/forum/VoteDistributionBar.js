import React from 'react';
import { StyleSheet, View } from 'react-native';
import { voteDistribution } from '../../lib/forum/format';
import { VOTE_COLORS } from '../../constants/forum';

export default function VoteDistributionBar({ thread, height = 4 }) {
  const { total, sPct, aPct, iPct } = voteDistribution(thread);
  if (!total) return <View style={[styles.bar, { height, backgroundColor: '#1d232a', borderRadius: 1 }]} />;
  return (
    <View style={[styles.bar, { height }]}>
      <View style={{ flex: sPct, backgroundColor: VOTE_COLORS.suspicious, borderRadius: 1 }} />
      <View style={{ flex: aPct, backgroundColor: VOTE_COLORS.authentic, borderRadius: 1 }} />
      <View style={{ flex: iPct, backgroundColor: VOTE_COLORS.investigate, borderRadius: 1 }} />
    </View>
  );
}
const styles = StyleSheet.create({ bar: { flexDirection: 'row', gap: 2, width: '100%' } });
