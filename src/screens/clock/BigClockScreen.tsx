import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, Check, Hourglass, RotateCw, Smartphone, TimerOff, Type, TabletSmartphone, Moon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenBackground from '../../components/ScreenBackground';
import GlassCard from '../../components/GlassCard';
import FlipCard from '../../components/clock/FlipCard';
import ClockCountdownDialog from '../../components/clock/ClockCountdownDialog';
import { CLOCK_FONT_IDS, CLOCK_FONTS, ClockFontId } from '../../components/clock/clockFonts';
import { useAudio } from '../../context/AudioContext';
import { RootScreenProps } from '../../navigation';
import { colors, fontSize, radii, shadow } from '../../theme';

const STORAGE_KEY = '@nocta_big_clock';
const CONTROLS_HIDE_MS = 4000;

type OrientationMode = 'all' | 'portrait' | 'landscape';
const ORIENTATION_MODES: OrientationMode[] = ['all', 'portrait', 'landscape'];

interface ClockPrefs {
  font: ClockFontId;
  hour12: boolean;
  orientation: OrientationMode;
}

const DEFAULT_PREFS: ClockPrefs = { font: 'oswald', hour12: false, orientation: 'all' };

const pad = (n: number) => String(n).padStart(2, '0');

const formatSeconds = (total: number) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export default function BigClockScreen({ navigation }: RootScreenProps<'BigClock'>) {
  useKeepAwake();
  const { t } = useTranslation('clock');
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { timerRemaining } = useAudio();

  const [now, setNow] = useState(() => new Date());
  const [prefs, setPrefs] = useState<ClockPrefs>(DEFAULT_PREFS);
  const [countdownEnd, setCountdownEnd] = useState<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [dialog, setDialog] = useState<'countdown' | 'font' | null>(null);
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<ClockPrefs>;
        setPrefs({
          font: saved.font && CLOCK_FONT_IDS.includes(saved.font) ? saved.font : DEFAULT_PREFS.font,
          hour12: !!saved.hour12,
          orientation:
            saved.orientation && ORIENTATION_MODES.includes(saved.orientation) ? saved.orientation : DEFAULT_PREFS.orientation,
        });
      })
      .catch(() => {});
  }, []);

  const updatePrefs = useCallback((patch: Partial<ClockPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // react-native-screens owns orientation for this route, so switching modes updates the screen option
  // instead of locking globally; the portrait lock of other routes is restored automatically on leave.
  useEffect(() => {
    navigation.setOptions({ orientation: prefs.orientation });
  }, [navigation, prefs.orientation]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Align ticks to the wall-clock second so the flip lands on time.
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      tick();
      interval = setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, []);

  useEffect(() => {
    Animated.timing(controlsAnim, { toValue: controlsVisible ? 1 : 0, duration: 250, useNativeDriver: true }).start();
    if (controlsVisible && !dialog) scheduleHide();
    else if (hideTimer.current) clearTimeout(hideTimer.current);
  }, [controlsVisible, dialog, controlsAnim, scheduleHide]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const interact = (fn: () => void) => () => {
    fn();
    scheduleHide();
  };

  const font = CLOCK_FONTS[prefs.font];
  const isLandscape = width > height;
  const inCountdown = countdownEnd !== null;

  let first: string;
  let second: string;
  let seconds: string;
  let badge: string | undefined;
  if (inCountdown) {
    const left = Math.max(0, Math.round((countdownEnd - now.getTime()) / 1000));
    first = pad(Math.floor(left / 3600));
    second = pad(Math.floor((left % 3600) / 60));
    seconds = pad(left % 60);
  } else {
    const h24 = now.getHours();
    const h = prefs.hour12 ? h24 % 12 || 12 : h24;
    first = pad(h);
    second = pad(now.getMinutes());
    seconds = pad(now.getSeconds());
    badge = prefs.hour12 ? (h24 < 12 ? 'AM' : 'PM') : undefined;
  }

  // Two square cards with half-card gaps, sized from the long axis like XMSLEEP's FlipClockContent.
  const unit = (isLandscape ? width : height) / 10;
  const cardSize = Math.min(unit * 4, (isLandscape ? height : width) * (isLandscape ? 0.8 : 0.9));
  const clockScale = controlsAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });

  const OrientationIcon =
    prefs.orientation === 'all' ? RotateCw : prefs.orientation === 'portrait' ? Smartphone : TabletSmartphone;
  const orientationLabel =
    prefs.orientation === 'all' ? t('rotateAuto') : prefs.orientation === 'portrait' ? t('rotatePortrait') : t('rotateLandscape');

  const controls = [
    { key: 'back', Icon: ArrowLeft, label: t('back'), onPress: () => navigation.goBack(), active: false },
    inCountdown
      ? { key: 'cancel', Icon: TimerOff, label: t('cancelCountdown'), onPress: interact(() => setCountdownEnd(null)), active: true }
      : { key: 'countdown', Icon: Hourglass, label: t('countdown'), onPress: () => setDialog('countdown'), active: false },
    { key: 'font', Icon: Type, label: t('font'), onPress: () => setDialog('font'), active: false },
    {
      key: 'hour',
      Icon: null,
      label: prefs.hour12 ? t('hour12') : t('hour24'),
      onPress: interact(() => updatePrefs({ hour12: !prefs.hour12 })),
      active: prefs.hour12,
    },
    {
      key: 'orientation',
      Icon: OrientationIcon,
      label: orientationLabel,
      onPress: interact(() =>
        updatePrefs({
          orientation: ORIENTATION_MODES[(ORIENTATION_MODES.indexOf(prefs.orientation) + 1) % ORIENTATION_MODES.length],
        }),
      ),
      active: prefs.orientation === 'all',
    },
  ];

  return (
    <ScreenBackground>
      <StatusBar hidden />
      <Pressable style={styles.fill} onPress={() => setControlsVisible((v) => !v)}>
        <Animated.View
          style={[
            styles.clock,
            { flexDirection: isLandscape ? 'row' : 'column', gap: unit * 0.5, transform: [{ scale: clockScale }] },
          ]}
        >
          <FlipCard value={first} size={cardSize} font={font} badge={badge} />
          <FlipCard value={second} size={cardSize} font={font} corner={seconds} />
        </Animated.View>

        {timerRemaining !== null && (
          <View style={[styles.sleepPill, { top: insets.top + 16 }]}>
            <Moon size={14} color={colors.accent} />
            <Text style={styles.sleepText}>
              {t('sleepTimer')} · {formatSeconds(timerRemaining)}
            </Text>
          </View>
        )}
      </Pressable>

      <Animated.View
        pointerEvents={controlsVisible ? 'box-none' : 'none'}
        style={[
          styles.controlsWrap,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            opacity: controlsAnim,
            transform: [{ translateY: controlsAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }],
          },
        ]}
      >
        <View style={styles.controls}>
          {controls.map(({ key, Icon, label, onPress, active }) => (
            <TouchableOpacity
              key={key}
              style={[styles.controlBtn, active && styles.controlBtnActive]}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityLabel={label}
            >
              {Icon ? (
                <Icon size={20} color={active ? colors.textOnAccent : colors.textPrimary} />
              ) : (
                <Text style={[styles.hourText, active && styles.hourTextActive]}>{prefs.hour12 ? '12' : '24'}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <ClockCountdownDialog
        visible={dialog === 'countdown'}
        onClose={() => setDialog(null)}
        onStart={(minutes) => setCountdownEnd(Date.now() + minutes * 60 * 1000)}
      />

      <Modal
        visible={dialog === 'font'}
        transparent
        animationType="fade"
        onRequestClose={() => setDialog(null)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setDialog(null)}>
          <GlassCard strong style={styles.dialog}>
            <Text style={styles.dialogTitle}>{t('selectFont')}</Text>
            {CLOCK_FONT_IDS.map((id) => {
              const f = CLOCK_FONTS[id];
              const selected = prefs.font === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={styles.fontRow}
                  onPress={() => {
                    updatePrefs({ font: id });
                    setDialog(null);
                  }}
                >
                  <View style={styles.fontTexts}>
                    <Text style={[styles.fontSample, { fontFamily: f.fontFamily }]}>{f.name} 12:34</Text>
                    <Text style={styles.fontDesc}>{t(f.descKey)}</Text>
                  </View>
                  {selected && <Check size={20} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </GlassCard>
        </TouchableOpacity>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  clock: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sleepPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
  },
  sleepText: { color: colors.textPrimary, fontSize: fontSize.caption, fontWeight: '700', fontVariant: ['tabular-nums'] },
  controlsWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  controls: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
  },
  controlBtnActive: { backgroundColor: colors.accent },
  hourText: { fontSize: fontSize.body, fontWeight: '800', color: colors.textPrimary },
  hourTextActive: { color: colors.textOnAccent },
  backdrop: { flex: 1, backgroundColor: 'rgba(43, 58, 103, 0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { padding: 16, width: 340, maxWidth: '100%' },
  dialogTitle: { fontSize: fontSize.subtitle, fontWeight: '700', color: colors.textPrimary, marginBottom: 8, paddingHorizontal: 4 },
  fontRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  fontTexts: { flex: 1 },
  fontSample: { fontSize: 28, color: colors.textPrimary },
  fontDesc: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2 },
});
