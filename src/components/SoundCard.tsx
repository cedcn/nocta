import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { SoundMetadata } from '../types';

interface SoundCardProps {
  sound: SoundMetadata;
  isPlaying: boolean;
}

export default function SoundCard({ sound, isPlaying }: SoundCardProps) {
  const { toggleSound, setVolume, getVolume, toggleFavorite, isFavorite } = useAudio();
  const volume = getVolume(sound.id);
  const favorite = isFavorite(sound.id);

  return (
    <TouchableOpacity
      style={[styles.card, isPlaying && styles.cardActive]}
      onPress={() => toggleSound(sound.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{sound.nameEn || sound.name}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(sound.id)}>
          <Text style={styles.favoriteIcon}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {isPlaying && (
        <View style={styles.volumeControl}>
          <Text style={styles.volumeLabel}>🔊</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={(v) => setVolume(sound.id, v)}
            minimumTrackTintColor="#3b5998"
            maximumTrackTintColor="#1a2332"
            thumbTintColor="#fff"
          />
          <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: '#3b5998',
    backgroundColor: '#1e2a3f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  volumeLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeValue: {
    color: '#6b7fa8',
    fontSize: 12,
    marginLeft: 8,
    width: 40,
  },
});
