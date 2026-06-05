import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

function TabIcon({ focused, label, emoji }) {
  const { colors } = useTheme();
  return (
    <View style={styles.iconWrap}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[
        styles.label,
        { color: focused ? palette.brand.primary : colors.text.muted },
      ]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor:  colors.border,
          height: 60,
          paddingBottom: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="haberler"
        options={{ tabBarIcon: (p) => <TabIcon {...p} label="Haberler" emoji="📰" /> }}
      />
      <Tabs.Screen
        name="analiz"
        options={{ tabBarIcon: (p) => <TabIcon {...p} label="Analiz" emoji="🔍" /> }}
      />
      <Tabs.Screen
        name="forum"
        options={{ tabBarIcon: (p) => <TabIcon {...p} label="Forum" emoji="💬" /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ tabBarIcon: (p) => <TabIcon {...p} label="Profil" emoji="👤" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  label:    { fontSize: typography.xs, marginTop: 2 },
});
