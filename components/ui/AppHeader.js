import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuroraGlow from './AuroraGlow';
import { fonts, palette, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

/**
 * Paylaşılan kompakt üst bar: NeHaber + (senkron) aurora. Normalde tek satır/küçük.
 * - `sub` ({title}) verilince: morph (aurora solar, NeHaber yukarı, alttan sub.title gelir, sol ikon geri).
 * - `onSearch` verilince: sol ikon aramayı açar; bar AŞAĞI doğru genişler, input belirir, onSearch(q).
 */
export default function AppHeader({
  sectionIcon = 'newspaper-outline', rightIcon, onRight,
  sub = null, onBack,
  onSearch, searchPlaceholder = 'Ara…',
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const searchable = !!onSearch;
  const inputRef = useRef(null);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  const active = !!sub || searching;
  const aV   = useRef(new Animated.Value(0)).current;  // aurora + brand fade
  const subV = useRef(new Animated.Value(0)).current;  // sub başlık
  const seaV = useRef(new Animated.Value(0)).current;  // arama genişleme

  const anim = (v, to) => Animated.timing(v, { toValue: to, duration: 460, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
  useEffect(() => { anim(aV, active ? 1 : 0); }, [active]);   // eslint-disable-line
  useEffect(() => { anim(subV, sub ? 1 : 0); }, [sub]);      // eslint-disable-line
  useEffect(() => {
    anim(seaV, searching ? 1 : 0);
    if (searching) setTimeout(() => inputRef.current?.focus(), 200);
  }, [searching]);                                           // eslint-disable-line

  const HOME_H   = insets.top + 56;
  const SEARCH_H = insets.top + 104;

  const height   = seaV.interpolate({ inputRange: [0, 1], outputRange: [HOME_H, SEARCH_H] });
  const auroraOp = aV.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const brandO   = aV.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' });
  const brandT   = aV.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const subO     = subV.interpolate({ inputRange: [0.45, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const subT     = subV.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const seaO     = seaV.interpolate({ inputRange: [0.25, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const seaScale = seaV.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const sectionO = aV.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const altO     = aV.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const rightO   = aV.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const onLeft = () => {
    if (searching) { setSearching(false); setQ(''); onSearch?.(''); }
    else if (sub) { onBack?.(); }
    else if (searchable) { setSearching(true); }
  };
  const onType = (t) => { setQ(t); onSearch?.(t); };

  const ROW_TOP = insets.top + 10;

  return (
    <Animated.View style={[styles.hdr, { height, backgroundColor: colors.bg.base, borderBottomColor: 'rgba(255,255,255,0.14)' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: auroraOp }]} pointerEvents="none">
        <AuroraGlow baseColor={colors.bg.base} />
      </Animated.View>

      {/* başlık / sub başlık — ortada */}
      <View pointerEvents="none" style={[styles.center, { top: ROW_TOP }]}>
        <Animated.Text style={[styles.brand, { color: colors.text.primary, opacity: brandO, transform: [{ translateY: brandT }] }]}>NeHaber</Animated.Text>
        <Animated.Text numberOfLines={1} style={[styles.sub, { color: colors.text.primary, opacity: subO, transform: [{ translateY: subT }] }]}>{sub?.title ?? ''}</Animated.Text>
      </View>

      {/* sol / sağ ikonlar */}
      <View style={[styles.toprow, { top: ROW_TOP }]}>
        <Pressable hitSlop={12} onPress={onLeft} style={styles.side}>
          <Animated.View style={[styles.abs, { opacity: sectionO }]}>
            <Ionicons name={sectionIcon} size={22} color={colors.text.muted} />
          </Animated.View>
          <Animated.View style={[styles.abs, { opacity: altO }]}>
            <Ionicons name={searching ? 'close' : 'chevron-back'} size={24} color={colors.text.primary} />
          </Animated.View>
        </Pressable>

        <View style={styles.rightSlot}>
          {rightIcon ? (
            <Animated.View style={[styles.rabs, { opacity: rightO }]} pointerEvents={active ? 'none' : 'auto'}>
              <Pressable hitSlop={12} onPress={onRight}>
                <Ionicons name={rightIcon} size={23} color={colors.text.secondary} />
              </Pressable>
            </Animated.View>
          ) : null}
          {sub?.action ? (
            <Animated.View style={[styles.rabs, { opacity: subV }]} pointerEvents={sub ? 'auto' : 'none'}>
              <Pressable onPress={sub.action.onPress} disabled={sub.action.disabled}
                style={[styles.actBtn, { backgroundColor: palette.brand.primary, opacity: sub.action.disabled ? 0.45 : 1 }]}>
                <Text style={styles.actTxt}>{sub.action.label}</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {/* arama girişi (genişler) */}
      {searchable ? (
        <Animated.View pointerEvents={searching ? 'auto' : 'none'}
          style={[styles.sfield, { top: insets.top + 50, opacity: seaO, transform: [{ scaleX: seaScale }], borderColor: colors.border, backgroundColor: colors.bg.solid }]}>
          <Ionicons name="search" size={17} color={colors.text.muted} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text.primary }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.muted}
            value={q}
            onChangeText={onType}
            returnKeyType="search"
          />
          {q ? (
            <Pressable hitSlop={8} onPress={() => onType('')}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hdr:    { borderBottomWidth: 1, overflow: 'hidden' },
  center: { position: 'absolute', left: 0, right: 0, height: 30, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  brand:  { position: 'absolute', fontFamily: fonts.logo, fontSize: 23, letterSpacing: 0.5 },
  sub:    { position: 'absolute', fontFamily: fonts.extrabold, fontSize: 18 },
  toprow: { position: 'absolute', left: 0, right: 0, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 3 },
  side:   { width: 40, height: 30, justifyContent: 'center' },
  abs:    { position: 'absolute' },
  rightSlot: { minWidth: 40, height: 30, alignItems: 'flex-end', justifyContent: 'center' },
  rabs:   { position: 'absolute', right: 0 },
  actBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 4 },
  actTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#06080b', letterSpacing: 0.3 },
  sfield: { position: 'absolute', left: spacing.md, right: spacing.md, height: 40, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 4, paddingHorizontal: 12, zIndex: 2 },
  input:  { flex: 1, fontFamily: fonts.medium, fontSize: 14, padding: 0 },
});
