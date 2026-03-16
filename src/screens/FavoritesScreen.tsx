import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { getSoundById } from '../data/sounds';
import SoundCard from '../components/SoundCard';

export default function FavoritesScreen() {
  const { favorites, playingSounds } = useAudio();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} sounds</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap ❤️ on any sound to add it here</Text>
          </View>
        ) : (
          favorites.map(fav => {
            const sound = getSoundById(fav.soundId);
            if (!sound) return null;
            return (
              <SoundCard
                key={fav.soundId}
                sound={sound}
                isPlaying={playingSounds.some(p => p.id === fav.soundId)}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#6b7fa8', marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: 20 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, color: '#6b7fa8', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#3b4a6b' },
});
