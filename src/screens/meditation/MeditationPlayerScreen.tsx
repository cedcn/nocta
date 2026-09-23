import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Animated, Easing } from 'react-native';
import { Pause, Play, Repeat, Repeat1, RotateCcw, RotateCw } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { formatDuration, getMeditationSession } from '../../data/meditation';
import { useLocalizedName } from '../../i18n/LanguageProvider';
import { RootScreenProps } from '../../navigation';
import ScreenBackground from '../../components/ScreenBackground';
import BackBar from '../../components/breathing/BackBar';
import { useMeditationPlayer } from '../../components/meditation/useMeditationPlayer';
import { colors, radii, fontSize, shadow } from '../../theme';

const COVER_SIZE = 220;
const SKIP_SECONDS = 15;

export default function MeditationPlayerScreen({ route, navigation }: RootScreenProps<'MeditationPlayer'>) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('meditation');
  const localizedName = useLocalizedName();
  const session = getMeditationSession(route.params.sessionId);
  const { state, loading, error, loop, repeatCount, load, togglePlay, seekTo, skip, toggleLoop, cycleRepeat } =
    useMeditationPlayer(session);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!state.playing) {
      pulse.stopAnimation();
      Animated.timing(pulse, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.94, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, state.playing]);

  if (!session) return null;

  const position = dragValue ?? state.currentTime;
  const duration = state.duration || session.duration;

  return (
    <ScreenBackground>
      <BackBar title={t('title')} onBack={() => navigation.goBack()} />

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Animated.View style={[styles.coverWrap, { transform: [{ scale: pulse }] }]}>
          <Image source={{ uri: session.coverUrl }} style={styles.cover} />
        </Animated.View>

        <Text style={styles.title} numberOfLines={3}>
          {localizedName(session)}
        </Text>

        <View style={styles.statusRow}>
          {error ? (
            <TouchableOpacity onPress={() => load(true)} style={styles.retry} activeOpacity={0.8}>
              <Text style={styles.errorText}>{t('loadFailed')}</Text>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          ) : loading || state.buffering ? (
            <Text style={styles.statusText}>{t('loading')}</Text>
          ) : null}
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={position}
          disabled={loading || error}
          onValueChange={setDragValue}
          onSlidingComplete={(v) => {
            seekTo(v);
            setDragValue(null);
          }}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.trackInactive}
          thumbTintColor={colors.accent}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatDuration(position)}</Text>
          <Text style={styles.time}>{formatDuration(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.sideBtn, loop && styles.sideBtnActive]}
            onPress={toggleLoop}
            accessibilityLabel={t('loopPlay')}
          >
            <Repeat size={22} color={loop ? colors.accent : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => skip(-SKIP_SECONDS)} disabled={loading}>
            <RotateCcw size={22} color={colors.textPrimary} />
            <Text style={styles.skipText}>{SKIP_SECONDS}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color={colors.textOnAccent} />
            ) : state.playing ? (
              <Pause size={28} color={colors.textOnAccent} />
            ) : (
              <Play size={28} color={colors.textOnAccent} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => skip(SKIP_SECONDS)} disabled={loading}>
            <RotateCw size={22} color={colors.textPrimary} />
            <Text style={styles.skipText}>{SKIP_SECONDS}</Text>
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={[styles.sideBtn, repeatCount > 0 && styles.sideBtnActive]}
              onPress={cycleRepeat}
              accessibilityLabel={repeatCount > 0 ? t('repeatCount', { count: repeatCount }) : t('repeatTimes')}
            >
              <Repeat1 size={22} color={repeatCount > 0 ? colors.accent : colors.textSecondary} />
            </TouchableOpacity>
            {repeatCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>×{repeatCount}</Text>
              </View>
            )}
          </View>
        </View>

        {repeatCount > 0 && <Text style={styles.repeatHint}>{t('repeatCount', { count: repeatCount })}</Text>}
        <Text style={styles.source}>{t('source')}</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
  coverWrap: { borderRadius: radii.lg, ...shadow },
  cover: { width: COVER_SIZE, height: COVER_SIZE, borderRadius: radii.lg, backgroundColor: colors.pastelLavender },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.title,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 28,
  },
  statusRow: { height: 40, justifyContent: 'center', marginTop: 8 },
  statusText: { color: colors.textSecondary, fontSize: fontSize.body },
  retry: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  errorText: { color: colors.danger, fontSize: fontSize.body },
  retryText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  slider: { alignSelf: 'stretch', height: 40 },
  timeRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  time: { color: colors.textSecondary, fontSize: fontSize.caption },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 24,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnActive: { backgroundColor: colors.glassStrong, borderColor: colors.accent },
  skipBtn: { alignItems: 'center', justifyContent: 'center', width: 44 },
  skipText: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { color: colors.textOnAccent, fontSize: 10, fontWeight: '700' },
  repeatHint: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 16 },
  source: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 'auto' },
});
