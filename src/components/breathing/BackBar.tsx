import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, fontSize, shadow } from '../../theme';

interface BackBarProps {
  title?: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export default function BackBar({ title, onBack, right }: BackBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity style={styles.circleBtn} onPress={onBack} activeOpacity={0.7}>
        <ArrowLeft size={22} color={colors.textOnAccent} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  title: { flex: 1, color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
  right: { minWidth: 44, alignItems: 'flex-end' },
});
