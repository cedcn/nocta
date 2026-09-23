import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import GlassCard from '../GlassCard';
import { colors, fontSize, radii } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStart: (minutes: number) => void;
}

const QUICK_OPTIONS = [15, 30, 45, 60, 90, 120];
const MAX_HOURS = 23;

function Stepper({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(value <= 0 ? max : value - 1)} hitSlop={6}>
          <Minus size={16} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{String(value).padStart(2, '0')}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(value >= max ? 0 : value + 1)} hitSlop={6}>
          <Plus size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ClockCountdownDialog({ visible, onClose, onStart }: Props) {
  const { t } = useTranslation('clock');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const total = hours * 60 + minutes;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <GlassCard strong style={styles.dialog}>
            <Text style={styles.title}>{t('setCountdown')}</Text>
            <View style={styles.chips}>
              {QUICK_OPTIONS.map((m) => {
                const selected = total === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => {
                      setHours(Math.floor(m / 60));
                      setMinutes(m % 60);
                    }}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{t('minutes', { count: m })}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.steppers}>
              <Stepper label={t('hoursLabel')} value={hours} onChange={setHours} max={MAX_HOURS} />
              <Stepper label={t('minutesLabel')} value={minutes} onChange={setMinutes} max={59} />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Text style={styles.cancel}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={total === 0}
                onPress={() => {
                  onStart(total);
                  onClose();
                }}
                hitSlop={8}
              >
                <Text style={[styles.confirm, total === 0 && styles.disabled]}>{t('start')}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(43, 58, 103, 0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { padding: 20, width: 320, maxWidth: '100%' },
  title: { fontSize: fontSize.subtitle, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexBasis: '30%',
    flexGrow: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.glass,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textSecondary, fontWeight: '700', fontSize: fontSize.body },
  chipTextActive: { color: colors.textOnAccent },
  steppers: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stepper: { flex: 1, alignItems: 'center' },
  stepperLabel: { color: colors.textSecondary, fontSize: fontSize.caption, fontWeight: '600', marginBottom: 6 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: fontSize.heading, fontWeight: '800', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 20 },
  cancel: { fontSize: fontSize.subtitle, color: colors.textSecondary, fontWeight: '600' },
  confirm: { fontSize: fontSize.subtitle, color: colors.accent, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});
