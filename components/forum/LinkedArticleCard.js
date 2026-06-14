import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { alpha, fonts } from '../../constants/theme';

export default function LinkedArticleCard({ article }) {
  if (!article) return null;
  const P = '#a855f7';
  return (
    <View style={[styles.c, { borderColor: alpha(P, 0.28), backgroundColor: alpha(P, 0.06) }]}>
      {article.image_url ? <Image source={{ uri: article.image_url }} style={styles.th} /> : <View style={[styles.th, { backgroundColor: alpha(P, 0.18) }]} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.ti} numberOfLines={2}>{article.title}</Text>
        {article.source_name ? <Text style={styles.src}>{article.source_name}</Text> : null}
      </View>
      {article.source_url ? (
        <Pressable onPress={() => Linking.openURL(article.source_url)} hitSlop={8}>
          <Icon name="external" size={16} color="#c084fc" />
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  c:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 14 },
  th:  { width: 42, height: 42, borderRadius: 4 },
  ti:  { color: '#eef3f7', fontSize: 11.5, fontFamily: fonts.bold, lineHeight: 16 },
  src: { color: '#9aa4ad', fontSize: 10, fontFamily: fonts.semibold, marginTop: 4 },
});
