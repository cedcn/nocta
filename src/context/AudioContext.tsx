import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayingSound, Preset } from '../types';
import { getSoundById } from '../data/sounds';

export const MAX_PRESETS = 10;
export const MIN_PRESETS = 3;
export const MAX_PRESET_SOUNDS = 10;
export const TIMER_OPTIONS = [15, 30, 45, 60, 120];
const DEFAULT_VOLUME = 0.5;
const FADE_OUT_MS = 5000;
const FADE_STEPS = 20;
const VOLUME_PERSIST_DELAY_MS = 300;

const STORAGE_KEYS = {
  VOLUMES: '@nocta_volumes',
  PRESETS: '@nocta_presets',
  CURRENT_PRESET: '@nocta_current_preset',
  AUTO_COUNTDOWN: '@nocta_auto_countdown',
  LEGACY_FAVORITES: '@nocta_favorites',
};

export interface MixItem {
  soundId: string;
  volume: number;
}

interface AudioContextType {
  playingSounds: PlayingSound[];
  presets: Preset[];
  currentPresetId: string;
  activePresetId: string | null;
  timer: number | null;
  timerRemaining: number | null;
  autoCountdown: number | null;
  toggleSound: (soundId: string) => Promise<void>;
  setVolume: (soundId: string, volume: number) => void;
  getVolume: (soundId: string) => number;
  stopAll: () => void;
  playMix: (items: MixItem[]) => Promise<void>;
  pauseAll: () => void;
  resumeAll: () => Promise<void>;
  fadeOutAndStopAll: (durationMs?: number) => Promise<void>;
  setTimer: (minutes: number | null) => void;
  setAutoCountdown: (minutes: number | null) => void;
  setCurrentPreset: (id: string) => void;
  addPreset: () => boolean;
  renamePreset: (id: string, name: string) => void;
  deletePreset: (id: string) => boolean;
  saveToPreset: (id: string, soundIds: string[]) => void;
  loadPreset: (id: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const newPresetId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Legacy presets were named "Preset N"; an empty name now means "use the localized default".
const migratePresets = (raw: unknown): Preset[] => {
  const list = Array.isArray(raw) ? (raw as Preset[]) : [];
  const presets = list
    .filter((p) => p && typeof p.id === 'string' && Array.isArray(p.sounds))
    .slice(0, MAX_PRESETS)
    .map((p) => ({
      id: p.id,
      name: /^Preset \d+$/.test(p.name ?? '') ? '' : p.name ?? '',
      sounds: p.sounds.slice(0, MAX_PRESET_SOUNDS),
    }));
  while (presets.length < MIN_PRESETS) presets.push({ id: newPresetId(), name: '', sounds: [] });
  return presets;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingSounds, setPlayingSoundsState] = useState<PlayingSound[]>([]);
  const [presets, setPresetsState] = useState<Preset[]>(() => migratePresets([]));
  const [currentPresetId, setCurrentPresetId] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [timer, setTimerState] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [autoCountdown, setAutoCountdownState] = useState<number | null>(null);

  // Refs mirror state so async callbacks (timer, preset loading) never act on stale snapshots.
  const playingRef = useRef<PlayingSound[]>([]);
  const volumesRef = useRef<Record<string, number>>({});
  const presetsRef = useRef<Preset[]>(presets);
  const pausedMixRef = useRef<MixItem[]>([]);
  const timerEndRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadingRef = useRef(false);
  const volumePersistRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPlaying = useCallback((updater: (prev: PlayingSound[]) => PlayingSound[]) => {
    playingRef.current = updater(playingRef.current);
    setPlayingSoundsState(playingRef.current);
  }, []);

  const setPresets = useCallback((next: Preset[]) => {
    presetsRef.current = next;
    setPresetsState(next);
    AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});

    (async () => {
      try {
        const [volumesData, presetsData, currentData, autoData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VOLUMES),
          AsyncStorage.getItem(STORAGE_KEYS.PRESETS),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PRESET),
          AsyncStorage.getItem(STORAGE_KEYS.AUTO_COUNTDOWN),
        ]);
        if (volumesData) volumesRef.current = JSON.parse(volumesData);
        const loaded = migratePresets(presetsData ? JSON.parse(presetsData) : []);
        presetsRef.current = loaded;
        setPresetsState(loaded);
        setCurrentPresetId(loaded.some((p) => p.id === currentData) ? currentData! : loaded[0].id);
        if (autoData) setAutoCountdownState(JSON.parse(autoData));
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_FAVORITES).catch(() => {});
      } catch (e) {
        console.error('Failed to load audio data', e);
      }
    })();
  }, []);

  const clearTimer = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    timerEndRef.current = null;
    setTimerState(null);
    setTimerRemaining(null);
  }, []);

  const releaseAll = useCallback(() => {
    playingRef.current.forEach((s) => {
      s.sound.pause();
      s.sound.remove();
    });
    setPlaying(() => []);
  }, [setPlaying]);

  const stopAll = useCallback(() => {
    releaseAll();
    pausedMixRef.current = [];
    setActivePresetId(null);
    clearTimer();
  }, [clearTimer, releaseAll]);

  const getVolume = useCallback((soundId: string) => volumesRef.current[soundId] ?? DEFAULT_VOLUME, []);

  const startSound = useCallback(
    async (soundId: string, volume?: number) => {
      if (playingRef.current.some((s) => s.id === soundId)) return;
      const soundData = getSoundById(soundId);
      if (!soundData?.remoteUrl) return;
      const v = volume ?? getVolume(soundId);
      const sound = createAudioPlayer(soundData.remoteUrl);
      sound.loop = true;
      sound.volume = v;
      sound.play();
      setPlaying((prev) => [...prev, { id: soundId, sound, volume: v }]);
    },
    [getVolume, setPlaying],
  );

  const toggleSound = useCallback(
    async (soundId: string) => {
      const existing = playingRef.current.find((s) => s.id === soundId);
      if (existing) {
        existing.sound.pause();
        existing.sound.remove();
        setPlaying((prev) => prev.filter((s) => s.id !== soundId));
        if (playingRef.current.length === 0) setActivePresetId(null);
      } else {
        await startSound(soundId);
      }
    },
    [setPlaying, startSound],
  );

  const setVolume = useCallback(
    (soundId: string, volume: number) => {
      const playing = playingRef.current.find((s) => s.id === soundId);
      if (playing) {
        playing.sound.volume = volume;
        setPlaying((prev) => prev.map((s) => (s.id === soundId ? { ...s, volume } : s)));
      }
      volumesRef.current = { ...volumesRef.current, [soundId]: volume };
      if (volumePersistRef.current) clearTimeout(volumePersistRef.current);
      volumePersistRef.current = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEYS.VOLUMES, JSON.stringify(volumesRef.current)).catch(() => {});
      }, VOLUME_PERSIST_DELAY_MS);
    },
    [setPlaying],
  );

  const fadeOutAndStopAll = useCallback(
    async (durationMs: number = FADE_OUT_MS) => {
      if (fadingRef.current) return;
      fadingRef.current = true;
      try {
        const targets = playingRef.current.map((s) => ({ player: s.sound, from: s.volume }));
        for (let step = 1; step <= FADE_STEPS; step++) {
          await sleep(durationMs / FADE_STEPS);
          const k = 1 - step / FADE_STEPS;
          targets.forEach(({ player, from }) => {
            try {
              player.volume = from * k;
            } catch {
              // Player may have been removed by the user mid-fade.
            }
          });
        }
        stopAll();
      } finally {
        fadingRef.current = false;
      }
    },
    [stopAll],
  );

  const checkTimer = useCallback(() => {
    const endAt = timerEndRef.current;
    if (endAt === null) return;
    const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    setTimerRemaining(remaining);
    if (remaining <= 0) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      fadeOutAndStopAll();
    }
  }, [fadeOutAndStopAll]);

  const setTimer = useCallback(
    (minutes: number | null) => {
      clearTimer();
      if (!minutes) return;
      timerEndRef.current = Date.now() + minutes * 60 * 1000;
      setTimerState(minutes);
      setTimerRemaining(minutes * 60);
      tickRef.current = setInterval(checkTimer, 1000);
    },
    [checkTimer, clearTimer],
  );

  // JS intervals can be throttled in the background; re-sync from the absolute end time on resume.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkTimer();
    });
    return () => sub.remove();
  }, [checkTimer]);

  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (volumePersistRef.current) clearTimeout(volumePersistRef.current);
    },
    [],
  );

  const playMix = useCallback(
    async (items: MixItem[]) => {
      stopAll();
      for (const item of items.slice(0, MAX_PRESET_SOUNDS)) {
        setVolume(item.soundId, item.volume);
        await startSound(item.soundId, item.volume);
      }
    },
    [setVolume, startSound, stopAll],
  );

  // Used when another audio experience (breathing, meditation, pomodoro alarm) takes over.
  // The sleep timer keeps running, matching XMSLEEP's behaviour for temporary pauses.
  const pauseAll = useCallback(() => {
    if (playingRef.current.length === 0) return;
    pausedMixRef.current = playingRef.current.map((s) => ({ soundId: s.id, volume: s.volume }));
    releaseAll();
  }, [releaseAll]);

  const resumeAll = useCallback(async () => {
    const snapshot = pausedMixRef.current;
    pausedMixRef.current = [];
    for (const item of snapshot) await startSound(item.soundId, item.volume);
  }, [startSound]);

  const setAutoCountdown = useCallback((minutes: number | null) => {
    setAutoCountdownState(minutes);
    AsyncStorage.setItem(STORAGE_KEYS.AUTO_COUNTDOWN, JSON.stringify(minutes)).catch(() => {});
  }, []);

  const setCurrentPreset = useCallback((id: string) => {
    setCurrentPresetId(id);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PRESET, id).catch(() => {});
  }, []);

  const addPreset = useCallback(() => {
    if (presetsRef.current.length >= MAX_PRESETS) return false;
    const preset: Preset = { id: newPresetId(), name: '', sounds: [] };
    setPresets([...presetsRef.current, preset]);
    setCurrentPreset(preset.id);
    return true;
  }, [setCurrentPreset, setPresets]);

  const renamePreset = useCallback(
    (id: string, name: string) => {
      setPresets(presetsRef.current.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
    },
    [setPresets],
  );

  const deletePreset = useCallback(
    (id: string) => {
      if (presetsRef.current.length <= MIN_PRESETS) return false;
      const next = presetsRef.current.filter((p) => p.id !== id);
      setPresets(next);
      if (activePresetId === id) stopAll();
      if (currentPresetId === id) setCurrentPreset(next[0].id);
      return true;
    },
    [activePresetId, currentPresetId, setCurrentPreset, setPresets, stopAll],
  );

  const saveToPreset = useCallback(
    (id: string, soundIds: string[]) => {
      setPresets(
        presetsRef.current.map((p) =>
          p.id === id
            ? {
                ...p,
                sounds: soundIds
                  .slice(0, MAX_PRESET_SOUNDS)
                  .map((soundId) => ({ soundId, volume: getVolume(soundId) })),
              }
            : p,
        ),
      );
    },
    [getVolume, setPresets],
  );

  const loadPreset = useCallback(
    async (id: string) => {
      const preset = presetsRef.current.find((p) => p.id === id);
      if (!preset || preset.sounds.length === 0) return;
      await playMix(preset.sounds);
      setActivePresetId(id);
      if (autoCountdown) setTimer(autoCountdown);
    },
    [autoCountdown, playMix, setTimer],
  );

  return (
    <AudioContext.Provider
      value={{
        playingSounds,
        presets,
        currentPresetId,
        activePresetId,
        timer,
        timerRemaining,
        autoCountdown,
        toggleSound,
        setVolume,
        getVolume,
        stopAll,
        playMix,
        pauseAll,
        resumeAll,
        fadeOutAndStopAll,
        setTimer,
        setAutoCountdown,
        setCurrentPreset,
        addPreset,
        renamePreset,
        deletePreset,
        saveToPreset,
        loadPreset,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
