import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const RED = '#ff7351';
export default function FalseClaimsCard({ falseClaims }) {
  const { colors } = useTheme();
  if (!falseClaims || falseClaims.length === 0) return null;
  return (
    <View style={[styles.box, { backgroundColor: '#da363314', borderLeftColor: '#da363366' }]}>
      <View style={styles.head}>
        <Ionicons name="warning" size={14} color={RED} />
        <Text style={[styles.headText, { color: RED }]}>YANLIŞ İDDİALAR</Text>
      </View>
      {falseClaims.map((c, i) => (
        <View key={i} style={[styles.claim, { borderColor: '#da363340' }]}>
          <Text style={styles.wrong}>{c.wrong_text}</Text>
          <Text style={[styles.fix, { color: colors.text.secondary }]}>→ {c.correction}</Text>
          {!!c.source_url && (
            <Pressable style={styles.src} onPress={() => Linking.openURL(c.source_url)}>
              <Ionicons name="open-outline" size={11} color={RED} />
              <Text style={styles.srcText} numberOfLines={1}>{c.source_title || c.source_url}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box:      { borderLeftWidth: 3, padding: spacing.md, gap: spacing.sm },
  head:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headText: { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1.5 },
  claim:    { borderWidth: 1, padding: spacing.sm, gap: 4 },
  wrong:    { color: '#ff9b86', fontFamily: fonts.regular, fontSize: 14, textDecorationLine: 'line-through', lineHeight: 19 },
  fix:      { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },
  src:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  srcText:  { color: RED, fontFamily: fonts.medium, fontSize: 11, flex: 1 },
});
