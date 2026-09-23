import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SoundsManifest } from '../types';
import bundledManifest from './sounds_remote.json';

const MANIFEST_URLS = [
  'https://cdn.jsdelivr.net/gh/Tosencen/XMSLEEP@main/sounds_remote.json',
  'https://raw.githubusercontent.com/Tosencen/XMSLEEP/main/sounds_remote.json',
];
const CACHE_KEY = '@nocta_manifest';
const FETCH_TIMEOUT_MS = 10000;

const BUNDLED = bundledManifest as SoundsManifest;

let manifest: SoundsManifest = BUNDLED;
const listeners = new Set<() => void>();

const compareVersions = (a: string, b: string) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const isValidManifest = (m: unknown): m is SoundsManifest => {
  const v = m as SoundsManifest;
  return !!v && typeof v.version === 'string' && Array.isArray(v.sounds) && Array.isArray(v.categories);
};

const setManifest = (next: SoundsManifest) => {
  if (compareVersions(next.version, manifest.version) <= 0) return;
  manifest = next;
  listeners.forEach((l) => l());
};

async function fetchRemoteManifest(): Promise<SoundsManifest | null> {
  for (const url of MANIFEST_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      if (isValidManifest(json)) return json;
    } catch {
      // Try the next mirror.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

export async function refreshManifest() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: unknown = JSON.parse(cached);
      if (isValidManifest(parsed)) setManifest(parsed);
    }
  } catch {
    // A corrupt cache is ignored; the bundled manifest stays in use.
  }

  const remote = await fetchRemoteManifest();
  if (remote && compareVersions(remote.version, BUNDLED.version) > 0) {
    setManifest(remote);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote)).catch(() => {});
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getManifest = () => manifest;

export const useSoundsManifest = () => useSyncExternalStore(subscribe, getManifest);

export const getSoundsByCategory = (categoryId: string) =>
  manifest.sounds
    .filter((s) => s.category === categoryId && s.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const getAllCategories = () => [...manifest.categories].sort((a, b) => a.order - b.order);

export const getSoundById = (id: string) => manifest.sounds.find((s) => s.id === id);
