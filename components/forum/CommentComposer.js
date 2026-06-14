import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { palette } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export default function CommentComposer({ replyTo, onCancelReply, onSubmit, submitting }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [text, setText] = useState('');

  const send = () => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v);
    setText('');
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {replyTo ? (
        <View style={[styles.reply, { backgroundColor: colors.bg.surface }]}>
          <Text style={[styles.replyT, { color: colors.text.muted }]}>↪ <Text style={{ color: palette.brand.primary }}>@{replyTo.username}</Text> yanıtlanıyor</Text>
          <Pressable onPress={onCancelReply} hitSlop={8}><Icon name="x" size={14} color={colors.text.muted} /></Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <Avatar username={user?.username} uri={user?.avatar_url} size={28} />
        <TextInput
          style={[styles.in, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="Kanıt veya yorumunu ekle…"
          placeholderTextColor={colors.text.muted}
          value={text} onChangeText={setText} multiline
        />
        <Pressable onPress={send} disabled={submitting || !text.trim()}
          style={[styles.snd, { backgroundColor: palette.brand.primary, opacity: submitting || !text.trim() ? 0.4 : 1 }]}>
          <Icon name="send" size={17} color="#06080b" strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  reply:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginBottom: 8 },
  replyT: { fontSize: 11, fontWeight: '600' },
  row:    { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  in:     { flex: 1, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12.5, maxHeight: 100 },
  snd:    { width: 38, height: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
