import React from 'react';
import { View, StyleSheet } from 'react-native';
import { palette } from '../../constants/theme';

// İçinde bulunduğu (position:relative) kabın 4 köşesine ince L-braket çizer
export default function CornerBrackets({ color = palette.brand.primary, size = 16, thickness = 2 }) {
  const h = { height: thickness, width: size, backgroundColor: color, position: 'absolute' };
  const v = { width: thickness, height: size, backgroundColor: color, position: 'absolute' };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[h, { top: 0, left: 0 }]} /><View style={[v, { top: 0, left: 0 }]} />
      <View style={[h, { top: 0, right: 0 }]} /><View style={[v, { top: 0, right: 0 }]} />
      <View style={[h, { bottom: 0, left: 0 }]} /><View style={[v, { bottom: 0, left: 0 }]} />
      <View style={[h, { bottom: 0, right: 0 }]} /><View style={[v, { bottom: 0, right: 0 }]} />
    </View>
  );
}
