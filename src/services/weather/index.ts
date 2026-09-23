import * as Location from 'expo-location';
import type { Language } from '../../i18n/languages';
import { fetchOpenMeteo } from './openMeteo';
import { fetchQWeather, QWeatherConfig } from './qweather';
import type { WeatherData } from './types';

export * from './types';

const LOCATION_TIMEOUT_MS = 15000;

// Language codes accepted by QWeather/Nominatim, mirroring XMSLEEP WeatherService.resolveLang.
export function weatherApiLang(language: Language): string {
  switch (language) {
    case 'zh-CN':
      return 'zh';
    case 'zh-TW':
      return 'zh-hk';
    default:
      return language;
  }
}

export class LocationPermissionError extends Error {}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

async function getCoarsePosition(): Promise<{ lat: number; lon: number }> {
  if (!(await hasLocationPermission())) throw new LocationPermissionError('permission');
  try {
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('location timeout')), LOCATION_TIMEOUT_MS)),
    ]);
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  } catch (e) {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return { lat: last.coords.latitude, lon: last.coords.longitude };
    throw e;
  }
}

/** QWeather first when configured, falling back to Open-Meteo (same order as XMSLEEP). */
export async function fetchWeather(language: Language, qweather: QWeatherConfig | null): Promise<WeatherData> {
  const { lat, lon } = await getCoarsePosition();
  const apiLang = weatherApiLang(language);
  if (qweather) {
    try {
      return await fetchQWeather(lat, lon, qweather, apiLang);
    } catch {
      // Invalid key or network error: fall through to the free source.
    }
  }
  return fetchOpenMeteo(lat, lon, apiLang);
}
