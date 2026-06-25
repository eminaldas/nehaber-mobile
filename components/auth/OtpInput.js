import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts, palette, radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

/**
 * 6 haneli kod girişi. Görsel kutular + üstte şeffaf TextInput (SMS otomatik doldurma destekli).
 * value/onChange ile kontrol edilir; sadece rakam kabul eder.
 */
export default function OtpInput({ value, onChange, length = 6, autoFocus = true, onComplete }) {
  const { colors } = useTheme();
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  function handleChange(t) {
    const next = t.replace(/\D/g, '').slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  return (
    <Pressable style={styles.row} onPress={() => ref.current?.focus()}>
      {Array.from({ length }).map((_, i) => {
        const char   = value[i] ?? '';
        const active = focused && i === value.length;
        return (
          <View
            key={i}
            style={[styles.cell, {
              backgroundColor: colors.bg.base,
              borderColor: active
                ? palette.brand.bright
                : char ? palette.brand.primary + '99' : colors.border,
            }]}
          >
            {char
              ? <Text style={[styles.digit, { color: colors.text.primary }]}>{char}</Text>
              : active ? <View style={[styles.cursor, { backgroundColor: palette.brand.bright }]} /> : null}
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.overlay}
        caretHidden
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row:     { flexDirection: 'row', justifyContent: 'space-between', gap: 9, position: 'relative' },
  cell:    { flex: 1, aspectRatio: 0.82, borderWidth: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  digit:   { fontFamily: fonts.extrabold, fontSize: 24 },
  cursor:  { width: 2, height: 24, borderRadius: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },
});
