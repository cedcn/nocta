import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import { getAllCategories, getSoundsByCategory, useSoundsManifest } from '../data/sounds';
import { useLocalizedName } from '../i18n/LanguageProvider';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import SoundRow from '../components/SoundRow';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';
import { CategoryDetailProps } from '../navigation';

export default function CategoryDetailScreen({ route, navigation }: CategoryDetailProps) {
  const [activeId, setActiveId] = useState(route.params.categoryId);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const { playingSounds } = useAudio();
  useSoundsManifest();

  const categories = getAllCategories();
  const category = categories.find((c) => c.id === activeId) ?? categories[0];
  const sounds = getSoundsByCategory(category.id);
  const { icon: HeroIcon } = getCategoryStyle(category.id);

  return (
    <ScreenBackground>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textOnAccent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <View style={styles.hero}>
          <GlassCard strong style={styles.heroBadge}>
            <HeroIcon size={48} color={colors.accent} />
          </GlassCard>
          <Text style={styles.title}>{localizedName(category)}</Text>
          <Text style={styles.subtitle}>{t(`categoryDesc.${category.id}`, { defaultValue: t('categoryDesc.default') })}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('categoryDetail.categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, cat.id === category.id && styles.chipActive]}
              onPress={() => setActiveId(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, cat.id === category.id && styles.chipTextActive]}>
                {localizedName(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('categoryDetail.sounds')}</Text>
        {sounds.map((sound) => (
          <SoundRow key={sound.id} sound={sound} isPlaying={playingSounds.some((p) => p.id === sound.id)} />
        ))}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
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
  content: { paddingHorizontal: 20 },
  hero: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  title: { color: colors.textPrimary, fontSize: fontSize.heading, fontWeight: '800', marginTop: 16 },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.body, marginTop: 6, textAlign: 'center' },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '700', marginTop: 24, marginBottom: 14 },
  chipsScroll: { flexGrow: 0 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 10,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: '600' },
  chipTextActive: { color: colors.textOnAccent },
});
