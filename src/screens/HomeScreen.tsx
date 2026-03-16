import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { getAllCategories, getSoundsByCategory } from '../data/sounds';
import SoundCard from '../components/SoundCard';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const categories = getAllCategories();
  const sounds = getSoundsByCategory(selectedCategory);
  const { playingSounds } = useAudio();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nocta</Text>
        <Text style={styles.subtitle}>Sleep Sounds</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#6b7fa8', marginTop: 4 },
  categoryScroll: { maxHeight: 50, marginHorizontal: 20 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, borderRadius: 20, backgroundColor: '#1a2332' },
  categoryBtnActive: { backgroundColor: '#3b5998' },
  categoryText: { color: '#6b7fa8', fontSize: 14 },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  soundsScroll: { flex: 1, marginTop: 20 },
  soundsGrid: { padding: 20, paddingTop: 10 },
});
