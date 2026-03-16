import React, { createContext, useContext, useState } from 'react';
import { Audio } from 'expo-av';
import { PlayingSound, Scene } from '../types';

interface AudioContextType {
  playingSounds: PlayingSound[];
  scenes: Scene[];
  timer: number | null;
  toggleSound: (soundId: string) => Promise<void>;
  setVolume: (soundId: string, volume: number) => void;
  stopAll: () => void;
  setTimer: (minutes: number | null) => void;
  saveScene: (name: string) => void;
  loadScene: (scene: Scene) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playingSounds, setPlayingSounds] = useState<PlayingSound[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [timer, setTimerState] = useState<number | null>(null);

  const toggleSound = async (soundId: string) => {
    const existing = playingSounds.find(s => s.id === soundId);
    if (existing) {
      await existing.sound.stopAsync();
      await existing.sound.unloadAsync();
      setPlayingSounds(prev => prev.filter(s => s.id !== soundId));
    } else {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://example.com/sound.mp3' },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      setPlayingSounds(prev => [...prev, { id: soundId, sound, volume: 0.5 }]);
    }
  };

  const setVolume = (soundId: string, volume: number) => {
    const playing = playingSounds.find(s => s.id === soundId);
    if (playing) {
      playing.sound.setVolumeAsync(volume);
      setPlayingSounds(prev => prev.map(s => s.id === soundId ? { ...s, volume } : s));
    }
  };

  const stopAll = () => {
    playingSounds.forEach(s => {
      s.sound.stopAsync();
      s.sound.unloadAsync();
    });
    setPlayingSounds([]);
  };

  const setTimer = (minutes: number | null) => {
    setTimerState(minutes);
    if (minutes) {
      setTimeout(stopAll, minutes * 60 * 1000);
    }
  };

  const saveScene = (name: string) => {
    const scene: Scene = {
      id: Date.now().toString(),
      name,
      sounds: playingSounds.map(s => ({ soundId: s.id, volume: s.volume }))
    };
    setScenes(prev => [...prev, scene]);
  };

  const loadScene = async (scene: Scene) => {
    stopAll();
    for (const s of scene.sounds) {
      await toggleSound(s.soundId);
      setVolume(s.soundId, s.volume);
    }
  };

  return (
    <AudioContext.Provider value={{ playingSounds, scenes, timer, toggleSound, setVolume, stopAll, setTimer, saveScene, loadScene }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
