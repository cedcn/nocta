export type WeatherSourceId = 'open-meteo' | 'qweather';

export interface WeatherData {
  temperature: number;
  /** WMO weather code; QWeather icons are mapped onto it. */
  weatherCode: number;
  windSpeed: number;
  cityName: string;
  humidity: number;
  feelsLike: number;
  precipitation: number;
  isDay: boolean;
  cloudCover: number;
  source: WeatherSourceId;
}

export type WeatherType =
  | 'SUNNY_CLEAR'
  | 'SUNNY_NIGHT'
  | 'CLOUDY_PARTLY'
  | 'CLOUDY_OVERCAST'
  | 'FOGGY'
  | 'FOGGY_DRIZZLE'
  | 'RAIN_LIGHT'
  | 'RAIN_MODERATE'
  | 'RAIN_HEAVY'
  | 'RAIN_SHOWER'
  | 'SNOW_LIGHT'
  | 'SNOW_MODERATE'
  | 'SNOW_HEAVY'
  | 'SNOW_SLEET'
  | 'THUNDERSTORM'
  | 'THUNDERSTORM_HAIL'
  | 'UNKNOWN';
