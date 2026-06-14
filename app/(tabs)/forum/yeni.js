import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/ui/Icon';
import CreateThreadForm from '../../../components/forum/CreateThreadForm';
import { palette } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { useCreateThread } from '../../../hooks/useForum';

const EMPTY = { postType: 'iddia', title: '', body: '', category: 'Gündem', tagNames: [], imageUrls: [] };

export default function NewThreadScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const create = useCreateThread();
  const [form, setForm] = useState(EMPTY);

  const valid = form.title.trim().length >= 5 && form.category;

  const submit = () => {
    if (!valid) return toast.error('Başlık en az 5 karakter ve kategori gerekli');
    create.mutate(form, {
      onSuccess: (thread) => { toast.success('Paylaşıldı'); router.replace(`/(tabs)/forum/${thread.id}`); },
      onError: (e) => toast.error(e?.response?.data?.detail || 'Paylaşılamadı'),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.nav, { paddingTop: insets.top + 6, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Icon name="x" size={20} color={colors.text.secondary} /></Pressable>
        <Text style={[styles.ti, { color: colors.text.primary }]}>Yeni gönderi</Text>
        <Pressable onPress={submit} disabled={!valid || create.isPending}
          style={[styles.sub, { backgroundColor: palette.brand.primary, opacity: !valid || create.isPending ? 0.45 : 1 }]}>
          <Text style={styles.subT}>Paylaş</Text>
        </Pressable>
      </View>
      <CreateThreadForm value={form} onChange={setForm} />
    </View>
  );
}
const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  ti:  { fontSize: 14, fontWeight: '800', marginLeft: 12 },
  sub: { marginLeft: 'auto', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  subT:{ color: '#06080b', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
});
