import { SoundsManifest } from '../types';
import soundsManifest from './sounds_remote.json';

export const SOUNDS_MANIFEST: SoundsManifest = soundsManifest as SoundsManifest;

export const getSoundsByCategory = (categoryId: string) => {
  return SOUNDS_MANIFEST.sounds.filter(s => s.category === categoryId && s.isVisible !== false);
};

export const getAllCategories = () => {
  return SOUNDS_MANIFEST.categories.sort((a, b) => a.order - b.order);
};

export const getSoundById = (id: string) => {
  return SOUNDS_MANIFEST.sounds.find(s => s.id === id);
};
