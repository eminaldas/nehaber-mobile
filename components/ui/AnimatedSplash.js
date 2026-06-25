import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { fonts, palette } from '../../constants/theme';

const MASK_H = 80;   // logoyu çevreleyen maske yüksekliği
const DOWN   = 80;   // gizliyken aşağıdaki offset (maskenin dışında)

/**
 * Açılış animasyonu: yeşil zeminde "Ne" (Pacifico) maskeden yukarı süzülür,
 * çok hafif gerilir (spring overshoot + küçük scaleY), kısa bekler, sonra
 * aşağı kayıp solar. Bitince onFinish() çağrılır; üst katman kaldırılır.
 */
export default function AnimatedSplash({ onFinish }) {
  const translateY = useRef(new Animated.Value(DOWN)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scaleY     = useRef(new Animated.Value(1)).current;
  const screenOp   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const enter = Animated.parallel([
      // yukarı süzülürken hafif geri tepme (gerilme)
      Animated.spring(translateY, { toValue: 0, friction: 5.5, tension: 55, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      // çok az dikey gerilme
      Animated.sequence([
        Animated.timing(scaleY, { toValue: 1.06, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scaleY, { toValue: 1,    duration: 240, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ]);

    const exit = Animated.parallel([
      Animated.timing(translateY, { toValue: DOWN, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]);

    Animated.sequence([
      enter,
      Animated.delay(560),
      exit,
      // zemin de yumuşakça kapanıp uygulamayı açar
      Animated.timing(screenOp, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onFinish?.(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOp }]} pointerEvents="none">
      <View style={styles.mask}>
        <Animated.Text style={[styles.ne, { opacity, transform: [{ translateY }, { scaleY }] }]}>
          Ne
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { ...StyleSheet.absoluteFillObject, backgroundColor: palette.brand.primary, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  mask:   { height: MASK_H, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ne:     { fontFamily: fonts.logo, fontSize: 46, color: '#ffffff', textShadowColor: 'rgba(0,0,0,0.16)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 14 },
});
