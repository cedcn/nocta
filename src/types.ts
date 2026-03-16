export type AudioSource = 'LOCAL' | 'REMOTE' | 'IMPORTED';

export interface SoundMetadata {
  id: string;
  name: string;
  nameEn?: string;
  nameZhTW?: string;
  category: string;
  icon?: string;
  source?: AudioSource;
  remoteUrl?: string;
  loopStart?: number;
  loopEnd?: number;
  isSeamless?: boolean;
  format?: string;
  order?: number;
  isVisible?: boolean;
}

export interface SoundCategory {
  id: string;
  name: string;
  nameEn?: string;
  nameZhTW?: string;
  icon?: string;
  order: number;
}

export interface SoundsManifest {
  version: string;
  description?: string;
  categories: SoundCategory[];
  sounds: SoundMetadata[];
}

export interface PlayingSound {
  id: string;
  sound: any;
  volume: number;
}

export interface Preset {
  id: string;
  name: string;
  sounds: { soundId: string; volume: number }[];
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  from?: string;
  category: string;
}

export interface FavoriteSound {
  soundId: string;
  addedAt: number;
}
