import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun, Sunrise, Timer, Play, Pause } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import { getAllCategories, getSoundsByCategory, useSoundsManifest } from '../data/sounds';
import { useLocalizedName } from '../i18n/LanguageProvider';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import CategoryCard from '../components/CategoryCard';
import WeatherCard from '../components/weather/WeatherCard';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';
import { HomeMainProps, useRootNavigation } from '../navigation';

// Surface a recommended sound on the hero card (falls back to the first sound)
const FEATURED_ID = 'rain';

const greetingFor = (hour: number) => {
  if (hour >= 5 && hour < 12) return { key: 'home.greetingMorning', Icon: Sunrise } as const;
  if (hour >= 12 && hour < 18) return { key: 'home.greetingAfternoon', Icon: Sun } as const;
  return { key: 'home.greetingEvening', Icon: Moon } as const;
};

export default function HomeScreen({ navigation }: HomeMainProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const rootNavigation = useRootNavigation();
  const { playingSounds, toggleSound, timer, timerRemaining } = useAudio();
  useSoundsManifest();
  const categories = getAllCategories();
  const greeting = greetingFor(new Date().getHours());

  const featured = getSoundsByCategory('rain')[0] ?? getSoundsByCategory(categories[0].id)[0];
  const featuredPlaying = featured ? playingSounds.some((p) => p.id === featured.id) : false;
  const { icon: FeaturedIcon } = getCategoryStyle(featured?.category ?? FEATURED_ID);

  const progress = timer && timerRemaining ? timerRemaining / (timer * 60) : featuredPlaying ? 1 : 0;

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }]}
      >
        <View style={styles.topBar}>
          <View style={styles.greetingPill}>
            <greeting.Icon size={16} color={colors.textOnAccent} />
            <Text style={styles.greetingText}>{t(greeting.key)}</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => rootNavigation.navigate('Pomodoro')} activeOpacity={0.8}>
            <Timer size={20} color={colors.textOnAccent} />
          </TouchableOpacity>
        </View>

        <Text style={styles.brand}>Nocta</Text>
        <Text style={styles.brandSub}>{t('home.brandSub')}</Text>

        <WeatherCard />

        {featured && (
          <GlassCard strong style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.heroIcon}>
                <FeaturedIcon size={32} color={colors.accent} />
              </View>
              <View style={styles.heroTexts}>
                <Text style={styles.heroLabel}>{t('home.featured')}</Text>
                <Text style={styles.heroTitle}>{localizedName(featured)}</Text>
              </View>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => toggleSound(featured.id)}
                activeOpacity={0.8}
              >
                {featuredPlaying ? (
                  <Pause size={16} color={colors.textOnAccent} />
                ) : (
                  <Play size={16} color={colors.textOnAccent} />
                )}
                <Text style={styles.playText}>{featuredPlaying ? t('actions.pause') : t('actions.play')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </GlassCard>
        )}

        <Text style={styles.sectionTitle}>{t('home.category')}</Text>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              count={getSoundsByCategory(cat.id).length}
              onPress={() => navigation.navigate('CategoryDetail', { categoryId: cat.id })}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    ...shadow,
  },
  greetingText: { color: colors.textOnAccent, fontSize: fontSize.body, fontWeight: '600' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  brand: { color: colors.textPrimary, fontSize: fontSize.display, fontWeight: '800', marginTop: 20 },
  brandSub: { color: colors.textSecondary, fontSize: fontSize.subtitle, marginTop: 2 },
  hero: { marginTop: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.pastelSky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTexts: { flex: 1, marginLeft: 14 },
  heroLabel: { color: colors.textSecondary, fontSize: fontSize.caption, fontWeight: '600' },
  heroTitle: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '700', marginTop: 2 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  playText: { color: colors.textOnAccent, fontSize: fontSize.body, fontWeight: '700' },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.trackInactive,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radii.pill },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '700', marginTop: 28, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
