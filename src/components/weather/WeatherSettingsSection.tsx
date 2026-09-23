import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { useRootNavigation } from '../../navigation';
import { maskHost } from '../../services/weather/qweather';
import ThemedSwitch from '../ThemedSwitch';
import { colors, fontSize } from '../../theme';

// Rendered inside the Settings → System group, so row styles mirror SettingsScreen.
export default function WeatherSettingsSection() {
  const { t } = useTranslation('weather');
  const navigation = useRootNavigation();
  const { enabled, setEnabled, qweather } = useWeather();

  const onToggle = async (next: boolean) => {
    const ok = await setEnabled(next);
    if (!ok) Alert.alert(t('location_denied'));
  };

  const sourceLabel = qweather ? t('source_configured', { p1: maskHost(qweather.host) }) : t('source_default');

  return (
    <>
      <View style={styles.divider} />
      <View style={styles.item}>
        <View style={styles.itemTexts}>
          <Text style={styles.itemText}>{t('smart_recommend')}</Text>
          <Text style={styles.itemDesc}>{t('smart_recommend_desc')}</Text>
        </View>
        <ThemedSwitch
          value={enabled}
          onValueChange={onToggle}
        />
      </View>
      {enabled && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('WeatherSettings')}
            activeOpacity={0.7}
          >
            <View style={styles.itemTexts}>
              <Text style={styles.itemText}>{t('source_label')}</Text>
              <Text style={styles.itemDesc} numberOfLines={1}>
                {sourceLabel}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});
