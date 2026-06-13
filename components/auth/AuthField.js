import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts, palette, radius, spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

/**
 * Etiketli, sol ikonlu giriş alanı. secure=true ise sağda göster/gizle (göz) düğmesi.
 * Login + Register ekranlarının ortak alan bileşeni.
 */
export default function AuthField({
  label, icon, secure = false, style, ...inputProps
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden]   = useState(secure);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: colors.text.muted }]}>{label}</Text>
      <View style={[styles.box, {
        backgroundColor: colors.bg.base,
        borderColor: focused ? palette.brand.primary + '99' : colors.border,
      }]}>
        <Ionicons name={icon} size={17} color={focused ? palette.brand.bright : colors.text.muted} />
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secure && (
          <Pressable hitSlop={8} onPress={() => setHidden(h => !h)}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.text.muted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { marginTop: spacing.md },
  label: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7, marginLeft: 3 },
  box:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14 },
});
