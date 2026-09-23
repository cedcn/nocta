import type { AnimationObject } from 'lottie-react-native';

// Metro needs static requires, so every Meteocons animation is listed explicitly.
const ICONS = {
  clear_day: require('../../../assets/weather/wx_clear_day.json'),
  clear_night: require('../../../assets/weather/wx_clear_night.json'),
  partly_cloudy_day: require('../../../assets/weather/wx_partly_cloudy_day.json'),
  partly_cloudy_night: require('../../../assets/weather/wx_partly_cloudy_night.json'),
  overcast: require('../../../assets/weather/wx_overcast.json'),
  fog_day: require('../../../assets/weather/wx_fog_day.json'),
  fog_night: require('../../../assets/weather/wx_fog_night.json'),
  drizzle: require('../../../assets/weather/wx_drizzle.json'),
  sleet: require('../../../assets/weather/wx_sleet.json'),
  rain: require('../../../assets/weather/wx_rain.json'),
  partly_cloudy_day_rain: require('../../../assets/weather/wx_partly_cloudy_day_rain.json'),
  partly_cloudy_night_rain: require('../../../assets/weather/wx_partly_cloudy_night_rain.json'),
  snow: require('../../../assets/weather/wx_snow.json'),
  partly_cloudy_day_snow: require('../../../assets/weather/wx_partly_cloudy_day_snow.json'),
  partly_cloudy_night_snow: require('../../../assets/weather/wx_partly_cloudy_night_snow.json'),
  thunderstorms_day: require('../../../assets/weather/wx_thunderstorms_day.json'),
  thunderstorms_night: require('../../../assets/weather/wx_thunderstorms_night.json'),
  thunderstorms_extreme_day: require('../../../assets/weather/wx_thunderstorms_extreme_day.json'),
  thunderstorms_extreme_night: require('../../../assets/weather/wx_thunderstorms_extreme_night.json'),
} satisfies Record<string, AnimationObject>;

// Ported from XMSLEEP WeatherCodeMapper.toLottieResId (as of b336d4a, which restored the
// day/night split for thunderstorms that 7828942 had pinned to night).
export function weatherIcon(code: number, isDay: boolean): AnimationObject {
  switch (code) {
    case 0:
      return isDay ? ICONS.clear_day : ICONS.clear_night;
    case 1:
    case 2:
      return isDay ? ICONS.partly_cloudy_day : ICONS.partly_cloudy_night;
    case 3:
      return ICONS.overcast;
    case 45:
    case 48:
      return isDay ? ICONS.fog_day : ICONS.fog_night;
    case 51:
    case 53:
    case 55:
      return ICONS.drizzle;
    case 56:
    case 57:
    case 66:
    case 67:
      return ICONS.sleet;
    case 61:
    case 63:
    case 65:
      return ICONS.rain;
    case 80:
    case 81:
    case 82:
      return isDay ? ICONS.partly_cloudy_day_rain : ICONS.partly_cloudy_night_rain;
    case 71:
    case 73:
    case 75:
    case 77:
      return ICONS.snow;
    case 85:
    case 86:
      return isDay ? ICONS.partly_cloudy_day_snow : ICONS.partly_cloudy_night_snow;
    case 95:
      return isDay ? ICONS.thunderstorms_day : ICONS.thunderstorms_night;
    case 96:
    case 99:
      return isDay ? ICONS.thunderstorms_extreme_day : ICONS.thunderstorms_extreme_night;
    default:
      return isDay ? ICONS.clear_day : ICONS.clear_night;
  }
}
