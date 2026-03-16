export type SoundType = 'nature' | 'white' | 'ambient' | 'meditation';

export interface Sound {
  id: string;
  name: string;
  emoji: string;
  type: SoundType;
  file: any;
}

export interface Scene {
  id: string;
  name: string;
  sounds: { soundId: string; volume: number }[];
}

export interface PlayingSound {
  id: string;
  sound: any;
  volume: number;
}
