import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { fonts, spacing } from '../../constants/theme';

// actions: [{ key, label, icon, danger?, onPress }]
export default function ForumActionSheet({ visible, onClose, actions }) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="İşlemler">
      <View style={styles.wrap}>
        {actions.map((a, i) => (
          <Pressable
            key={a.key}
            onPress={() => { onClose?.(); a.onPress?.(); }}
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              pressed && { backgroundColor: colors.bg.solid },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: a.danger ? 'rgba(248,113,113,0.10)' : colors.bg.solid }]}>
              <Icon name={a.icon} size={19} color={a.danger ? '#f87171' : colors.text.secondary} />
            </View>
            <Text style={[styles.t, { color: a.danger ? '#f87171' : colors.text.primary }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

export async function shareThread(thread) {
  try {
    await Share.share({ message: `Forum: ${thread.title}\nnehaber uygulamasında tartış.` });
  } catch (_) {}
}

const styles = StyleSheet.create({
  wrap:     { paddingTop: spacing.xs, paddingBottom: spacing.xs },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 4 },
  iconWrap: { width: 38, height: 38, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  t:        { fontSize: 15, fontFamily: fonts.semibold },
});
