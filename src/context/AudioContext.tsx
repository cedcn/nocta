import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayingSound, Preset, FavoriteSound } from '../types';
import { getSoundById } from '../data/sounds';

interface AudioContextType {
  playingSounds: PlayingSound[];
  presets: Preset[];
  currentPresetIndex: number;
  favorites: FavoriteSound[];
  timer: number | null;
  timerRemaining: number | null;
  toggleSound: (soundId: string) => Promise<void>;
  setVolume: (soundId: string, volume: number) => Promise<void>;
  stopAll: () => Promise<void>;
  setTimer: (minutes: number | null) => void;
  saveToPreset: (presetIndex: number, soundIds: string[]) => Promise<void>;
  loadPreset: (presetIndex: number) => Promise<void>;
  setCurrentPreset: (index: number) => void;
  toggleFavorite: (soundId: string) => Promise<void>;
  isFavorite: (soundId: string) => boolean;
  getVolume: (soundId: string) => number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VOLUMES: '@nocta_volumes',
  PRESETS: '@nocta_presets',
  FAVORITES: '@nocta_favorites',
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingSounds, setPlayingSounds] = useState<PlayingSound[]>([]);
  const [presets, setPresets] = useState<Preset[]>([
    { id: '1', name: 'Preset 1', sounds: [] },
    { id: '2', name: 'Preset 2', sounds: [] },
    { id: '3', name: 'Preset 3', sounds: [] },
  ]);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteSound[]>([]);
  const [timer, setTimerState] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPersistedData();
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  const loadPersistedData = async () => {
    try {
      const [volumesData, presetsData, favoritesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VOLUMES),
        AsyncStorage.getItem(STORAGE_KEYS.PRESETS),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
      ]);
      if (volumesData) setVolumes(JSON.parse(volumesData));
      if (presetsData) setPresets(JSON.parse(presetsData));
      if (favoritesData) setFavorites(JSON.parse(favoritesData));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const toggleSound = async (soundId: string) => {
    const existing = playingSounds.find(s => s.id === soundId);
    if (existing) {
      await existing.sound.pauseAsync();
      await existing.sound.unloadAsync();
      setPlayingSounds(prev => prev.filter(s => s.id !== soundId));
    } else {
      const soundData = getSoundById(soundId);
      if (!soundData?.remoteUrl) return;

      const savedVolume = volumes[soundId] ?? 0.5;
      const sound = await Audio.Sound.createAsync(
        { uri: soundData.remoteUrl },
        { shouldPlay: true, isLooping: true, volume: savedVolume }
      );
      setPlayingSounds(prev => [...prev, { id: soundId, sound: sound.sound, volume: savedVolume }]);
    }
  };

  const setVolume = async (soundId: string, volume: number) => {
    const playing = playingSounds.find(s => s.id === soundId);
    if (playing) {
      await playing.sound.setVolumeAsync(volume);
      setPlayingSounds(prev => prev.map(s => s.id === soundId ? { ...s, volume } : s));
    }
    const newVolumes = { ...volumes, [soundId]: volume };
    setVolumes(newVolumes);
    await AsyncStorage.setItem(STORAGE_KEYS.VOLUMES, JSON.stringify(newVolumes));
  };

  const stopAll = async () => {
    await Promise.all(playingSounds.map(s => s.sound.pauseAsync().then(() => s.sound.unloadAsync())));
    setPlayingSounds([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState(null);
    setTimerRemaining(null);
  };

  const setTimer = (minutes: number | null) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (minutes) {
      setTimerState(minutes);
      setTimerRemaining(minutes * 60);
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev === null || prev <= 1) {
            stopAll();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerState(null);
      setTimerRemaining(null);
    }
  };

  const saveToPreset = async (presetIndex: number, soundIds: string[]) => {
    const newPresets = [...presets];
    newPresets[presetIndex] = {
      ...newPresets[presetIndex],
      sounds: soundIds.slice(0, 10).map(id => ({ soundId: id, volume: volumes[id] ?? 0.5 }))
    };
    setPresets(newPresets);
    await AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(newPresets));
  };

  const loadPreset = async (presetIndex: number) => {
    await stopAll();
    const preset = presets[presetIndex];
    for (const s of preset.sounds) {
      await toggleSound(s.soundId);
      await setVolume(s.soundId, s.volume);
    }
  };

  const setCurrentPreset = (index: number) => {
    setCurrentPresetIndex(index);
  };

  const toggleFavorite = async (soundId: string) => {
    const exists = favorites.find(f => f.soundId === soundId);
    const newFavorites = exists
      ? favorites.filter(f => f.soundId !== soundId)
      : [...favorites, { soundId, addedAt: Date.now() }];
    setFavorites(newFavorites);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
  };

  const isFavorite = (soundId: string) => favorites.some(f => f.soundId === soundId);
  const getVolume = (soundId: string) => volumes[soundId] ?? 0.5;

  return (
    <AudioContext.Provider value={{
      playingSounds, presets, currentPresetIndex, favorites, timer, timerRemaining,
      toggleSound, setVolume, stopAll, setTimer, saveToPreset, loadPreset,
      setCurrentPreset, toggleFavorite, isFavorite, getVolume,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
