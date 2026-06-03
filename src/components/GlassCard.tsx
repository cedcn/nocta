import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, shadow } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
}

export default function GlassCard({ children, style, strong }: GlassCardProps) {
  return (
    <View style={[styles.card, strong && styles.strong, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 16,
    ...shadow,
  },
  strong: {
    backgroundColor: colors.glassStrong,
  },
});
