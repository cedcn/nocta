import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Check, Play, Square } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePomodoro } from '../../context/PomodoroContext';
import type { RingtoneId } from '../../services/notifications';
import { previewRingtone, RINGTONE_IDS, stopPreview } from './ringtonePlayer';
import { colors, fontSize, radii } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LABEL_KEYS: Record<RingtoneId, string> = {
  chime: 'ringtoneChime',
  ding: 'ringtoneDing',
  marimba: 'ringtoneMarimba',
  windchime: 'ringtoneWindchime',
};

export default function PomodoroSettingsSheet({ visible, onClose }: Props) {
  const { t } = useTranslation('pomodoro');
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = usePomodoro();
  const [previewing, setPreviewing] = useState<RingtoneId | null>(null);

  useEffect(() => {
    if (!visible) {
      stopPreview();
      setPreviewing(null);
    }
  }, [visible]);

  useEffect(() => () => stopPreview(), []);

  const togglePreview = (id: RingtoneId) => {
    if (previewing === id) {
      stopPreview();
      setPreviewing(null);
      return;
    }
    setPreviewing(id);
    previewRingtone(id, () => setPreviewing((p) => (p === id ? null : p)));
  };

  const options: (RingtoneId | null)[] = [null, ...RINGTONE_IDS];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t('settingsTitle')}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>{t('ringtoneLabel')}</Text>
          <View style={styles.card}>
            {options.map((id, index) => {
              const selected = settings.ringtone === id;
              return (
                <View key={id ?? 'none'}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => updateSettings({ ringtone: id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkSlot}>{selected && <Check size={18} color={colors.accent} />}</View>
                    <Text style={[styles.rowText, selected && styles.rowTextSelected]}>
                      {id ? t(LABEL_KEYS[id]) : t('ringtoneNone')}
                    </Text>
                    {id && (
                      <TouchableOpacity style={styles.previewBtn} onPress={() => togglePreview(id)} hitSlop={8}>
                        {previewing === id ? (
                          <Square size={12} color={colors.accent} fill={colors.accent} />
                        ) : (
                          <Play size={12} color={colors.accent} fill={colors.accent} />
                        )}
                        <Text style={styles.previewText}>{t('ringtonePreview')}</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={[styles.card, styles.switchCard]}>
            <View style={styles.row}>
              <Text style={[styles.rowText, styles.flex]}>{t('pulseAnimation')}</Text>
              <Switch
                value={settings.pulseAnimation}
                onValueChange={(v) => updateSettings({ pulseAnimation: v })}
                trackColor={{ true: colors.accent, false: colors.trackInactive }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={[styles.rowText, styles.flex]}>{t('vibrate')}</Text>
              <Switch
                value={settings.vibrate}
                onValueChange={(v) => updateSettings({ vibrate: v })}
                trackColor={{ true: colors.accent, false: colors.trackInactive }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.glassStrong,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.trackInactive,
    marginBottom: 14,
  },
  title: { fontSize: fontSize.title, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  sectionLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.glassStrong,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 4,
  },
  switchCard: { marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14 },
  checkSlot: { width: 26 },
  rowText: { flex: 1, fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '600' },
  rowTextSelected: { color: colors.accent },
  flex: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.trackInactive, marginHorizontal: 12 },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  previewText: { fontSize: fontSize.caption, color: colors.accent, fontWeight: '700' },
});
