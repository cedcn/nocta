import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Music, Heart, MessageCircle, Settings, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, radii, shadow, fontSize } from '../theme';

const ICONS: Record<string, LucideIcon> = {
  Home,
  Mixer: Music,
  Favorites: Heart,
  Quotes: MessageCircle,
  Settings,
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICONS[route.name] ?? Home;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.7}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Icon size={22} color={focused ? colors.textOnAccent : colors.textSecondary} />
              </View>
              {focused && <Text style={styles.label}>{route.name}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadow,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.accent,
    fontSize: fontSize.caption,
    fontWeight: '600',
    marginLeft: 6,
  },
});
