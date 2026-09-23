import meditationManifest from './meditation_remote.json';

export interface MeditationCategory {
  id: string;
  name: string;
  nameEn?: string;
  nameZhTW?: string;
  nameKo?: string;
  nameJa?: string;
  nameRu?: string;
  order: number;
}

export interface MeditationSession {
  id: string;
  name: string;
  nameEn?: string;
  nameZhTW?: string;
  nameKo?: string;
  nameJa?: string;
  nameRu?: string;
  category: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  sourceId: string;
  sourceTitle?: string;
}

interface MeditationManifest {
  version: string;
  categories: MeditationCategory[];
  sessions: MeditationSession[];
}

const MANIFEST = meditationManifest as MeditationManifest;

export const getMeditationCategories = () => [...MANIFEST.categories].sort((a, b) => a.order - b.order);

export const getMeditationCategory = (id: string) => MANIFEST.categories.find((c) => c.id === id);

export const getMeditationSessions = (categoryId: string) =>
  MANIFEST.sessions.filter((s) => s.category === categoryId);

export const getMeditationSession = (id: string) => MANIFEST.sessions.find((s) => s.id === id);

export const formatDuration = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};
