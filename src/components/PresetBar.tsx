import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { MAX_PRESETS, MAX_PRESET_SOUNDS, MIN_PRESETS, useAudio } from '../context/AudioContext';
import { Preset } from '../types';
import { usePresetName } from '../hooks/usePresetActions';
import PresetRenameModal from './PresetRenameModal';
import { colors, radii, fontSize, shadow } from '../theme';

export default function PresetBar() {
  const { t } = useTranslation();
  const {
    presets,
    currentPresetId,
    activePresetId,
    setCurrentPreset,
    loadPreset,
    stopAll,
    saveToPreset,
    addPreset,
    deletePreset,
    playingSounds,
  } = useAudio();
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const displayName = usePresetName();

  const handleSave = (preset: Preset) => {
    if (playingSounds.length === 0) {
      Alert.alert(t('presets.nothingPlaying'));
      return;
    }
    if (playingSounds.length > MAX_PRESET_SOUNDS) {
      Alert.alert(t('presets.maxSounds', { count: MAX_PRESET_SOUNDS }));
    }
    saveToPreset(
      preset.id,
      playingSounds.map((p) => p.id),
    );
  };

  const handlePress = (preset: Preset, index: number) => {
    Haptics.selectionAsync().catch(() => {});
    setCurrentPreset(preset.id);
    if (activePresetId === preset.id && playingSounds.length > 0) {
      stopAll();
    } else if (preset.sounds.length > 0) {
      loadPreset(preset.id);
    } else if (playingSounds.length > 0) {
      Alert.alert(t('presets.saveToEmpty', { name: displayName(preset, index) }), undefined, [
        { text: t('actions.cancel'), style: 'cancel' },
        { text: t('actions.save'), onPress: () => handleSave(preset) },
      ]);
    } else {
      Alert.alert(t('presets.empty'));
    }
  };

  const handleDelete = (preset: Preset, index: number) => {
    if (presets.length <= MIN_PRESETS) {
      Alert.alert(t('presets.minPresets', { count: MIN_PRESETS }));
      return;
    }
    Alert.alert(t('presets.deleteTitle'), t('presets.deleteMessage', { name: displayName(preset, index) }), [
      { text: t('actions.cancel'), style: 'cancel' },
      { text: t('actions.delete'), style: 'destructive', onPress: () => deletePreset(preset.id) },
    ]);
  };

  const handleLongPress = (preset: Preset, index: number) => {
    Alert.alert(displayName(preset, index), undefined, [
      { text: t('presets.saveCurrent'), onPress: () => handleSave(preset) },
      {
        text: t('actions.rename'),
        onPress: () => setRenamingId(preset.id),
      },
      { text: t('actions.delete'), style: 'destructive', onPress: () => handleDelete(preset, index) },
      { text: t('actions.cancel'), style: 'cancel' },
    ]);
  };

  const handleAdd = () => {
    if (!addPreset()) Alert.alert(t('presets.maxPresets', { count: MAX_PRESETS }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('presets.title')}</Text>
      <Text style={styles.hint}>{t('presets.hint')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {presets.map((preset, index) => {
          const selected = currentPresetId === preset.id;
          const active = activePresetId === preset.id && playingSounds.length > 0;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.preset, selected && styles.presetSelected, active && styles.presetActive]}
              onPress={() => handlePress(preset, index)}
              onLongPress={() => handleLongPress(preset, index)}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetName, active && styles.presetTextActive]} numberOfLines={1}>
                {displayName(preset, index)}
              </Text>
              <Text style={[styles.presetCount, active && styles.presetTextActive]}>
                {t('presets.soundCount', { count: preset.sounds.length, max: MAX_PRESET_SOUNDS })}
              </Text>
            </TouchableOpacity>
          );
        })}
        {presets.length < MAX_PRESETS && (
          <TouchableOpacity style={[styles.preset, styles.addButton]} onPress={handleAdd} activeOpacity={0.8}>
            <Plus size={22} color={colors.accent} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {renamingId && (
        <PresetRenameModal
          key={renamingId}
          presetId={renamingId}
          title={t('presets.renameTitle')}
          onClose={() => setRenamingId(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700' },
  hint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  scroll: { flexDirection: 'row', overflow: 'visible' },
  preset: {
    backgroundColor: colors.glass,
    minWidth: 84,
    maxWidth: 140,
    height: 70,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 12,
    ...shadow,
  },
  presetSelected: { borderColor: colors.accent, borderWidth: 2 },
  presetActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  presetName: { fontSize: fontSize.body, color: colors.textPrimary, fontWeight: '800' },
  presetCount: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  presetTextActive: { color: colors.textOnAccent },
  addButton: { minWidth: 70, borderStyle: 'dashed', borderColor: colors.accent },
});
