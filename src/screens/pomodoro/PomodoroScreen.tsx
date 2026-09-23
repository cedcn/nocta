import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Check, Pause, Play, RotateCcw, Settings2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import ScreenBackground from '../../components/ScreenBackground';
import WaveRing from '../../components/pomodoro/WaveRing';
import MinuteRuler from '../../components/pomodoro/MinuteRuler';
import PomodoroSettingsSheet from '../../components/pomodoro/PomodoroSettingsSheet';
import { POMODORO_MAX_MINUTES, POMODORO_MIN_MINUTES, usePomodoro } from '../../context/PomodoroContext';
import { RootScreenProps } from '../../navigation';
import { colors, fontSize, radii, shadow } from '../../theme';

const BREAK_COLOR = '#5E8F80';
const RING_SIZE = 260;
const KEEP_AWAKE_TAG = 'pomodoro';

const formatMs = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
};

export default function PomodoroScreen({ navigation }: RootScreenProps<'Pomodoro'>) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('pomodoro');
  const {
    phase,
    running,
    remainingMs,
    totalMs,
    awaitingBreakStart,
    completedToday,
    completionTick,
    settings,
    start,
    pause,
    reset,
    skipBreak,
    setPhaseMinutes,
  } = usePomodoro();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const seenTickRef = useRef(completionTick);

  const isBreak = phase === 'break';
  const color = isBreak ? BREAK_COLOR : colors.accent;
  const onColor = isBreak ? colors.textOnColor : colors.textOnAccent;
  const progress = totalMs > 0 ? remainingMs / totalMs : 1;

  useEffect(() => {
    if (!running) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [running]);

  // Only animate for completions that happen while (or after) this screen is open, not stale ones.
  useEffect(() => {
    if (completionTick === seenTickRef.current) return;
    seenTickRef.current = completionTick;
    if (!settings.pulseAnimation) return;
    pulse.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      { iterations: 3 },
    ).start();
  }, [completionTick, settings.pulseAnimation, pulse]);

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
  };

  const rulerValue = isBreak ? settings.breakMinutes : settings.focusMinutes;

  return (
    <ScreenBackground>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.textOnAccent} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('timerTitle')}</Text>
        <TouchableOpacity style={styles.circleBtn} onPress={() => setSettingsOpen(true)} activeOpacity={0.7}>
          <Settings2 size={20} color={colors.textOnAccent} />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.today, isBreak && styles.hidden]}>
          {t('todayCompleted', { count: completedToday })}
        </Text>

        <View style={styles.ringWrap}>
          <Animated.View
            pointerEvents="none"
            style={[styles.pulseRing, { borderColor: color, width: RING_SIZE, height: RING_SIZE }, pulseStyle]}
          />
          <WaveRing size={RING_SIZE} progress={progress} color={color}>
            <Text style={[styles.phaseLabel, isBreak && { color: BREAK_COLOR }]}>
              {isBreak ? t('break') : t('focus')}
            </Text>
            <Text style={styles.time}>{formatMs(remainingMs)}</Text>
          </WaveRing>
        </View>

        <View style={styles.ruler}>
          <MinuteRuler
            value={rulerValue}
            min={POMODORO_MIN_MINUTES}
            max={POMODORO_MAX_MINUTES}
            enabled={!running}
            color={color}
            unit={t('minutesUnit')}
            onChange={setPhaseMinutes}
          />
        </View>

        {awaitingBreakStart ? (
          <TouchableOpacity style={[styles.breakBtn, { backgroundColor: BREAK_COLOR }]} onPress={start} activeOpacity={0.85}>
            <Play size={18} color={colors.textOnColor} fill={colors.textOnColor} />
            <Text style={styles.breakBtnText}>{t('startBreak')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.sideBtn} onPress={reset} activeOpacity={0.7} accessibilityLabel={t('reset')}>
              <RotateCcw size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: color }, running && styles.mainBtnRunning]}
              onPress={running ? pause : start}
              activeOpacity={0.85}
              accessibilityLabel={running ? t('pause') : t('start')}
            >
              {running ? (
                <Pause size={36} color={onColor} fill={onColor} />
              ) : (
                <Play size={36} color={onColor} fill={onColor} />
              )}
            </TouchableOpacity>
            {isBreak ? (
              <TouchableOpacity
                style={styles.sideBtn}
                onPress={skipBreak}
                activeOpacity={0.7}
                accessibilityLabel={t('skipBreak')}
              >
                <Check size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.sideSpacer} />
            )}
          </View>
        )}
      </View>

      <PomodoroSettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '800' },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  today: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: '600', marginBottom: 24 },
  hidden: { opacity: 0 },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', borderRadius: radii.pill, borderWidth: 4 },
  phaseLabel: { color: colors.textSecondary, fontSize: fontSize.body, fontWeight: '600' },
  time: {
    color: colors.textPrimary,
    fontSize: 60,
    fontWeight: '800',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  ruler: { width: '100%', marginTop: 32, height: 100 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 28, marginTop: 20 },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  sideSpacer: { width: 56, height: 56 },
  mainBtn: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  mainBtnRunning: { opacity: 0.6 },
  breakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 28,
    height: 56,
    borderRadius: radii.pill,
    ...shadow,
  },
  breakBtnText: { color: colors.textOnColor, fontSize: fontSize.subtitle, fontWeight: '700' },
});
