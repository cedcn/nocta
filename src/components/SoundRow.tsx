import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Play, Pause, Heart, RotateCw, CloudCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { isSoundCached } from '../services/soundCache';
import { SoundMetadata } from '../types';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';

interface SoundRowProps {
  sound: SoundMetadata;
  isPlaying: boolean;
}

export default function SoundRow({ sound, isPlaying }: SoundRowProps) {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const { toggleSound, setVolume, getVolume, soundStates, favorites, toggleFavorite } = useAudio();
  const volume = getVolume(sound.id);
  const { icon: Icon, color } = getCategoryStyle(sound.category);
  const loadState = soundStates[sound.id];
  const favorite = favorites.includes(sound.id);

  const subtitle =
    loadState === 'loading'
      ? t('sound.loading')
      : loadState === 'error'
        ? t('sound.error')
        : isPlaying
          ? t('sound.playingVolume', { volume: Math.round(volume * 100) })
          : t('sound.tapToPlay');

  const onPress = () => {
    Haptics.selectionAsync().catch(() => {});
    toggleSound(sound.id);
  };

  const renderBadge = () => {
    if (loadState === 'loading') return <ActivityIndicator size="small" color={colors.accent} />;
    if (loadState === 'error') return <RotateCw size={16} color={colors.danger} />;
    if (isPlaying) return <Pause size={16} color={colors.textOnAccent} />;
    return <Play size={16} color={colors.accent} />;
  };

  return (
    <View style={[styles.row, isPlaying && styles.rowActive]}>
      <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Icon size={22} color={colors.textPrimary} />
        </View>
        <View style={styles.texts}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {localizedName(sound)}
            </Text>
            {isSoundCached(sound) && (
              <CloudCheck size={14} color={colors.textSecondary} accessibilityLabel={t('sound.offline')} />
            )}
          </View>
          <Text style={[styles.sub, loadState === 'error' && styles.subError]}>{subtitle}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleFavorite(sound.id)} hitSlop={10}>
            <Heart
              size={20}
              color={favorite ? colors.danger : colors.textSecondary}
              fill={favorite ? colors.danger : 'transparent'}
            />
          </TouchableOpacity>
          <View style={[styles.playBadge, isPlaying && !loadState && styles.playBadgeActive]}>{renderBadge()}</View>
        </View>
      </TouchableOpacity>

      {isPlaying && (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={(v) => setVolume(sound.id, v)}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.trackInactive}
          thumbTintColor={colors.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    ...shadow,
  },
  rowActive: {
    backgroundColor: colors.glassStrong,
  },
  main: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, marginLeft: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700', flexShrink: 1 },
  sub: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 2 },
  subError: { color: colors.danger },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeActive: { backgroundColor: colors.accent },
  slider: { height: 36, marginTop: 6 },
});
