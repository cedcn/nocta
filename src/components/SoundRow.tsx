import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Play, Pause } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { SoundMetadata } from '../types';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';

interface SoundRowProps {
  sound: SoundMetadata;
  isPlaying: boolean;
}

export default function SoundRow({ sound, isPlaying }: SoundRowProps) {
  const { toggleSound, setVolume, getVolume, toggleFavorite, isFavorite } = useAudio();
  const volume = getVolume(sound.id);
  const favorite = isFavorite(sound.id);
  const { icon: Icon, color } = getCategoryStyle(sound.category);

  return (
    <View style={[styles.row, isPlaying && styles.rowActive]}>
      <TouchableOpacity style={styles.main} onPress={() => toggleSound(sound.id)} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Icon size={22} color={colors.textPrimary} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.name}>{sound.nameEn || sound.name}</Text>
          <Text style={styles.sub}>{isPlaying ? `Playing · ${Math.round(volume * 100)}%` : 'Tap to play'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleFavorite(sound.id)} hitSlop={8}>
            <Heart
              size={20}
              color={favorite ? colors.danger : colors.textSecondary}
              fill={favorite ? colors.danger : 'transparent'}
            />
          </TouchableOpacity>
          <View style={[styles.playBadge, isPlaying && styles.playBadgeActive]}>
            {isPlaying ? (
              <Pause size={16} color={colors.textOnAccent} />
            ) : (
              <Play size={16} color={colors.accent} />
            )}
          </View>
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
  name: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
  sub: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 2 },
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
