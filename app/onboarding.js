import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Easing, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, spacing } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { completeOnboarding } from '../services/authService';

const STEPS = ['welcome', 'photo', 'interests', 'source'];
const TOTAL = STEPS.length;
const MIN_INTERESTS = 3;

const INTERESTS = [
  { id: 'gundem',    label: 'Gündem & Politika',    icon: 'newspaper-outline' },
  { id: 'ekonomi',   label: 'Ekonomi & Finans',     icon: 'trending-up-outline' },
  { id: 'spor',      label: 'Spor',                 icon: 'trophy-outline' },
  { id: 'teknoloji', label: 'Teknoloji & Yazılım',  icon: 'hardware-chip-outline' },
  { id: 'bilim',     label: 'Bilim & Araştırma',    icon: 'flask-outline' },
  { id: 'saglik',    label: 'Sağlık & Tıp',         icon: 'heart-outline' },
  { id: 'kultur',    label: 'Kültür & Sanat',       icon: 'color-palette-outline' },
  { id: 'cevre',     label: 'Çevre & İklim',        icon: 'leaf-outline' },
  { id: 'egitim',    label: 'Eğitim & Akademi',     icon: 'book-outline' },
  { id: 'is',        label: 'İş Dünyası',           icon: 'briefcase-outline' },
  { id: 'dunya',     label: 'Dünya Haberleri',      icon: 'globe-outline' },
  { id: 'hukuk',     label: 'Hukuk & Adalet',       icon: 'hammer-outline' },
  { id: 'siber',     label: 'Siber Güvenlik',       icon: 'shield-checkmark-outline' },
  { id: 'fintech',   label: 'Kripto & Fintech',     icon: 'logo-bitcoin' },
];

const SOURCES = [
  { id: 'linkedin',  label: 'LinkedIn',      icon: 'logo-linkedin' },
  { id: 'twitter',   label: 'Twitter / X',   icon: 'logo-twitter' },
  { id: 'instagram', label: 'Instagram',     icon: 'logo-instagram' },
  { id: 'github',    label: 'GitHub',        icon: 'logo-github' },
  { id: 'youtube',   label: 'YouTube',       icon: 'logo-youtube' },
  { id: 'facebook',  label: 'Facebook',      icon: 'logo-facebook' },
  { id: 'arkadas',   label: 'Arkadaş',       icon: 'people-outline' },
  { id: 'arama',     label: 'Arama Motoru',  icon: 'search-outline' },
  { id: 'podcast',   label: 'Podcast',       icon: 'mic-outline' },
  { id: 'haber',     label: 'Haber / Blog',  icon: 'document-text-outline' },
  { id: 'etkinlik',  label: 'Etkinlik',      icon: 'calendar-outline' },
  { id: 'diger',     label: 'Diğer',         icon: 'ellipsis-horizontal' },
];

export default function OnboardingScreen() {
  const { colors }  = useTheme();
  const { user }    = useAuth();
  const toast       = useToast();
  const insets      = useSafeAreaInsets();

  const [step, setStep]           = useState(0);
  const [avatar, setAvatar]       = useState(null);
  const [interests, setInterests] = useState([]);
  const [source, setSource]       = useState('');
  const [loading, setLoading]     = useState(false);

  const username = user?.username ?? '';
  const initial  = (username || 'N').charAt(0).toUpperCase();

  // Akışkan ilerleme barı
  const progress  = useRef(new Animated.Value(1 / TOTAL)).current;
  // İçerik giriş animasyonu (her adımda sıfırlanır)
  const enter     = useRef(new Animated.Value(0)).current;
  // İlgi alanı hücreleri için stagger
  const cellAnims = useRef(INTERESTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step + 1) / TOTAL, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();

    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();

    if (STEPS[step] === 'interests') {
      cellAnims.forEach(a => a.setValue(0));
      Animated.stagger(45, cellAnims.map(a =>
        Animated.timing(a, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      )).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const contentStyle = {
    opacity: enter,
    transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }],
  };

  function next() { setStep(s => Math.min(s + 1, TOTAL - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  function toggleInterest(id) {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error('Galeriye erişim izni gerekli.', { title: 'İzin gerekli' });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setAvatar(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  }

  async function finish() {
    setLoading(true);
    try {
      await completeOnboarding({
        interests,
        marketing_source: source || undefined,
        avatar_url:       avatar || undefined,
      });
      toast.success('Akışın hazır, keyifli okumalar!', { title: 'Her şey tamam' });
      router.replace('/(tabs)/haberler');
    } catch (err) {
      toast.error('Bir şeyler ters gitti, tekrar dene.', { title: 'Kaydedilemedi' });
      setLoading(false);
    }
  }

  const enough = interests.length >= MIN_INTERESTS;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.base, paddingTop: insets.top + 14 }]}>
      {/* Akışkan ilerleme barı */}
      <View style={styles.progressHead}>
        {step > 0
          ? <Pressable hitSlop={10} onPress={back}><Ionicons name="chevron-back" size={22} color={colors.text.secondary} /></Pressable>
          : <View style={{ width: 22 }} />}
        <View style={[styles.track, { backgroundColor: colors.bg.solid }]}>
          <Animated.View style={[styles.fill, { width: barWidth }]} />
        </View>
        <Text style={[styles.stepNo, { color: colors.text.muted }]}>{step + 1}/{TOTAL}</Text>
      </View>

      <Animated.View style={[styles.content, contentStyle]}>
        {/* 1 — Hoş geldin */}
        {STEPS[step] === 'welcome' && (
          <View style={styles.center}>
            <View style={[styles.shield, { backgroundColor: palette.brand.primary + '14', borderColor: palette.brand.bright + '55' }]}>
              <Ionicons name="shield-checkmark" size={40} color={palette.brand.bright} />
            </View>
            <Text style={styles.logo}>NeHaber</Text>
            <Text style={[styles.h1, { color: colors.text.primary, textAlign: 'center' }]}>
              Merhaba {username ? `@${username}` : ''}!
            </Text>
            <Text style={[styles.sub, { color: colors.text.muted, textAlign: 'center', maxWidth: 280 }]}>
              Sana özel bir haber akışı hazırlayalım. Yalnızca 30 saniye sürer.
            </Text>
          </View>
        )}

        {/* 2 — Profil fotoğrafı (oto baş harf avatar) */}
        {STEPS[step] === 'photo' && (
          <View style={styles.center}>
            <Text style={[styles.h1, { color: colors.text.primary }]}>Profil fotoğrafın</Text>
            <Text style={[styles.sub, { color: colors.text.muted, textAlign: 'center' }]}>
              İstersen şimdi ekle, dilediğin zaman değiştirebilirsin.
            </Text>
            <Pressable onPress={pickImage} style={[styles.avatar, { borderColor: palette.brand.primary }]}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
                : <Text style={styles.avatarInitial}>{initial}</Text>}
              <View style={[styles.camBadge, { backgroundColor: palette.brand.primary, borderColor: colors.bg.base }]}>
                <Ionicons name="camera" size={15} color="#06140d" />
              </View>
            </Pressable>
            <Pressable onPress={pickImage} style={[styles.uploadBtn, { borderColor: palette.brand.primary }]}>
              <Ionicons name="image-outline" size={16} color={palette.brand.bright} />
              <Text style={styles.uploadText}>{avatar ? 'Değiştir' : 'Fotoğraf Yükle'}</Text>
            </Pressable>
          </View>
        )}

        {/* 3 — İlgi alanları */}
        {STEPS[step] === 'interests' && (
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: colors.text.primary }]}>İlgi alanların</Text>
            <Text style={[styles.sub, { color: colors.text.muted }]}>
              Hangi konuları takip etmek istersin?{'  '}
              <Text style={{ color: enough ? palette.brand.bright : palette.risk.medium, fontFamily: fonts.bold }}>
                {interests.length} seçildi
              </Text>
              {!enough && <Text style={{ color: palette.risk.medium }}> · en az {MIN_INTERESTS}</Text>}
            </Text>

            <ScrollView style={{ marginTop: spacing.md }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
              {INTERESTS.map((it, i) => {
                const active = interests.includes(it.id);
                const aStyle = {
                  opacity: cellAnims[i],
                  transform: [{ translateY: cellAnims[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
                };
                return (
                  <Animated.View key={it.id} style={[styles.cellWrap, aStyle]}>
                    <Pressable
                      onPress={() => toggleInterest(it.id)}
                      style={[styles.cell, {
                        borderColor: active ? palette.brand.primary : colors.border,
                        backgroundColor: active ? palette.brand.primary + '1a' : 'transparent',
                      }]}
                    >
                      <Ionicons name={it.icon} size={17} color={active ? palette.brand.bright : colors.text.muted} />
                      <Text style={[styles.cellLabel, { color: active ? colors.text.primary : colors.text.secondary }]} numberOfLines={1}>
                        {it.label}
                      </Text>
                      {active && (
                        <View style={styles.check}>
                          <Ionicons name="checkmark" size={12} color="#06140d" />
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 4 — Bizi nasıl buldun */}
        {STEPS[step] === 'source' && (
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: colors.text.primary }]}>Bizi nasıl buldun?</Text>
            <Text style={[styles.sub, { color: colors.text.muted }]}>İsteğe bağlı — atlayabilirsin.</Text>
            <ScrollView style={{ marginTop: spacing.md }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sgrid}>
              {SOURCES.map(src => {
                const active = source === src.id;
                return (
                  <Pressable
                    key={src.id}
                    onPress={() => setSource(active ? '' : src.id)}
                    style={[styles.scell, {
                      borderColor: active ? palette.brand.primary : colors.border,
                      backgroundColor: active ? palette.brand.primary + '1a' : 'transparent',
                    }]}
                  >
                    <Ionicons name={src.icon} size={20} color={active ? palette.brand.bright : colors.text.muted} />
                    <Text style={[styles.scellLabel, { color: active ? colors.text.primary : colors.text.muted }]} numberOfLines={1}>
                      {src.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Footer butonları */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {STEPS[step] === 'welcome' && (
          <Pressable style={styles.primary} onPress={next}>
            <Text style={styles.primaryText}>Başla</Text>
            <Ionicons name="arrow-forward" size={17} color="#06140d" />
          </Pressable>
        )}

        {STEPS[step] === 'photo' && (
          <View style={styles.row}>
            <Pressable style={[styles.ghost, { borderColor: colors.border }]} onPress={next}>
              <Text style={[styles.ghostText, { color: colors.text.muted }]}>Atla</Text>
            </Pressable>
            <Pressable style={[styles.primary, { flex: 1 }]} onPress={next}>
              <Text style={styles.primaryText}>Devam Et</Text>
            </Pressable>
          </View>
        )}

        {STEPS[step] === 'interests' && (
          <Pressable
            style={[styles.primary, { opacity: enough ? 1 : 0.4 }]}
            onPress={enough ? next : undefined}
            disabled={!enough}
          >
            <Text style={styles.primaryText}>Devam Et</Text>
            <Ionicons name="arrow-forward" size={17} color="#06140d" />
          </Pressable>
        )}

        {STEPS[step] === 'source' && (
          <View style={styles.row}>
            <Pressable style={[styles.ghost, { borderColor: colors.border }]} onPress={finish} disabled={loading}>
              <Text style={[styles.ghostText, { color: colors.text.muted }]}>Atla</Text>
            </Pressable>
            <Pressable style={[styles.primary, { flex: 1 }]} onPress={finish} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#06140d" />
                : <><Text style={styles.primaryText}>Başla</Text><Ionicons name="sparkles" size={16} color="#06140d" /></>}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: spacing.xl },

  progressHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  track:        { flex: 1, height: 6, borderRadius: radius.full, overflow: 'hidden' },
  fill:         { height: '100%', borderRadius: radius.full, backgroundColor: palette.brand.primary },
  stepNo:       { fontFamily: fonts.semibold, fontSize: 11, width: 30, textAlign: 'right' },

  content:      { flex: 1, paddingTop: spacing.xl },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },

  logo:         { fontFamily: fonts.logo, fontSize: 22, color: palette.brand.bright, marginTop: spacing.sm },
  h1:           { fontFamily: fonts.extrabold, fontSize: 23, letterSpacing: -0.4 },
  sub:          { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, marginTop: 6 },

  shield:       { width: 78, height: 78, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // avatar
  avatar:       { width: 112, height: 112, borderRadius: 56, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'visible', backgroundColor: palette.brand.accent, marginTop: spacing.lg },
  avatarImg:    { width: '100%', height: '100%', borderRadius: 56 },
  avatarInitial:{ fontFamily: fonts.extrabold, fontSize: 44, color: palette.brand.bright },
  camBadge:     { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  uploadBtn:    { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 11, marginTop: spacing.lg },
  uploadText:   { fontFamily: fonts.bold, fontSize: 12.5, color: palette.brand.bright },

  // interests grid
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingBottom: spacing.md },
  cellWrap:     { width: '48%' },
  cell:         { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 11, paddingVertical: 12 },
  cellLabel:    { flex: 1, fontFamily: fonts.semibold, fontSize: 11.5 },
  check:        { width: 18, height: 18, borderRadius: 6, backgroundColor: palette.brand.primary, alignItems: 'center', justifyContent: 'center' },

  // source grid
  sgrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingBottom: spacing.md },
  scell:        { width: '31%', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 4 },
  scellLabel:   { fontFamily: fonts.semibold, fontSize: 10, textAlign: 'center' },

  // footer
  footer:       { paddingTop: spacing.md },
  row:          { flexDirection: 'row', gap: spacing.sm },
  primary:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: palette.brand.primary, borderRadius: radius.md, paddingVertical: 15, shadowColor: palette.brand.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  primaryText:  { fontFamily: fonts.bold, fontSize: 14.5, color: '#06140d', letterSpacing: 0.2 },
  ghost:        { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: spacing.xl },
  ghostText:    { fontFamily: fonts.semibold, fontSize: 13.5 },
});
