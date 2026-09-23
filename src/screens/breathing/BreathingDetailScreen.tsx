import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import { CircleHelp, Timer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudio } from '../../context/AudioContext';
import { BreathPhase, getBreathingMethod, methodPhases, BREATHING_METHODS } from '../../data/breathing';
import { RootScreenProps } from '../../navigation';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import BackBar from '../../components/breathing/BackBar';
import DurationPickerModal from '../../components/breathing/DurationPickerModal';
import BreathingTutorialModal from '../../components/breathing/BreathingTutorialModal';
import { colors, radii, fontSize, shadow } from '../../theme';

const CIRCLE_SIZE = 260;
const MIN_SCALE = 0.5;
const KEEP_AWAKE_TAG = 'breathing';
const PHASE_SCALE: Record<BreathPhase, number> = { inhale: 1, hold: 1, exhale: MIN_SCALE, holdAfter: MIN_SCALE };

interface Session {
  remaining: number;
  phaseIndex: number;
  phaseLeft: number;
  breathCount: number;
}

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

export default function BreathingDetailScreen({ route, navigation }: RootScreenProps<'BreathingDetail'>) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('breathing');
  const { pauseAll } = useAudio();
  const method = getBreathingMethod(route.params.methodId) ?? BREATHING_METHODS[0];
  const phases = useMemo(() => methodPhases(method), [method]);

  const [durationMinutes, setDurationMinutes] = useState(method.defaultDurationMinutes);
  const [session, setSession] = useState<Session | null>(null);
  const [finished, setFinished] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const cuesRef = useRef<{ inhale: AudioPlayer; exhale: AudioPlayer } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const running = session !== null;
  const phase = session ? phases[session.phaseIndex].phase : 'inhale';

  useEffect(() => {
    const cues = {
      inhale: createAudioPlayer(require('../../../assets/breathing/breath-in.m4a')),
      exhale: createAudioPlayer(require('../../../assets/breathing/breath-out.m4a')),
    };
    cuesRef.current = cues;
    return () => {
      cues.inhale.remove();
      cues.exhale.remove();
      cuesRef.current = null;
    };
  }, []);

  const playCue = useCallback((p: BreathPhase) => {
    const cues = cuesRef.current;
    if (!cues) return;
    cues.inhale.pause();
    cues.exhale.pause();
    const cue = p === 'inhale' ? cues.inhale : p === 'exhale' ? cues.exhale : null;
    if (cue) {
      cue.seekTo(0);
      cue.play();
    }
  }, []);

  const stop = useCallback((completed = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    cuesRef.current?.inhale.pause();
    cuesRef.current?.exhale.pause();
    deactivateKeepAwake(KEEP_AWAKE_TAG);
    setSession(null);
    setFinished(completed);
  }, []);

  const tick = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const remaining = prev.remaining - 1;
      if (remaining <= 0) return { ...prev, remaining: 0 };
      if (prev.phaseLeft > 1) return { ...prev, remaining, phaseLeft: prev.phaseLeft - 1 };
      const nextIndex = (prev.phaseIndex + 1) % phases.length;
      return {
        remaining,
        phaseIndex: nextIndex,
        phaseLeft: phases[nextIndex].seconds,
        breathCount: nextIndex === 0 ? prev.breathCount + 1 : prev.breathCount,
      };
    });
  }, [phases]);

  const start = () => {
    pauseAll();
    setFinished(false);
    setSession({ remaining: durationMinutes * 60, phaseIndex: 0, phaseLeft: phases[0].seconds, breathCount: 0 });
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    intervalRef.current = setInterval(tick, 1000);
  };

  useEffect(() => {
    if (session && session.remaining <= 0) stop(true);
  }, [session, stop]);

  const phaseIndex = session?.phaseIndex;
  useEffect(() => {
    if (phaseIndex === undefined) {
      Animated.timing(scale, { toValue: MIN_SCALE, duration: 500, useNativeDriver: true }).start();
      return;
    }
    const { phase: p, seconds } = phases[phaseIndex];
    playCue(p);
    Animated.timing(scale, {
      toValue: PHASE_SCALE[p],
      duration: Math.max(100, seconds * 1000),
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [phaseIndex, phases, playCue, scale]);

  useEffect(() => () => stop(), [stop]);

  const totalSeconds = durationMinutes * 60;
  const progress = session ? (totalSeconds - session.remaining) / totalSeconds : 0;
  const guidance = running ? t(phase) : finished ? t('finished') : t('ready');

  return (
    <ScreenBackground>
      <BackBar
        title={t(`methods.${method.id}.name`)}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowTutorial(true)} hitSlop={10}>
            <CircleHelp size={24} color={colors.accent} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.subtitle}>{t(`methods.${method.id}.subtitle`)}</Text>

        <View style={styles.countRow}>
          {running && <Text style={styles.count}>{t('breathCount', { n: session.breathCount + 1 })}</Text>}
        </View>

        <View style={styles.circleWrap}>
          <View style={[styles.outerCircle, { backgroundColor: `${method.color}1F` }]} />
          <Animated.View
            style={[styles.innerCircle, { backgroundColor: `${method.color}59`, transform: [{ scale }] }]}
          />
          <View style={styles.guidance}>
            <Text style={styles.guidanceText}>{guidance}</Text>
            {running && <Text style={styles.phaseCountdown}>{session.phaseLeft}s</Text>}
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.durationBtn}
            onPress={() => !running && setShowDuration(true)}
            activeOpacity={running ? 1 : 0.8}
          >
            {running ? (
              <Text style={styles.durationText}>{formatClock(session.remaining)}</Text>
            ) : (
              <>
                <Timer size={20} color={colors.accent} />
                <Text style={styles.durationText}>{t('minutes', { count: durationMinutes })}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: method.color }]}
            onPress={() => (running ? stop() : start())}
            activeOpacity={0.85}
          >
            <Text style={styles.startText}>{running ? t('stop') : t('start')}</Text>
            {running && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.descCard}>
          <Text style={styles.descText}>{t(`methods.${method.id}.desc`)}</Text>
        </GlassCard>
      </ScrollView>

      <DurationPickerModal
        visible={showDuration}
        minutes={durationMinutes}
        onChange={setDurationMinutes}
        onClose={() => setShowDuration(false)}
      />
      <BreathingTutorialModal method={showTutorial ? method : null} onClose={() => setShowTutorial(false)} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingHorizontal: 20 },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.body, marginTop: 4 },
  countRow: { height: 24, marginTop: 24, justifyContent: 'center' },
  count: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: { position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 },
  innerCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  guidance: { alignItems: 'center' },
  guidanceText: { color: colors.textPrimary, fontSize: fontSize.title + 2, fontWeight: '700', textAlign: 'center' },
  phaseCountdown: { color: colors.textSecondary, fontSize: fontSize.subtitle, marginTop: 4 },
  buttons: { alignItems: 'center', gap: 12, marginTop: 32 },
  durationBtn: {
    width: 160,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.glassStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadow,
  },
  durationText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  startBtn: {
    width: 160,
    height: 64,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow,
  },
  startText: { color: colors.textOnAccent, fontSize: fontSize.subtitle, fontWeight: '700' },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: { height: '100%', backgroundColor: colors.textOnAccent },
  descCard: { marginTop: 32, alignSelf: 'stretch' },
  descText: { color: colors.textSecondary, fontSize: fontSize.body, lineHeight: 22 },
});
