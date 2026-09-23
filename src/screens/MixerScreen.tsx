import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Square } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import { getAllCategories, getSoundsByCategory, useSoundsManifest } from '../data/sounds';
import { useLocalizedName } from '../i18n/LanguageProvider';
import ScreenBackground from '../components/ScreenBackground';
import SoundRow from '../components/SoundRow';
import PresetBar from '../components/PresetBar';
import TimerControl from '../components/TimerControl';
import FloatingPlayButton from '../components/FloatingPlayButton';
import { colors, radii, fontSize } from '../theme';

export default function MixerScreen() {
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  useSoundsManifest();
  const categories = getAllCategories();
  const sounds = getSoundsByCategory(selectedCategory);
  const { playingSounds, stopAll } = useAudio();

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('mixer.title')}</Text>
        {playingSounds.length > 0 && (
          <TouchableOpacity style={styles.stopButton} onPress={stopAll} activeOpacity={0.8}>
            <Square size={14} color={colors.textOnColor} fill={colors.textOnColor} />
            <Text style={styles.stopButtonText}>{t('actions.stopAll')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <TimerControl />
        <PresetBar />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                {localizedName(cat)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {sounds.map((sound) => (
            <SoundRow key={sound.id} sound={sound} isPlaying={playingSounds.some((p) => p.id === sound.id)} />
          ))}
        </View>
      </ScrollView>

      {playingSounds.length > 0 && <FloatingPlayButton />}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  stopButtonText: { color: colors.textOnColor, fontSize: fontSize.body, fontWeight: '700' },
  chipsScroll: { flexGrow: 0, marginBottom: 16 },
  chipsContent: { paddingHorizontal: 20 },
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
  list: { paddingHorizontal: 20 },
});
