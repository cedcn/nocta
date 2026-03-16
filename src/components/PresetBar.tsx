import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAudio } from '../context/AudioContext';

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
    const soundIds = playingSounds.map(p => p.id);
    saveToPreset(index, soundIds);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {presets.map((preset, index) => (
          <View key={preset.id} style={styles.presetWrapper}>
            <TouchableOpacity
              style={[styles.preset, currentPresetIndex === index && styles.presetActive]}
              onPress={() => handlePresetPress(index)}
              onLongPress={() => handleSaveToPreset(index)}
            >
              <Text style={styles.presetNumber}>{index + 1}</Text>
              <Text style={styles.presetCount}>{preset.sounds.length}/10</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 15 },
  title: { fontSize: 16, color: '#fff', fontWeight: '600', marginBottom: 10 },
  scroll: { flexDirection: 'row' },
  presetWrapper: { marginRight: 12 },
  preset: { backgroundColor: '#1a2332', width: 70, height: 70, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  presetActive: { borderColor: '#3b5998', backgroundColor: '#1e2a3f' },
  presetNumber: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  presetCount: { fontSize: 12, color: '#6b7fa8', marginTop: 4 },
});
