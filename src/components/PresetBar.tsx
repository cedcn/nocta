import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MAX_PRESETS, MAX_PRESET_SOUNDS, MIN_PRESETS, useAudio } from '../context/AudioContext';
import { Preset } from '../types';
import GlassCard from './GlassCard';
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
    renamePreset,
    deletePreset,
    playingSounds,
  } = useAudio();
  const [renaming, setRenaming] = useState<Preset | null>(null);
  const [draftName, setDraftName] = useState('');

  const displayName = (preset: Preset, index: number) => preset.name || t('presets.defaultName', { n: index + 1 });

  const handlePress = (preset: Preset) => {
    setCurrentPreset(preset.id);
    if (activePresetId === preset.id && playingSounds.length > 0) {
      stopAll();
    } else if (preset.sounds.length > 0) {
      loadPreset(preset.id);
    }
  };

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
        onPress: () => {
          setDraftName(preset.name);
          setRenaming(preset);
        },
      },
      { text: t('actions.delete'), style: 'destructive', onPress: () => handleDelete(preset, index) },
      { text: t('actions.cancel'), style: 'cancel' },
    ]);
  };

  const handleAdd = () => {
    if (!addPreset()) Alert.alert(t('presets.maxPresets', { count: MAX_PRESETS }));
  };

  const submitRename = () => {
    if (renaming) renamePreset(renaming.id, draftName);
    setRenaming(null);
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
              onPress={() => handlePress(preset)}
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

      <Modal visible={renaming !== null} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <View style={styles.backdrop}>
          <GlassCard strong style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('presets.renameTitle')}</Text>
            <TextInput
              style={styles.input}
              value={draftName}
              onChangeText={setDraftName}
              placeholder={renaming ? displayName(renaming, presets.indexOf(renaming)) : ''}
              placeholderTextColor={colors.textSecondary}
              maxLength={20}
              autoFocus
              onSubmitEditing={submitRename}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setRenaming(null)} hitSlop={8}>
                <Text style={styles.dialogCancel}>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitRename} hitSlop={8}>
                <Text style={styles.dialogConfirm}>{t('actions.save')}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 58, 103, 0.35)',
    justifyContent: 'center',
    padding: 32,
  },
  dialog: { padding: 20 },
  dialogTitle: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700', marginBottom: 14 },
  input: {
    backgroundColor: colors.glass,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.subtitle,
    color: colors.textPrimary,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 18 },
  dialogCancel: { fontSize: fontSize.subtitle, color: colors.textSecondary, fontWeight: '600' },
  dialogConfirm: { fontSize: fontSize.subtitle, color: colors.accent, fontWeight: '700' },
});
