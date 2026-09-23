import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import i18n from '../i18n';
import { useAudio } from './AudioContext';
import {
  RingtoneId,
  cancelNotification,
  configureNotificationHandler,
  ensureNotificationPermission,
  schedulePhaseEndNotification,
} from '../services/notifications';
import { playRingtone, stopRingtone, RINGTONE_IDS } from '../components/pomodoro/ringtonePlayer';

export const POMODORO_MIN_MINUTES = 3;
export const POMODORO_MAX_MINUTES = 180;
const STORAGE_KEY = '@nocta_pomodoro';
const HAPTIC_TIMES = 3;
const HAPTIC_GAP_MS = 600;
// A phase that ended this long before we noticed has already been announced by the scheduled notification.
const STALE_COMPLETION_MS = 5000;

export type PomodoroPhase = 'focus' | 'break';

export interface PomodoroSettings {
  focusMinutes: number;
  breakMinutes: number;
  ringtone: RingtoneId | null;
  vibrate: boolean;
  pulseAnimation: boolean;
}

interface PersistedState {
  phase: PomodoroPhase;
  running: boolean;
  endAt: number | null;
  remainingMs: number;
  awaitingBreakStart: boolean;
  completedToday: number;
  completedDate: string;
  notificationId: string | null;
  settings: PomodoroSettings;
}

interface PomodoroContextType {
  phase: PomodoroPhase;
  running: boolean;
  remainingMs: number;
  totalMs: number;
  awaitingBreakStart: boolean;
  completedToday: number;
  completionTick: number;
  settings: PomodoroSettings;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipBreak: () => void;
  setPhaseMinutes: (minutes: number) => void;
  updateSettings: (patch: Partial<PomodoroSettings>) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
  ringtone: 'chime',
  vibrate: true,
  pulseAnimation: true,
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const minutesToMs = (m: number) => m * 60 * 1000;

const initialState = (): PersistedState => ({
  phase: 'focus',
  running: false,
  endAt: null,
  remainingMs: minutesToMs(DEFAULT_SETTINGS.focusMinutes),
  awaitingBreakStart: false,
  completedToday: 0,
  completedDate: todayKey(),
  notificationId: null,
  settings: DEFAULT_SETTINGS,
});

const clampMinutes = (m: number) => Math.min(POMODORO_MAX_MINUTES, Math.max(POMODORO_MIN_MINUTES, Math.round(m)));

const sanitize = (raw: unknown): PersistedState | null => {
  const s = raw as Partial<PersistedState> | null;
  if (!s || (s.phase !== 'focus' && s.phase !== 'break')) return null;
  const settings = { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) };
  settings.focusMinutes = clampMinutes(settings.focusMinutes);
  settings.breakMinutes = clampMinutes(settings.breakMinutes);
  if (settings.ringtone !== null && !RINGTONE_IDS.includes(settings.ringtone)) settings.ringtone = null;
  return {
    ...initialState(),
    ...s,
    settings,
    endAt: s.running && typeof s.endAt === 'number' ? s.endAt : null,
    running: !!s.running && typeof s.endAt === 'number',
  } as PersistedState;
};

const rollDay = (s: PersistedState): PersistedState =>
  s.completedDate === todayKey() ? s : { ...s, completedToday: 0, completedDate: todayKey() };

const phaseMinutes = (s: PersistedState, phase: PomodoroPhase) =>
  phase === 'focus' ? s.settings.focusMinutes : s.settings.breakMinutes;

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { pauseAll } = useAudio();
  const [state, setStateRaw] = useState<PersistedState>(initialState);
  const [now, setNow] = useState(() => Date.now());
  const [completionTick, setCompletionTick] = useState(0);
  const stateRef = useRef(state);
  const loadedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});

  const setState = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setStateRaw(next);
    if (loadedRef.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const completePhase = useCallback(
    (announce: boolean) => {
      const s = stateRef.current;
      const finishedFocus = s.phase === 'focus';
      if (announce) {
        pauseAll();
        if (s.settings.ringtone) playRingtone(s.settings.ringtone);
        if (s.settings.vibrate) {
          for (let i = 0; i < HAPTIC_TIMES; i++) {
            setTimeout(() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }, i * HAPTIC_GAP_MS);
          }
        }
      }
      setState((prev) => {
        const base = rollDay(prev);
        // XMSLEEP: focus → waits for the user to start the break; break → back to focus ready state.
        return finishedFocus
          ? {
              ...base,
              phase: 'break',
              running: false,
              endAt: null,
              notificationId: null,
              awaitingBreakStart: true,
              completedToday: base.completedToday + 1,
              remainingMs: minutesToMs(base.settings.breakMinutes),
            }
          : {
              ...base,
              phase: 'focus',
              running: false,
              endAt: null,
              notificationId: null,
              awaitingBreakStart: false,
              remainingMs: minutesToMs(base.settings.focusMinutes),
            };
      });
      setCompletionTick((t) => t + 1);
    },
    [pauseAll, setState],
  );

  const sync = useCallback(() => {
    const t = Date.now();
    setNow(t);
    const s = stateRef.current;
    if (s.running && s.endAt !== null && t >= s.endAt) {
      completePhase(t - s.endAt < STALE_COMPLETION_MS);
    } else if (s.completedDate !== todayKey()) {
      setState(rollDay);
    }
  }, [completePhase, setState]);
  syncRef.current = sync;

  useEffect(() => {
    configureNotificationHandler();
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        const parsed = saved ? sanitize(JSON.parse(saved)) : null;
        if (parsed) {
          stateRef.current = parsed;
          setStateRaw(parsed);
        }
      })
      .catch(() => {})
      .finally(() => {
        loadedRef.current = true;
        syncRef.current();
      });
  }, []);

  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, [state.running, sync]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') sync();
    });
    return () => sub.remove();
  }, [sync]);

  const start = useCallback(() => {
    stopRingtone();
    const s = stateRef.current;
    if (s.running) return;
    const remaining = s.remainingMs > 0 ? s.remainingMs : minutesToMs(phaseMinutes(s, s.phase));
    const endAt = Date.now() + remaining;
    setState((prev) => ({ ...prev, running: true, endAt, remainingMs: remaining, awaitingBreakStart: false }));
    setNow(Date.now());

    const isFocus = s.phase === 'focus';
    ensureNotificationPermission().then(async (granted) => {
      if (!granted) return;
      const id = await schedulePhaseEndNotification({
        date: endAt,
        title: i18n.t(isFocus ? 'pomodoro:focusCompleteTitle' : 'pomodoro:breakCompleteTitle'),
        body: i18n.t(isFocus ? 'pomodoro:focusCompleteDesc' : 'pomodoro:breakCompleteDesc'),
        ringtone: s.settings.ringtone,
        channelName: i18n.t('pomodoro:notifyChannel'),
      });
      // The phase may have been paused/reset while scheduling was in flight.
      if (stateRef.current.running && stateRef.current.endAt === endAt) {
        setState((prev) => ({ ...prev, notificationId: id }));
      } else {
        cancelNotification(id);
      }
    });
  }, [setState]);

  const pause = useCallback(() => {
    stopRingtone();
    const s = stateRef.current;
    if (!s.running || s.endAt === null) return;
    cancelNotification(s.notificationId);
    setState((prev) => ({
      ...prev,
      running: false,
      endAt: null,
      notificationId: null,
      remainingMs: Math.max(0, (prev.endAt ?? Date.now()) - Date.now()),
    }));
  }, [setState]);

  const toFocusReady = useCallback(() => {
    stopRingtone();
    cancelNotification(stateRef.current.notificationId);
    setState((prev) => ({
      ...prev,
      phase: 'focus',
      running: false,
      endAt: null,
      notificationId: null,
      awaitingBreakStart: false,
      remainingMs: minutesToMs(prev.settings.focusMinutes),
    }));
  }, [setState]);

  const setPhaseMinutes = useCallback(
    (minutes: number) => {
      const m = clampMinutes(minutes);
      setState((prev) => {
        if (prev.running) return prev;
        const settings =
          prev.phase === 'focus' ? { ...prev.settings, focusMinutes: m } : { ...prev.settings, breakMinutes: m };
        return { ...prev, settings, remainingMs: minutesToMs(m) };
      });
    },
    [setState],
  );

  const updateSettings = useCallback(
    (patch: Partial<PomodoroSettings>) => {
      setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    },
    [setState],
  );

  const remainingMs =
    state.running && state.endAt !== null ? Math.max(0, state.endAt - now) : state.remainingMs;
  const totalMs = minutesToMs(phaseMinutes(state, state.phase));
  const completedToday = state.completedDate === todayKey() ? state.completedToday : 0;

  return (
    <PomodoroContext.Provider
      value={{
        phase: state.phase,
        running: state.running,
        remainingMs,
        totalMs,
        awaitingBreakStart: state.awaitingBreakStart,
        completedToday,
        completionTick,
        settings: state.settings,
        start,
        pause,
        reset: toFocusReady,
        skipBreak: toFocusReady,
        setPhaseMinutes,
        updateSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider');
  return ctx;
}
