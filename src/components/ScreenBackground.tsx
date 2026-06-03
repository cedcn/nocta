import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return (
    <LinearGradient
      colors={[colors.gradientTop, colors.gradientBottom]}
      style={styles.gradient}
    >
      <View style={[styles.content, style]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { flex: 1 },
});
