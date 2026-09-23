import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { Play, RefreshCw, Square } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useWeather } from '../../context/WeatherContext';
import { useAudio } from '../../context/AudioContext';
import { useLocalizedName } from '../../i18n/LanguageProvider';
import { getSoundById, useSoundsManifest } from '../../data/sounds';
import { weatherDescriptionKey } from '../../services/weather/codes';
import { weatherIcon } from '../../services/weather/icons';
import { getRecommendedSoundIds } from '../../services/weather/soundMapper';
import GlassCard from '../GlassCard';
import { colors, radii, fontSize } from '../../theme';

export default function WeatherCard() {
  const { t } = useTranslation('weather');
  const localizedName = useLocalizedName();
  const { enabled, weather, status, refresh } = useWeather();
  const { playingSounds, playMix, stopAll, getVolume } = useAudio();
  useSoundsManifest();

  if (!enabled) return null;

  if (!weather) {
    const message =
      status === 'denied' ? t('location_denied') : status === 'error' ? t('load_failed') : t('loading');
    return (
      <GlassCard strong style={styles.card}>
        <View style={styles.placeholder}>
          {status === 'loading' || status === 'idle' ? <ActivityIndicator color={colors.accent} /> : null}
          <Text style={styles.placeholderText}>{message}</Text>
          {status === 'error' && (
            <TouchableOpacity onPress={() => refresh(true)} hitSlop={8}>
              <Text style={styles.retry}>{t('retry')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    );
  }

  const recommended = getRecommendedSoundIds(weather.weatherCode, weather.isDay);
  const playingIds = new Set(playingSounds.map((p) => p.id));
  const mixPlaying = recommended.length > 0 && recommended.every((id) => playingIds.has(id));
  const temp = Math.round(weather.temperature);
  const feelsLike = Math.round(weather.feelsLike);

  const toggleMix = () => {
    if (mixPlaying) stopAll();
    else playMix(recommended.map((id) => ({ soundId: id, volume: getVolume(id) })));
  };

  return (
    <GlassCard strong style={styles.card}>
      <View style={styles.row}>
        <LottieView source={weatherIcon(weather.weatherCode, weather.isDay)} autoPlay loop style={styles.icon} />
        <View style={styles.texts}>
          {weather.cityName ? (
            <Text style={styles.city} numberOfLines={1}>
              {weather.cityName}
            </Text>
          ) : null}
          <Text style={styles.temp} numberOfLines={1}>
            {`${temp}°C · ${t(weatherDescriptionKey(weather.weatherCode))}`}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[
              weather.humidity > 0 ? `${t('humidity')} ${weather.humidity}%` : null,
              feelsLike !== temp ? `${t('feels_like')} ${feelsLike}°C` : null,
            ]
              .filter(Boolean)
              .join('  ')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => refresh(true)} hitSlop={10} disabled={status === 'loading'}>
          {status === 'loading' ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <RefreshCw size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {recommended.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.chips}>
            <Text style={styles.label}>{t('recommended')}</Text>
            {recommended.map((id) => {
              const sound = getSoundById(id);
              if (!sound) return null;
              return (
                <View key={id} style={[styles.chip, playingIds.has(id) && styles.chipActive]}>
                  <Text style={[styles.chipText, playingIds.has(id) && styles.chipTextActive]} numberOfLines={1}>
                    {localizedName(sound)}
                  </Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={styles.playBtn} onPress={toggleMix} activeOpacity={0.8}>
            {mixPlaying ? (
              <Square size={14} color={colors.textOnAccent} fill={colors.textOnAccent} />
            ) : (
              <Play size={14} color={colors.textOnAccent} />
            )}
            <Text style={styles.playText}>{mixPlaying ? t('stop_recommended') : t('play_recommended')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 20 },
  placeholder: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  placeholderText: { flex: 1, color: colors.textSecondary, fontSize: fontSize.body },
  retry: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 64, height: 64 },
  texts: { flex: 1, marginLeft: 10 },
  city: { color: colors.textSecondary, fontSize: fontSize.caption, fontWeight: '600' },
  temp: { color: colors.textPrimary, fontSize: fontSize.title, fontWeight: '700', marginTop: 2 },
  meta: { color: colors.textSecondary, fontSize: fontSize.caption, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.trackInactive,
    gap: 10,
  },
  chips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  label: { color: colors.textSecondary, fontSize: fontSize.caption, fontWeight: '600', marginRight: 2 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.pastelSky,
    maxWidth: 140,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.textPrimary, fontSize: fontSize.caption, fontWeight: '600' },
  chipTextActive: { color: colors.textOnAccent },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  playText: { color: colors.textOnAccent, fontSize: fontSize.caption, fontWeight: '700' },
});
