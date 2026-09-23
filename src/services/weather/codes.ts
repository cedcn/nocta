import type { WeatherType } from './types';

// Ported from XMSLEEP WeatherCodeMapper; returns a key in the `weather` i18n namespace.
export function weatherDescriptionKey(code: number): string {
  switch (code) {
    case 0:
      return 'clear';
    case 1:
      return 'partly_cloudy';
    case 2:
      return 'cloudy';
    case 3:
      return 'overcast';
    case 45:
    case 48:
      return 'fog';
    case 51:
    case 53:
    case 55:
      return 'drizzle';
    case 56:
    case 57:
      return 'freezing_fog';
    case 61:
    case 63:
    case 65:
      return 'rain';
    case 66:
    case 67:
      return 'freezing_rain';
    case 71:
    case 73:
    case 75:
      return 'snow';
    case 77:
      return 'snow_grains';
    case 80:
    case 81:
    case 82:
      return 'shower';
    case 85:
    case 86:
      return 'snow_shower';
    case 95:
      return 'thunderstorm';
    case 96:
    case 99:
      return 'thunderstorm_hail';
    default:
      return 'unknown';
  }
}

export function toWeatherType(code: number, isDay: boolean): WeatherType {
  switch (code) {
    case 0:
      return isDay ? 'SUNNY_CLEAR' : 'SUNNY_NIGHT';
    case 1:
    case 2:
      return 'CLOUDY_PARTLY';
    case 3:
      return 'CLOUDY_OVERCAST';
    case 45:
    case 48:
      return 'FOGGY';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return 'FOGGY_DRIZZLE';
    case 61:
      return 'RAIN_LIGHT';
    case 63:
      return 'RAIN_MODERATE';
    case 65:
    case 66:
    case 67:
      return 'RAIN_HEAVY';
    case 80:
    case 81:
    case 82:
      return 'RAIN_SHOWER';
    case 71:
    case 77:
      return 'SNOW_LIGHT';
    case 73:
      return 'SNOW_MODERATE';
    case 75:
      return 'SNOW_HEAVY';
    case 85:
    case 86:
      return 'SNOW_SLEET';
    case 95:
      return 'THUNDERSTORM';
    case 96:
    case 99:
      return 'THUNDERSTORM_HAIL';
    default:
      return 'UNKNOWN';
  }
}

// Ported from XMSLEEP QWeatherMapper (https://dev.qweather.com/docs/resource/weather-condition/).
export function qweatherIconToWmo(icon: string): number {
  const c = parseInt(icon, 10);
  if (Number.isNaN(c)) return 0;
  if ([100, 150].includes(c)) return 0;
  if ([102, 103, 152, 153].includes(c)) return 1;
  if ([101, 151].includes(c)) return 2;
  if (c === 104) return 3;
  if ([302, 303, 372, 373].includes(c)) return 95;
  if (c === 304) return 96;
  if (c === 309) return 51;
  if ([305, 399].includes(c)) return 61;
  if ([306, 314].includes(c)) return 63;
  if ([307, 308, 310, 311, 312, 315, 316, 317, 318].includes(c)) return 65;
  if (c === 313) return 66;
  if ([400, 499].includes(c)) return 71;
  if ([401, 408].includes(c)) return 73;
  if ([402, 403, 407, 409, 410].includes(c)) return 75;
  if ([404, 405, 406, 456, 457, 903, 905].includes(c)) return 85;
  if (c === 904) return 86;
  if ([500, 501, 502, 503, 504, 507, 508, 509, 510, 511, 512, 513].includes(c)) return 45;
  if ([900, 902, 906, 907].includes(c)) return 80;
  if (c === 901) return 82;
  return 0;
}

// QWeather night icons use the 15x range (e.g. 150 = clear night).
export function qweatherIsDay(icon: string): boolean {
  const c = parseInt(icon, 10);
  if (Number.isNaN(c)) return true;
  return c < 150 || c > 199;
}
