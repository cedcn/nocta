import { getSoundById } from '../../data/sounds';
import { toWeatherType } from './codes';
import type { WeatherType } from './types';

// Ported from XMSLEEP WeatherSoundMapper.getDefaultMappings.
const DEFAULT_MAPPINGS: { weatherTypes: WeatherType[]; soundIds: string[] }[] = [
  { weatherTypes: ['SUNNY_CLEAR'], soundIds: ['kitchen', 'wind-chimes', 'light-piano'] },
  { weatherTypes: ['SUNNY_NIGHT'], soundIds: ['field', 'wind'] },
  { weatherTypes: ['CLOUDY_PARTLY'], soundIds: ['light-piano', 'birds'] },
  { weatherTypes: ['CLOUDY_OVERCAST'], soundIds: ['lake', 'wind'] },
  { weatherTypes: ['FOGGY'], soundIds: ['wind-chimes', 'kitchen'] },
  { weatherTypes: ['FOGGY_DRIZZLE'], soundIds: ['lake', 'wind'] },
  { weatherTypes: ['SNOW_SLEET'], soundIds: ['wind', 'walk-in-snow', 'drizzle'] },
  { weatherTypes: ['RAIN_LIGHT'], soundIds: ['rain', 'light-rain', 'drizzle'] },
  { weatherTypes: ['RAIN_MODERATE'], soundIds: ['rain', 'light-rain'] },
  { weatherTypes: ['RAIN_HEAVY', 'RAIN_SHOWER'], soundIds: ['heavy-rain', 'rain', 'drizzle'] },
  { weatherTypes: ['THUNDERSTORM', 'THUNDERSTORM_HAIL'], soundIds: ['thunderstorm', 'rain', 'heavy-rain'] },
  { weatherTypes: ['SNOW_LIGHT'], soundIds: ['walk-in-snow', 'wind'] },
  { weatherTypes: ['SNOW_MODERATE', 'SNOW_HEAVY'], soundIds: ['walk-in-snow', 'wind', 'field'] },
];

// XMSLEEP's "rain" is a bundled local sound; Nocta only ships the remote manifest.
const ID_ALIASES: Record<string, string> = {
  rain: 'rain-on-leaves',
};

export function getRecommendedSoundIds(weatherCode: number, isDay: boolean): string[] {
  const type = toWeatherType(weatherCode, isDay);
  const mapping = DEFAULT_MAPPINGS.find((m) => m.weatherTypes.includes(type));
  if (!mapping) return [];
  const ids = mapping.soundIds.map((id) => ID_ALIASES[id] ?? id).filter((id) => getSoundById(id));
  return [...new Set(ids)];
}
