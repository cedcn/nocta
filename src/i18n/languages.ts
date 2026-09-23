import { getLocales } from 'expo-localization';

export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'ko' | 'ja' | 'ru';
export type LanguagePreference = Language | 'system';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
];

export const FALLBACK_LANGUAGE: Language = 'en';

export function resolveSystemLanguage(): Language {
  const locale = getLocales()[0];
  if (!locale) return FALLBACK_LANGUAGE;
  const code = locale.languageCode?.toLowerCase();
  if (code === 'zh') {
    const tag = locale.languageTag.toLowerCase();
    const region = locale.regionCode?.toUpperCase();
    const traditional = tag.includes('hant') || region === 'TW' || region === 'HK' || region === 'MO';
    return traditional ? 'zh-TW' : 'zh-CN';
  }
  if (code === 'en' || code === 'ko' || code === 'ja' || code === 'ru') return code;
  return FALLBACK_LANGUAGE;
}

export function resolveLanguage(pref: LanguagePreference): Language {
  return pref === 'system' ? resolveSystemLanguage() : pref;
}
