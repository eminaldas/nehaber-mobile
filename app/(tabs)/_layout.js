import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassTabBarBackground from '../../components/navigation/GlassTabBarBackground';
import { palette } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const ICONS = {
  haberler: { on: 'newspaper',           off: 'newspaper-outline' },
  analiz:   { on: 'search',              off: 'search-outline' },
  forum:    { on: 'chatbubble-ellipses', off: 'chatbubble-ellipses-outline' },
  profil:   { on: 'person',              off: 'person-outline' },
};

function TabIcon({ focused, name }) {
  const { colors } = useTheme();
  const cfg = ICONS[name];
  return (
    <View style={styles.iconWrap}>
      <Ionicons
        name={focused ? cfg.on : cfg.off}
        size={22}
        color={focused ? palette.brand.bright : colors.text.muted}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      {Object.keys(ICONS).map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={name} /> }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 40, width: 60 },
});
