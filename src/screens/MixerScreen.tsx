import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { getAllCategories, getSoundsByCategory } from '../data/sounds';
import SoundCard from '../components/SoundCard';
import PresetBar from '../components/PresetBar';
import TimerControl from '../components/TimerControl';
import FloatingPlayButton from '../components/FloatingPlayButton';

export default function MixerScreen() {
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const categories = getAllCategories();
  const sounds = getSoundsByCategory(selectedCategory);
  const { playingSounds, stopAll } = useAudio();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mixer</Text>
        <View style={styles.headerButtons}>
          {playingSounds.length > 0 && (
            <TouchableOpacity style={styles.stopButton} onPress={stopAll}>
              <Text style={styles.stopButtonText}>⏹ Stop All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TimerControl />
      <PresetBar />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryBtn, selectedCategory === cat.id && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.nameEn || cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.soundsScroll} contentContainerStyle={styles.soundsGrid}>
        {sounds.map(sound => (
          <SoundCard key={sound.id} sound={sound} isPlaying={playingSounds.some(p => p.id === sound.id)} />
        ))}
      </ScrollView>

      {playingSounds.length > 0 && <FloatingPlayButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  headerButtons: { flexDirection: 'row', gap: 10 },
  stopButton: { backgroundColor: '#d32f2f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  stopButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  categoryScroll: { maxHeight: 50, marginHorizontal: 20, marginTop: 10 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, borderRadius: 20, backgroundColor: '#1a2332' },
  categoryBtnActive: { backgroundColor: '#3b5998' },
  categoryText: { color: '#6b7fa8', fontSize: 14 },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  soundsScroll: { flex: 1, marginTop: 20 },
  soundsGrid: { padding: 20, paddingTop: 10, paddingBottom: 100 },
});
