import * as SecureStore from 'expo-secure-store';
import { getJson } from './http';
import { qweatherIconToWmo, qweatherIsDay } from './codes';
import { wgs84ToGcj02 } from './coordinates';
import type { WeatherData } from './types';

const HOST_KEY = 'qweather_host';
const API_KEY = 'qweather_key';
// Beijing (lon,lat), used only to check that a Host+Key pair works.
const VALIDATION_LOCATION = '116.41,39.92';

export interface QWeatherConfig {
  host: string;
  key: string;
}

export const normalizeHost = (host: string) =>
  host
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .trim();

export async function loadQWeatherConfig(): Promise<QWeatherConfig | null> {
  try {
    const [host, key] = await Promise.all([SecureStore.getItemAsync(HOST_KEY), SecureStore.getItemAsync(API_KEY)]);
    if (!host?.trim() || !key?.trim()) return null;
    return { host: normalizeHost(host), key: key.trim() };
  } catch {
    return null;
  }
}

export async function saveQWeatherConfig(config: QWeatherConfig) {
  await SecureStore.setItemAsync(HOST_KEY, normalizeHost(config.host));
  await SecureStore.setItemAsync(API_KEY, config.key.trim());
}

export async function clearQWeatherConfig() {
  await Promise.all([SecureStore.deleteItemAsync(HOST_KEY), SecureStore.deleteItemAsync(API_KEY)]);
}

export const maskHost = (host: string) =>
  host.length <= 8 ? host : `${host.slice(0, 4)}****${host.slice(host.length - 4)}`;

interface NowResponse {
  code: string;
  now?: {
    temp: string;
    icon?: string;
    humidity?: string;
    feelsLike?: string;
    windSpeed?: string;
    precip?: string;
    cloud?: string;
  };
}

interface CityResponse {
  code: string;
  location?: { name?: string; adm2?: string }[];
}

/** Throws with the HTTP status or QWeather `code` so the settings screen can show why it failed. */
export async function validateQWeather(config: QWeatherConfig): Promise<void> {
  const host = normalizeHost(config.host);
  const key = config.key.trim();
  if (!host || !key) throw new Error('empty');
  const json = await getJson<NowResponse>(
    `https://${host}/v7/weather/now?location=${VALIDATION_LOCATION}&key=${encodeURIComponent(key)}`,
  );
  if (json.code !== '200') throw new Error(`code=${json.code}`);
}

async function getCityName(host: string, key: string, loc: string, apiLang: string): Promise<string> {
  try {
    const json = await getJson<CityResponse>(
      `https://${host}/geo/v2/city/lookup?location=${loc}&key=${encodeURIComponent(key)}&lang=${apiLang}`,
    );
    if (json.code !== '200' || !json.location?.length) return '';
    // adm2 is the city level; `name` can be as fine-grained as a district.
    const first = json.location[0];
    return first.adm2 || first.name || '';
  } catch {
    return '';
  }
}

const num = (v: string | undefined, fallback: number) => {
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export async function fetchQWeather(
  lat: number,
  lon: number,
  config: QWeatherConfig,
  apiLang: string,
): Promise<WeatherData> {
  const gcj = wgs84ToGcj02(lat, lon);
  const loc = `${gcj.lon.toFixed(2)},${gcj.lat.toFixed(2)}`;
  const [json, cityName] = await Promise.all([
    getJson<NowResponse>(`https://${config.host}/v7/weather/now?location=${loc}&key=${encodeURIComponent(config.key)}`),
    getCityName(config.host, config.key, loc, apiLang),
  ]);
  if (json.code !== '200' || !json.now) throw new Error(`QWeather code ${json.code}`);
  const now = json.now;
  const temperature = num(now.temp, 0);
  const icon = now.icon ?? '100';
  return {
    temperature,
    weatherCode: qweatherIconToWmo(icon),
    windSpeed: num(now.windSpeed, 0),
    cityName,
    humidity: num(now.humidity, 0),
    feelsLike: num(now.feelsLike, temperature),
    precipitation: num(now.precip, 0),
    isDay: qweatherIsDay(icon),
    cloudCover: num(now.cloud, 0),
    source: 'qweather',
  };
}
