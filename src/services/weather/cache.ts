import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherData } from './types';

const CACHE_KEY = '@nocta_weather_cache';
// Bump when the cached shape or city-name logic changes so stale entries are refetched.
const CACHE_SCHEMA = 1;
export const WEATHER_CACHE_DURATION_MS = 3 * 60 * 60 * 1000;

interface CacheEntry {
  schema: number;
  timestamp: number;
  language: string;
  data: WeatherData;
}

export interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  language: string;
}

export async function readWeatherCache(): Promise<CachedWeather | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry.schema !== CACHE_SCHEMA || !entry.data) return null;
    return { data: entry.data, timestamp: entry.timestamp, language: entry.language };
  } catch {
    return null;
  }
}

export async function writeWeatherCache(data: WeatherData, language: string) {
  const entry: CacheEntry = { schema: CACHE_SCHEMA, timestamp: Date.now(), language, data };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry)).catch(() => {});
}

export async function clearWeatherCache() {
  await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
}

export const isCacheFresh = (timestamp: number) => Date.now() - timestamp < WEATHER_CACHE_DURATION_MS;
