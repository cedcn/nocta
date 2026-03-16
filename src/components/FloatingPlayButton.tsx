import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { getSoundById } from '../data/sounds';

export default function FloatingPlayButton() {
  const { playingSounds, stopAll } = useAudio();
  const [expanded, setExpanded] = useState(false);

  if (playingSounds.length === 0) return null;

  return (
    <View style={styles.container}>
      {expanded && (
        <View style={styles.expandedView}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Playing ({playingSounds.length})</Text>
            <TouchableOpacity onPress={stopAll}>
              <Text style={styles.stopText}>⏹ Stop All</Text>
            </TouchableOpacity>
          </View>
          {playingSounds.map(ps => {
            const sound = getSoundById(ps.id);
            return (
              <View key={ps.id} style={styles.soundItem}>
                <Text style={styles.soundName}>{sound?.nameEn || sound?.name}</Text>
                <Text style={styles.volumeText}>{Math.round(ps.volume * 100)}%</Text>
              </View>
            );
          })}
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.buttonText}>
          {expanded ? '▼' : '▲'} {playingSounds.length} playing
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 80, right: 20, left: 20 },
  expandedView: { backgroundColor: '#1a2332', borderRadius: 12, padding: 16, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  headerText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stopText: { color: '#d32f2f', fontSize: 14, fontWeight: '600' },
  soundItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#2a3447' },
  soundName: { color: '#fff', fontSize: 14 },
  volumeText: { color: '#6b7fa8', fontSize: 14 },
  button: { backgroundColor: '#3b5998', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
