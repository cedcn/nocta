import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronUp, ChevronDown, Pause, Play, X, Volume2, BookmarkPlus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { getSoundById } from '../data/sounds';
import { useSaveCurrentMix } from '../hooks/usePresetActions';
import GlassCard from './GlassCard';
import { colors, radii, fontSize, shadow } from '../theme';

const LIST_MAX_HEIGHT = 260;

export default function FloatingPlayButton() {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const { playingSounds, stopAll, isPaused, togglePause, masterVolume, setMasterVolume, setVolume, toggleSound } =
    useAudio();
  const saveMix = useSaveCurrentMix();
  const [expanded, setExpanded] = useState(false);

  if (playingSounds.length === 0) return null;

  const slider = (value: number, onChange: (v: number) => void) => (
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={1}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor={colors.accent}
      maximumTrackTintColor={colors.trackInactive}
      thumbTintColor={colors.accent}
    />
  );

  return (
    <View style={styles.container} pointerEvents="box-none">
      {expanded && (
        <GlassCard strong style={styles.expandedView}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{t('player.playingTitle', { count: playingSounds.length })}</Text>
            <TouchableOpacity onPress={stopAll} hitSlop={8} activeOpacity={0.7}>
              <Text style={styles.stopText}>{t('actions.stopAll')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.masterRow}>
            <Volume2 size={18} color={colors.accent} />
            <Text style={styles.masterLabel}>{t('player.master')}</Text>
            {slider(masterVolume, setMasterVolume)}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {playingSounds.map((ps) => {
              const sound = getSoundById(ps.id);
              return (
                <View key={ps.id} style={styles.soundItem}>
                  <View style={styles.soundHeader}>
                    <Text style={styles.soundName} numberOfLines={1}>
                      {sound ? localizedName(sound) : ps.id}
                    </Text>
                    <Text style={styles.volumeText}>{Math.round(ps.volume * 100)}%</Text>
                    <TouchableOpacity
                      onPress={() => toggleSound(ps.id)}
                      hitSlop={10}
                      accessibilityLabel={t('player.remove')}
                    >
                      <X size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {slider(ps.volume, (v) => setVolume(ps.id, v))}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={saveMix} activeOpacity={0.8}>
            <BookmarkPlus size={16} color={colors.accent} />
            <Text style={styles.saveText}>{t('player.saveMix')}</Text>
          </TouchableOpacity>
        </GlassCard>
      )}
      <View style={styles.bar}>
        <TouchableOpacity style={styles.button} onPress={() => setExpanded(!expanded)} activeOpacity={0.85}>
          {expanded ? (
            <ChevronDown size={18} color={colors.textOnAccent} />
          ) : (
            <ChevronUp size={18} color={colors.textOnAccent} />
          )}
          <Text style={styles.buttonText}>{t('player.playingCount', { count: playingSounds.length })}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={togglePause}
          activeOpacity={0.85}
          accessibilityLabel={isPaused ? t('actions.play') : t('actions.pause')}
        >
          {isPaused ? (
            <Play size={20} color={colors.textOnAccent} fill={colors.textOnAccent} />
          ) : (
            <Pause size={20} color={colors.textOnAccent} fill={colors.textOnAccent} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 100, right: 20, left: 20 },
  expandedView: { marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
  stopText: { color: colors.danger, fontSize: fontSize.body, fontWeight: '700' },
  masterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  masterLabel: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '600' },
  list: { maxHeight: LIST_MAX_HEIGHT },
  slider: { flex: 1, height: 32 },
  soundItem: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.trackInactive,
  },
  soundHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  soundName: { flex: 1, color: colors.textPrimary, fontSize: fontSize.body },
  volumeText: { color: colors.textSecondary, fontSize: fontSize.caption },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  saveText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  bar: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    ...shadow,
  },
  buttonText: { color: colors.textOnAccent, fontSize: fontSize.body, fontWeight: '700' },
  pauseButton: {
    width: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
});
