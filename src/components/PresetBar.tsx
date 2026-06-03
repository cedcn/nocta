import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { colors, radii, fontSize, shadow } from '../theme';

export default function PresetBar() {
  const { presets, currentPresetIndex, setCurrentPreset, loadPreset, saveToPreset, playingSounds } = useAudio();

  const handlePresetPress = (index: number) => {
    if (currentPresetIndex === index && presets[index].sounds.length > 0) {
      loadPreset(index);
    } else {
      setCurrentPreset(index);
    }
  };

  const handleSaveToPreset = (index: number) => {
    const soundIds = playingSounds.map((p) => p.id);
    saveToPreset(index, soundIds);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presets</Text>
      <Text style={styles.hint}>Tap to load · long-press to save</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {presets.map((preset, index) => (
          <TouchableOpacity
            key={preset.id}
            style={[styles.preset, currentPresetIndex === index && styles.presetActive]}
            onPress={() => handlePresetPress(index)}
            onLongPress={() => handleSaveToPreset(index)}
            activeOpacity={0.8}
          >
            <Text style={[styles.presetNumber, currentPresetIndex === index && styles.presetTextActive]}>
              {index + 1}
            </Text>
            <Text style={[styles.presetCount, currentPresetIndex === index && styles.presetTextActive]}>
              {preset.sounds.length}/10
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: fontSize.subtitle, color: colors.textPrimary, fontWeight: '700' },
  hint: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  scroll: { flexDirection: 'row' },
  preset: {
    backgroundColor: colors.glass,
    width: 70,
    height: 70,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 12,
    ...shadow,
  },
  presetActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  presetNumber: { fontSize: fontSize.title, color: colors.textPrimary, fontWeight: '800' },
  presetCount: { fontSize: fontSize.caption, color: colors.textSecondary, marginTop: 4 },
  presetTextActive: { color: colors.textOnAccent },
});
