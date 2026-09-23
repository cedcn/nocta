import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Switch, Modal, Alert } from 'react-native';
import { Check, ChevronRight, CircleStop, ExternalLink } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { TIMER_OPTIONS, useAudio } from '../context/AudioContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../i18n/LanguageProvider';
import { LANGUAGES, LanguagePreference } from '../i18n/languages';
import { useRootNavigation } from '../navigation';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import WeatherSettingsSection from '../components/weather/WeatherSettingsSection';
import { colors, fontSize, radii } from '../theme';

const GITHUB_URL = 'https://github.com/Tosencen/XMSLEEP';
const METEOCONS_URL = 'https://github.com/basmilius/meteocons';

interface Choice<T> {
  value: T;
  label: string;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useRootNavigation();
  const { stopAll, presets, autoCountdown, setAutoCountdown } = useAudio();
  const { showBreathingTab, setShowBreathingTab } = useSettings();
  const { preference, setPreference } = useLanguage();
  const [picker, setPicker] = useState<'language' | 'countdown' | null>(null);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert(t('settings.linkCopyFailed'), url));
  };

  const formatMinutes = (min: number) =>
    min >= 120 && min % 60 === 0 ? t('timer.hours', { count: min / 60 }) : t('timer.minutes', { count: min });

  const languageChoices: Choice<LanguagePreference>[] = [
    { value: 'system', label: t('settings.followSystem') },
    ...LANGUAGES.map((l) => ({ value: l.code, label: l.label })),
  ];
  const countdownChoices: Choice<number | null>[] = [
    { value: null, label: t('timer.off') },
    ...TIMER_OPTIONS.map((m) => ({ value: m, label: formatMinutes(m) })),
  ];

  const languageLabel = languageChoices.find((c) => c.value === preference)?.label ?? '';
  const countdownLabel = autoCountdown ? formatMinutes(autoCountdown) : t('timer.off');
  const savedPresets = presets.filter((p) => p.sounds.length > 0).length;
  const version = Constants.expoConfig?.version ?? '';

  const renderPicker = () => {
    if (!picker) return null;
    const isLanguage = picker === 'language';
    const choices: Choice<LanguagePreference | number | null>[] = isLanguage ? languageChoices : countdownChoices;
    const selected = isLanguage ? preference : autoCountdown;
    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setPicker(null)}>
          <GlassCard strong style={styles.dialog}>
            <Text style={styles.dialogTitle}>{isLanguage ? t('settings.language') : t('settings.autoCountdown')}</Text>
            {choices.map((c) => (
              <TouchableOpacity
                key={String(c.value)}
                style={styles.choice}
                onPress={() => {
                  if (isLanguage) setPreference(c.value as LanguagePreference);
                  else setAutoCountdown(c.value as number | null);
                  setPicker(null);
                }}
              >
                <Text style={styles.itemText}>{c.label}</Text>
                {selected === c.value && <Check size={20} color={colors.accent} />}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>
        <GlassCard style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={stopAll} activeOpacity={0.7}>
            <Text style={styles.itemText}>{t('settings.stopAllSounds')}</Text>
            <CircleStop size={22} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => setPicker('countdown')} activeOpacity={0.7}>
            <View style={styles.itemTexts}>
              <Text style={styles.itemText}>{t('settings.autoCountdown')}</Text>
              <Text style={styles.itemDesc}>{t('settings.autoCountdownDesc')}</Text>
            </View>
            <Text style={styles.itemValue}>{countdownLabel}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.item}>
            <Text style={styles.itemText}>{t('settings.savedPresets')}</Text>
            <Text style={styles.itemValue}>{savedPresets}</Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>{t('settings.features')}</Text>
        <GlassCard style={styles.group}>
          <View style={styles.item}>
            <View style={styles.itemTexts}>
              <Text style={styles.itemText}>{t('settings.showBreathingTab')}</Text>
              <Text style={styles.itemDesc}>{t('settings.showBreathingTabDesc')}</Text>
            </View>
            <Switch
              value={showBreathingTab}
              onValueChange={setShowBreathingTab}
              trackColor={{ true: colors.accent, false: colors.trackInactive }}
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>{t('settings.system')}</Text>
        <GlassCard style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('BigClock')} activeOpacity={0.7}>
            <View style={styles.itemTexts}>
              <Text style={styles.itemText}>{t('clock:title', { defaultValue: 'Big Clock' })}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <WeatherSettingsSection />
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => setPicker('language')} activeOpacity={0.7}>
            <Text style={styles.itemText}>{t('settings.language')}</Text>
            <Text style={styles.itemValue}>{languageLabel}</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <GlassCard style={styles.group}>
          <View style={styles.item}>
            <Text style={styles.itemText}>{t('settings.version')}</Text>
            <Text style={styles.itemValue}>{version}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => openUrl(GITHUB_URL)} activeOpacity={0.7}>
            <Text style={styles.itemText}>{t('settings.originalProject')}</Text>
            <ExternalLink size={20} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={() => openUrl(METEOCONS_URL)} activeOpacity={0.7}>
            <Text style={styles.itemDesc}>Weather icons: Meteocons by Bas Milius · MIT</Text>
            <ExternalLink size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>

      {renderPicker()}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  sectionTitle: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  group: { padding: 4 },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemTexts: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.trackInactive, marginHorizontal: 14 },
  itemText: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '600' },
  itemDesc: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 2, flexShrink: 1 },
  itemValue: { color: colors.textSecondary, fontSize: fontSize.subtitle },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 32,
  },
  dialog: { padding: 8, borderRadius: radii.lg },
  dialogTitle: {
    fontSize: fontSize.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  choice: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
