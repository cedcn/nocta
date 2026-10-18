import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable, Image } from 'react-native';
import { BookmarkPlus, ChevronRight, Moon, Pause, Play, Volume2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { useLocalizedName } from '../i18n/LanguageProvider';
import { getSoundById } from '../data/sounds';
import { formatDuration } from '../data/meditation';
import { useMeditationProgress } from '../services/meditationPlayer';
import { usePresetName, useSaveCurrentMix } from '../hooks/usePresetActions';
import { MINI_PLAYER_HEIGHT, useMiniPlayerVisible } from '../hooks/useMiniPlayerInset';
import { navigationRef } from '../navigation';
import GlassCard from './GlassCard';
import PresetRenameModal from './PresetRenameModal';
import TimerControl, { formatTime } from './TimerControl';
import { TAB_BAR_HEIGHT } from './TabBar';
import { colors, radii, fontSize, shadow, getCategoryStyle } from '../theme';

export type MiniPlayerPlacement = 'tabs' | 'stack' | 'hidden';

const LIST_MAX_HEIGHT = 240;

export default function MiniPlayer({ placement }: { placement: MiniPlayerPlacement }) {
  const { t } = useTranslation();
  const localizedName = useLocalizedName();
  const insets = useSafeAreaInsets();
  const {
    playingSounds,
    presets,
    isPaused,
    meditation,
    suspended,
    mixTitle,
    timerRemaining,
    masterVolume,
    setMasterVolume,
    setVolume,
    toggleSound,
    togglePlayback,
    seekMeditation,
    stopAll,
  } = useAudio();
  const progress = useMeditationProgress();
  const visible = useMiniPlayerVisible();
  const presetName = usePresetName();
  const [expanded, setExpanded] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  // Offer a name right after saving so new presets don't all stay "Preset N".
  const [savedId, setSavedId] = useState<string | null>(null);
  const saveMix = useSaveCurrentMix(setSavedId);

  useEffect(() => {
    if (!visible) setExpanded(false);
  }, [visible]);

  if (!visible || placement === 'hidden') return null;

  const hasMix = playingSounds.length > 0;
  const playing = meditation ? progress.playing : hasMix && !isPaused;
  const { icon: MixIcon } = getCategoryStyle(getSoundById(playingSounds[0]?.id ?? '')?.category ?? 'rain');

  const title = meditation ? localizedName(meditation.session) : hasMix ? mixTitle : t('timer.title');
  const status = meditation
    ? meditation.error
      ? t('sound.error')
      : meditation.loading || progress.buffering
        ? t('sound.loading')
        : t('player.meditation')
    : hasMix
      ? isPaused
        ? t('player.paused')
        : t('player.playingCount', { count: playingSounds.length })
      : null;

  const closeAll = () => {
    setExpanded(false);
    stopAll();
  };

  const openMeditation = () => {
    if (!meditation) return;
    setExpanded(false);
    if (navigationRef.isReady()) navigationRef.navigate('MeditationPlayer', { sessionId: meditation.session.id });
  };

  const bottom = placement === 'tabs' ? Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT + 10 : insets.bottom + 12;
  const savedIndex = presets.findIndex((p) => p.id === savedId);

  const slider = (value: number, onChange: (v: number) => void) => (
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={1}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor={colors.accent}
      maximumTrackTintColor={colors.trackInactive}
      thumbTintColor={colors.accent}
    />
  );

  const renderMeditation = () => {
    if (!meditation) return null;
    const duration = progress.duration || meditation.session.duration;
    const position = dragValue ?? progress.currentTime;
    return (
      <View style={styles.section}>
        <Slider
          style={styles.seek}
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={position}
          disabled={meditation.loading || meditation.error}
          onValueChange={setDragValue}
          onSlidingComplete={(v) => {
            seekMeditation(v);
            setDragValue(null);
          }}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.trackInactive}
          thumbTintColor={colors.accent}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatDuration(position)}</Text>
          <Text style={styles.time}>{formatDuration(duration)}</Text>
        </View>
        <TouchableOpacity style={styles.outlineButton} onPress={openMeditation} activeOpacity={0.8}>
          <Text style={styles.outlineText}>{t('player.openPlayer')}</Text>
          <ChevronRight size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMix = () => {
    if (meditation || !hasMix) return null;
    return (
      <View style={styles.section}>
        <View style={styles.masterRow}>
          <Volume2 size={18} color={colors.accent} />
          <Text style={styles.masterLabel}>{t('player.master')}</Text>
          {slider(masterVolume, setMasterVolume)}
        </View>
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {playingSounds.map((ps) => {
            const sound = getSoundById(ps.id);
            return (
              <View key={ps.id} style={styles.soundItem}>
                <View style={styles.soundHeader}>
                  <Text style={styles.soundName} numberOfLines={1}>
                    {sound ? localizedName(sound) : ps.id}
                  </Text>
                  <Text style={styles.volumeText}>{Math.round(ps.volume * 100)}%</Text>
                  <TouchableOpacity onPress={() => toggleSound(ps.id)} hitSlop={10} accessibilityLabel={t('player.remove')}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                {slider(ps.volume, (v) => setVolume(ps.id, v))}
              </View>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.outlineButton} onPress={saveMix} activeOpacity={0.8}>
          <BookmarkPlus size={16} color={colors.accent} />
          <Text style={styles.outlineText}>{t('player.saveMix')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { bottom }]} pointerEvents="box-none">
      <Pressable style={styles.bar} onPress={() => setExpanded(true)}>
        <View style={styles.artwork}>
          {meditation ? (
            <Image source={{ uri: meditation.session.coverUrl }} style={styles.cover} />
          ) : hasMix ? (
            <MixIcon size={20} color={colors.accent} />
          ) : (
            <Moon size={20} color={colors.accent} />
          )}
        </View>
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.statusRow}>
            {status && (
              <Text style={[styles.status, meditation?.error && styles.statusError]} numberOfLines={1}>
                {status}
              </Text>
            )}
            {timerRemaining !== null && (
              <View style={styles.timerChip}>
                <Moon size={11} color={colors.accent} />
                <Text style={styles.timerText}>{formatTime(timerRemaining)}</Text>
              </View>
            )}
          </View>
        </View>
        {(meditation || hasMix) && (
          // Breathing has paused playback and resumes it when it ends; resuming here would talk over its cues.
          <TouchableOpacity
            style={[styles.playButton, suspended && styles.playButtonDisabled]}
            onPress={togglePlayback}
            disabled={suspended}
            hitSlop={6}
            accessibilityLabel={playing ? t('actions.pause') : t('actions.play')}
          >
            {playing ? (
              <Pause size={18} color={colors.textOnAccent} fill={colors.textOnAccent} />
            ) : (
              <Play size={18} color={colors.textOnAccent} fill={colors.textOnAccent} />
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={closeAll} hitSlop={6} accessibilityLabel={t('actions.stopAll')}>
          <X size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Pressable>

      <Modal visible={expanded} transparent animationType="slide" onRequestClose={() => setExpanded(false)}>
        <Pressable style={styles.backdrop} onPress={() => setExpanded(false)}>
          <Pressable onPress={() => {}}>
            <GlassCard strong style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {meditation ? title : hasMix ? t('player.playingTitle', { count: playingSounds.length }) : t('timer.title')}
                </Text>
                <TouchableOpacity onPress={closeAll} hitSlop={8} activeOpacity={0.7}>
                  <Text style={styles.stopText}>{t('actions.stopAll')}</Text>
                </TouchableOpacity>
              </View>
              {renderMeditation()}
              {renderMix()}
              <View style={styles.section}>
                <TimerControl embedded />
              </View>
            </GlassCard>
          </Pressable>
          {savedId && savedIndex >= 0 && (
            <PresetRenameModal
              key={savedId}
              presetId={savedId}
              title={t('player.savedAs', { name: presetName(presets[savedIndex], savedIndex) })}
              onClose={() => setSavedId(null)}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 20, right: 20 },
  bar: {
    height: MINI_PLAYER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 10,
    paddingRight: 8,
    backgroundColor: colors.glassStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadow,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.iconSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cover: { width: 44, height: 44 },
  texts: { flex: 1 },
  title: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  status: { color: colors.textSecondary, fontSize: fontSize.caption, flexShrink: 1 },
  statusError: { color: colors.danger },
  timerChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timerText: { color: colors.accent, fontSize: fontSize.caption, fontWeight: '700', fontVariant: ['tabular-nums'] },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonDisabled: { opacity: 0.4 },
  closeButton: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingHorizontal: 20, paddingTop: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  sheetTitle: { flex: 1, color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
  stopText: { color: colors.danger, fontSize: fontSize.body, fontWeight: '700' },
  section: { marginTop: 14 },
  masterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  masterLabel: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '600' },
  list: { maxHeight: LIST_MAX_HEIGHT },
  slider: { flex: 1, height: 32 },
  seek: { alignSelf: 'stretch', height: 32 },
  soundItem: { paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.trackInactive },
  soundHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  soundName: { flex: 1, color: colors.textPrimary, fontSize: fontSize.body },
  volumeText: { color: colors.textSecondary, fontSize: fontSize.caption },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  time: { color: colors.textSecondary, fontSize: fontSize.caption },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  outlineText: { color: colors.accent, fontSize: fontSize.body, fontWeight: '700' },
});
