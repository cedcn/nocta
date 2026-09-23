import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BreathingMethod } from '../../data/breathing';
import GlassCard from '../GlassCard';
import { colors, radii, fontSize } from '../../theme';

interface Props {
  method: BreathingMethod | null;
  onClose: () => void;
}

export default function BreathingTutorialModal({ method, onClose }: Props) {
  const { t } = useTranslation('breathing');
  if (!method) return null;
  const key = `methods.${method.id}`;
  const steps = t(`${key}.steps`, { returnObjects: true }) as string[];
  const rhythm = [
    t('rhythmInhale', { count: method.inhale }),
    t('rhythmHold', { count: method.hold }),
    t('rhythmExhale', { count: method.exhale }),
    t('rhythmHold', { count: method.holdAfter }),
  ].join(' → ');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <GlassCard strong style={styles.dialog}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t(`${key}.name`)}</Text>
            <Text style={[styles.subtitle, { color: method.color }]}>{t(`${key}.subtitle`)}</Text>
            <View style={styles.divider} />
            <Text style={styles.body}>{t(`${key}.desc`)}</Text>
            <View style={styles.divider} />
            <Text style={styles.section}>{t('steps')}</Text>
            {steps.map((step, i) => (
              <Text key={i} style={styles.body}>
                {i + 1}. {step}
              </Text>
            ))}
            <View style={styles.divider} />
            <Text style={styles.section}>{t('rhythm')}</Text>
            <Text style={styles.body}>{rhythm}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('gotIt')}</Text>
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
  dialog: { maxHeight: '80%', padding: 20 },
  title: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '800' },
  subtitle: { fontSize: fontSize.body, fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.trackInactive, marginVertical: 12 },
  section: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700', marginBottom: 6 },
  body: { color: colors.textSecondary, fontSize: fontSize.body, lineHeight: 22, marginBottom: 4 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: colors.textOnAccent, fontSize: fontSize.subtitle, fontWeight: '700' },
});
