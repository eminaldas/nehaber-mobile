import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '../../../components/ui/BottomSheet';
import { fonts, palette, radius, spacing } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { deleteAccount, getMe, updateProfile } from '../../../services/authService';
import api from '../../../services/api';

const CATEGORIES = ['gündem', 'ekonomi', 'spor', 'sağlık', 'teknoloji', 'kültür', 'yaşam'];
const PLATFORMS = [
  { key: 'twitter',   label: 'X (Twitter)', icon: 'logo-twitter',   ph: 'https://x.com/kullanici' },
  { key: 'instagram', label: 'Instagram',   icon: 'logo-instagram', ph: 'https://instagram.com/kullanici' },
  { key: 'github',    label: 'GitHub',      icon: 'logo-github',    ph: 'https://github.com/kullanici' },
  { key: 'linkedin',  label: 'LinkedIn',    icon: 'logo-linkedin',  ph: 'https://linkedin.com/in/kullanici' },
  { key: 'website',   label: 'Website',     icon: 'globe-outline',  ph: 'https://siteniz.com' },
];

function Underline({ label, icon, accent, ...props }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {!!label && <Text style={[styles.flab, { color: colors.text.muted }]}>{label}</Text>}
      <View style={[styles.uline, { borderBottomColor: focused ? accent : colors.border, borderBottomWidth: focused ? 2 : 1.5 }]}>
        {!!icon && <Ionicons name={icon} size={16} color={focused ? accent : colors.text.muted} />}
        <TextInput
          style={[styles.uval, { color: colors.text.primary }]}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
}

export default function HesapScreen() {
  const { colors, isDark } = useTheme();
  const { logout } = useAuth();
  const toast  = useToast();
  const insets = useSafeAreaInsets();
  const qc     = useQueryClient();
  const accent = isDark ? palette.brand.bright : colors.text.primary;

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: getMe });
  const { data: feed } = useQuery({ queryKey: ['feed-prefs'], queryFn: async () => (await api.get('/users/me/feed-preferences')).data });

  const [sheet, setSheet] = useState(null); // null|'username'|'bio'|'photo'|'interests'|'social'|'delete'
  const [username, setUsername] = useState('');
  const [bio, setBio]           = useState('');
  const [social, setSocial]     = useState({});
  const [pw, setPw]             = useState('');
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    if (me) { setUsername(me.username ?? ''); setBio(me.bio ?? ''); setSocial(me.social_links ?? {}); }
  }, [me]);

  const hidden = feed?.hidden_categories ?? [];

  async function patchMe(payload, okMsg) {
    setBusy(true);
    try {
      await updateProfile(payload);
      await qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(okMsg, { title: 'Kaydedildi' });
      setSheet(null);
    } catch (err) {
      const m = err.response?.data?.detail;
      toast.error(typeof m === 'string' ? m : 'Güncellenemedi.', { title: 'Hata' });
    } finally { setBusy(false); }
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast.error('Galeri izni gerekli.', { title: 'İzin' }); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true });
    if (!res.canceled && res.assets?.[0]?.base64) {
      await patchMe({ avatar_url: `data:image/jpeg;base64,${res.assets[0].base64}` }, 'Fotoğraf güncellendi.');
    }
  }

  async function toggleCategory(cat) {
    const next = hidden.includes(cat) ? hidden.filter(c => c !== cat) : [...hidden, cat];
    qc.setQueryData(['feed-prefs'], (o) => ({ ...(o ?? {}), hidden_categories: next }));
    try { await api.patch('/users/me/feed-preferences', { hidden_categories: next }); }
    catch { qc.setQueryData(['feed-prefs'], (o) => ({ ...(o ?? {}), hidden_categories: hidden })); }
  }

  async function doDelete() {
    setBusy(true);
    try {
      await deleteAccount(pw);
      setSheet(null);
      toast.success('Hesabın askıya alındı.', { title: 'Tamam' });
      logout();
    } catch (err) {
      const m = err.response?.data?.detail;
      toast.error(typeof m === 'string' ? m : 'Silinemedi.', { title: 'Hata' });
    } finally { setBusy(false); }
  }

  const socialCount = Object.values(social).filter(Boolean).length;
  const Row = ({ icon, label, value, onPress, danger, avatar }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { borderTopColor: colors.border }, pressed && { backgroundColor: colors.bg.surface }]}>
      {avatar
        ? <View style={[styles.avThumb, { borderColor: accent }]}>{me?.avatar_url ? <Image source={{ uri: me.avatar_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <Ionicons name="person" size={16} color={accent} />}</View>
        : <View style={[styles.rowIcon, { backgroundColor: (danger ? palette.fake.fill : accent) + '1f' }]}><Ionicons name={icon} size={16} color={danger ? palette.fake.fill : accent} /></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.rowLabel, { color: danger ? palette.fake.fill : colors.text.primary }]}>{label}</Text>
        {!!value && <Text style={[styles.rowVal, { color: colors.text.muted }]} numberOfLines={1}>{value}</Text>}
      </View>
      {!!onPress && <Ionicons name="chevron-forward" size={15} color={danger ? palette.fake.fill : accent} />}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.bg.deepest }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={{ width: 24 }}><Ionicons name="chevron-back" size={24} color={colors.text.primary} /></Pressable>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Hesap</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={[styles.group, { color: colors.text.muted }]}>PROFİL</Text>
        <View style={{ paddingHorizontal: spacing.md }}>
          <Row avatar label="Profil fotoğrafı" value="Değiştir veya kaldır" onPress={() => setSheet('photo')} />
          <Row icon="person-outline" label="Kullanıcı adı" value={me?.username} onPress={() => setSheet('username')} />
          <Row icon="mail-outline" label="E-posta" value={me?.email} />
          <Row icon="reader-outline" label="Biyografi" value={me?.bio || 'Eklenmedi'} onPress={() => setSheet('bio')} />
        </View>

        <Text style={[styles.group, { color: colors.text.muted }]}>TERCİHLER</Text>
        <View style={{ paddingHorizontal: spacing.md }}>
          <Row icon="options-outline" label="İlgi alanları" value={`${CATEGORIES.length - hidden.length} aktif · feed sıralaması`} onPress={() => setSheet('interests')} />
          <Row icon="link-outline" label="Sosyal bağlantılar" value={socialCount ? `${socialCount} bağlantı` : 'Eklenmedi'} onPress={() => setSheet('social')} />
        </View>

        <Text style={[styles.group, { color: colors.text.muted }]}>TEHLİKELİ BÖLGE</Text>
        <View style={{ paddingHorizontal: spacing.md }}>
          <Row icon="trash-outline" label="Hesabı sil" value="30 gün askıya alınır" danger onPress={() => { setPw(''); setSheet('delete'); }} />
        </View>
      </ScrollView>

      {/* Fotoğraf */}
      <BottomSheet visible={sheet === 'photo'} onClose={() => setSheet(null)} title="Profil fotoğrafı">
        <Pressable style={[styles.sheetBtn, { backgroundColor: palette.brand.primary }]} onPress={pickPhoto} disabled={busy}>
          {busy ? <ActivityIndicator color="#06140d" /> : <><Ionicons name="image-outline" size={17} color="#06140d" /><Text style={styles.sheetBtnText}>Galeriden Yükle</Text></>}
        </Pressable>
        {!!me?.avatar_url && (
          <Pressable style={[styles.sheetGhost, { borderColor: palette.fake.fill + '66' }]} onPress={() => patchMe({ avatar_url: null }, 'Fotoğraf kaldırıldı.')} disabled={busy}>
            <Text style={[styles.sheetGhostText, { color: palette.fake.fill }]}>Fotoğrafı Kaldır</Text>
          </Pressable>
        )}
      </BottomSheet>

      {/* Kullanıcı adı */}
      <BottomSheet visible={sheet === 'username'} onClose={() => setSheet(null)} title="Kullanıcı adı">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Underline label="Kullanıcı Adı" icon="person-outline" accent={accent} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="kullanici_adi" />
          <Text style={[styles.hint, { color: colors.text.muted }]}>3–30 karakter · harf, rakam ve _</Text>
          <Pressable style={[styles.sheetBtn, { backgroundColor: palette.brand.primary }]} onPress={() => username.trim().length >= 3 ? patchMe({ username: username.trim() }, 'Kullanıcı adı güncellendi.') : toast.error('En az 3 karakter.', { title: 'Geçersiz' })} disabled={busy}>
            {busy ? <ActivityIndicator color="#06140d" /> : <Text style={styles.sheetBtnText}>Kaydet</Text>}
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Biyografi */}
      <BottomSheet visible={sheet === 'bio'} onClose={() => setSheet(null)} title="Biyografi">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TextInput
            style={[styles.bio, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.bg.base }]}
            placeholder="Kendinden kısaca bahset…" placeholderTextColor={colors.text.muted}
            value={bio} onChangeText={setBio} multiline maxLength={500} textAlignVertical="top"
          />
          <Text style={[styles.hint, { color: colors.text.muted, textAlign: 'right' }]}>{bio.length}/500</Text>
          <Pressable style={[styles.sheetBtn, { backgroundColor: palette.brand.primary }]} onPress={() => patchMe({ bio: bio.trim() }, 'Biyografi güncellendi.')} disabled={busy}>
            {busy ? <ActivityIndicator color="#06140d" /> : <Text style={styles.sheetBtnText}>Kaydet</Text>}
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* İlgi alanları */}
      <BottomSheet visible={sheet === 'interests'} onClose={() => setSheet(null)} title="İlgi alanları">
        <Text style={[styles.hint, { color: colors.text.muted, marginBottom: spacing.md }]}>Kapattığın kategoriler feed'den gizlenir.</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(cat => {
            const off = hidden.includes(cat);
            return (
              <Pressable key={cat} onPress={() => toggleCategory(cat)}
                style={[styles.chip, off
                  ? { borderColor: palette.fake.fill + '80' }
                  : { borderColor: accent, backgroundColor: accent + '14' }]}>
                <Text style={[styles.chipText, { color: off ? palette.fake.fill : colors.text.primary }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={[styles.sheetBtn, { backgroundColor: palette.brand.primary }]} onPress={() => setSheet(null)}>
          <Text style={styles.sheetBtnText}>Tamam</Text>
        </Pressable>
      </BottomSheet>

      {/* Sosyal bağlantılar */}
      <BottomSheet visible={sheet === 'social'} onClose={() => setSheet(null)} title="Sosyal bağlantılar">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {PLATFORMS.map(p => (
            <Underline key={p.key} label={p.label} icon={p.icon} accent={accent}
              value={social[p.key] ?? ''} onChangeText={(v) => setSocial(s => ({ ...s, [p.key]: v }))}
              autoCapitalize="none" keyboardType="url" placeholder={p.ph} />
          ))}
          <Pressable style={[styles.sheetBtn, { backgroundColor: palette.brand.primary }]}
            onPress={() => patchMe({ social_links: Object.fromEntries(Object.entries(social).filter(([, v]) => v)) }, 'Bağlantılar güncellendi.')} disabled={busy}>
            {busy ? <ActivityIndicator color="#06140d" /> : <Text style={styles.sheetBtnText}>Kaydet</Text>}
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* Hesap silme */}
      <BottomSheet visible={sheet === 'delete'} onClose={() => setSheet(null)} title="Hesabı sil">
        <View style={[styles.delIcon, { borderColor: palette.fake.fill + '66', backgroundColor: palette.fake.fill + '1a' }]}>
          <Ionicons name="warning-outline" size={22} color={palette.fake.fill} />
        </View>
        <Text style={[styles.delMsg, { color: colors.text.muted }]}>
          Hesabın <Text style={{ color: colors.text.primary, fontFamily: fonts.bold }}>30 gün</Text> askıya alınır, sonra kalıcı olarak silinir. Bu süre içinde geri dönebilirsin.
        </Text>
        <Underline label="Şifreni onayla" icon="lock-closed-outline" accent={palette.fake.fill} value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••••" />
        <View style={styles.delRow}>
          <Pressable style={[styles.sheetGhost, { flex: 1, marginTop: 0, borderColor: colors.border }]} onPress={() => setSheet(null)}>
            <Text style={[styles.sheetGhostText, { color: colors.text.secondary }]}>Vazgeç</Text>
          </Pressable>
          <Pressable style={[styles.delBtn, { backgroundColor: palette.fake.fill, opacity: pw ? 1 : 0.5 }]} onPress={doDelete} disabled={busy || !pw}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.delBtnText}>Hesabı Sil</Text>}
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar:   { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 17 },

  group:    { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.xs, marginLeft: spacing.md + 4 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 15, paddingHorizontal: 8, borderTopWidth: StyleSheet.hairlineWidth },
  rowIcon:  { width: 30, height: 30, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  avThumb:  { width: 30, height: 30, borderRadius: radius.full, borderWidth: 1.5, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brand.accent },
  rowLabel: { fontFamily: fonts.bold, fontSize: 13.5 },
  rowVal:   { fontFamily: fonts.medium, fontSize: 11.5, marginTop: 2 },

  // underline
  flab:     { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  uline:    { flexDirection: 'row', alignItems: 'center', gap: 9, paddingBottom: 7 },
  uval:     { flex: 1, fontFamily: fonts.semibold, fontSize: 15, paddingVertical: 2 },
  hint:     { fontFamily: fonts.medium, fontSize: 10.5, marginTop: 6 },
  bio:      { borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, minHeight: 100, fontFamily: fonts.regular, fontSize: 14 },

  // sheet buttons
  sheetBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: radius.sm, paddingVertical: 14, marginTop: spacing.lg },
  sheetBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#06140d' },
  sheetGhost:   { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.sm, paddingVertical: 13, marginTop: spacing.sm },
  sheetGhostText: { fontFamily: fonts.bold, fontSize: 13.5 },

  // chips
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:     { borderWidth: 1.5, borderRadius: radius.sm, paddingHorizontal: 13, paddingVertical: 7 },
  chipText: { fontFamily: fonts.bold, fontSize: 12.5 },

  // delete
  delIcon:  { width: 46, height: 46, borderRadius: 3, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  delMsg:   { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 19, marginBottom: spacing.md },
  delRow:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  delBtn:   { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingVertical: 13 },
  delBtnText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
});
