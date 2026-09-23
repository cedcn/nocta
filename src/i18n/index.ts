import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { FALLBACK_LANGUAGE, LANGUAGES, resolveSystemLanguage } from './languages';
import { common } from './locales/common';
import { breathing } from './locales/breathing';
import { meditation } from './locales/meditation';
import { pomodoro } from './locales/pomodoro';
import { clock } from './locales/clock';
import { weather } from './locales/weather';

const resources = Object.fromEntries(
  LANGUAGES.map(({ code }) => [
    code,
    {
      common: common[code],
      breathing: breathing[code],
      meditation: meditation[code],
      pomodoro: pomodoro[code],
      clock: clock[code],
      weather: weather[code],
    },
  ]),
);

i18n.use(initReactI18next).init({
  resources,
  lng: resolveSystemLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'breathing', 'meditation', 'pomodoro', 'clock', 'weather'],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
