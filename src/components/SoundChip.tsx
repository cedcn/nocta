import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../context/AudioContext';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { SoundMetadata } from '../types';
import { colors, radii, fontSize, getCategoryStyle } from '../theme';

export default function SoundChip({ sound }: { sound: SoundMetadata }) {
  const localizedName = useLocalizedName();
  const { playingSounds, soundStates, toggleSound } = useAudio();
  const playing = playingSounds.some((p) => p.id === sound.id);
  const loading = soundStates[sound.id] === 'loading';
  const { icon: Icon } = getCategoryStyle(sound.category);
  const tint = playing ? colors.textOnAccent : colors.textPrimary;

  return (
    <TouchableOpacity
      style={[styles.chip, playing && styles.chipActive]}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        toggleSound(sound.id);
      }}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator size="small" color={colors.accent} /> : <Icon size={16} color={tint} />}
      <Text style={[styles.text, { color: tint }]} numberOfLines={1}>
        {localizedName(sound)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 10,
    maxWidth: 180,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: fontSize.body, fontWeight: '600', flexShrink: 1 },
});
