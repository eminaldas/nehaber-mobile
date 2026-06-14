import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../ui/Icon';
import { POST_TYPES, FORUM_CATEGORIES } from '../../constants/forum';
import { palette, alpha, fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function CreateThreadForm({ value, onChange }) {
  const { colors } = useTheme();
  const v = value;
  const set = (patch) => onChange({ ...v, ...patch });
  const [tagInput, setTagInput] = useState('');

  const pickImage = async () => {
    if ((v.imageUrls || []).length >= 4) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets?.[0]) set({ imageUrls: [...(v.imageUrls || []), res.assets[0].uri] });
  };
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !(v.tagNames || []).includes(t)) set({ tagNames: [...(v.tagNames || []), t] });
    setTagInput('');
  };

  const Lab = ({ children }) => <Text style={[styles.lab, { color: colors.text.muted }]}>{children}</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <View style={styles.sect}>
        <Lab>GÖNDERİ TİPİ</Lab>
        <View style={styles.types}>
          {POST_TYPES.map(t => {
            const on = v.postType === t.key;
            return (
              <Pressable key={t.key} onPress={() => set({ postType: t.key })}
                style={[styles.ty, { borderColor: on ? alpha(t.color, 0.6) : colors.border, backgroundColor: on ? alpha(t.color, 0.08) : colors.bg.solid }]}>
                <Icon name={t.icon} size={18} color={on ? t.color : colors.text.muted} />
                <Text style={[styles.tyNm, { color: on ? t.color : colors.text.secondary }]}>{t.label}</Text>
                <Text style={[styles.tyDs, { color: colors.text.muted }]}>{t.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>BAŞLIK</Lab>
        <TextInput style={[styles.inp, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="İddianı kısa ve net yaz…" placeholderTextColor={colors.text.muted}
          value={v.title} onChangeText={t => set({ title: t })} />
      </View>

      <View style={styles.sect}>
        <Lab>DETAY / KANIT</Lab>
        <TextInput style={[styles.area, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="Bağlam, kaynak linki veya açıklama ekle…" placeholderTextColor={colors.text.muted}
          value={v.body} onChangeText={t => set({ body: t })} multiline />
      </View>

      <View style={styles.sect}>
        <Lab>KATEGORİ</Lab>
        <View style={styles.chips}>
          {FORUM_CATEGORIES.map(c => {
            const on = v.category === c;
            return (
              <Pressable key={c} onPress={() => set({ category: c })}
                style={[styles.chip, { borderColor: on ? alpha(palette.brand.primary, 0.5) : colors.border, backgroundColor: on ? alpha(palette.brand.primary, 0.08) : colors.bg.solid }]}>
                <Text style={[styles.chipT, { color: on ? palette.brand.bright : colors.text.secondary }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>ETİKETLER</Lab>
        <View style={styles.chips}>
          {(v.tagNames || []).map(t => (
            <Pressable key={t} onPress={() => set({ tagNames: v.tagNames.filter(x => x !== t) })} style={[styles.tg, { backgroundColor: alpha(palette.brand.primary, 0.1) }]}>
              <Text style={styles.tgT}>#{t}</Text><Icon name="x" size={11} color={palette.brand.bright} strokeWidth={2.4} />
            </Pressable>
          ))}
          <TextInput style={[styles.tagIn, { color: colors.text.primary }]} placeholder="+ etiket" placeholderTextColor={colors.text.muted}
            value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done" />
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>GÖRSEL · EN FAZLA 4</Lab>
        <View style={styles.attach}>
          {(v.imageUrls || []).map((uri, i) => (
            <View key={uri} style={styles.thumbW}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable onPress={() => set({ imageUrls: v.imageUrls.filter((_, j) => j !== i) })} style={styles.rm}><Icon name="x" size={10} color="#fff" strokeWidth={3} /></Pressable>
            </View>
          ))}
          {(v.imageUrls || []).length < 4 && (
            <Pressable onPress={pickImage} style={[styles.imgbox, { borderColor: colors.border }]}><Icon name="image" size={20} color={colors.text.muted} strokeWidth={1.8} /></Pressable>
          )}
        </View>
      </View>

      {v.postType === 'iddia' ? (
        <View style={[styles.note, { backgroundColor: alpha('#f59e0b', 0.07) }]}>
          <Icon name="info" size={15} color="#d6a64f" />
          <Text style={styles.noteT}>İddia gönderilerinde topluluk oyu eşiğe ulaşınca otomatik "Doğru / Yanlış / Yanıltıcı" sonucu çıkar.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  sect:  { marginBottom: 18 },
  lab:   { fontSize: 10, fontFamily: fonts.bold, letterSpacing: 0.6, marginBottom: 9 },
  types: { flexDirection: 'row', gap: 8 },
  ty:    { flex: 1, borderWidth: 1, borderRadius: 8, padding: 11, alignItems: 'center', gap: 6 },
  tyNm:  { fontSize: 12, fontFamily: fonts.extrabold },
  tyDs:  { fontSize: 9, fontFamily: fonts.semibold, textAlign: 'center' },
  inp:   { borderWidth: 1, borderRadius: 7, padding: 13, fontSize: 15, fontFamily: fonts.bold },
  area:  { borderWidth: 1, borderRadius: 7, padding: 13, fontSize: 13, minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  chip:  { borderWidth: 1, borderRadius: 5, paddingHorizontal: 12, paddingVertical: 8 },
  chipT: { fontSize: 11, fontFamily: fonts.bold },
  tg:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 5 },
  tgT:   { color: '#3fff8b', fontSize: 11, fontFamily: fonts.bold },
  tagIn: { minWidth: 80, fontSize: 12, paddingVertical: 7 },
  attach:{ flexDirection: 'row', gap: 9 },
  thumbW:{ position: 'relative' },
  thumb: { width: 60, height: 60, borderRadius: 7 },
  rm:    { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  imgbox:{ width: 60, height: 60, borderWidth: 1, borderStyle: 'dashed', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  note:  { flexDirection: 'row', gap: 8, padding: 11, borderRadius: 7 },
  noteT: { flex: 1, fontSize: 10.5, lineHeight: 15, color: '#d6a64f', fontFamily: fonts.semibold },
});
