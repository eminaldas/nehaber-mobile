import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';

// actions: [{ key, label, icon, danger?, onPress }]
export default function ForumActionSheet({ visible, onClose, actions }) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="İşlemler">
      <View style={{ gap: 4 }}>
        {actions.map(a => (
          <Pressable key={a.key} onPress={() => { onClose?.(); a.onPress?.(); }} style={styles.row}>
            <Icon name={a.icon} size={18} color={a.danger ? '#f87171' : colors.text.secondary} />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  t:   { fontSize: 15, fontWeight: '600' },
});
