import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SHOW_BREATHING_TAB: '@nocta_tab_breathing_visible',
};

interface SettingsContextType {
  showBreathingTab: boolean;
  setShowBreathingTab: (visible: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showBreathingTab, setShowBreathingTabState] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.SHOW_BREATHING_TAB)
      .then((v) => {
        if (v !== null) setShowBreathingTabState(v === 'true');
      })
      .catch(() => {});
  }, []);

  const setShowBreathingTab = useCallback((visible: boolean) => {
    setShowBreathingTabState(visible);
    AsyncStorage.setItem(STORAGE_KEYS.SHOW_BREATHING_TAB, String(visible)).catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={{ showBreathingTab, setShowBreathingTab }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
