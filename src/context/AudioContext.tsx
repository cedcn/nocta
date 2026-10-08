import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AudioPlayer, AudioStatus, createAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { PlayingSound, Preset } from '../types';
import { getSoundById } from '../data/sounds';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { APP_ARTIST, applyDefaultAudioMode, claimLockScreen, releaseLockScreen, updateLockScreen } from '../services/nowPlaying';
import { resolveSoundUri } from '../services/soundCache';

export const MAX_PRESETS = 10;
export const MIN_PRESETS = 3;
export const MAX_PRESET_SOUNDS = 10;
export const TIMER_OPTIONS = [15, 30, 60, 120];
export const TIMER_EXTEND_MINUTES = 5;
export const FADE_OPTIONS = [5, 30, 60, 180, 300];
const DEFAULT_FADE_SECONDS = 30;
const DEFAULT_VOLUME = 0.5;
const FADE_STEPS = 30;
// Short tail after the timer hits zero so listeners (e.g. meditation) can observe `timerRemaining === 0`.
const TIMER_END_FADE_MS = 1000;
const PERSIST_DELAY_MS = 300;
const MAX_RECENTS = 12;

const STORAGE_KEYS = {
  VOLUMES: '@nocta_volumes',
  PRESETS: '@nocta_presets',
  CURRENT_PRESET: '@nocta_current_preset',
  AUTO_COUNTDOWN: '@nocta_auto_countdown',
  MASTER_VOLUME: '@nocta_master_volume',
  FADE_SECONDS: '@nocta_fade_seconds',
  FAVORITES: '@nocta_favorite_sounds',
  RECENTS: '@nocta_recent_sounds',
  LAST_MIX: '@nocta_last_mix',
  LEGACY_FAVORITES: '@nocta_favorites',
};

const BUILTIN_PRESETS: Omit<Preset, 'id' | 'name'>[] = [
  {
    nameKey: 'presets.builtin.rainyNight',
    sounds: [
      { soundId: 'rain-on-windowsill', volume: 0.6 },
      { soundId: 'campfire', volume: 0.35 },
    ],
  },
  {
    nameKey: 'presets.builtin.seaside',
    sounds: [
      { soundId: 'waves', volume: 0.6 },
      { soundId: 'wind', volume: 0.25 },
      { soundId: 'seagulls', volume: 0.15 },
    ],
  },
  {
    nameKey: 'presets.builtin.focus',
    sounds: [
      { soundId: 'cafe', volume: 0.45 },
      { soundId: 'light-rain', volume: 0.3 },
      { soundId: 'brown-noise', volume: 0.2 },
    ],
  },
];

export type SoundLoadState = 'loading' | 'error';

export interface MixItem {
  soundId: string;
  volume: number;
}

interface AudioContextType {
  playingSounds: PlayingSound[];
  soundStates: Record<string, SoundLoadState>;
  isPaused: boolean;
  masterVolume: number;
  presets: Preset[];
  currentPresetId: string;
  activePresetId: string | null;
  timer: number | null;
  timerRemaining: number | null;
  autoCountdown: number | null;
  fadeSeconds: number;
  favorites: string[];
  recents: string[];
  lastMix: MixItem[];
  toggleSound: (soundId: string) => Promise<void>;
  setVolume: (soundId: string, volume: number) => void;
  getVolume: (soundId: string) => number;
  setMasterVolume: (volume: number) => void;
  togglePause: () => void;
  stopAll: () => void;
  playMix: (items: MixItem[]) => Promise<void>;
  pauseAll: () => void;
  resumeAll: () => Promise<void>;
  fadeOutAndStopAll: (durationMs?: number) => Promise<void>;
  setTimer: (minutes: number | null) => void;
  extendTimer: (minutes?: number) => void;
  setAutoCountdown: (minutes: number | null) => void;
  setFadeSeconds: (seconds: number) => void;
  toggleFavorite: (soundId: string) => void;
  setCurrentPreset: (id: string) => void;
  addPreset: () => boolean;
  renamePreset: (id: string, name: string) => void;
  deletePreset: (id: string) => boolean;
  saveToPreset: (id: string, soundIds: string[]) => void;
  saveMixAsNewPreset: () => string | null;
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
      nameKey: p.nameKey,
      sounds: p.sounds.slice(0, MAX_PRESET_SOUNDS),
    }));
  while (presets.length < MIN_PRESETS) presets.push({ id: newPresetId(), name: '', nameKey: undefined, sounds: [] });
  return presets;
};

const seedPresets = (): Preset[] => BUILTIN_PRESETS.map((p) => ({ ...p, id: newPresetId(), name: '' }));

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const disposePlayer = (player: AudioPlayer) => {
  releaseLockScreen(player);
  player.pause();
  player.remove();
};

const setPlayerVolume = (player: AudioPlayer, volume: number) => {
  try {
    player.volume = volume;
  } catch {
    // Player may have been removed concurrently.
  }
};

const parseJson = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const [playingSounds, setPlayingSoundsState] = useState<PlayingSound[]>([]);
  const [soundStates, setSoundStates] = useState<Record<string, SoundLoadState>>({});
  const [isPaused, setIsPausedState] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(1);
  const [presets, setPresetsState] = useState<Preset[]>(() => migratePresets([]));
  const [currentPresetId, setCurrentPresetId] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [timer, setTimerState] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [autoCountdown, setAutoCountdownState] = useState<number | null>(null);
  const [fadeSeconds, setFadeSecondsState] = useState(DEFAULT_FADE_SECONDS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [lastMix, setLastMix] = useState<MixItem[]>([]);

  // Refs mirror state so async callbacks (timer, preset loading, downloads) never act on stale snapshots.
  const playingRef = useRef<PlayingSound[]>([]);
  const volumesRef = useRef<Record<string, number>>({});
  const masterRef = useRef(1);
  const fadeMsRef = useRef(DEFAULT_FADE_SECONDS * 1000);
  const presetsRef = useRef<Preset[]>(presets);
  const pausedMixRef = useRef<MixItem[]>([]);
  const isPausedRef = useRef(false);
  // Sounds the user asked for that are still downloading; removing an id cancels its start.
  const pendingRef = useRef(new Set<string>());
  const timerEndRef = useRef<number | null>(null);
  const timerMinutesRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTokenRef = useRef(0);
  const timerFadingRef = useRef(false);
  const volumePersistRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPlaying = useCallback((updater: (prev: PlayingSound[]) => PlayingSound[]) => {
    playingRef.current = updater(playingRef.current);
    setPlayingSoundsState(playingRef.current);
  }, []);

  const setIsPaused = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setIsPausedState(paused);
  }, []);

  const setSoundState = useCallback((soundId: string, state: SoundLoadState | null) => {
    setSoundStates((prev) => {
      if ((prev[soundId] ?? null) === state) return prev;
      const next = { ...prev };
      if (state) next[soundId] = state;
      else delete next[soundId];
      return next;
    });
  }, []);

  const setPresets = useCallback((next: Preset[]) => {
    presetsRef.current = next;
    setPresetsState(next);
    AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    applyDefaultAudioMode();

    (async () => {
      try {
        const keys = [
          STORAGE_KEYS.VOLUMES,
          STORAGE_KEYS.PRESETS,
          STORAGE_KEYS.CURRENT_PRESET,
          STORAGE_KEYS.AUTO_COUNTDOWN,
          STORAGE_KEYS.MASTER_VOLUME,
          STORAGE_KEYS.FADE_SECONDS,
          STORAGE_KEYS.FAVORITES,
          STORAGE_KEYS.RECENTS,
          STORAGE_KEYS.LAST_MIX,
        ];
        const [volumes, presetsData, current, auto, master, fade, favs, recent, mix] = await Promise.all(
          keys.map((k) => AsyncStorage.getItem(k)),
        );
        volumesRef.current = parseJson(volumes, {});
        const loaded = presetsData ? migratePresets(parseJson(presetsData, [])) : seedPresets();
        if (!presetsData) AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(loaded)).catch(() => {});
        presetsRef.current = loaded;
        setPresetsState(loaded);
        setCurrentPresetId(loaded.some((p) => p.id === current) ? current! : loaded[0].id);
        setAutoCountdownState(parseJson(auto, null));
        masterRef.current = parseJson(master, 1);
        setMasterVolumeState(masterRef.current);
        const fadeSec = parseJson(fade, DEFAULT_FADE_SECONDS);
        fadeMsRef.current = fadeSec * 1000;
        setFadeSecondsState(fadeSec);
        setFavorites(parseJson(favs, []));
        setRecents(parseJson(recent, []));
        setLastMix(parseJson(mix, []));
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_FAVORITES).catch(() => {});
      } catch (e) {
        console.error('Failed to load audio data', e);
      }
    })();
  }, []);

  const restoreVolumes = useCallback(() => {
    playingRef.current.forEach((s) => setPlayerVolume(s.sound, s.volume * masterRef.current));
  }, []);

  const cancelFade = useCallback(() => {
    fadeTokenRef.current++;
    timerFadingRef.current = false;
    restoreVolumes();
  }, [restoreVolumes]);

  // Resolves false when cancelled; whoever cancels is responsible for restoring volumes.
  const fadeOut = useCallback(async (durationMs: number) => {
    const token = ++fadeTokenRef.current;
    const targets = playingRef.current.map((s) => ({ player: s.sound, from: s.sound.volume }));
    for (let step = 1; step <= FADE_STEPS; step++) {
      await sleep(durationMs / FADE_STEPS);
      if (fadeTokenRef.current !== token) return false;
      const k = 1 - step / FADE_STEPS;
      targets.forEach(({ player, from }) => setPlayerVolume(player, from * k));
    }
    return true;
  }, []);

  const clearTimer = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    timerEndRef.current = null;
    timerMinutesRef.current = null;
    cancelFade();
    setTimerState(null);
    setTimerRemaining(null);
  }, [cancelFade]);

  const releaseAll = useCallback(() => {
    pendingRef.current.clear();
    setSoundStates({});
    playingRef.current.forEach((s) => disposePlayer(s.sound));
    setPlaying(() => []);
    setIsPaused(false);
  }, [setIsPaused, setPlaying]);

  const stopAll = useCallback(() => {
    releaseAll();
    pausedMixRef.current = [];
    setActivePresetId(null);
    clearTimer();
  }, [clearTimer, releaseAll]);

  const getVolume = useCallback((soundId: string) => volumesRef.current[soundId] ?? DEFAULT_VOLUME, []);

  const addRecent = useCallback((soundId: string) => {
    setRecents((prev) => {
      const next = [soundId, ...prev.filter((id) => id !== soundId)].slice(0, MAX_RECENTS);
      AsyncStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const startSound = useCallback(
    async (soundId: string, volume?: number) => {
      if (playingRef.current.some((s) => s.id === soundId) || pendingRef.current.has(soundId)) return;
      const soundData = getSoundById(soundId);
      if (!soundData?.remoteUrl) return;

      pendingRef.current.add(soundId);
      setSoundState(soundId, 'loading');
      let uri: string;
      try {
        uri = await resolveSoundUri(soundData);
      } catch {
        if (pendingRef.current.delete(soundId)) setSoundState(soundId, 'error');
        return;
      }
      if (!pendingRef.current.delete(soundId)) return;
      setSoundState(soundId, null);

      const v = volume ?? getVolume(soundId);
      const sound = createAudioPlayer(uri);
      sound.loop = true;
      sound.volume = v * masterRef.current;
      sound.play();
      setPlaying((prev) => [...prev, { id: soundId, sound, volume: v }]);
      addRecent(soundId);
      // Adding a sound to a paused mix resumes the whole mix.
      if (isPausedRef.current) {
        playingRef.current.forEach((s) => s.sound.play());
        setIsPaused(false);
      }
    },
    [addRecent, getVolume, setIsPaused, setPlaying, setSoundState],
  );

  const toggleSound = useCallback(
    async (soundId: string) => {
      if (pendingRef.current.delete(soundId)) {
        setSoundState(soundId, null);
        return;
      }
      const existing = playingRef.current.find((s) => s.id === soundId);
      if (existing) {
        disposePlayer(existing.sound);
        setPlaying((prev) => prev.filter((s) => s.id !== soundId));
        if (playingRef.current.length === 0) {
          setActivePresetId(null);
          setIsPaused(false);
        }
      } else {
        await startSound(soundId);
      }
    },
    [setIsPaused, setPlaying, setSoundState, startSound],
  );

  const persistVolumes = useCallback(() => {
    if (volumePersistRef.current) clearTimeout(volumePersistRef.current);
    volumePersistRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEYS.VOLUMES, JSON.stringify(volumesRef.current)).catch(() => {});
    }, PERSIST_DELAY_MS);
  }, []);

  const setVolume = useCallback(
    (soundId: string, volume: number) => {
      const playing = playingRef.current.find((s) => s.id === soundId);
      if (playing) {
        setPlayerVolume(playing.sound, volume * masterRef.current);
        setPlaying((prev) => prev.map((s) => (s.id === soundId ? { ...s, volume } : s)));
      }
      volumesRef.current = { ...volumesRef.current, [soundId]: volume };
      persistVolumes();
    },
    [persistVolumes, setPlaying],
  );

  const setMasterVolume = useCallback(
    (volume: number) => {
      masterRef.current = volume;
      setMasterVolumeState(volume);
      restoreVolumes();
      AsyncStorage.setItem(STORAGE_KEYS.MASTER_VOLUME, JSON.stringify(volume)).catch(() => {});
    },
    [restoreVolumes],
  );

  const togglePause = useCallback(() => {
    if (playingRef.current.length === 0) return;
    const next = !isPausedRef.current;
    playingRef.current.forEach((s) => (next ? s.sound.pause() : s.sound.play()));
    setIsPaused(next);
  }, [setIsPaused]);

  const fadeOutAndStopAll = useCallback(
    async (durationMs: number = fadeMsRef.current) => {
      if (await fadeOut(durationMs)) stopAll();
    },
    [fadeOut, stopAll],
  );

  const checkTimer = useCallback(() => {
    const endAt = timerEndRef.current;
    if (endAt === null) return;
    const remainingMs = Math.max(0, endAt - Date.now());
    const remaining = Math.round(remainingMs / 1000);
    setTimerRemaining(remaining);
    if (remaining <= 0) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      fadeOutAndStopAll(TIMER_END_FADE_MS);
    } else if (!timerFadingRef.current && remainingMs <= fadeMsRef.current) {
      // Start fading early so the sound reaches silence right as the timer ends.
      timerFadingRef.current = true;
      fadeOut(remainingMs);
    }
  }, [fadeOut, fadeOutAndStopAll]);

  const startTicking = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(checkTimer, 1000);
    checkTimer();
  }, [checkTimer]);

  const setTimer = useCallback(
    (minutes: number | null) => {
      clearTimer();
      if (!minutes) return;
      timerEndRef.current = Date.now() + minutes * 60 * 1000;
      timerMinutesRef.current = minutes;
      setTimerState(minutes);
      startTicking();
    },
    [clearTimer, startTicking],
  );

  const extendTimer = useCallback(
    (minutes: number = TIMER_EXTEND_MINUTES) => {
      if (timerEndRef.current === null || timerMinutesRef.current === null) {
        setTimer(minutes);
        return;
      }
      cancelFade();
      timerEndRef.current += minutes * 60 * 1000;
      timerMinutesRef.current += minutes;
      setTimerState(timerMinutesRef.current);
      startTicking();
    },
    [cancelFade, setTimer, startTicking],
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

  useEffect(() => {
    if (playingSounds.length === 0) return;
    const handle = setTimeout(() => {
      const mix = playingSounds.map((s) => ({ soundId: s.id, volume: s.volume }));
      setLastMix(mix);
      AsyncStorage.setItem(STORAGE_KEYS.LAST_MIX, JSON.stringify(mix)).catch(() => {});
    }, PERSIST_DELAY_MS);
    return () => clearTimeout(handle);
  }, [playingSounds]);

  // The first sound in the mix represents the whole mix on the lock screen / Dynamic Island /
  // media notification. System controls only drive that player, so mirror its play/pause to the rest.
  const leadPlayer = playingSounds[0]?.sound;
  const mixTitle = playingSounds
    .map((s) => {
      const sound = getSoundById(s.id);
      return sound ? localizedName(sound) : s.id;
    })
    .join(' · ');
  const remainingMinutes = timerRemaining === null ? null : Math.ceil(timerRemaining / 60);
  const lockScreenArtist =
    remainingMinutes === null ? APP_ARTIST : `${APP_ARTIST} · ${t('timer.remaining', { count: remainingMinutes })}`;
  const metadataRef = useRef({ title: mixTitle, artist: lockScreenArtist });
  metadataRef.current = { title: mixTitle, artist: lockScreenArtist };

  useEffect(() => {
    if (!leadPlayer) return;
    claimLockScreen(leadPlayer, metadataRef.current);
    let wasPlaying = true;
    const sub = leadPlayer.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!status.isLoaded || status.isBuffering || status.playing === wasPlaying) return;
      wasPlaying = status.playing;
      setIsPaused(!status.playing);
      playingRef.current.forEach((s) => {
        if (s.sound === leadPlayer) return;
        if (status.playing) s.sound.play();
        else s.sound.pause();
      });
    });
    return () => sub.remove();
  }, [leadPlayer, setIsPaused]);

  useEffect(() => {
    if (leadPlayer) updateLockScreen(leadPlayer, { title: mixTitle, artist: lockScreenArtist });
  }, [leadPlayer, mixTitle, lockScreenArtist]);

  const playMix = useCallback(
    async (items: MixItem[]) => {
      stopAll();
      const limited = items.slice(0, MAX_PRESET_SOUNDS);
      limited.forEach((item) => setVolume(item.soundId, item.volume));
      await Promise.all(limited.map((item) => startSound(item.soundId, item.volume)));
    },
    [setVolume, startSound, stopAll],
  );

  // Used when another audio experience (breathing, meditation, pomodoro alarm) takes over.
  // The sleep timer keeps running, matching XMSLEEP's behaviour for temporary pauses.
  const pauseAll = useCallback(() => {
    if (playingRef.current.length === 0 && pendingRef.current.size === 0) return;
    pausedMixRef.current = playingRef.current.map((s) => ({ soundId: s.id, volume: s.volume }));
    releaseAll();
  }, [releaseAll]);

  const resumeAll = useCallback(async () => {
    const snapshot = pausedMixRef.current;
    pausedMixRef.current = [];
    await Promise.all(snapshot.map((item) => startSound(item.soundId, item.volume)));
  }, [startSound]);

  const setAutoCountdown = useCallback((minutes: number | null) => {
    setAutoCountdownState(minutes);
    AsyncStorage.setItem(STORAGE_KEYS.AUTO_COUNTDOWN, JSON.stringify(minutes)).catch(() => {});
  }, []);

  const setFadeSeconds = useCallback((seconds: number) => {
    fadeMsRef.current = seconds * 1000;
    setFadeSecondsState(seconds);
    AsyncStorage.setItem(STORAGE_KEYS.FADE_SECONDS, JSON.stringify(seconds)).catch(() => {});
  }, []);

  const toggleFavorite = useCallback((soundId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(soundId) ? prev.filter((id) => id !== soundId) : [soundId, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next)).catch(() => {});
      return next;
    });
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

  const currentMix = useCallback(
    (soundIds: string[]) =>
      soundIds.slice(0, MAX_PRESET_SOUNDS).map((soundId) => ({ soundId, volume: getVolume(soundId) })),
    [getVolume],
  );

  const saveToPreset = useCallback(
    (id: string, soundIds: string[]) => {
      setPresets(presetsRef.current.map((p) => (p.id === id ? { ...p, sounds: currentMix(soundIds) } : p)));
      if (soundIds.length > 0 && playingRef.current.length > 0) setActivePresetId(id);
    },
    [currentMix, setPresets],
  );

  const saveMixAsNewPreset = useCallback(() => {
    if (presetsRef.current.length >= MAX_PRESETS || playingRef.current.length === 0) return null;
    const preset: Preset = {
      id: newPresetId(),
      name: '',
      sounds: currentMix(playingRef.current.map((s) => s.id)),
    };
    setPresets([...presetsRef.current, preset]);
    setCurrentPreset(preset.id);
    setActivePresetId(preset.id);
    return preset.id;
  }, [currentMix, setCurrentPreset, setPresets]);

  const loadPreset = useCallback(
    async (id: string) => {
      const preset = presetsRef.current.find((p) => p.id === id);
      if (!preset || preset.sounds.length === 0) return;
      // playMix stops the previous mix synchronously, so mark the preset active right after it starts.
      const playback = playMix(preset.sounds);
      setActivePresetId(id);
      if (autoCountdown) setTimer(autoCountdown);
      await playback;
    },
    [autoCountdown, playMix, setTimer],
  );

  return (
    <AudioContext.Provider
      value={{
        playingSounds,
        soundStates,
        isPaused,
        masterVolume,
        presets,
        currentPresetId,
        activePresetId,
        timer,
        timerRemaining,
        autoCountdown,
        fadeSeconds,
        favorites,
        recents,
        lastMix,
        toggleSound,
        setVolume,
        getVolume,
        setMasterVolume,
        togglePause,
        stopAll,
        playMix,
        pauseAll,
        resumeAll,
        fadeOutAndStopAll,
        setTimer,
        extendTimer,
        setAutoCountdown,
        setFadeSeconds,
        toggleFavorite,
        setCurrentPreset,
        addPreset,
        renamePreset,
        deletePreset,
        saveToPreset,
        saveMixAsNewPreset,
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
