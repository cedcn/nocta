import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { CircleHelp, Flower2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BREATHING_METHODS, BreathingMethod } from '../../data/breathing';
import { getMeditationCategories, getMeditationSessions } from '../../data/meditation';
import { useLocalizedName } from '../../i18n/LanguageProvider';
import { useRootNavigation } from '../../navigation';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import RhythmBars from '../../components/breathing/RhythmBars';
import BreathingTutorialModal from '../../components/breathing/BreathingTutorialModal';
import { colors, radii, fontSize, shadow } from '../../theme';

const CARD_GAP = 14;

export default function BreathingListScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation('breathing');
  const { t: tm } = useTranslation('meditation');
  const localizedName = useLocalizedName();
  const navigation = useRootNavigation();
  const [tutorial, setTutorial] = useState<BreathingMethod | null>(null);

  const cardWidth = width - 64;
  const categories = getMeditationCategories();

  const renderMethod = (method: BreathingMethod) => {
    const key = `methods.${method.id}`;
    const tags = (t(`${key}.tags`, { returnObjects: true }) as string[]).slice(0, 2);
    const params = [
      { label: t('inhale'), value: method.inhale },
      { label: t('hold'), value: method.hold },
      { label: t('exhale'), value: method.exhale },
      { label: t('holdAfter'), value: method.holdAfter },
    ].filter((p) => p.value > 0);

    return (
      <TouchableOpacity
        key={method.id}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('BreathingDetail', { methodId: method.id })}
        style={[styles.methodShadow, { width: cardWidth }]}
      >
        <LinearGradient colors={[method.color, `${method.color}D9`]} style={styles.methodCard}>
          <View>
            {method.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.badgeText}>{t('primary')}</Text>
              </View>
            )}
            <Text style={styles.methodName}>{t(`${key}.name`)}</Text>
            <Text style={styles.methodSubtitle}>{t(`${key}.subtitle`)}</Text>
          </View>

          <RhythmBars method={method} />

          <View>
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.badgeText}>{tag}</Text>
                </View>
              ))}
              <TouchableOpacity onPress={() => setTutorial(method)} hitSlop={10}>
                <CircleHelp size={20} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
            <View style={styles.paramRow}>
              {params.map((p) => (
                <View key={p.label + p.value} style={styles.param}>
                  <Text style={styles.paramValue}>{p.value}s</Text>
                  <Text style={styles.paramLabel}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('common:tabs.Breathing')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        <Text style={styles.sectionTitle}>{tm('title')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MeditationList', { categoryId: cat.id })}
            >
              <GlassCard strong style={[styles.meditationCard, { width: cardWidth }]}>
                <View style={styles.meditationTop}>
                  <View style={styles.meditationIcon}>
                    <Flower2 size={24} color={colors.accent} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.meditationName}>{localizedName(cat)}</Text>
                    <Text style={styles.meditationSubtitle}>{tm(`subtitles.${cat.id}`, { defaultValue: '' })}</Text>
                  </View>
                </View>
                <View style={styles.meditationBottom}>
                  <View style={styles.meditationTag}>
                    <Text style={styles.meditationTagText}>{tm(`tags.${cat.id}`, { defaultValue: '' })}</Text>
                  </View>
                  <Text style={styles.meditationCount}>
                    {tm('sessionsCount', { count: getMeditationSessions(cat.id).length })}
                  </Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('title')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}
        >
          {BREATHING_METHODS.map(renderMethod)}
        </ScrollView>
      </ScrollView>

      <BreathingTutorialModal method={tutorial} onClose={() => setTutorial(null)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.title,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  carousel: { paddingHorizontal: 32, gap: CARD_GAP, paddingBottom: 16 },
  meditationCard: { height: 160, justifyContent: 'space-between', padding: 20 },
  meditationTop: { flexDirection: 'row', gap: 14 },
  meditationIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.pastelLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meditationName: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '800' },
  meditationSubtitle: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 4, lineHeight: 18 },
  meditationBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meditationTag: {
    backgroundColor: colors.pastelSky,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meditationTagText: { color: colors.textPrimary, fontSize: fontSize.caption, fontWeight: '600' },
  meditationCount: { color: colors.textSecondary, fontSize: fontSize.caption },
  methodShadow: { borderRadius: radii.lg, ...shadow },
  methodCard: { height: 320, borderRadius: radii.lg, padding: 24, justifyContent: 'space-between' },
  primaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: { color: colors.textOnColor, fontSize: fontSize.caption, fontWeight: '600' },
  methodName: { color: colors.textOnColor, fontSize: fontSize.title + 2, fontWeight: '800' },
  methodSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.body, marginTop: 4 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  paramRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  param: { alignItems: 'center' },
  paramValue: { color: colors.textOnColor, fontSize: fontSize.subtitle, fontWeight: '800' },
  paramLabel: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.caption },
});
