import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { SOUNDS } from '../data/sounds';

export default function MixerScreen() {
  const { playingSounds, toggleSound, setVolume, stopAll, setTimer, timer, saveScene } = useAudio();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sceneName, setSceneName] = useState('');

  const isPlaying = (id: string) => playingSounds.some(s => s.id === id);
  const getVolume = (id: string) => playingSounds.find(s => s.id === id)?.volume || 0.5;

  const handleSave = () => {
    if (sceneName.trim()) {
      saveScene(sceneName);
      setSceneName('');
      setShowSaveModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sound Mixer</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.smallButton} onPress={stopAll}>
            <Text style={styles.smallButtonText}>⏹ Stop All</Text>
          </TouchableOpacity>
          {playingSounds.length > 0 && (
            <TouchableOpacity style={styles.smallButton} onPress={() => setShowSaveModal(true)}>
              <Text style={styles.smallButtonText}>💾 Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>⏱ Timer</Text>
        <View style={styles.timerButtons}>
          {[15, 30, 45, 60].map(min => (
            <TouchableOpacity
              key={min}
              style={[styles.timerButton, timer === min && styles.timerButtonActive]}
              onPress={() => setTimer(min)}
            >
              <Text style={styles.timerButtonText}>{min}m</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={SOUNDS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const playing = isPlaying(item.id);
          return (
            <View style={styles.soundItem}>
              <TouchableOpacity
                style={[styles.soundButton, playing && styles.soundButtonActive]}
                onPress={() => toggleSound(item.id)}
              >
                <Text style={styles.soundEmoji}>{item.emoji}</Text>
                <Text style={styles.soundName}>{item.name}</Text>
              </TouchableOpacity>
              {playing && (
                <Slider
                  style={styles.slider}
                  value={getVolume(item.id)}
                  onValueChange={(v: number) => setVolume(item.id, v)}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#6b7fa8"
                  maximumTrackTintColor="#2a3447"
                />
              )}
            </View>
          );
        }}
      />

      <Modal visible={showSaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Scene</Text>
            <TextInput
              style={styles.input}
              placeholder="Scene name"
              placeholderTextColor="#666"
              value={sceneName}
              onChangeText={setSceneName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSave}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27', padding: 20 },
  header: { marginTop: 60, marginBottom: 20 },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 15 },
  controls: { flexDirection: 'row', gap: 10 },
  smallButton: { backgroundColor: '#3b4a6b', padding: 10, borderRadius: 8 },
  smallButtonText: { color: '#fff', fontSize: 14 },
  timerSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#fff', marginBottom: 10 },
  timerButtons: { flexDirection: 'row', gap: 10 },
  timerButton: { flex: 1, backgroundColor: '#1a2332', padding: 12, borderRadius: 8 },
  timerButtonActive: { backgroundColor: '#3b4a6b' },
  timerButtonText: { color: '#fff', textAlign: 'center' },
  soundItem: { marginBottom: 15 },
  soundButton: { backgroundColor: '#1a2332', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  soundButtonActive: { backgroundColor: '#2a3447' },
  soundEmoji: { fontSize: 24, marginRight: 12 },
  soundName: { color: '#fff', fontSize: 16 },
  slider: { width: '100%', height: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a2332', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, color: '#fff', marginBottom: 15 },
  input: { backgroundColor: '#0a0e27', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, backgroundColor: '#3b4a6b', padding: 12, borderRadius: 8 },
  modalButtonPrimary: { backgroundColor: '#5b6fa8' },
  modalButtonText: { color: '#fff', textAlign: 'center' },
});
