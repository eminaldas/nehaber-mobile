import React from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const W = Dimensions.get('window').width;

// Tüm AppHeader örnekleri AYNI animasyon değerlerini paylaşır → sekme geçişlerinde
// aurora kesilmez/sıfırlanmaz, tek sabit bir bar gibi sürekli akar.
const A = new Animated.Value(0);
const B = new Animated.Value(0);
let _started = false;
function startAurora() {
  if (_started) return;
  _started = true;
  const loop = (v, dur) => Animated.loop(Animated.sequence([
    Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(v, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  ]));
  loop(A, 9000).start();
  loop(B, 13000).start();
}

export default function AuroraGlow({ baseColor = '#06080b' }) {
  startAurora();

  const t1 = A.interpolate({ inputRange: [0, 1], outputRange: [-W * 0.22, W * 0.22] });
  const t2 = B.interpolate({ inputRange: [0, 1], outputRange: [W * 0.18, -W * 0.18] });
  const o1 = A.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22, 0.4, 0.22] });
  const o2 = B.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.3, 0.16] });

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
      <LinearGradient colors={['transparent', baseColor]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blob: { position: 'absolute', left: -W * 0.4, width: W * 1.8, height: 90 },
});
