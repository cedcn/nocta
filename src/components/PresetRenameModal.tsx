import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../context/AudioContext';
import { usePresetName } from '../hooks/usePresetActions';
import GlassCard from './GlassCard';
import { colors, radii, fontSize } from '../theme';

// Mount with `key={presetId}` so the draft starts from that preset's name.
interface Props {
  presetId: string;
  title: string;
  onClose: () => void;
}

export default function PresetRenameModal({ presetId, title, onClose }: Props) {
  const { t } = useTranslation();
  const { presets, renamePreset } = useAudio();
  const displayName = usePresetName();
  const index = presets.findIndex((p) => p.id === presetId);
  const preset = index >= 0 ? presets[index] : null;
  const [draft, setDraft] = useState(() => preset?.name ?? '');

  const submit = () => {
    if (preset) renamePreset(preset.id, draft);
    onClose();
  };

  return (
    <Modal visible={preset !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <GlassCard strong style={styles.dialog}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={preset ? displayName(preset, index) : ''}
            placeholderTextColor={colors.textSecondary}
            maxLength={20}
            autoFocus
            onSubmitEditing={submit}
          />
          <View style={styles.dialogActions}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.dialogCancel}>{t('actions.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} hitSlop={8}>
              <Text style={styles.dialogConfirm}>{t('actions.save')}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
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
