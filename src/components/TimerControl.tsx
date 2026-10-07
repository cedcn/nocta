import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TIMER_EXTEND_MINUTES, TIMER_OPTIONS, useAudio } from '../context/AudioContext';
import MinuteRuler from './pomodoro/MinuteRuler';
import GlassCard from './GlassCard';
import { colors, radii, fontSize } from '../theme';

const CUSTOM_MIN = 1;
const CUSTOM_MAX = 240;
const CUSTOM_DEFAULT = 90;

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const mmss = `${mins.toString().padStart(hours ? 2 : 1, '0')}:${secs.toString().padStart(2, '0')}`;
  return hours ? `${hours}:${mmss}` : mmss;
};

export default function TimerControl() {
  const { t } = useTranslation();
  const { timer, timerRemaining, setTimer, extendTimer } = useAudio();
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState(CUSTOM_DEFAULT);

  const isCustom = timer !== null && !TIMER_OPTIONS.includes(timer);

  const confirmCustom = () => {
    setTimer(customValue);
    setCustomOpen(false);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Timer size={18} color={colors.textPrimary} />
          <Text style={styles.title}>{t('timer.title')}</Text>
        </View>
        {timerRemaining !== null ? (
          <View style={styles.titleRow}>
            <Text style={styles.countdown}>{formatTime(timerRemaining)}</Text>
            <TouchableOpacity style={styles.extend} onPress={() => extendTimer()} hitSlop={8} activeOpacity={0.8}>
              <Text style={styles.extendText}>{t('timer.extend', { count: TIMER_EXTEND_MINUTES })}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
      <View style={styles.buttons}>
        {TIMER_OPTIONS.map((min) => (
          <TouchableOpacity
            key={min}
            style={[styles.button, timer === min && styles.buttonActive]}
            onPress={() => setTimer(timer === min ? null : min)}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, timer === min && styles.buttonTextActive]}>{min % 60 === 0 && min >= 120 ? t('timer.hours', { count: min / 60 }) : t('timer.minutes', { count: min })}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.button, isCustom && styles.buttonActive]}
          onPress={() => (isCustom ? setTimer(null) : setCustomOpen(true))}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, isCustom && styles.buttonTextActive]} numberOfLines={1}>
            {isCustom ? t('timer.minutes', { count: timer }) : t('timer.custom')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={customOpen} transparent animationType="fade" onRequestClose={() => setCustomOpen(false)}>
        <View style={styles.backdrop}>
          <GlassCard strong style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('timer.customTitle')}</Text>
            <MinuteRuler
              value={customValue}
              min={CUSTOM_MIN}
              max={CUSTOM_MAX}
              enabled
              color={colors.accent}
              unit={t('pomodoro:minutesUnit')}
              onChange={setCustomValue}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setCustomOpen(false)} hitSlop={8}>
                <Text style={styles.dialogCancel}>{t('actions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmCustom} hitSlop={8}>
                <Text style={styles.dialogConfirm}>{t('actions.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700' },
  countdown: { fontSize: fontSize.subtitle, color: colors.accent, fontWeight: '800' },
  extend: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  extendText: { color: colors.accent, fontSize: fontSize.caption, fontWeight: '700' },
  buttons: { flexDirection: 'row', gap: 6 },
  button: {
    flex: 1,
    backgroundColor: colors.glassStrong,
    paddingVertical: 12,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  buttonActive: { backgroundColor: colors.accent },
  buttonText: { color: colors.textSecondary, fontSize: fontSize.caption + 1, fontWeight: '700' },
  buttonTextActive: { color: colors.textOnAccent },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 32 },
  dialog: { padding: 20 },
  dialogTitle: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700', marginBottom: 14 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 18 },
  dialogCancel: { fontSize: fontSize.subtitle, color: colors.textSecondary, fontWeight: '600' },
  dialogConfirm: { fontSize: fontSize.subtitle, color: colors.accent, fontWeight: '700' },
});
