import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 84, STROKE = 7, R = (SIZE - STROKE) / 2, CIRC = 2 * Math.PI * R;

// score: 0–100, color: hex, label: 'Güven' | 'Doğruluk'
export default function ScoreRing({ score = 0, color, trackColor, label, textColor }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);
  const offset = anim.interpolate({ inputRange: [0, 100], outputRange: [CIRC, 0], extrapolate: 'clamp' });

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={trackColor} strokeWidth={STROKE} fill="transparent" />
        <AnimatedCircle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={color} strokeWidth={STROKE} fill="transparent"
          strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round" />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color: textColor }]}>%{Math.round(score)}</Text>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  score:  { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 20 },
  label:  { fontFamily: fonts.medium, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, marginTop: 1 },
});
