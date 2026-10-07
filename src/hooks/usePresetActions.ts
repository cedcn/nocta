import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../context/AudioContext';
import { Preset } from '../types';

export function usePresetName() {
  const { t } = useTranslation();
  return useCallback(
    (preset: Preset, index: number) =>
      preset.name || (preset.nameKey ? t(preset.nameKey) : t('presets.defaultName', { n: index + 1 })),
    [t],
  );
}

// Saves the current mix to a new preset, or offers to overwrite the selected one when presets are full.
export function useSaveCurrentMix() {
  const { t } = useTranslation();
  const presetName = usePresetName();
  const { presets, currentPresetId, playingSounds, saveMixAsNewPreset, saveToPreset } = useAudio();

  return useCallback(() => {
    if (playingSounds.length === 0) {
      Alert.alert(t('presets.nothingPlaying'));
      return;
    }
    const id = saveMixAsNewPreset();
    if (id) {
      Alert.alert(t('player.savedAs', { name: t('presets.defaultName', { n: presets.length + 1 }) }));
      return;
    }
    const index = Math.max(0, presets.findIndex((p) => p.id === currentPresetId));
    const target = presets[index];
    Alert.alert(t('presets.fullTitle'), t('presets.fullMessage', { name: presetName(target, index) }), [
      { text: t('actions.cancel'), style: 'cancel' },
      {
        text: t('presets.overwrite'),
        style: 'destructive',
        onPress: () =>
          saveToPreset(
            target.id,
            playingSounds.map((p) => p.id),
          ),
      },
    ]);
  }, [currentPresetId, playingSounds, presetName, presets, saveMixAsNewPreset, saveToPreset, t]);
}
