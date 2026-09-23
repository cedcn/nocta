import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './index';
import { Language, LanguagePreference, LANGUAGES, resolveLanguage } from './languages';
import { getLocalizedName, LocalizedNames } from './localizedName';

const STORAGE_KEY = '@nocta_language';

interface LanguageContextType {
  language: Language;
  preference: LanguagePreference;
  setPreference: (pref: LanguagePreference) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isPreference = (v: string | null): v is LanguagePreference =>
  v === 'system' || LANGUAGES.some((l) => l.code === v);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const [language, setLanguage] = useState<Language>(() => resolveLanguage('system'));

  const apply = useCallback((pref: LanguagePreference) => {
    const next = resolveLanguage(pref);
    setLanguage(next);
    if (i18n.language !== next) i18n.changeLanguage(next);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isPreference(saved)) {
          setPreferenceState(saved);
          apply(saved);
        }
      })
      .catch(() => {});
  }, [apply]);

  // The system locale can change while the app is backgrounded; re-resolve on return.
  useEffect(() => {
    if (preference !== 'system') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') apply('system');
    });
    return () => sub.remove();
  }, [preference, apply]);

  const setPreference = useCallback(
    (pref: LanguagePreference) => {
      setPreferenceState(pref);
      apply(pref);
      AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
    },
    [apply],
  );

  return (
    <LanguageContext.Provider value={{ language, preference, setPreference }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useLocalizedName() {
  const { language } = useLanguage();
  return useCallback((item: LocalizedNames) => getLocalizedName(item, language), [language]);
}
