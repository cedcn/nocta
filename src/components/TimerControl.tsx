import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TIMER_OPTIONS, useAudio } from '../context/AudioContext';
import GlassCard from './GlassCard';
import { colors, radii, fontSize } from '../theme';

export default function TimerControl() {
  const { t } = useTranslation();
  const { timer, timerRemaining, setTimer } = useAudio();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const mmss = `${mins.toString().padStart(hours ? 2 : 1, '0')}:${secs.toString().padStart(2, '0')}`;
    return hours ? `${hours}:${mmss}` : mmss;
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Timer size={18} color={colors.textPrimary} />
          <Text style={styles.title}>{t('timer.title')}</Text>
        </View>
        {timerRemaining !== null ? <Text style={styles.countdown}>{formatTime(timerRemaining)}</Text> : null}
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
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700' },
  countdown: { fontSize: fontSize.subtitle, color: colors.accent, fontWeight: '800' },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    backgroundColor: colors.glassStrong,
    paddingVertical: 12,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  buttonActive: { backgroundColor: colors.accent },
  buttonText: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: '700' },
  buttonTextActive: { color: colors.textOnAccent },
});
