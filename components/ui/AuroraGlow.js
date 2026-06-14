import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const W = Dimensions.get('window').width;

/**
 * Üst bara hafif, yavaş, "kutup ışığı" (aurora) hissi veren hareketli yeşil gradyen.
 * Sadece yerleştirildiği kabın ÜST kısmında görünür (alt tarafı baseColor'a karışarak söner).
 * pointerEvents=none → dokunmayı engellemez. Kapsayan View overflow:hidden olmalı.
 */
export default function AuroraGlow({ baseColor = '#06080b' }) {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v, dur) => Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const l1 = loop(a, 9000);
    const l2 = loop(b, 13000);
    l1.start();
    l2.start();
    return () => { l1.stop(); l2.stop(); };
  }, [a, b]);

  const t1 = a.interpolate({ inputRange: [0, 1], outputRange: [-W * 0.22, W * 0.22] });
  const t2 = b.interpolate({ inputRange: [0, 1], outputRange: [W * 0.18, -W * 0.18] });
  const o1 = a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22, 0.4, 0.22] });
  const o2 = b.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.3, 0.16] });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.blob, { top: -28, transform: [{ translateX: t1 }, { rotate: '-10deg' }], opacity: o1 }]}>
        <LinearGradient colors={['transparent', 'rgba(16,185,129,0.5)', 'transparent']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={[styles.blob, { top: -8, transform: [{ translateX: t2 }, { rotate: '8deg' }], opacity: o2 }]}>
        <LinearGradient colors={['transparent', 'rgba(63,255,139,0.4)', 'transparent']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {/* aşağı doğru baseColor'a karışıp söner → yalnız üst görünür */}
      <LinearGradient colors={['transparent', baseColor]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blob: { position: 'absolute', left: -W * 0.4, width: W * 1.8, height: 90 },
});
