import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BreathingMethod, BreathPhase, methodPhases } from '../../data/breathing';
import { radii } from '../../theme';

const HEIGHT_RATIO: Record<BreathPhase, number> = { inhale: 0.8, hold: 1, exhale: 0.5, holdAfter: 1 };

export default function RhythmBars({ method }: { method: BreathingMethod }) {
  const { t } = useTranslation('breathing');
  return (
    <View style={styles.row}>
      {methodPhases(method).map(({ phase, seconds }) => (
        <View key={phase} style={[styles.segment, { flex: seconds, height: `${HEIGHT_RATIO[phase] * 100}%` }]}>
          <Text style={styles.label} numberOfLines={1}>
            {t(phase)}
            {seconds}s
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 50, gap: 3 },
  segment: {
    borderRadius: radii.sm / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  label: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 10 },
});
