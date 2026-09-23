import { Language } from './languages';

export interface LocalizedNames {
  name: string;
  nameEn?: string;
  nameZhTW?: string;
  nameKo?: string;
  nameJa?: string;
  nameRu?: string;
}

// Mirrors XMSLEEP SoundMetadata.getLocalizedName: ko/ja/ru fall back to English before Chinese.
export function getLocalizedName(item: LocalizedNames, lang: Language): string {
  switch (lang) {
    case 'zh-CN':
      return item.name;
    case 'zh-TW':
      return item.nameZhTW || item.name;
    case 'en':
      return item.nameEn || item.name;
    case 'ko':
      return item.nameKo || item.nameEn || item.name;
    case 'ja':
      return item.nameJa || item.nameEn || item.name;
    case 'ru':
      return item.nameRu || item.nameEn || item.name;
  }
}
