import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';

export default function FeaturedEvidence({ comment }) {
  const { colors } = useTheme();
  if (!comment) return null;
  const url = (comment.evidence_urls || [])[0];
  return (
    <View style={styles.c}>
      <View style={styles.lab}>
        <Icon name="shield-check" size={12} color="#6ee7b7" />
        <Text style={styles.labT}>ÖNE ÇIKAN KANIT</Text>
      </View>
      <View style={styles.head}>
        <Avatar username={comment.username} uri={comment.avatar_url} size={22} />
        <Text style={[styles.nm, { color: colors.text.secondary }]}>{comment.username}</Text>
      </View>
      <Text style={[styles.tx, { color: colors.text.secondary }]}>{comment.body}</Text>
      {url ? (
        <Pressable onPress={() => Linking.openURL(url)} style={styles.row}>
          <Icon name="check" size={13} color="#60a5fa" />
          <Text style={styles.act}>Kaynağı doğrula · {comment.verified_count || 0}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  c:    { backgroundColor: 'rgba(16,185,129,0.055)', borderRadius: 10, padding: 13, marginBottom: 14 },
  lab:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 },
  labT: { color: '#6ee7b7', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  nm:   { fontSize: 11, fontWeight: '700' },
  tx:   { fontSize: 12, lineHeight: 18, marginBottom: 9 },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  act:  { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
});
