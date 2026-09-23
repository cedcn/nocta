import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SoundCategory } from '../types';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';

interface CategoryCardProps {
  category: SoundCategory;
  count: number;
  onPress: () => void;
}

export default function CategoryCard({ category, count, onPress }: CategoryCardProps) {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const { icon: Icon, color } = getCategoryStyle(category.id);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconCircle}>
        <Icon size={26} color={colors.textPrimary} />
      </View>
      <Text style={styles.name}>{localizedName(category)}</Text>
      <Text style={styles.count}>{t('home.soundsCount', { count })}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radii.lg,
    padding: 18,
    minHeight: 140,
    justifyContent: 'space-between',
    ...shadow,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700', marginTop: 14 },
  count: { color: colors.textPrimary, opacity: 0.6, fontSize: fontSize.caption, marginTop: 2 },
});
