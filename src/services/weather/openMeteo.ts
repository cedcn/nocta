import { getJson } from './http';
import type { WeatherData } from './types';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day?: number;
    cloud_cover?: number;
  };
}

interface NominatimResponse {
  address?: { city?: string; county?: string; town?: string; village?: string };
}

async function getCityName(lat: number, lon: number, apiLang: string): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    // Nominatim's usage policy requires an identifying User-Agent.
    const json = await getJson<NominatimResponse>(url, {
      'User-Agent': 'Nocta/1.0',
      'Accept-Language': apiLang.split('-')[0] || 'en',
    });
    const a = json.address ?? {};
    // City level only, so the card never shows a street or village-level name.
    return a.city || a.county || a.town || a.village || '';
  } catch {
    return '';
  }
}

export async function fetchOpenMeteo(lat: number, lon: number, apiLang: string): Promise<WeatherData> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day,cloud_cover' +
    '&timezone=auto';
  const [json, cityName] = await Promise.all([getJson<OpenMeteoResponse>(url), getCityName(lat, lon, apiLang)]);
  const c = json.current;
  return {
    temperature: c.temperature_2m,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
    cityName,
    humidity: c.relative_humidity_2m ?? 0,
    feelsLike: c.apparent_temperature ?? c.temperature_2m,
    precipitation: c.precipitation ?? 0,
    isDay: (c.is_day ?? 1) === 1,
    cloudCover: c.cloud_cover ?? 0,
    source: 'open-meteo',
  };
}
