import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../i18n/LanguageProvider';
import {
  fetchWeather,
  hasLocationPermission,
  LocationPermissionError,
  requestLocationPermission,
  WeatherData,
} from '../services/weather';
import { clearWeatherCache, isCacheFresh, readWeatherCache, writeWeatherCache } from '../services/weather/cache';
import {
  clearQWeatherConfig,
  loadQWeatherConfig,
  QWeatherConfig,
  saveQWeatherConfig,
  validateQWeather,
} from '../services/weather/qweather';

const ENABLED_KEY = '@nocta_weather_enabled';

export type WeatherStatus = 'idle' | 'loading' | 'ready' | 'error' | 'denied';

interface WeatherContextType {
  enabled: boolean;
  weather: WeatherData | null;
  status: WeatherStatus;
  qweather: QWeatherConfig | null;
  /** Resolves false when location permission was refused, leaving the feature disabled. */
  setEnabled: (enabled: boolean) => Promise<boolean>;
  refresh: (force?: boolean) => Promise<void>;
  /** Validates the pair before saving; throws with the failure reason. */
  saveQWeather: (config: QWeatherConfig) => Promise<void>;
  clearQWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [enabled, setEnabledState] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [qweather, setQWeather] = useState<QWeatherConfig | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const fetchedAtRef = useRef<number>(0);
  const fetchedLangRef = useRef<string>('');
  const inFlightRef = useRef(false);

  useEffect(() => {
    (async () => {
      const [saved, config, cached] = await Promise.all([
        AsyncStorage.getItem(ENABLED_KEY).catch(() => null),
        loadQWeatherConfig(),
        readWeatherCache(),
      ]);
      setQWeather(config);
      if (cached) {
        setWeather(cached.data);
        setStatus('ready');
        fetchedAtRef.current = cached.timestamp;
        fetchedLangRef.current = cached.language;
      }
      if (saved === 'true') setEnabledState(await hasLocationPermission());
      setConfigLoaded(true);
    })();
  }, []);

  const load = useCallback(
    async (force: boolean) => {
      if (inFlightRef.current) return;
      const stale = !isCacheFresh(fetchedAtRef.current) || fetchedLangRef.current !== language;
      if (!force && !stale) return;
      inFlightRef.current = true;
      // Keep showing the cached card while refreshing in the background.
      setStatus((s) => (s === 'ready' ? s : 'loading'));
      try {
        const data = await fetchWeather(language, qweather);
        setWeather(data);
        setStatus('ready');
        fetchedAtRef.current = Date.now();
        fetchedLangRef.current = language;
        writeWeatherCache(data, language);
      } catch (e) {
        if (e instanceof LocationPermissionError) {
          setStatus('denied');
        } else {
          setStatus((s) => (s === 'ready' ? s : 'error'));
        }
      } finally {
        inFlightRef.current = false;
      }
    },
    [language, qweather],
  );

  useEffect(() => {
    if (enabled && configLoaded) load(false);
  }, [enabled, configLoaded, load]);

  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load(false);
    });
    return () => sub.remove();
  }, [enabled, load]);

  const setEnabled = useCallback(async (next: boolean) => {
    if (next && !(await requestLocationPermission())) {
      setEnabledState(false);
      setStatus('denied');
      AsyncStorage.setItem(ENABLED_KEY, 'false').catch(() => {});
      return false;
    }
    setEnabledState(next);
    if (next) setStatus((s) => (s === 'denied' ? 'idle' : s));
    AsyncStorage.setItem(ENABLED_KEY, String(next)).catch(() => {});
    return true;
  }, []);

  // A source change invalidates the cache so the next fetch uses the new provider.
  const resetCache = useCallback(async () => {
    fetchedAtRef.current = 0;
    await clearWeatherCache();
  }, []);

  const saveQWeather = useCallback(
    async (config: QWeatherConfig) => {
      await validateQWeather(config);
      await saveQWeatherConfig(config);
      setQWeather(await loadQWeatherConfig());
      await resetCache();
    },
    [resetCache],
  );

  const clearQWeather = useCallback(async () => {
    await clearQWeatherConfig();
    setQWeather(null);
    await resetCache();
  }, [resetCache]);

  const refresh = useCallback((force = true) => load(force), [load]);

  return (
    <WeatherContext.Provider
      value={{ enabled, weather, status, qweather, setEnabled, refresh, saveQWeather, clearQWeather }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
