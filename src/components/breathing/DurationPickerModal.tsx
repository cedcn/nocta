import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { DURATION_PRESETS, MAX_CUSTOM_DURATION } from '../../data/breathing';
import GlassCard from '../GlassCard';
import { colors, radii, fontSize } from '../../theme';

interface Props {
  visible: boolean;
  minutes: number;
  onChange: (minutes: number) => void;
  onClose: () => void;
}

export default function DurationPickerModal({ visible, minutes, onChange, onClose }: Props) {
  const { t } = useTranslation('breathing');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <GlassCard strong style={styles.dialog}>
          <Text style={styles.title}>{t('selectDuration')}</Text>

          <Text style={styles.section}>{t('presetDuration')}</Text>
          <View style={styles.chips}>
            {DURATION_PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, minutes === m && styles.chipActive]}
                onPress={() => onChange(m)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, minutes === m && styles.chipTextActive]}>
                  {t('minutes', { count: m })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>{t('customDuration')}</Text>
          <Text style={styles.value}>{t('minutes', { count: minutes })}</Text>
          <Slider
            minimumValue={5}
            maximumValue={MAX_CUSTOM_DURATION}
            step={5}
            value={minutes}
            onValueChange={(v) => onChange(Math.round(v))}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.trackInactive}
            thumbTintColor={colors.accent}
          />

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('done')}</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 58, 103, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { padding: 20 },
  title: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '800', marginBottom: 8 },
  section: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: '600' },
  chipTextActive: { color: colors.textOnAccent },
  value: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: colors.textOnAccent, fontSize: fontSize.subtitle, fontWeight: '700' },
});
